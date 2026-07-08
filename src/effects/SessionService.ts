import { Context, Effect } from 'effect';
import type { SessionNotFoundError, SessionCreationError } from './errors';

export interface Session {
  readonly id: string;
  readonly name: string;
  readonly workingDirectory: string;
  readonly createdAt: Date;
  readonly model?: string;
}

export interface CreateSessionParams {
  readonly name: string;
  readonly workingDirectory: string;
  readonly model?: string;
}

export interface SessionService {
  readonly create: (params: CreateSessionParams) => Effect.Effect<Session, SessionCreationError>;
  readonly get: (id: string) => Effect.Effect<Session, SessionNotFoundError>;
  readonly list: Effect.Effect<ReadonlyArray<Session>>;
  readonly remove: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly setActive: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly getActive: Effect.Effect<Session | null>;
}

export const SessionService = Context.GenericTag<SessionService>('SessionService');
