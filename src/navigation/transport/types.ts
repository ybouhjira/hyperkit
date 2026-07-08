import type { DispatchResult, NavigableInfo, ActionEvent } from '../NavigableRegistry';

export type TransportMessage =
  | { type: 'inspect'; requestId: string }
  | { type: 'inspect-result'; requestId: string; data: NavigableInfo[] }
  | { type: 'dispatch'; requestId: string; target: string; action: string; params?: unknown }
  | { type: 'dispatch-result'; requestId: string; result: DispatchResult }
  | { type: 'state-change'; target: string; state: unknown }
  | { type: 'action-event'; event: ActionEvent };

export interface NavigableTransportAdapter {
  send(message: TransportMessage): void;
  onMessage(handler: (msg: TransportMessage) => void): () => void;
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
}

export interface TransportOptions {
  syncActionEvents?: boolean;
  syncStateChanges?: boolean;
  timeout?: number;
}
