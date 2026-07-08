import {
  inspectNavigables,
  dispatchAction,
  onActionDispatched,
  onAnyStateChange,
} from '../NavigableRegistry';
import type { NavigableTransportAdapter, TransportOptions, TransportMessage } from './types';

export function connectTransport(
  adapter: NavigableTransportAdapter,
  options: TransportOptions = {}
): () => void {
  const { syncActionEvents = true, syncStateChanges = true } = options;
  const cleanups: (() => void)[] = [];

  // Handle incoming messages from server
  const unsubMessage = adapter.onMessage((msg: TransportMessage) => {
    void (async () => {
      switch (msg.type) {
        case 'inspect': {
          const data = inspectNavigables();
          adapter.send({ type: 'inspect-result', requestId: msg.requestId, data });
          break;
        }
        case 'dispatch': {
          const result = await dispatchAction(msg.target, msg.action, msg.params);
          adapter.send({ type: 'dispatch-result', requestId: msg.requestId, result });
          break;
        }
        // Client ignores result messages (those are for the server side)
        default:
          break;
      }
    })();
  });
  cleanups.push(unsubMessage);

  // Forward action events to server
  if (syncActionEvents) {
    const unsubEvents = onActionDispatched((event) => {
      if (adapter.isConnected()) {
        adapter.send({ type: 'action-event', event });
      }
    });
    cleanups.push(unsubEvents);
  }

  // Forward state changes to server
  if (syncStateChanges) {
    const unsubState = onAnyStateChange((target, newState) => {
      if (adapter.isConnected()) {
        adapter.send({ type: 'state-change', target, state: newState });
      }
    });
    cleanups.push(unsubState);
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
    adapter.disconnect();
  };
}
