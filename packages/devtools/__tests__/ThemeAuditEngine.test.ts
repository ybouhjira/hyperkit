import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  auditThemeCompliance,
  summarizeThemeAudit,
  normalizeCssValue,
  isRawLiteral,
  findMatchingToken,
  AUDITED_PROPERTIES,
  READABILITY_FLOOR_PX,
} from '../src/engine/ThemeAuditEngine';
import type { ThemeAuditRow } from '../src/engine/ThemeAuditEngine';

/** Resolved token values as resolveAllTokens() would return for a dark theme. */
function makeTokenMap(): Map<string, string> {
  return new Map<string, string>([
    ['--sk-bg-primary', '#1a1d21'],
    ['--sk-bg-secondary', '#222529'],
    ['--sk-bg-tertiary', '#2c2d30'],
    ['--sk-text-primary', '#e0e0e0'],
    ['--sk-text-secondary', '#b0b3b8'],
    ['--sk-border', '#2c2d30'],
    ['--sk-accent', '#1264a3'],
    ['--sk-space-sm', '8px'],
    ['--sk-space-md', '16px'],
    ['--sk-font-size-xs', '10px'],
    ['--sk-font-size-sm', '12px'],
    ['--sk-font-size-base', '14px'],
    ['--sk-font-weight-semibold', '600'],
    ['--sk-radius-md', '8px'],
  ]);
}

function rowFor(rows: ThemeAuditRow[], property: string): ThemeAuditRow {
  const row = rows.find((r) => r.property === property);
  expect(row, `expected an audit row for ${property}`).toBeDefined();
  return row!;
}

describe('ThemeAuditEngine', () => {
  describe('normalizeCssValue', () => {
    it('returns empty string unchanged', () => {
      expect(normalizeCssValue('')).toBe('');
      expect(normalizeCssValue('   ')).toBe('');
    });

    it('normalizes 6-digit hex to rgb()', () => {
      expect(normalizeCssValue('#2C2D30')).toBe('rgb(44, 45, 48)');
    });

    it('normalizes 3-digit hex to rgb()', () => {
      expect(normalizeCssValue('#fff')).toBe('rgb(255, 255, 255)');
    });

    it('normalizes 8-digit hex with alpha to rgba()', () => {
      expect(normalizeCssValue('#ff000080')).toBe('rgba(255, 0, 0, 0.502)');
    });

    it('normalizes 8-digit hex with full alpha to rgb()', () => {
      expect(normalizeCssValue('#ff0000ff')).toBe('rgb(255, 0, 0)');
    });

    it('normalizes 4-digit hex to rgba()', () => {
      expect(normalizeCssValue('#f008')).toBe('rgba(255, 0, 0, 0.533)');
    });

    it('normalizes named colors to rgb()', () => {
      expect(normalizeCssValue('rebeccapurple')).toBe('rgb(102, 51, 153)');
      expect(normalizeCssValue('White')).toBe('rgb(255, 255, 255)');
    });

    it('keeps non-color keywords intact', () => {
      expect(normalizeCssValue('solid')).toBe('solid');
      expect(normalizeCssValue('transparent')).toBe('transparent');
    });

    it('converts rem to px at 16px root', () => {
      expect(normalizeCssValue('0.875rem')).toBe('14px');
      expect(normalizeCssValue('1rem 2rem')).toBe('16px 32px');
    });

    it('normalizes function/comma spacing', () => {
      expect(normalizeCssValue('rgb(44,45,48)')).toBe('rgb(44, 45, 48)');
      expect(normalizeCssValue('rgb( 44 , 45 , 48 )')).toBe('rgb(44, 45, 48)');
    });

    it('serializes rgba with alpha 1 as rgb', () => {
      expect(normalizeCssValue('rgba(18, 100, 163, 1)')).toBe('rgb(18, 100, 163)');
    });
  });

  describe('isRawLiteral', () => {
    it('detects hex colors', () => {
      expect(isRawLiteral('#333', 'color')).toBe(true);
      expect(isRawLiteral('#2c2d30', 'color')).toBe(true);
    });

    it('detects rgb()/rgba()/hsl() functions', () => {
      expect(isRawLiteral('rgb(1, 2, 3)', 'color')).toBe(true);
      expect(isRawLiteral('rgba(0, 0, 0, 0.3)', 'color')).toBe(true);
      expect(isRawLiteral('hsl(200, 50%, 50%)', 'color')).toBe(true);
    });

    it('detects named CSS colors', () => {
      expect(isRawLiteral('red', 'color')).toBe(true);
      expect(isRawLiteral('cornflowerblue', 'color')).toBe(true);
    });

    it('detects raw px/rem lengths', () => {
      expect(isRawLiteral('1.5px', 'length')).toBe(true);
      expect(isRawLiteral('0.75rem', 'font-size')).toBe(true);
      expect(isRawLiteral('0 2px 8px rgba(0,0,0,0.3)', 'shadow')).toBe(true);
    });

    it('detects bare numeric and keyword font weights', () => {
      expect(isRawLiteral('700', 'font-weight')).toBe(true);
      expect(isRawLiteral('bold', 'font-weight')).toBe(true);
      expect(isRawLiteral('lighter', 'font-weight')).toBe(true);
    });

    it('rejects empty values, keywords, and bare numbers on non-weight kinds', () => {
      expect(isRawLiteral('', 'color')).toBe(false);
      expect(isRawLiteral('solid', 'color')).toBe(false);
      expect(isRawLiteral('400', 'length')).toBe(false);
    });
  });

  describe('findMatchingToken', () => {
    it('matches computed rgb against a hex token value', () => {
      expect(findMatchingToken('rgb(44, 45, 48)', makeTokenMap(), 'color')).toBe('--sk-bg-tertiary');
    });

    it('prefers the kind-relevant token on value collisions', () => {
      // 8px collides between --sk-space-sm and --sk-radius-md
      expect(findMatchingToken('8px', makeTokenMap(), 'radius')).toBe('--sk-radius-md');
      expect(findMatchingToken('8px', makeTokenMap(), 'length')).toBe('--sk-space-sm');
    });

    it('prefers a token the declaration actually references on value collisions', () => {
      // #2c2d30 collides between --sk-bg-tertiary and --sk-border
      expect(findMatchingToken('#2c2d30', makeTokenMap(), 'color', ['--sk-border'])).toBe('--sk-border');
    });

    it('falls back to the first match when no hint applies', () => {
      const map = new Map([['--sk-mystery-a', '13px'], ['--sk-mystery-b', '13px']]);
      expect(findMatchingToken('13px', map, 'length')).toBe('--sk-mystery-a');
    });

    it('returns null for empty or unmatched values', () => {
      expect(findMatchingToken('', makeTokenMap(), 'color')).toBeNull();
      expect(findMatchingToken('#bada55', makeTokenMap(), 'color')).toBeNull();
    });
  });

  describe('auditThemeCompliance', () => {
    let styleEl: HTMLStyleElement | null = null;
    let testEl: HTMLElement;

    beforeEach(() => {
      testEl = document.createElement('div');
      testEl.className = 'ta-test-subject';
      document.body.appendChild(testEl);
    });

    afterEach(() => {
      if (styleEl) {
        document.head.removeChild(styleEl);
        styleEl = null;
      }
      document.body.removeChild(testEl);
    });

    function addStylesheet(css: string): void {
      styleEl = document.createElement('style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }

    it('audits every property in AUDITED_PROPERTIES exactly once', () => {
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rows.map((r) => r.property)).toEqual(AUDITED_PROPERTIES.map((p) => p.name));
    });

    it('flags a stylesheet var(--sk-*) declaration as on-theme', () => {
      addStylesheet('.ta-test-subject { background-color: var(--sk-bg-tertiary); }');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'background-color');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-bg-tertiary');
      expect(row.rawValue).toBe('var(--sk-bg-tertiary)');
    });

    it('flags an inline var(--sk-*) declaration as on-theme', () => {
      testEl.style.setProperty('color', 'var(--sk-text-primary)');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'color');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-text-primary');
    });

    it('flags a computed value equal to a token value as on-theme (inherited/indirect)', () => {
      // No declaration on the element itself — value equals a resolved token
      testEl.style.setProperty('color', '#e0e0e0');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'color');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-text-primary');
    });

    it('matches token values across color formats (rgb vs hex)', () => {
      testEl.style.setProperty('background-color', 'rgb(44, 45, 48)');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'background-color');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-bg-tertiary');
    });

    it('flags hardcoded hex colors as off-theme', () => {
      testEl.style.setProperty('background-color', '#bada55');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'background-color');
      expect(row.status).toBe('off-theme');
      expect(row.token).toBeNull();
      expect(row.note).toContain('hardcoded');
    });

    it('flags hardcoded rgb()/hsl() colors as off-theme', () => {
      testEl.style.setProperty('color', 'rgb(12, 34, 56)');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'color').status).toBe('off-theme');
    });

    it('flags named CSS colors as off-theme', () => {
      testEl.style.setProperty('color', 'tomato');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'color').status).toBe('off-theme');
    });

    it('flags raw px lengths that match no token as off-theme', () => {
      testEl.style.setProperty('padding-top', '13px');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'padding-top').status).toBe('off-theme');
    });

    it('flags a hardcoded border width inside a shorthand as off-theme while the token color stays on-theme', () => {
      addStylesheet('.ta-test-subject { border: 1.5px solid var(--sk-border); }');
      // Browser computes the longhands from the shorthand declaration
      const computedLonghands: Record<string, string> = {
        'border-top-width': '1.5px',
        'border-top-color': 'rgb(44, 45, 48)',
      };
      const fakeComputed = {
        getPropertyValue: (name: string) => computedLonghands[name] ?? '',
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      expect(rowFor(rows, 'border-top-width').status).toBe('off-theme');
      const colorRow = rowFor(rows, 'border-top-color');
      expect(colorRow.status).toBe('on-theme');
      expect(colorRow.token).toBe('--sk-border');
    });

    it('attributes a token-only shorthand to its token (safe shorthand)', () => {
      addStylesheet('.ta-test-subject { padding: var(--sk-unregistered-pad); }');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'padding-top');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-unregistered-pad');
      expect(row.note).toBe('via shorthand');
    });

    it('does not blanket-approve unsafe shorthands (mixed literal + var)', () => {
      addStylesheet('.ta-test-subject { padding: 3px var(--sk-space-md); }');
      testEl.style.setProperty('padding-top', '3px');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'padding-top').status).toBe('off-theme');
    });

    it('treats computed values still carrying var(--sk-*) as on-theme (guard)', () => {
      // Engine quirk: computed value passes the raw var() through with no declaration
      const fakeComputed = {
        getPropertyValue: (name: string) => (name === 'row-gap' ? 'var(--sk-space-sm)' : ''),
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      const row = rowFor(rows, 'row-gap');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-space-sm');
    });

    it('flags a declaration through a non --sk-* variable as off-theme', () => {
      testEl.style.setProperty('color', 'var(--app-custom-color)');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'color');
      expect(row.status).toBe('off-theme');
      expect(row.token).toBeNull();
    });

    it('flags a literal-only shorthand as off-theme (no var at all)', () => {
      addStylesheet('.ta-test-subject { margin: 7px; }');
      const fakeComputed = {
        getPropertyValue: (name: string) => (name === 'margin-top' ? '7px' : ''),
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      expect(rowFor(rows, 'margin-top').status).toBe('off-theme');
    });

    it('does not attribute a safe shorthand using a non --sk-* variable', () => {
      addStylesheet('.ta-test-subject { padding: var(--app-pad); }');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'padding-top');
      expect(row.status).not.toBe('on-theme');
      expect(row.token).toBeNull();
    });

    it('flags font-size below the readability floor as tiny-text even when token-backed', () => {
      addStylesheet('.ta-test-subject { font-size: var(--sk-font-size-xs); }');
      // Browser resolves var(--sk-font-size-xs) → 10px
      const fakeComputed = {
        getPropertyValue: (name: string) => (name === 'font-size' ? '10px' : ''),
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      const row = rowFor(rows, 'font-size');
      expect(row.status).toBe('tiny-text');
      expect(row.token).toBe('--sk-font-size-xs');
      expect(row.note).toContain(`below the ${READABILITY_FLOOR_PX}px readability floor`);
    });

    it('flags a hardcoded tiny font-size as tiny-text with the px value in the note', () => {
      testEl.style.setProperty('font-size', '10px');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'font-size');
      expect(row.status).toBe('tiny-text');
      expect(row.note).toBe('10px — below the 12px readability floor');
    });

    it('does not flag font-size at or above the floor', () => {
      testEl.style.setProperty('font-size', '14px');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'font-size');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-font-size-base');
    });

    it('classifies neutral values (0px, none, transparent) as default', () => {
      testEl.style.setProperty('margin-top', '0px');
      testEl.style.setProperty('box-shadow', 'none');
      testEl.style.setProperty('background-color', 'transparent');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'margin-top').status).toBe('default');
      expect(rowFor(rows, 'box-shadow').status).toBe('default');
      expect(rowFor(rows, 'background-color').status).toBe('default');
      expect(rowFor(rows, 'gap').status).toBe('default'); // unset → ''
    });

    it('classifies an undeclared default font-weight as default, but a declared one as off-theme', () => {
      testEl.style.setProperty('font-weight', '400');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'font-weight').status).toBe('off-theme');

      testEl.style.removeProperty('font-weight');
      const fakeComputed = {
        getPropertyValue: (name: string) => (name === 'font-weight' ? '400' : ''),
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows2 = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      expect(rowFor(rows2, 'font-weight').status).toBe('default');
    });

    it('classifies declared font-weight matching a token as on-theme', () => {
      testEl.style.setProperty('font-weight', '600');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'font-weight');
      expect(row.status).toBe('on-theme');
      expect(row.token).toBe('--sk-font-weight-semibold');
    });

    it('classifies non-literal keywords without declarations as default', () => {
      const fakeComputed = {
        getPropertyValue: (name: string) => (name === 'outline-color' ? 'invert' : ''),
      } as CSSStyleDeclaration;
      const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue(fakeComputed);
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      spy.mockRestore();
      expect(rowFor(rows, 'outline-color').status).toBe('default');
    });

    it('flags box-shadow containing raw rgba as off-theme', () => {
      testEl.style.setProperty('box-shadow', '0 -4px 20px rgba(0, 0, 0, 0.3)');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      expect(rowFor(rows, 'box-shadow').status).toBe('off-theme');
    });

    it('exposes the declared raw value on the row', () => {
      testEl.style.setProperty('border-radius', '50%');
      const rows = auditThemeCompliance(testEl, makeTokenMap());
      const row = rowFor(rows, 'border-radius');
      expect(row.status).toBe('off-theme');
      expect(row.rawValue).toBe('50%');
    });
  });

  describe('summarizeThemeAudit', () => {
    it('tallies every status bucket', () => {
      const rows: ThemeAuditRow[] = [
        { property: 'color', computedValue: '#e0e0e0', rawValue: null, status: 'on-theme', token: '--sk-text-primary', note: null },
        { property: 'background-color', computedValue: '#bada55', rawValue: '#bada55', status: 'off-theme', token: null, note: 'hardcoded — not from a --sk-* token' },
        { property: 'font-size', computedValue: '10px', rawValue: null, status: 'tiny-text', token: '--sk-font-size-xs', note: '10px — below the 12px readability floor' },
        { property: 'margin-top', computedValue: '0px', rawValue: null, status: 'default', token: null, note: null },
        { property: 'padding-top', computedValue: '8px', rawValue: null, status: 'on-theme', token: '--sk-space-sm', note: null },
      ];
      expect(summarizeThemeAudit(rows)).toEqual({
        onTheme: 2,
        offTheme: 1,
        tinyText: 1,
        defaults: 1,
        total: 5,
      });
    });

    it('handles an empty row set', () => {
      expect(summarizeThemeAudit([])).toEqual({
        onTheme: 0,
        offTheme: 0,
        tinyText: 0,
        defaults: 0,
        total: 0,
      });
    });
  });
});
