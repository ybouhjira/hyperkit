import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createNavigable } from './createNavigable';
import { clearNavigables, getNavigable, dispatchAction } from './NavigableRegistry';

describe('createNavigable', () => {
  beforeEach(() => {
    clearNavigables();
  });

  // ── Registration ──────────────────────────────────────────────────────────

  describe('registration', () => {
    it('registers the navigable when created', () =>
      createRoot((dispose) => {
        createNavigable({
          id: 'test-nav',
          label: 'Test Navigable',
          actions: [],
        });

        expect(getNavigable('test-nav')).toBeDefined();
        expect(getNavigable('test-nav')!.label).toBe('Test Navigable');

        dispose();
      }));

    it('exposes the registered ID on the handle', () =>
      createRoot((dispose) => {
        const handle = createNavigable({
          id: 'my-panel',
          label: 'My Panel',
          actions: [],
        });

        expect(handle.id).toBe('my-panel');

        dispose();
      }));

    it('registers with category when provided', () =>
      createRoot((dispose) => {
        createNavigable({
          id: 'dialog-nav',
          label: 'Dialog',
          category: 'dialog',
          actions: [],
        });

        expect(getNavigable('dialog-nav')!.category).toBe('dialog');

        dispose();
      }));

    it('wires up getState when provided', () =>
      createRoot((dispose) => {
        let count = 0;
        createNavigable({
          id: 'stateful',
          label: 'Stateful',
          actions: [],
          getState: () => ({ count }),
        });

        count = 5;
        expect(getNavigable('stateful')!.getState!()).toEqual({ count: 5 });

        dispose();
      }));

    it('registers initial actions', async () =>
      createRoot(async (dispose) => {
        createNavigable({
          id: 'with-actions',
          label: 'With Actions',
          actions: [
            {
              name: 'greet',
              description: 'Returns a greeting',
              handler: (params: unknown) => `hello ${(params as { name: string }).name}`,
            },
          ],
        });

        const result = await dispatchAction('with-actions', 'greet', { name: 'world' });
        expect(result.ok).toBe(true);
        expect(result.data).toBe('hello world');

        dispose();
      }));
  });

  // ── Auto-unregister on cleanup ────────────────────────────────────────────

  describe('cleanup', () => {
    it('auto-unregisters when the reactive scope is disposed', () => {
      let disposeRoot!: () => void;

      createRoot((dispose) => {
        createNavigable({ id: 'scoped', label: 'Scoped', actions: [] });
        disposeRoot = dispose;
      });

      expect(getNavigable('scoped')).toBeDefined();

      disposeRoot();

      expect(getNavigable('scoped')).toBeUndefined();
    });
  });

  // ── addAction ─────────────────────────────────────────────────────────────

  describe('addAction', () => {
    it('adds a new action at runtime', async () =>
      createRoot(async (dispose) => {
        const handle = createNavigable({
          id: 'dynamic',
          label: 'Dynamic',
          actions: [],
        });

        handle.addAction({
          name: 'wave',
          description: 'Waves',
          handler: () => 'waving',
        });

        const result = await dispatchAction('dynamic', 'wave');
        expect(result.ok).toBe(true);
        expect(result.data).toBe('waving');

        dispose();
      }));

    it('overwrites an action with the same name', async () =>
      createRoot(async (dispose) => {
        const handle = createNavigable({
          id: 'overwrite-test',
          label: 'Overwrite Test',
          actions: [{ name: 'do', description: 'v1', handler: () => 'v1' }],
        });

        handle.addAction({ name: 'do', description: 'v2', handler: () => 'v2' });

        const result = await dispatchAction('overwrite-test', 'do');
        expect(result.data).toBe('v2');

        dispose();
      }));
  });

  // ── removeAction ──────────────────────────────────────────────────────────

  describe('removeAction', () => {
    it('removes an action by name', async () =>
      createRoot(async (dispose) => {
        const handle = createNavigable({
          id: 'removable',
          label: 'Removable',
          actions: [{ name: 'vanish', description: 'Will be removed', handler: () => 'here' }],
        });

        handle.removeAction('vanish');

        const result = await dispatchAction('removable', 'vanish');
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/vanish/);

        dispose();
      }));

    it('is a no-op when action does not exist', () =>
      createRoot((dispose) => {
        const handle = createNavigable({
          id: 'safe-remove',
          label: 'Safe Remove',
          actions: [],
        });

        expect(() => handle.removeAction('ghost')).not.toThrow();

        dispose();
      }));
  });

  // ── dispose ───────────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('manually unregisters the navigable', () =>
      createRoot((dispose) => {
        const handle = createNavigable({
          id: 'manual-dispose',
          label: 'Manual Dispose',
          actions: [],
        });

        expect(getNavigable('manual-dispose')).toBeDefined();

        handle.dispose();

        expect(getNavigable('manual-dispose')).toBeUndefined();

        dispose();
      }));

    it('does not throw when called a second time (double-dispose safety)', () =>
      createRoot((dispose) => {
        const handle = createNavigable({
          id: 'double-dispose',
          label: 'Double Dispose',
          actions: [],
        });

        handle.dispose();
        expect(() => handle.dispose()).not.toThrow();

        dispose();
      }));

    it('does not re-register after dispose when scope cleans up', () => {
      let disposeRoot!: () => void;
      let handle!: ReturnType<typeof createNavigable>;

      createRoot((dispose) => {
        handle = createNavigable({ id: 'no-re-register', label: 'No Re-register', actions: [] });
        disposeRoot = dispose;
      });

      handle.dispose();
      expect(getNavigable('no-re-register')).toBeUndefined();

      // Disposing the scope again should not throw or re-register
      expect(() => disposeRoot()).not.toThrow();
      expect(getNavigable('no-re-register')).toBeUndefined();
    });
  });
});
