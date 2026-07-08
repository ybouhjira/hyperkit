// Re-export barrel — implementation moved to ./logging/
export { LoggingService, type LogEntry } from './logging/service';
export { makeLoggingLayer } from './logging/makeLoggingLayer';
export type { LoggingServiceConfig } from './logging/types';
