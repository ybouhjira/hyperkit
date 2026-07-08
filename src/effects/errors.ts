import { Data } from 'effect';

// WebSocket errors
export class WebSocketError extends Data.TaggedError('WebSocketError')<{
  readonly reason: string;
  readonly code?: number;
}> {}

export class WebSocketConnectionError extends Data.TaggedError('WebSocketConnectionError')<{
  readonly url: string;
  readonly reason: string;
}> {}

// Session errors
export class SessionNotFoundError extends Data.TaggedError('SessionNotFoundError')<{
  readonly sessionId: string;
}> {}

export class SessionCreationError extends Data.TaggedError('SessionCreationError')<{
  readonly reason: string;
}> {}

// File system errors
export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  readonly path: string;
  readonly reason: string;
}> {}

export class DirectoryNotFoundError extends Data.TaggedError('DirectoryNotFoundError')<{
  readonly path: string;
}> {}

// Clipboard errors
export class ClipboardError extends Data.TaggedError('ClipboardError')<{
  readonly reason: string;
}> {}

// Generic API error
export class ApiError extends Data.TaggedError('ApiError')<{
  readonly status: number;
  readonly message: string;
  readonly url?: string;
}> {}

// User errors
export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  readonly userId: string;
}> {}

export class UserAlreadyExistsError extends Data.TaggedError('UserAlreadyExistsError')<{
  readonly email: string;
}> {}

export class InvalidInviteError extends Data.TaggedError('InvalidInviteError')<{
  readonly token: string;
  readonly reason: string;
}> {}

// License errors
export class LicenseNotFoundError extends Data.TaggedError('LicenseNotFoundError')<{
  readonly product: string;
  readonly userId: string;
}> {}

export class LicenseInvalidError extends Data.TaggedError('LicenseInvalidError')<{
  readonly key: string;
  readonly reason: string;
}> {}

// AI state bridge errors
export class AiStateError extends Data.TaggedError('AiStateError')<{
  readonly reason: string;
  readonly selector?: string;
}> {}
