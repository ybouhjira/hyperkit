import { Context, Effect, Stream } from 'effect';
import type { WebSocketError, WebSocketConnectionError } from './errors';

// Message types
export interface WsMessage {
  readonly type: string;
  readonly [key: string]: unknown;
}

// Service interface
export interface WebSocketService {
  readonly connect: (url: string) => Effect.Effect<void, WebSocketConnectionError>;
  readonly disconnect: Effect.Effect<void, WebSocketError>;
  readonly send: (message: WsMessage) => Effect.Effect<void, WebSocketError>;
  readonly messages: Stream.Stream<WsMessage, WebSocketError>;
  readonly isConnected: Effect.Effect<boolean>;
}

// Context Tag
export const WebSocketService = Context.GenericTag<WebSocketService>('WebSocketService');
