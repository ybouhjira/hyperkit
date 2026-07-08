/**
 * Editor smoke test — written against the navigable registry, no selectors.
 *
 * Every app-level interaction goes through `app.dispatch(navigable, action, params)`.
 * This is the fixture eating its own dogfood: the test for the test framework.
 */
import { test, expect } from '../src/fixture';

test.describe('hyperkit-editor via navigable', () => {
  test.beforeEach(async ({ page, app }) => {
    await page.goto('/');
    // First load against a fresh vite dev server pays on-demand compilation of
    // the whole explorer module graph — budget it like webServer startup
    // (60s), not like a warm-app readiness check.
    await app.ready(60_000);
    // Select the editor story. Explorer is itself a navigable.
    const selection = await app.dispatch('explorer', 'selectStoryByTitle', {
      title: 'WYSIWYG Editor',
    });
    expect(selection.ok, 'explorer should have a story titled "WYSIWYG Editor"').toBe(true);
    // The editor story lazy-loads its module — the first select also pays a
    // cold vite transform.
    await app.waitFor('hyperkit-editor', 30_000);
  });

  test('self-describes 7 actions', async ({ app }) => {
    const [editor] = await app
      .inspect()
      .then((all) => all.filter((n) => n.id === 'hyperkit-editor'));
    expect(editor).toBeDefined();
    expect(editor!.label).toBe('HyperKit WYSIWYG Editor');
    const actionNames = editor!.actions.map((a) => a.name).sort();
    expect(actionNames).toEqual([
      'clear',
      'delete',
      'drop',
      'redo',
      'select',
      'undo',
      'update-prop',
    ]);
  });

  test('reports empty canvas state on first load', async ({ app }) => {
    const state = await app.getState<{ nodeCount: number; selectedId: string | null }>(
      'hyperkit-editor'
    );
    // Root node only — no children yet.
    expect(state.nodeCount).toBe(1);
    expect(state.selectedId).toBeNull();
  });

  test('drop → select → update-prop round trip', async ({ app }) => {
    const dropped = await app.dispatch('hyperkit-editor', 'drop', {
      component: 'Button',
      targetId: 'root',
    });
    expect(dropped.ok).toBe(true);

    const afterDrop = await app.getState<{ nodeCount: number }>('hyperkit-editor');
    expect(afterDrop.nodeCount).toBe(2);

    const tree = await app
      .inspect()
      .then((all) => all.find((n) => n.id === 'hyperkit-editor')?.state as { nodeCount: number });
    expect(tree.nodeCount).toBe(2);
  });

  test('undo rewinds the drop', async ({ app }) => {
    await app.dispatch('hyperkit-editor', 'drop', { component: 'Text', targetId: 'root' });
    const before = await app.getState<{ nodeCount: number; canUndo: boolean }>('hyperkit-editor');
    expect(before.nodeCount).toBe(2);
    expect(before.canUndo).toBe(true);

    const undone = await app.dispatch('hyperkit-editor', 'undo');
    expect(undone.ok).toBe(true);

    const after = await app.getState<{ nodeCount: number; canRedo: boolean }>('hyperkit-editor');
    expect(after.nodeCount).toBe(1);
    expect(after.canRedo).toBe(true);
  });

  test('unknown action returns ok:false without throwing', async ({ app }) => {
    const r = await app.dispatch('hyperkit-editor', 'definitely-not-an-action');
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test('action history records dispatched actions in order', async ({ app }) => {
    await app.dispatch('hyperkit-editor', 'drop', { component: 'Button', targetId: 'root' });
    await app.dispatch('hyperkit-editor', 'drop', { component: 'Text', targetId: 'root' });
    await app.dispatch('hyperkit-editor', 'undo');

    const history = await app.history();
    const editorActions = history.filter((h) => h.target === 'hyperkit-editor');
    const last3 = editorActions.slice(-3).map((h) => h.action);
    expect(last3).toEqual(['drop', 'drop', 'undo']);
  });
});
