import { describe, it, expect, vi } from 'vitest';
import { filterActions, filterActionsConfig } from './actions';
import type { ViewAction, ActionsConfig } from './actions';

// Test fixtures
const editAction: ViewAction = {
  id: 'edit',
  label: 'Edit',
  icon: 'pencil',
  permission: 'edit',
  onClick: vi.fn(),
};

const deleteAction: ViewAction = {
  id: 'delete',
  label: 'Delete',
  icon: 'trash',
  permission: 'delete',
  variant: 'danger',
  onClick: vi.fn(),
};

const closeAction: ViewAction = {
  id: 'close',
  label: 'Close',
  permission: 'edit',
  showIf: (item: unknown) => (item as { status: string }).status === 'open',
  onClick: vi.fn(),
};

const reopenAction: ViewAction = {
  id: 'reopen',
  label: 'Reopen',
  permission: 'edit',
  showIf: (item: unknown) => (item as { status: string }).status === 'closed',
  onClick: vi.fn(),
};

const shareAction: ViewAction = {
  id: 'share',
  label: 'Share',
  // No permission required — available to everyone
  onClick: vi.fn(),
};

const allActions = [editAction, deleteAction, closeAction, reopenAction, shareAction];

const canAll = () => true;
const canNone = () => false;
const canEditOnly = (action: string) => action === 'edit';

const openIssue = { id: 1, status: 'open' };
const closedIssue = { id: 2, status: 'closed' };

describe('filterActions', () => {
  describe('Stage 1: Intent filter', () => {
    it('browse intent hides all actions', () => {
      const result = filterActions(allActions, 'browse', canAll, openIssue);
      expect(result).toHaveLength(0);
    });

    it('pick intent hides all actions', () => {
      const result = filterActions(allActions, 'pick', canAll, openIssue);
      expect(result).toHaveLength(0);
    });

    it('edit intent shows eligible actions', () => {
      const result = filterActions(allActions, 'edit', canAll, openIssue);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Stage 2: Permission filter', () => {
    it('filters out actions user cannot perform', () => {
      const result = filterActions(allActions, 'edit', canNone, openIssue);
      // Only share has no permission requirement
      const ids = result.map(a => a.id);
      expect(ids).toContain('share');
      expect(ids).not.toContain('edit');
      expect(ids).not.toContain('delete');
    });

    it('allows actions matching can()', () => {
      const result = filterActions(allActions, 'edit', canEditOnly, openIssue);
      const ids = result.map(a => a.id);
      expect(ids).toContain('edit');
      expect(ids).toContain('close'); // permission is 'edit'
      expect(ids).not.toContain('delete'); // permission is 'delete'
      expect(ids).toContain('share'); // no permission required
    });

    it('actions without permission are always allowed', () => {
      const result = filterActions([shareAction], 'edit', canNone, openIssue);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('share');
    });
  });

  describe('Stage 3: Data-state filter (showIf)', () => {
    it('shows close action for open issue', () => {
      const result = filterActions(allActions, 'edit', canAll, openIssue);
      const ids = result.map(a => a.id);
      expect(ids).toContain('close');
      expect(ids).not.toContain('reopen');
    });

    it('shows reopen action for closed issue', () => {
      const result = filterActions(allActions, 'edit', canAll, closedIssue);
      const ids = result.map(a => a.id);
      expect(ids).toContain('reopen');
      expect(ids).not.toContain('close');
    });

    it('actions without showIf are always shown', () => {
      const result = filterActions([editAction], 'edit', canAll, openIssue);
      expect(result).toHaveLength(1);
    });
  });

  describe('Resolved action shape', () => {
    it('preserves id, label, icon, onClick', () => {
      const result = filterActions([editAction], 'edit', canAll, openIssue);
      expect(result[0]).toEqual({
        id: 'edit',
        label: 'Edit',
        icon: 'pencil',
        onClick: editAction.onClick,
        variant: 'default',
      });
    });

    it('defaults variant to "default"', () => {
      const result = filterActions([editAction], 'edit', canAll, openIssue);
      expect(result[0]!.variant).toBe('default');
    });

    it('preserves explicit variant', () => {
      const result = filterActions([deleteAction], 'edit', canAll, openIssue);
      expect(result[0]!.variant).toBe('danger');
    });
  });

  describe('Combined filter chain', () => {
    it('admin sees edit + delete + close for open issue', () => {
      const result = filterActions(allActions, 'edit', canAll, openIssue);
      const ids = result.map(a => a.id);
      expect(ids).toContain('edit');
      expect(ids).toContain('delete');
      expect(ids).toContain('close');
      expect(ids).toContain('share');
      expect(ids).not.toContain('reopen');
    });

    it('viewer sees nothing (browse intent)', () => {
      const result = filterActions(allActions, 'browse', canAll, openIssue);
      expect(result).toHaveLength(0);
    });

    it('editor sees edit + close but not delete for open issue', () => {
      const result = filterActions(allActions, 'edit', canEditOnly, openIssue);
      const ids = result.map(a => a.id);
      expect(ids).toContain('edit');
      expect(ids).toContain('close');
      expect(ids).not.toContain('delete');
    });

    it('empty actions returns empty', () => {
      const result = filterActions([], 'edit', canAll, openIssue);
      expect(result).toHaveLength(0);
    });
  });
});

describe('filterActionsConfig', () => {
  const config: ActionsConfig = {
    header: [editAction, deleteAction],
    footer: [shareAction],
    contextMenu: [closeAction, reopenAction],
  };

  it('filters all slots independently', () => {
    const result = filterActionsConfig(config, 'edit', canAll, openIssue);
    expect(result.header).toHaveLength(2);
    expect(result.footer).toHaveLength(1);
    // contextMenu: close shown, reopen not (openIssue)
    expect(result.contextMenu).toHaveLength(1);
    expect(result.contextMenu[0]!.id).toBe('close');
  });

  it('browse intent empties all slots', () => {
    const result = filterActionsConfig(config, 'browse', canAll, openIssue);
    expect(result.header).toHaveLength(0);
    expect(result.footer).toHaveLength(0);
    expect(result.contextMenu).toHaveLength(0);
  });

  it('handles missing slots', () => {
    const result = filterActionsConfig({}, 'edit', canAll, openIssue);
    expect(result.header).toHaveLength(0);
    expect(result.footer).toHaveLength(0);
    expect(result.contextMenu).toHaveLength(0);
  });
});
