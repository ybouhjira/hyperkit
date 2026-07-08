import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  WebSocketError,
  WebSocketConnectionError,
  SessionNotFoundError,
  SessionCreationError,
  FileSystemError,
  DirectoryNotFoundError,
  ClipboardError,
  ApiError,
} from './errors';

describe('errors', () => {
  describe('WebSocketError', () => {
    it('should create with correct tag', () => {
      const error = new WebSocketError({ reason: 'connection lost' });
      expect(error._tag).toBe('WebSocketError');
      expect(error.reason).toBe('connection lost');
    });

    it('should support optional code', () => {
      const error = new WebSocketError({ reason: 'connection lost', code: 1006 });
      expect(error.code).toBe(1006);
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new WebSocketError({ reason: 'test' })).pipe(
        Effect.catchTag('WebSocketError', (e) => Effect.succeed(`caught: ${e.reason}`))
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('caught: test');
    });

    it('should support structural equality', () => {
      const a = new WebSocketError({ reason: 'x' });
      const b = new WebSocketError({ reason: 'x' });
      expect(a.reason).toBe(b.reason);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('WebSocketConnectionError', () => {
    it('should create with correct tag', () => {
      const error = new WebSocketConnectionError({
        url: 'ws://localhost:8080',
        reason: 'timeout',
      });
      expect(error._tag).toBe('WebSocketConnectionError');
      expect(error.url).toBe('ws://localhost:8080');
      expect(error.reason).toBe('timeout');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(
        new WebSocketConnectionError({ url: 'ws://test', reason: 'refused' })
      ).pipe(
        Effect.catchTag('WebSocketConnectionError', (e) => Effect.succeed(`${e.url}: ${e.reason}`))
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('ws://test: refused');
    });

    it('should support structural equality', () => {
      const a = new WebSocketConnectionError({ url: 'ws://x', reason: 'y' });
      const b = new WebSocketConnectionError({ url: 'ws://x', reason: 'y' });
      expect(a.url).toBe(b.url);
      expect(a.reason).toBe(b.reason);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('SessionNotFoundError', () => {
    it('should create with correct tag', () => {
      const error = new SessionNotFoundError({ sessionId: 'abc123' });
      expect(error._tag).toBe('SessionNotFoundError');
      expect(error.sessionId).toBe('abc123');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new SessionNotFoundError({ sessionId: '123' })).pipe(
        Effect.catchTag('SessionNotFoundError', (e) =>
          Effect.succeed(`session ${e.sessionId} not found`)
        )
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('session 123 not found');
    });

    it('should support structural equality', () => {
      const a = new SessionNotFoundError({ sessionId: 'x' });
      const b = new SessionNotFoundError({ sessionId: 'x' });
      expect(a.sessionId).toBe(b.sessionId);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('SessionCreationError', () => {
    it('should create with correct tag', () => {
      const error = new SessionCreationError({ reason: 'invalid config' });
      expect(error._tag).toBe('SessionCreationError');
      expect(error.reason).toBe('invalid config');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new SessionCreationError({ reason: 'fail' })).pipe(
        Effect.catchTag('SessionCreationError', (e) =>
          Effect.succeed(`creation failed: ${e.reason}`)
        )
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('creation failed: fail');
    });

    it('should support structural equality', () => {
      const a = new SessionCreationError({ reason: 'x' });
      const b = new SessionCreationError({ reason: 'x' });
      expect(a.reason).toBe(b.reason);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('FileSystemError', () => {
    it('should create with correct tag', () => {
      const error = new FileSystemError({ path: '/tmp/test', reason: 'permission denied' });
      expect(error._tag).toBe('FileSystemError');
      expect(error.path).toBe('/tmp/test');
      expect(error.reason).toBe('permission denied');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new FileSystemError({ path: '/x', reason: 'not found' })).pipe(
        Effect.catchTag('FileSystemError', (e) => Effect.succeed(`${e.path}: ${e.reason}`))
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('/x: not found');
    });

    it('should support structural equality', () => {
      const a = new FileSystemError({ path: '/x', reason: 'y' });
      const b = new FileSystemError({ path: '/x', reason: 'y' });
      expect(a.path).toBe(b.path);
      expect(a.reason).toBe(b.reason);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('DirectoryNotFoundError', () => {
    it('should create with correct tag', () => {
      const error = new DirectoryNotFoundError({ path: '/missing/dir' });
      expect(error._tag).toBe('DirectoryNotFoundError');
      expect(error.path).toBe('/missing/dir');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new DirectoryNotFoundError({ path: '/x' })).pipe(
        Effect.catchTag('DirectoryNotFoundError', (e) =>
          Effect.succeed(`directory ${e.path} not found`)
        )
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('directory /x not found');
    });

    it('should support structural equality', () => {
      const a = new DirectoryNotFoundError({ path: '/x' });
      const b = new DirectoryNotFoundError({ path: '/x' });
      expect(a.path).toBe(b.path);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('ClipboardError', () => {
    it('should create with correct tag', () => {
      const error = new ClipboardError({ reason: 'access denied' });
      expect(error._tag).toBe('ClipboardError');
      expect(error.reason).toBe('access denied');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new ClipboardError({ reason: 'test' })).pipe(
        Effect.catchTag('ClipboardError', (e) => Effect.succeed(`clipboard error: ${e.reason}`))
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('clipboard error: test');
    });

    it('should support structural equality', () => {
      const a = new ClipboardError({ reason: 'x' });
      const b = new ClipboardError({ reason: 'x' });
      expect(a.reason).toBe(b.reason);
      expect(a._tag).toBe(b._tag);
    });
  });

  describe('ApiError', () => {
    it('should create with correct tag', () => {
      const error = new ApiError({ status: 404, message: 'Not Found' });
      expect(error._tag).toBe('ApiError');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
    });

    it('should support optional url', () => {
      const error = new ApiError({
        status: 500,
        message: 'Server Error',
        url: '/api/users',
      });
      expect(error.url).toBe('/api/users');
    });

    it('should support catchTag', async () => {
      const program = Effect.fail(new ApiError({ status: 403, message: 'Forbidden' })).pipe(
        Effect.catchTag('ApiError', (e) => Effect.succeed(`${e.status}: ${e.message}`))
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('403: Forbidden');
    });

    it('should support structural equality', () => {
      const a = new ApiError({ status: 200, message: 'OK' });
      const b = new ApiError({ status: 200, message: 'OK' });
      expect(a.status).toBe(b.status);
      expect(a.message).toBe(b.message);
      expect(a._tag).toBe(b._tag);
    });
  });
});
