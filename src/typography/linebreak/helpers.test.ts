import { describe, it, expect } from 'vitest';
import { layoutItemsFromString, layoutText, TextBox, TextGlue } from './helpers';
import { MAX_COST, MIN_COST, Penalty } from './layout';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple measureFn: every character is 10px wide. */
const charMeasure = (word: string) => word.length * 10;

/** Hyphenation that splits every word in half (for testing). */
const splitInHalf = (word: string): string[] => {
  if (word.length <= 2) return [word];
  const mid = Math.floor(word.length / 2);
  return [word.slice(0, mid), word.slice(mid)];
};

// ===========================================================================
// layoutItemsFromString
// ===========================================================================

describe('layoutItemsFromString', () => {
  it('generates items for a single word', () => {
    const items = layoutItemsFromString('hello', charMeasure);
    // Expect: [box("hello"), finishing glue, forced break]
    expect(items.length).toBe(3);

    const first = items[0] as TextBox;
    expect(first.type).toBe('box');
    expect(first.text).toBe('hello');
    expect(first.width).toBe(50); // 5 * 10
  });

  it('generates items for multiple words', () => {
    const items = layoutItemsFromString('hello world', charMeasure);
    // Expect: [box("hello"), glue(" "), box("world"), finishing glue, forced break]
    expect(items.length).toBe(5);

    expect(items[0]!.type).toBe('box');
    expect((items[0] as TextBox).text).toBe('hello');

    expect(items[1]!.type).toBe('glue');
    expect((items[1] as TextGlue).text).toBe(' ');

    expect(items[2]!.type).toBe('box');
    expect((items[2] as TextBox).text).toBe('world');
  });

  it('handles multiple spaces between words', () => {
    const items = layoutItemsFromString('a   b', charMeasure);
    // Should have: box("a"), glue("   "), box("b"), finishing glue, forced break
    expect(items.length).toBe(5);

    const space = items[1] as TextGlue;
    expect(space.type).toBe('glue');
    expect(space.text).toBe('   ');
  });

  it('handles empty string', () => {
    const items = layoutItemsFromString('', charMeasure);
    // Only finishing glue + forced break
    expect(items.length).toBe(2);
    expect(items[0]!.type).toBe('glue');
    expect(items[1]!.type).toBe('penalty');
  });

  it('ends with finishing glue and forced break', () => {
    const items = layoutItemsFromString('test', charMeasure);
    const last = items[items.length - 1] as Penalty;
    const secondLast = items[items.length - 2]!;

    expect(last.type).toBe('penalty');
    expect(last.cost).toBeLessThanOrEqual(MIN_COST);

    expect(secondLast.type).toBe('glue');
    expect((secondLast as TextGlue).stretch).toBe(MAX_COST);
  });

  it('sets correct glue properties', () => {
    const items = layoutItemsFromString('a b', charMeasure);
    const space = items[1] as TextGlue;

    expect(space.type).toBe('glue');
    expect(space.width).toBe(10); // ' '.length * 10
    expect(space.stretch).toBe(15); // spaceWidth * 1.5
    expect(space.shrink).toBe(8); // Math.max(0, spaceWidth - 2) = 8
  });

  it('applies hyphenation when hyphenateFn is provided', () => {
    const items = layoutItemsFromString('hello', charMeasure, splitInHalf);
    // "hello" → ["he", "llo"] → box("he"), penalty(hyphen), box("llo"), finishing glue, forced break
    expect(items.length).toBe(5);

    expect(items[0]!.type).toBe('box');
    expect((items[0] as TextBox).text).toBe('he');

    expect(items[1]!.type).toBe('penalty');
    const pen = items[1] as Penalty;
    expect(pen.flagged).toBe(true);
    expect(pen.cost).toBe(10);

    expect(items[2]!.type).toBe('box');
    expect((items[2] as TextBox).text).toBe('llo');
  });

  it('handles hyphenation with multiple words', () => {
    const items = layoutItemsFromString('ab cd', charMeasure, splitInHalf);
    // "ab" → single chunk (length <= 2), "cd" → single chunk
    // box("ab"), glue(" "), box("cd"), finishing glue, forced break
    expect(items[0]!.type).toBe('box');
    expect((items[0] as TextBox).text).toBe('ab');
  });

  it('glue shrink does not go negative', () => {
    // measureFn returns 1 for a space → shrink = max(0, 1-2) = 0
    const tinyMeasure = (word: string) => word.length;
    const items = layoutItemsFromString('a b', tinyMeasure);
    const space = items[1] as TextGlue;
    expect(space.shrink).toBeGreaterThanOrEqual(0);
  });
});

// ===========================================================================
// layoutText
// ===========================================================================

describe('layoutText', () => {
  it('returns items, breakpoints, and positions', () => {
    const result = layoutText('hello world foo bar', 100, charMeasure, splitInHalf);
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('breakpoints');
    expect(result).toHaveProperty('positions');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.breakpoints.length).toBeGreaterThan(1);
    expect(result.positions.length).toBeGreaterThan(0);
  });

  it('accepts line width as a number', () => {
    const result = layoutText('a b c d e f g h', 50, charMeasure, splitInHalf);
    expect(result.breakpoints.length).toBeGreaterThan(2);
  });

  it('accepts line width as an array', () => {
    const result = layoutText('a b c d e f g h', [60, 50, 40], charMeasure, splitInHalf);
    expect(result.breakpoints.length).toBeGreaterThan(2);
  });

  it('falls back to hyphenation when maxAdjustmentRatio is exceeded', () => {
    // Use a small line width that forces hyphenation
    // Words are "longword" (8 chars = 80px) and line is 50px
    const result = layoutText('longword anotherlong', 50, charMeasure, splitInHalf);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.breakpoints.length).toBeGreaterThanOrEqual(2);
  });

  it('rethrows non-MaxAdjustmentExceededError errors', () => {
    const badMeasure = (_word: string): number => {
      throw new Error('measure failed');
    };
    expect(() => layoutText('hello world', 100, badMeasure, splitInHalf)).toThrow('measure failed');
  });
});
