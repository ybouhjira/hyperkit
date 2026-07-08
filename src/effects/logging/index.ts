// ── Service ─────────────────────────────────────────────
export { LoggingService } from './service';
export type { LogEntry, LoggingService as LoggingServiceInterface } from './service';

// ── Types ───────────────────────────────────────────────
export type { LogTransportDef, LoggingServiceConfig } from './types';
export { SimpleTransport, ScopedTransport } from './types';

// ── Layer ───────────────────────────────────────────────
export { makeLoggingLayer } from './makeLoggingLayer';

// ── Pipeline ────────────────────────────────────────────
export { enrichOptions } from './enrichment';
export { redactOptions } from './redaction';
export { shouldSample } from './sampling';

// ── Transports ──────────────────────────────────────────
export { ConsoleTransport } from './transports';
export type { ConsoleTransportConfig } from './transports';
export { HttpTransport } from './transports';
export type { HttpTransportConfig } from './transports';
export { BeaconTransport } from './transports';
export type { BeaconTransportConfig } from './transports';
export { SentryTransport } from './transports';
export type { SentryLike, SentryTransportConfig } from './transports';
