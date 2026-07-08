/**
 * Internal logger for SolidKit dev-time warnings and audit output.
 * Wraps console methods so `no-console` stays enabled for accidental usage.
 */

/* eslint-disable no-console */
export const logger = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  group: console.group.bind(console),
  groupCollapsed: console.groupCollapsed.bind(console),
  groupEnd: console.groupEnd.bind(console),
} as const;
/* eslint-enable no-console */
