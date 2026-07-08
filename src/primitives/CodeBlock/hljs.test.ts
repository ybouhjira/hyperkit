import { describe, it, expect, vi } from 'vitest';
import { hljs, highlightCode } from './hljs';

describe('hljs shared instance', () => {
  it('has the common languages registered', () => {
    for (const lang of ['typescript', 'javascript', 'json', 'css', 'html', 'bash', 'yaml']) {
      expect(hljs.getLanguage(lang)).toBeTruthy();
    }
  });
});

describe('highlightCode', () => {
  it('highlights with an explicit registered language', () => {
    const html = highlightCode('const x: number = 1;', 'typescript');
    expect(html).toContain('hljs-keyword');
  });

  it('auto-detects when no language is given', () => {
    const html = highlightCode('function f() { return 1; }');
    expect(html).toContain('hljs-');
  });

  it('auto-detects when the language id is not registered', () => {
    // Unknown id → getLanguage falsy → falls through to highlightAuto (no throw).
    const html = highlightCode('{"k": 1}', 'totally-made-up-lang');
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('escapes HTML metacharacters when highlighting throws (fallback path)', () => {
    const spy = vi.spyOn(hljs, 'highlightAuto').mockImplementation(() => {
      throw new Error('boom');
    });
    try {
      // No language → goes through highlightAuto, which now throws → catch → escape.
      expect(highlightCode('<a> & b')).toBe('&lt;a&gt; &amp; b');
    } finally {
      spy.mockRestore();
    }
  });
});
