import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { ViewsProvider, useViews } from './views-provider';
import { defaultViewKit, createViewKit } from './view-kit';

describe('useViews', () => {
  it('returns defaults when no provider', () => {
    createRoot((dispose) => {
      const ctx = useViews();
      expect(ctx.viewKit).toBe(defaultViewKit);
      expect(ctx.intent).toBe('browse');
      expect(ctx.can('anything', {})).toBe(true);
      expect(ctx.overrides).toEqual({});
      dispose();
    });
  });
});

describe('ViewsProvider', () => {
  it('provides viewKit to children', () => {
    const customKit = createViewKit({ name: 'custom', extends: defaultViewKit });

    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        viewKit: customKit,
        get children() {
          captured = useViews();
          return null;
        },
      });

      expect(captured?.viewKit.name).toBe('custom');
      dispose();
    });
  });

  it('provides intent to children', () => {
    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        intent: 'edit',
        get children() {
          captured = useViews();
          return null;
        },
      });

      expect(captured?.intent).toBe('edit');
      dispose();
    });
  });

  it('provides can() to children', () => {
    const customCan = (action: string) => action === 'view';

    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        can: customCan,
        get children() {
          captured = useViews();
          return null;
        },
      });

      expect(captured?.can('view', {})).toBe(true);
      expect(captured?.can('edit', {})).toBe(false);
      dispose();
    });
  });

  it('provides overrides to children', () => {
    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        overrides: { IssueCard: { title: false } },
        get children() {
          captured = useViews();
          return null;
        },
      });

      expect(captured?.overrides).toEqual({ IssueCard: { title: false } });
      dispose();
    });
  });

  it('nested provider overrides parent viewKit', () => {
    const parentKit = createViewKit({ name: 'parent', extends: defaultViewKit });
    const childKit = createViewKit({ name: 'child', extends: defaultViewKit });

    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        viewKit: parentKit,
        get children() {
          ViewsProvider({
            viewKit: childKit,
            get children() {
              captured = useViews();
              return null;
            },
          });
          return null;
        },
      });

      expect(captured?.viewKit.name).toBe('child');
      dispose();
    });
  });

  it('nested provider inherits parent intent if not specified', () => {
    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        intent: 'edit',
        get children() {
          ViewsProvider({
            get children() {
              captured = useViews();
              return null;
            },
          });
          return null;
        },
      });

      expect(captured?.intent).toBe('edit');
      dispose();
    });
  });

  it('nested provider merges overrides', () => {
    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        overrides: { IssueCard: { title: false } },
        get children() {
          ViewsProvider({
            overrides: { IssueRow: { status: 'disabled' } },
            get children() {
              captured = useViews();
              return null;
            },
          });
          return null;
        },
      });

      expect(captured?.overrides).toEqual({
        IssueCard: { title: false },
        IssueRow: { status: 'disabled' },
      });
      dispose();
    });
  });

  it('nested provider can override parent intent', () => {
    createRoot((dispose) => {
      let captured: ReturnType<typeof useViews> | undefined;

      ViewsProvider({
        intent: 'edit',
        get children() {
          ViewsProvider({
            intent: 'pick',
            get children() {
              captured = useViews();
              return null;
            },
          });
          return null;
        },
      });

      expect(captured?.intent).toBe('pick');
      dispose();
    });
  });
});
