import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  addActionMiddleware,
  dispatchAction,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { createPermissionMiddleware } from './createPermissionMiddleware';
import type { PermissionLevel } from './createPermissionMiddleware';

function makeDefinition(
  id: string,
  overrides: Partial<NavigableDefinition> = {}
): NavigableDefinition {
  const actions = new Map();
  actions.set('read', {
    name: 'read',
    description: 'Read action',
    handler: () => 'read-result',
  });
  actions.set('write', {
    name: 'write',
    description: 'Write action',
    handler: () => 'write-result',
  });
  actions.set('admin', {
    name: 'admin',
    description: 'Admin action',
    handler: () => 'admin-result',
  });
  return { id, label: `Label for ${id}`, actions, ...overrides };
}

describe('createPermissionMiddleware (#285)', () => {
  beforeEach(() => {
    clearNavigables();
  });

  it('allows action when caller has sufficient permission', async () => {
    registerNavigable(makeDefinition('nav-perm'));
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'write',
    });
    handle.setPermission('nav-perm', 'write', 'write');

    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-perm', 'write');
    expect(result.ok).toBe(true);
    expect(result.data).toBe('write-result');

    unsubscribe();
  });

  it('blocks action when caller has insufficient permission (read < write)', async () => {
    registerNavigable(makeDefinition('nav-block-rw'));
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'read',
    });
    handle.setPermission('nav-block-rw', 'write', 'write');

    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-block-rw', 'write');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Permission denied/);

    unsubscribe();
  });

  it('blocks action when caller has insufficient permission (write < admin)', async () => {
    registerNavigable(makeDefinition('nav-block-wa'));
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'write',
    });
    handle.setPermission('nav-block-wa', 'admin', 'admin');

    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-block-wa', 'admin');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Permission denied/);

    unsubscribe();
  });

  it('calls onDenied callback when blocked', async () => {
    registerNavigable(makeDefinition('nav-denied'));
    const onDenied = vi.fn();
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'read',
      onDenied,
    });
    handle.setPermission('nav-denied', 'admin', 'admin');

    const unsubscribe = addActionMiddleware(handle.middleware);

    await dispatchAction('nav-denied', 'admin');

    expect(onDenied).toHaveBeenCalledOnce();
    expect(onDenied).toHaveBeenCalledWith(
      expect.objectContaining({
        target: 'nav-denied',
        action: 'admin',
        required: 'admin',
        actual: 'read',
      })
    );

    unsubscribe();
  });

  it('returns structured error message', async () => {
    registerNavigable(makeDefinition('nav-error-msg'));
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'read',
    });
    handle.setPermission('nav-error-msg', 'write', 'write');

    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-error-msg', 'write');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Permission denied: requires write, caller has read');

    unsubscribe();
  });

  it('works with custom getActionPermission', async () => {
    registerNavigable(makeDefinition('nav-custom-perm'));

    const getActionPermission = vi.fn(
      (_ctx: { target: string; action: string }): PermissionLevel => 'admin'
    );

    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'write',
      getActionPermission,
    });
    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-custom-perm', 'admin');
    expect(result.ok).toBe(false);
    expect(getActionPermission).toHaveBeenCalledWith(
      expect.objectContaining({ target: 'nav-custom-perm', action: 'admin' })
    );

    unsubscribe();
  });

  it('default permission is read (always allowed)', async () => {
    registerNavigable(makeDefinition('nav-default-perm'));
    // No setPermission call — defaults to 'read'
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'read',
    });
    const unsubscribe = addActionMiddleware(handle.middleware);

    const result = await dispatchAction('nav-default-perm', 'read');
    expect(result.ok).toBe(true);

    unsubscribe();
  });

  it('admin caller can perform any action', async () => {
    registerNavigable(makeDefinition('nav-admin-all'));
    const handle = createPermissionMiddleware({
      getCallerPermission: () => 'admin',
    });
    handle.setPermission('nav-admin-all', 'admin', 'admin');
    handle.setPermission('nav-admin-all', 'write', 'write');

    const unsubscribe = addActionMiddleware(handle.middleware);

    const adminResult = await dispatchAction('nav-admin-all', 'admin');
    expect(adminResult.ok).toBe(true);

    const writeResult = await dispatchAction('nav-admin-all', 'write');
    expect(writeResult.ok).toBe(true);

    unsubscribe();
  });

  it('instance permissions are isolated from other instances', async () => {
    registerNavigable(makeDefinition('iso-nav'));
    const handleA = createPermissionMiddleware({ getCallerPermission: () => 'read' });
    const handleB = createPermissionMiddleware({ getCallerPermission: () => 'read' });

    // Only set permission on instance A
    handleA.setPermission('iso-nav', 'write', 'write');

    const unsubA = addActionMiddleware(handleA.middleware);
    const result = await dispatchAction('iso-nav', 'write');
    // handleA blocks it (read < write)
    expect(result.ok).toBe(false);
    unsubA();

    // handleB has no permission entry — defaults to 'read', so it passes
    const unsubB = addActionMiddleware(handleB.middleware);
    const resultB = await dispatchAction('iso-nav', 'write');
    expect(resultB.ok).toBe(true);
    unsubB();
  });

  it('clearPermissions removes all entries from the instance', async () => {
    registerNavigable(makeDefinition('clear-nav'));
    const handle = createPermissionMiddleware({ getCallerPermission: () => 'read' });
    handle.setPermission('clear-nav', 'write', 'write');
    handle.clearPermissions();

    const unsubscribe = addActionMiddleware(handle.middleware);

    // After clear, defaults to 'read' — 'read' caller can proceed
    const result = await dispatchAction('clear-nav', 'write');
    expect(result.ok).toBe(true);

    unsubscribe();
  });
});
