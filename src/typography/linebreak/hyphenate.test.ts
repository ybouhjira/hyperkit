import { describe, it, expect, vi } from 'vitest';
import { createHyphenator, Patterns } from './hyphenate';

// Mock hypher module
vi.mock('hypher', () => {
  return {
    default: class MockHypher {
      private _patterns: unknown;
      constructor(patterns: unknown) {
        this._patterns = patterns;
      }
      hyphenate(word: string): string[] {
        // Simulate simple hyphenation: split every 3 characters
        if (word.length <= 3) return [word];
        const parts: string[] = [];
        for (let i = 0; i < word.length; i += 3) {
          parts.push(word.slice(i, i + 3));
        }
        return parts;
      }
    },
  };
});

describe('createHyphenator', () => {
  const patterns: Patterns = {
    id: 'en-us',
    leftmin: 2,
    rightmin: 3,
    patterns: { 2: 'abc' },
  };

  it('returns a function', () => {
    const hyphenate = createHyphenator(patterns);
    expect(typeof hyphenate).toBe('function');
  });

  it('returned function calls hypher.hyphenate', () => {
    const hyphenate = createHyphenator(patterns);
    const result = hyphenate('programming');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns the word as-is for short words', () => {
    const hyphenate = createHyphenator(patterns);
    const result = hyphenate('cat');
    expect(result).toEqual(['cat']);
  });

  it('splits long words into parts', () => {
    const hyphenate = createHyphenator(patterns);
    const result = hyphenate('abcdef');
    // Mock splits every 3 chars: ['abc', 'def']
    expect(result).toEqual(['abc', 'def']);
  });

  it('handles single character words', () => {
    const hyphenate = createHyphenator(patterns);
    const result = hyphenate('a');
    expect(result).toEqual(['a']);
  });

  it('can be created with different pattern sets', () => {
    const frPatterns: Patterns = {
      id: 'fr',
      leftmin: 2,
      rightmin: 2,
      patterns: { 2: 'xy' },
    };
    const hyphenate = createHyphenator(frPatterns);
    expect(typeof hyphenate).toBe('function');
    const result = hyphenate('bonjour');
    expect(Array.isArray(result)).toBe(true);
  });
});
