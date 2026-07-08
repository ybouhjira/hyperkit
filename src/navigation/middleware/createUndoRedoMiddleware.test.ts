import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  clearActionMiddlewares,
  clearActionHistory,
  clearActionEventListeners,
  clearStateListeners,
  addActionMiddleware,
  dispatchAction,
} from '../NavigableRegistry';
import { createUndoRedoMiddleware } from './createUndoRedoMiddleware';

function makeStatefulNav(id: string, initial = 0) {
  let value = initial;
  const actions = new Map();
  actions.set('set', {
    name: 'set',
    description: 'Set value',
    handler: (params: unknown) => {
      value = (params as { value: number }).value;
      return value;
    },
  });
  actions.set('get', {
    name: 'get',
    description: 'Get value',
    handler: () => value,
  });
  return {
    id,
    label: id,
    actions,
    getState: () => ({ value }),
    restoreState: (state: unknown) => {
      value = (state as { value: number }).value;
    },
  };
}

describe('createUndoRedoMiddleware', () => {
  let handle: ReturnType<typeof createUndoRedoMiddleware>;

  beforeEach(() => {
    clearNavigables();
    clearActionMiddlewares();
    clearActionHistory();
    clearActionEventListeners();
    clearStateListeners();
    handle = createUndoRedoMiddleware();
    addActionMiddleware(handle.middleware);
  });

  it('initially cannot undo or redo', () => {
    expect(handle.canUndo()).toBe(false);
    expect(handle.canRedo()).toBe(false);
  });

  it('tracks actions and enables undo', async () => {
    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 10 });
    expect(handle.canUndo()).toBe(true);
  });

  it('undo restores previous state', async () => {
    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 10 });
    await dispatchAction('nav', 'set', { value: 20 });

    const result = await handle.undo();
    expect(result.ok).toBe(true);

    const getResult = await dispatchAction('nav', 'get');
    expect(getResult.data).toBe(10);
  });

  it('redo restores forward state', async () => {
    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 10 });
    await handle.undo();

    const result = await handle.redo();
    expect(result.ok).toBe(true);

    const getResult = await dispatchAction('nav', 'get');
    expect(getResult.data).toBe(10);
  });

  it('new action clears redo stack', async () => {
    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 10 });
    await handle.undo();
    expect(handle.canRedo()).toBe(true);

    await dispatchAction('nav', 'set', { value: 99 });
    expect(handle.canRedo()).toBe(false);
  });

  it('respects maxHistory', async () => {
    const undoRedo = createUndoRedoMiddleware({ maxHistory: 3 });
    clearActionMiddlewares();
    addActionMiddleware(undoRedo.middleware);

    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 1 });
    await dispatchAction('nav', 'set', { value: 2 });
    await dispatchAction('nav', 'set', { value: 3 });
    await dispatchAction('nav', 'set', { value: 4 });

    expect(undoRedo.history()).toHaveLength(3);
  });

  it('filter excludes actions from tracking', async () => {
    const undoRedo = createUndoRedoMiddleware({
      filter: (ctx) => ctx.action !== 'get',
    });
    clearActionMiddlewares();
    addActionMiddleware(undoRedo.middleware);

    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'get');
    expect(undoRedo.canUndo()).toBe(false);

    await dispatchAction('nav', 'set', { value: 5 });
    expect(undoRedo.canUndo()).toBe(true);
  });

  it('undo with nothing returns error', async () => {
    const result = await handle.undo();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Nothing to undo');
  });

  it('redo with nothing returns error', async () => {
    const result = await handle.redo();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Nothing to redo');
  });

  it('does not track failed actions', async () => {
    const actions = new Map();
    actions.set('fail', {
      name: 'fail',
      description: 'Fails',
      handler: () => {
        throw new Error('oops');
      },
    });
    registerNavigable({
      id: 'nav',
      label: 'nav',
      actions,
      getState: () => ({}),
      restoreState: () => {},
    });

    await dispatchAction('nav', 'fail');
    expect(handle.canUndo()).toBe(false);
  });

  it('clear empties both stacks', async () => {
    registerNavigable(makeStatefulNav('nav', 0));
    await dispatchAction('nav', 'set', { value: 1 });
    handle.clear();
    expect(handle.canUndo()).toBe(false);
  });
});
