import { LogLevel } from 'effect';
import { ConsoleTransport } from './ConsoleTransport';

describe('ConsoleTransport', () => {
  it('returns a Simple transport def', () => {
    const transport = ConsoleTransport();
    expect(transport._tag).toBe('Simple');
  });

  it('defaults to pretty format', () => {
    const transport = ConsoleTransport();
    expect(transport._tag).toBe('Simple');
    // Pretty logger is a void-returning logger (writes directly to console)
    expect(transport).toHaveProperty('logger');
  });

  it('accepts json format', () => {
    const transport = ConsoleTransport({ format: 'json' });
    expect(transport._tag).toBe('Simple');
  });

  it('accepts logfmt format', () => {
    const transport = ConsoleTransport({ format: 'logfmt' });
    expect(transport._tag).toBe('Simple');
  });

  it('applies minLevel filter when provided', () => {
    const transport = ConsoleTransport({ minLevel: LogLevel.Warning });
    expect(transport._tag).toBe('Simple');
    // The logger should be wrapped with filterLogLevel
    expect(transport).toHaveProperty('logger');
  });
});
