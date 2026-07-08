import { describe, it, expect } from 'vitest';
import { Effect, Layer, Ref, HashMap } from 'effect';
import { SessionService, type Session } from './SessionService';
import { SessionNotFoundError } from './errors';

const makeTestSessionService = Effect.gen(function* () {
  const store = yield* Ref.make(HashMap.empty<string, Session>());
  const activeId = yield* Ref.make<string | null>(null);
  let counter = 0;

  return SessionService.of({
    create: (params) =>
      Effect.gen(function* () {
        const id = `session-${++counter}`;
        const session: Session = { id, ...params, createdAt: new Date() };
        yield* Ref.update(store, HashMap.set(id, session));
        return session;
      }),
    get: (id) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(store);
        const session = HashMap.get(map, id);
        if (session._tag === 'None') {
          return yield* Effect.fail(new SessionNotFoundError({ sessionId: id }));
        }
        return session.value;
      }),
    list: Effect.gen(function* () {
      const map = yield* Ref.get(store);
      return [...HashMap.values(map)];
    }),
    remove: (id) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(store);
        if (!HashMap.has(map, id)) {
          return yield* Effect.fail(new SessionNotFoundError({ sessionId: id }));
        }
        yield* Ref.update(store, HashMap.remove(id));
      }),
    setActive: (id) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(store);
        if (!HashMap.has(map, id)) {
          return yield* Effect.fail(new SessionNotFoundError({ sessionId: id }));
        }
        yield* Ref.set(activeId, id);
      }),
    getActive: Effect.gen(function* () {
      const id = yield* Ref.get(activeId);
      if (!id) return null;
      const map = yield* Ref.get(store);
      const session = HashMap.get(map, id);
      return session._tag === 'None' ? null : session.value;
    }),
  });
});

const TestLayer = Layer.effect(SessionService, makeTestSessionService);

describe('SessionService', () => {
  it('create returns a Session with generated id', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;
      const session = yield* service.create({
        name: 'Test Session',
        workingDirectory: '/tmp/test',
        model: 'claude-opus-4',
      });

      expect(session.id).toMatch(/^session-\d+$/);
      expect(session.name).toBe('Test Session');
      expect(session.workingDirectory).toBe('/tmp/test');
      expect(session.model).toBe('claude-opus-4');
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });

  it('get finds existing session', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;
      const created = yield* service.create({
        name: 'Test Session',
        workingDirectory: '/tmp/test',
      });

      const found = yield* service.get(created.id);
      expect(found).toEqual(created);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });

  it('get fails with SessionNotFoundError for missing id', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;
      yield* service.get('non-existent-id');
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer), Effect.flip));

    expect(result).toBeInstanceOf(SessionNotFoundError);
    expect(result.sessionId).toBe('non-existent-id');
  });

  it('list returns all sessions', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;

      const session1 = yield* service.create({
        name: 'Session 1',
        workingDirectory: '/tmp/1',
      });
      const session2 = yield* service.create({
        name: 'Session 2',
        workingDirectory: '/tmp/2',
      });

      const sessions = yield* service.list;
      expect(sessions).toHaveLength(2);
      expect(sessions).toContainEqual(session1);
      expect(sessions).toContainEqual(session2);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });

  it('remove deletes a session', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;

      const session = yield* service.create({
        name: 'To Delete',
        workingDirectory: '/tmp/delete',
      });

      yield* service.remove(session.id);

      const sessions = yield* service.list;
      expect(sessions).toHaveLength(0);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });

  it('remove fails with SessionNotFoundError for missing id', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;
      yield* service.remove('non-existent-id');
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer), Effect.flip));

    expect(result).toBeInstanceOf(SessionNotFoundError);
    expect(result.sessionId).toBe('non-existent-id');
  });

  it('setActive/getActive works', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;

      const activeBeforeSet = yield* service.getActive;
      expect(activeBeforeSet).toBeNull();

      const session = yield* service.create({
        name: 'Active Session',
        workingDirectory: '/tmp/active',
      });

      yield* service.setActive(session.id);

      const active = yield* service.getActive;
      expect(active).toEqual(session);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });

  it('setActive fails with SessionNotFoundError for missing id', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;
      yield* service.setActive('non-existent-id');
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer), Effect.flip));

    expect(result).toBeInstanceOf(SessionNotFoundError);
    expect(result.sessionId).toBe('non-existent-id');
  });

  it('getActive returns null when active session was removed', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SessionService;

      const session = yield* service.create({
        name: 'Active Session',
        workingDirectory: '/tmp/active',
      });

      yield* service.setActive(session.id);
      yield* service.remove(session.id);

      const active = yield* service.getActive;
      expect(active).toBeNull();
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
  });
});
