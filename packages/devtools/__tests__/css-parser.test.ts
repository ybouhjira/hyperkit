import { describe, it, expect } from 'vitest';
import { parseCssValue, extractVarNames, containsVar } from '../src/engine/css-parser';

describe('css-parser', () => {
  describe('parseCssValue', () => {
    it('parses a plain literal', () => {
      const result = parseCssValue('red');
      expect(result).toEqual({ type: 'literal', value: 'red' });
    });

    it('parses empty string', () => {
      const result = parseCssValue('');
      expect(result).toEqual({ type: 'literal', value: '' });
    });

    it('parses a simple var()', () => {
      const result = parseCssValue('var(--sk-accent)');
      expect(result).toEqual({
        type: 'var',
        name: '--sk-accent',
        fallback: null,
      });
    });

    it('parses var() with literal fallback', () => {
      const result = parseCssValue('var(--sk-accent, #5b9cf5)');
      expect(result).toEqual({
        type: 'var',
        name: '--sk-accent',
        fallback: { type: 'literal', value: '#5b9cf5' },
      });
    });

    it('parses nested var() fallback', () => {
      const result = parseCssValue('var(--sk-btn-primary-bg, var(--sk-accent))');
      expect(result).toEqual({
        type: 'var',
        name: '--sk-btn-primary-bg',
        fallback: {
          type: 'var',
          name: '--sk-accent',
          fallback: null,
        },
      });
    });

    it('parses deeply nested var()', () => {
      const result = parseCssValue('var(--a, var(--b, var(--c, blue)))');
      expect(result).toEqual({
        type: 'var',
        name: '--a',
        fallback: {
          type: 'var',
          name: '--b',
          fallback: {
            type: 'var',
            name: '--c',
            fallback: { type: 'literal', value: 'blue' },
          },
        },
      });
    });

    it('parses composite value with var()', () => {
      const result = parseCssValue('1px solid var(--sk-border)');
      expect(result).toEqual({
        type: 'composite',
        parts: [
          { type: 'literal', value: '1px solid' },
          { type: 'var', name: '--sk-border', fallback: null },
        ],
      });
    });

    it('parses multiple var() in composite', () => {
      const result = parseCssValue('var(--sk-space-sm) var(--sk-space-md)');
      expect(result).toEqual({
        type: 'composite',
        parts: [
          { type: 'var', name: '--sk-space-sm', fallback: null },
          { type: 'var', name: '--sk-space-md', fallback: null },
        ],
      });
    });

    it('preserves whitespace in literal values', () => {
      const result = parseCssValue('  hello world  ');
      expect(result).toEqual({ type: 'literal', value: 'hello world' });
    });

    it('handles var() with complex fallback value', () => {
      const result = parseCssValue('var(--sk-shadow-md, 0 2px 4px rgba(0,0,0,0.1))');
      expect(result).toEqual({
        type: 'var',
        name: '--sk-shadow-md',
        fallback: { type: 'literal', value: '0 2px 4px rgba(0,0,0,0.1)' },
      });
    });
  });

  describe('extractVarNames', () => {
    it('returns empty for literal', () => {
      expect(extractVarNames(parseCssValue('red'))).toEqual([]);
    });

    it('returns single var name', () => {
      expect(extractVarNames(parseCssValue('var(--sk-accent)'))).toEqual(['--sk-accent']);
    });

    it('returns nested var names in order', () => {
      const names = extractVarNames(parseCssValue('var(--a, var(--b, var(--c, blue)))'));
      expect(names).toEqual(['--a', '--b', '--c']);
    });

    it('returns var names from composite', () => {
      const names = extractVarNames(parseCssValue('1px solid var(--sk-border)'));
      expect(names).toEqual(['--sk-border']);
    });
  });

  describe('containsVar', () => {
    it('returns false for plain value', () => {
      expect(containsVar('red')).toBe(false);
    });

    it('returns true for var()', () => {
      expect(containsVar('var(--sk-accent)')).toBe(true);
    });

    it('returns true for value containing var()', () => {
      expect(containsVar('1px solid var(--sk-border)')).toBe(true);
    });
  });
});
