type EventHandler<T = unknown> = (payload: T) => void;
type WildcardHandler = (event: string, payload: unknown) => void;

export interface EventBus<Events extends Record<string, unknown>> {
  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void;
  on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): () => void;
  once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): () => void;
  onAny(handler: WildcardHandler): () => void;
  off<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): void;
  clear(): void;
}

export function createEventBus<Events extends Record<string, unknown>>(): EventBus<Events> {
  const handlers = new Map<string, Set<EventHandler>>();
  const wildcardHandlers = new Set<WildcardHandler>();

  function getHandlerSet(event: string): Set<EventHandler> {
    let set = handlers.get(event);
    if (!set) {
      set = new Set();
      handlers.set(event, set);
    }
    return set;
  }

  return {
    emit<K extends keyof Events & string>(event: K, payload: Events[K]): void {
      const set = handlers.get(event);
      if (set) {
        for (const handler of set) {
          try {
            handler(payload);
          } catch {
            /* swallow */
          }
        }
      }
      for (const handler of wildcardHandlers) {
        try {
          handler(event, payload);
        } catch {
          /* swallow */
        }
      }
    },

    on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): () => void {
      const set = getHandlerSet(event);
      set.add(handler as EventHandler);
      return () => set.delete(handler as EventHandler);
    },

    once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): () => void {
      const set = getHandlerSet(event);
      const wrapped: EventHandler = (payload) => {
        set.delete(wrapped);
        handler(payload as Events[K]);
      };
      set.add(wrapped);
      return () => set.delete(wrapped);
    },

    onAny(handler: WildcardHandler): () => void {
      wildcardHandlers.add(handler);
      return () => wildcardHandlers.delete(handler);
    },

    off<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): void {
      const set = handlers.get(event);
      if (set) set.delete(handler as EventHandler);
    },

    clear(): void {
      handlers.clear();
      wildcardHandlers.clear();
    },
  };
}
