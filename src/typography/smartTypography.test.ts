import { describe, it, expect } from 'vitest';
import {
  smartQuotes,
  smartDashes,
  smartSpacing,
  preventWidows,
  smartTypography,
} from './smartTypography';

// ---------------------------------------------------------------------------
// smartQuotes
// ---------------------------------------------------------------------------
describe('smartQuotes', () => {
  it('converts straight double quotes to curly quotes', () => {
    expect(smartQuotes('"Hello," she said.')).toBe('\u201CHello,\u201D she said.');
  });

  it('converts opening double quote at start of string', () => {
    expect(smartQuotes('"World"')).toBe('\u201CWorld\u201D');
  });

  it('handles apostrophes in contractions', () => {
    expect(smartQuotes("don't")).toContain('\u2019');
  });

  it("handles 'it's' contraction", () => {
    expect(smartQuotes("it's")).toBe('it\u2019s');
  });

  it('converts opening single quote after whitespace', () => {
    const result = smartQuotes("She said 'hello'");
    expect(result).toContain('\u2018');
    expect(result).toContain('\u2019');
  });

  it('preserves quotes inside inline code', () => {
    const result = smartQuotes('Use `"hello"` for strings');
    expect(result).toContain('`"hello"`');
  });

  it('preserves quotes inside fenced code blocks', () => {
    const input = '```\nconst x = "hello";\n```';
    expect(smartQuotes(input)).toBe(input);
  });

  it('handles nested single inside double quotes', () => {
    const result = smartQuotes('"She said \'hello\' to me"');
    expect(result).toContain('\u201C');
    expect(result).toContain('\u201D');
  });

  it('returns empty string unchanged', () => {
    expect(smartQuotes('')).toBe('');
  });

  it('leaves text without quotes unchanged', () => {
    expect(smartQuotes('no quotes here')).toBe('no quotes here');
  });
});

// ---------------------------------------------------------------------------
// smartDashes
// ---------------------------------------------------------------------------
describe('smartDashes', () => {
  it('converts -- to en-dash', () => {
    expect(smartDashes('pages 1--10')).toBe('pages 1\u201310');
  });

  it('converts --- to em-dash', () => {
    expect(smartDashes('word---word')).toBe('word\u2014word');
  });

  it('converts ... to ellipsis', () => {
    expect(smartDashes('wait...')).toBe('wait\u2026');
  });

  it('prioritises em-dash over en-dash (--- not treated as --+-)', () => {
    // If --- were processed as -- first, we'd get en-dash + extra dash
    expect(smartDashes('a---b')).toBe('a\u2014b');
  });

  it('preserves dashes inside inline code', () => {
    const result = smartDashes('Use `--flag` for options');
    expect(result).toContain('`--flag`');
  });

  it('preserves dashes inside fenced code blocks', () => {
    const input = '```\ngit commit ---amend\n```';
    expect(smartDashes(input)).toBe(input);
  });

  it('returns empty string unchanged', () => {
    expect(smartDashes('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// smartSpacing
// ---------------------------------------------------------------------------
describe('smartSpacing', () => {
  it('adds thin spaces around bare em-dashes', () => {
    expect(smartSpacing('word\u2014word')).toBe('word\u2009\u2014\u2009word');
  });

  it('does not double-space already-spaced em-dashes', () => {
    expect(smartSpacing('word \u2014 word')).toBe('word \u2014 word');
  });

  it('does not modify en-dashes', () => {
    expect(smartSpacing('1\u20135')).toBe('1\u20135');
  });

  it('returns empty string unchanged', () => {
    expect(smartSpacing('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// preventWidows
// ---------------------------------------------------------------------------
describe('preventWidows', () => {
  it('adds non-breaking space before a short last word', () => {
    const input = 'This is a long sentence that ends with a';
    const result = preventWidows(input);
    expect(result).toContain('\u00A0a');
  });

  it('does not modify text that is 30 chars or shorter', () => {
    expect(preventWidows('short text')).toBe('short text');
  });

  it('does not add nbsp before a long last word (>= 8 chars)', () => {
    const input = 'This is a long sentence ending with something';
    // "something" = 9 chars, should NOT be protected
    expect(preventWidows(input)).toBe(input);
  });

  it('returns empty string unchanged', () => {
    expect(preventWidows('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// smartTypography (composed)
// ---------------------------------------------------------------------------
describe('smartTypography', () => {
  it('applies all transformations by default', () => {
    const result = smartTypography('"Hello," she said -- "it\'s nice..."');
    expect(result).toContain('\u201C'); // smart left double quote
    expect(result).toContain('\u2013'); // en-dash
    expect(result).toContain('\u2026'); // ellipsis
    expect(result).toContain('\u2019'); // right single (apostrophe)
  });

  it('skips quotes when quotes: false', () => {
    const result = smartTypography('"Hello"', { quotes: false });
    expect(result).toContain('"');
    expect(result).not.toContain('\u201C');
  });

  it('skips dashes when dashes: false', () => {
    const result = smartTypography('word--word', { dashes: false });
    expect(result).toContain('--');
    expect(result).not.toContain('\u2013');
  });

  it('skips spacing when spacing: false', () => {
    const result = smartTypography('word\u2014word', { spacing: false });
    // Em-dash present but no thin spaces added
    expect(result).toBe('word\u2014word');
  });

  it('skips widows when widows: false', () => {
    const input = 'This is a long enough sentence ending in a';
    const result = smartTypography(input, { widows: false });
    expect(result).not.toContain('\u00A0');
  });

  it('returns empty string unchanged', () => {
    expect(smartTypography('')).toBe('');
  });

  it('preserves code blocks through all transformations', () => {
    const input = 'Use `--flag` and `"string"` together';
    const result = smartTypography(input);
    expect(result).toContain('`--flag`');
    expect(result).toContain('`"string"`');
  });
});
