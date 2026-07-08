import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tokensConsumed } from '../src/engine/TokensConsumed';

let style: HTMLStyleElement;
let el: HTMLElement;

beforeEach(() => {
  style = document.createElement('style');
  style.textContent = `
    .sk-card {
      background: var(--sk-card-bg, var(--sk-bg-secondary));
      border-radius: var(--sk-radius-md);
      border: 1px solid var(--sk-border);
    }
    .sk-card--outlined {
      border-color: var(--sk-border);
    }
  `;
  document.head.appendChild(style);

  el = document.createElement('div');
  el.className = 'sk-card sk-card--outlined';
  document.body.appendChild(el);
});

afterEach(() => {
  style.remove();
  el.remove();
});

function tokenMap(entries: Record<string, string> = {}): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('tokensConsumed', () => {
  it('lists every --sk-* token referenced by the matched rules, sorted by name', () => {
    const result = tokensConsumed(el, tokenMap());
    expect(result.map((t) => t.name)).toEqual([
      '--sk-bg-secondary',
      '--sk-border',
      '--sk-card-bg',
      '--sk-radius-md',
    ]);
  });

  it('resolves token values from the provided token map', () => {
    const result = tokensConsumed(
      el,
      tokenMap({ '--sk-bg-secondary': '#222529', '--sk-radius-md': '8px' }),
    );
    const bg = result.find((t) => t.name === '--sk-bg-secondary')!;
    const radius = result.find((t) => t.name === '--sk-radius-md')!;
    expect(bg.value).toBe('#222529');
    expect(bg.isColor).toBe(true);
    expect(radius.value).toBe('8px');
    expect(radius.isColor).toBe(false);
  });

  it('falls back to the element computed style for tokens missing from the map', () => {
    el.style.setProperty('--sk-card-bg', 'rgb(34, 37, 41)');
    const result = tokensConsumed(el, tokenMap());
    const cardBg = result.find((t) => t.name === '--sk-card-bg')!;
    expect(cardBg.value).toBe('rgb(34, 37, 41)');
    expect(cardBg.isColor).toBe(true);
  });

  it('reports unresolved tokens with a null value and no color flag', () => {
    const result = tokensConsumed(el, tokenMap());
    const cardBg = result.find((t) => t.name === '--sk-card-bg')!;
    expect(cardBg.value).toBeNull();
    expect(cardBg.isColor).toBe(false);
  });

  it('records every property consuming a token, merged across rules and sorted', () => {
    const result = tokensConsumed(el, tokenMap());
    const border = result.find((t) => t.name === '--sk-border')!;
    expect(border.properties).toEqual(['border', 'border-color']);
  });

  it('includes tokens referenced from inline styles', () => {
    el.style.setProperty('padding', 'var(--sk-space-md)');
    const result = tokensConsumed(el, tokenMap({ '--sk-space-md': '16px' }));
    const space = result.find((t) => t.name === '--sk-space-md')!;
    expect(space.value).toBe('16px');
    expect(space.properties).toEqual(['padding']);
  });

  it('returns an empty list for elements with no token-consuming styles', () => {
    const plain = document.createElement('div');
    document.body.appendChild(plain);
    expect(tokensConsumed(plain, tokenMap())).toEqual([]);
    plain.remove();
  });

  it('ignores non-sk custom properties in var() expressions', () => {
    el.style.setProperty('color', 'var(--app-text, var(--sk-text-primary))');
    const result = tokensConsumed(el, tokenMap({ '--sk-text-primary': '#e8e8e8' }));
    expect(result.some((t) => t.name === '--app-text')).toBe(false);
    expect(result.find((t) => t.name === '--sk-text-primary')!.value).toBe('#e8e8e8');
  });
});
