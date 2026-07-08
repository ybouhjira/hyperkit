import { onCleanup } from 'solid-js';
import type { EventBus } from './EventBus';

type EventHandler<T = unknown> = (payload: T) => void;

export function useEventBus<Events extends Record<string, unknown>>(
  bus: EventBus<Events>
): {
  emit: EventBus<Events>['emit'];
  on: <K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>) => void;
} {
  const unsubs: (() => void)[] = [];

  onCleanup(() => {
    for (const unsub of unsubs) unsub();
  });

  return {
    emit: bus.emit.bind(bus),
    on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): void {
      unsubs.push(bus.on(event, handler));
    },
  };
}
