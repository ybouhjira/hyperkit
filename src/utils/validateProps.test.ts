import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateProps, type PropSchema } from './validateProps';
import { logger } from './logger';

// Mock solid-js DEV to be true during tests
vi.mock('solid-js', () => ({ DEV: true }));

describe('validateProps', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('does not warn when all props are valid', () => {
    validateProps(
      'TestComp',
      { name: 'hello', count: 5 },
      {
        name: { required: true, type: 'string' },
        count: { type: 'number' },
      }
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns on missing required prop', () => {
    validateProps(
      'TestComp',
      {},
      {
        name: { required: true },
      }
    );
    expect(warnSpy).toHaveBeenCalledWith('[SolidKit] TestComp: required prop "name" is missing');
  });

  it('warns on invalid oneOf value', () => {
    validateProps(
      'Button',
      { variant: 'huge' },
      {
        variant: { oneOf: ['primary', 'secondary', 'ghost'] },
      }
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[SolidKit] Button: prop "variant" must be one of [primary, secondary, ghost], got "huge"'
    );
  });

  it('does not warn when oneOf value is valid', () => {
    validateProps(
      'Button',
      { variant: 'primary' },
      {
        variant: { oneOf: ['primary', 'secondary', 'ghost'] },
      }
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns on wrong type', () => {
    validateProps(
      'Input',
      { disabled: 'yes' },
      {
        disabled: { type: 'boolean' },
      }
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[SolidKit] Input: prop "disabled" expected boolean, got string'
    );
  });

  it('does not warn when type matches', () => {
    validateProps(
      'Input',
      { disabled: true },
      {
        disabled: { type: 'boolean' },
      }
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('runs custom validator and warns on error', () => {
    const schema: PropSchema = {
      age: {
        validate: (val) => (typeof val === 'number' && val < 0 ? 'age must be non-negative' : null),
      },
    };
    validateProps('User', { age: -5 }, schema);
    expect(warnSpy).toHaveBeenCalledWith('[SolidKit] User: age must be non-negative');
  });

  it('does not warn when custom validator passes', () => {
    const schema: PropSchema = {
      age: {
        validate: (val) => (typeof val === 'number' && val < 0 ? 'age must be non-negative' : null),
      },
    };
    validateProps('User', { age: 25 }, schema);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('skips oneOf/type checks for missing optional props', () => {
    validateProps(
      'Comp',
      {},
      {
        variant: { oneOf: ['a', 'b'] },
        count: { type: 'number' },
      }
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates multiple props and reports all violations', () => {
    validateProps(
      'Comp',
      { a: 'wrong', b: 999 },
      {
        a: { oneOf: ['x', 'y'] },
        b: { type: 'string' },
        c: { required: true },
      }
    );
    expect(warnSpy).toHaveBeenCalledTimes(3);
  });

  it('combines required + oneOf checks correctly', () => {
    // Missing required prop — should only warn about missing, not about oneOf
    validateProps(
      'Comp',
      {},
      {
        mode: { required: true, oneOf: ['light', 'dark'] },
      }
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('[SolidKit] Comp: required prop "mode" is missing');
  });
});
