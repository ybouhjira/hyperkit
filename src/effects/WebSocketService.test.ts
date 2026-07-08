import { describe, it, expect } from 'vitest';
import { Effect, Stream, Layer, Ref, Chunk } from 'effect';
import { WebSocketService, type WsMessage } from './WebSocketService';
import { WebSocketConnectionError, WebSocketError } from './errors';

// Test implementation
const makeTestWebSocketService = Effect.gen(function* () {
  const connected = yield* Ref.make(false);
  const sent = yield* Ref.make<Array<WsMessage>>([]);

  return WebSocketService.of({
    connect: (url: string) =>
      Effect.gen(function* () {
        if (url === 'invalid') {
          return yield* Effect.fail(new WebSocketConnectionError({ url, reason: 'invalid url' }));
        }
        yield* Ref.set(connected, true);
      }),
    disconnect: Effect.gen(function* () {
      yield* Ref.set(connected, false);
    }),
    send: (message: WsMessage) =>
      Effect.gen(function* () {
        const isConn = yield* Ref.get(connected);
        if (!isConn) {
          return yield* Effect.fail(new WebSocketError({ reason: 'not connected' }));
        }
        yield* Ref.update(sent, (msgs) => [...msgs, message]);
      }),
    messages: Stream.make({ type: 'test', data: 'hello' }),
    isConnected: Ref.get(connected),
  });
});

const TestLayer = Layer.effect(WebSocketService, makeTestWebSocketService);

describe('WebSocketService', () => {
  it('should connect successfully', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      yield* ws.connect('ws://localhost');
      return yield* ws.isConnected;
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromise(program);
    expect(result).toBe(true);
  });

  it('should fail to connect with invalid url', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      yield* ws.connect('invalid');
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe('Failure');
    if (result._tag === 'Failure') {
      const error = result.cause;
      expect(error).toBeDefined();
    }
  });

  it('should send message when connected', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      yield* ws.connect('ws://localhost');
      yield* ws.send({ type: 'ping', value: 42 });
    }).pipe(Effect.provide(TestLayer));

    await Effect.runPromise(program);
  });

  it('should fail to send when not connected', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      yield* ws.send({ type: 'ping', value: 42 });
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe('Failure');
  });

  it('should disconnect successfully', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      yield* ws.connect('ws://localhost');
      yield* ws.disconnect;
      return yield* ws.isConnected;
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromise(program);
    expect(result).toBe(false);
  });

  it('should stream messages', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      const messages = yield* Stream.runCollect(ws.messages);
      return Chunk.toReadonlyArray(messages);
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromise(program);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual({ type: 'test', data: 'hello' });
  });

  it('should return connection status', async () => {
    const program = Effect.gen(function* () {
      const ws = yield* WebSocketService;
      const beforeConnect = yield* ws.isConnected;
      yield* ws.connect('ws://localhost');
      const afterConnect = yield* ws.isConnected;
      return { beforeConnect, afterConnect };
    }).pipe(Effect.provide(TestLayer));

    const result = await Effect.runPromise(program);
    expect(result.beforeConnect).toBe(false);
    expect(result.afterConnect).toBe(true);
  });
});
