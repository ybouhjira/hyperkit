import type {
  NavigableDefinition,
  NavigableActionEntry,
  DispatchResult,
  NavigableInfo,
  ActionMiddleware,
  ActionEvent,
} from '../NavigableRegistry';

export interface MockNavigableOptions {
  id: string;
  label?: string;
  category?: string;
  actions: Array<{
    name: string;
    description?: string;
    params?: Record<string, unknown>;
    handler: (params: unknown) => unknown | Promise<unknown>;
  }>;
  initialState?: unknown;
}

export interface MockNavigableHandle {
  id: string;
  getState(): unknown;
  setState(state: unknown): void;
  getCallHistory(): Array<{ action: string; params: unknown; result: DispatchResult }>;
}

export class TestNavigableRegistry {
  private registry = new Map<string, NavigableDefinition>();
  private callHistory: Array<{
    target: string;
    action: string;
    params: unknown;
    result: DispatchResult;
  }> = [];
  private middlewares: ActionMiddleware[] = [];
  private eventListeners: Array<(event: ActionEvent) => void> = [];
  private eventCounter = 0;

  register(options: MockNavigableOptions): MockNavigableHandle {
    let state =
      options.initialState !== undefined
        ? JSON.parse(JSON.stringify(options.initialState))
        : undefined;

    const actions = new Map<string, NavigableActionEntry>();
    for (const action of options.actions) {
      actions.set(action.name, {
        name: action.name,
        description: action.description ?? action.name,
        ...(action.params ? { params: action.params } : {}),
        handler: action.handler,
      });
    }

    const def: NavigableDefinition = {
      id: options.id,
      label: options.label ?? options.id,
      ...(options.category ? { category: options.category } : {}),
      actions,
      ...(state !== undefined
        ? {
            getState: () => state,
            restoreState: (s: unknown) => {
              state = s;
            },
          }
        : {}),
    };

    this.registry.set(options.id, def);

    return {
      id: options.id,
      getState: () => state,
      setState: (s: unknown) => {
        state = s;
      },
      getCallHistory: () =>
        this.callHistory
          .filter((c) => c.target === options.id)
          .map(({ action, params, result }) => ({ action, params, result })),
    };
  }

  unregister(id: string): void {
    this.registry.delete(id);
  }

  addMiddleware(mw: ActionMiddleware): () => void {
    this.middlewares.push(mw);
    return () => {
      const idx = this.middlewares.indexOf(mw);
      if (idx >= 0) this.middlewares.splice(idx, 1);
    };
  }

  onAction(listener: (event: ActionEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const idx = this.eventListeners.indexOf(listener);
      if (idx >= 0) this.eventListeners.splice(idx, 1);
    };
  }

  async dispatch(target: string, action: string, params?: unknown): Promise<DispatchResult> {
    const context = { target, action, params };
    const startTime = performance.now();

    const coreDispatch = async (): Promise<DispatchResult> => {
      try {
        const def = this.registry.get(target);
        if (!def) return { ok: false, error: `Navigable "${target}" is not registered` };
        const entry = def.actions.get(action);
        if (!entry)
          return { ok: false, error: `Action "${action}" not found on navigable "${target}"` };
        const data = await Promise.resolve(entry.handler(params));
        return { ok: true, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, error: message };
      }
    };

    let result: DispatchResult;
    if (this.middlewares.length === 0) {
      result = await coreDispatch();
    } else {
      let index = 0;
      const executeNext = (): Promise<DispatchResult> => {
        if (index < this.middlewares.length) {
          const mw = this.middlewares[index++] as (typeof this.middlewares)[number];
          return mw(context, executeNext);
        }
        return coreDispatch();
      };
      result = await executeNext();
    }

    const duration = performance.now() - startTime;
    this.callHistory.push({ target, action, params, result });

    const event: ActionEvent = {
      id: String(++this.eventCounter),
      target,
      action,
      params,
      result,
      timestamp: Date.now(),
      duration,
    };
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch {
        /* swallow */
      }
    }

    return result;
  }

  inspect(): NavigableInfo[] {
    return Array.from(this.registry.values()).map((def) => ({
      id: def.id,
      label: def.label,
      ...(def.category ? { category: def.category } : {}),
      actions: Array.from(def.actions.values()).map(({ name, description, params }) => ({
        name,
        description,
        ...(params ? { params } : {}),
      })),
      ...(def.getState ? { state: def.getState() } : {}),
    }));
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  clear(): void {
    this.registry.clear();
    this.callHistory.length = 0;
    this.middlewares.length = 0;
    this.eventListeners.length = 0;
  }
}

export function createTestRegistry(): TestNavigableRegistry {
  return new TestNavigableRegistry();
}
