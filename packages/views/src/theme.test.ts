import { describe, it, expect } from 'vitest';
import {
  defaultTheme,
  mergeThemes,
  tokensToCss,
  formatValue,
  getSlotOverride,
  getRenderOverride,
  getBehavior,
  getSlotStyles,
} from './theme';
import type { ViewsTheme } from './theme';

describe('defaultTheme', () => {
  it('has name "default"', () => {
    expect(defaultTheme.name).toBe('default');
  });

  it('has no layers set', () => {
    expect(defaultTheme.tokens).toBeUndefined();
    expect(defaultTheme.styles).toBeUndefined();
    expect(defaultTheme.formatters).toBeUndefined();
    expect(defaultTheme.slots).toBeUndefined();
    expect(defaultTheme.behaviors).toBeUndefined();
    expect(defaultTheme.renderOverrides).toBeUndefined();
  });
});

describe('mergeThemes', () => {
  const baseTheme: ViewsTheme = {
    name: 'base',
    tokens: {
      '--card-bg': '#fff',
      '--card-border': '#ddd',
    },
    styles: {
      'card-title': { fontSize: '18px', fontWeight: '600' },
    },
    formatters: {
      timestamp: (v: unknown) => `${v} ago`,
    },
    slots: {
      'card-badge': 'CustomBadge',
    },
    behaviors: {
      onCardClick: () => {},
    },
  };

  it('overrides name', () => {
    const merged = mergeThemes(baseTheme, { name: 'custom' });
    expect(merged.name).toBe('custom');
  });

  it('merges tokens', () => {
    const merged = mergeThemes(baseTheme, {
      tokens: { '--card-bg': '#000', '--card-shadow': '0 1px 3px' },
    });
    expect(merged.tokens?.['--card-bg']).toBe('#000');
    expect(merged.tokens?.['--card-border']).toBe('#ddd');
    expect(merged.tokens?.['--card-shadow']).toBe('0 1px 3px');
  });

  it('merges styles', () => {
    const merged = mergeThemes(baseTheme, {
      styles: { 'card-badge': { padding: '4px' } },
    });
    expect(merged.styles?.['card-title']).toEqual({ fontSize: '18px', fontWeight: '600' });
    expect(merged.styles?.['card-badge']).toEqual({ padding: '4px' });
  });

  it('merges formatters', () => {
    const metricFn = (v: unknown) => `${v}x`;
    const merged = mergeThemes(baseTheme, {
      formatters: { metric: metricFn },
    });
    expect(merged.formatters?.timestamp).toBeDefined();
    expect(merged.formatters?.metric).toBe(metricFn);
  });

  it('merges slots', () => {
    const merged = mergeThemes(baseTheme, {
      slots: { 'card-avatar': 'CustomAvatar' },
    });
    expect(merged.slots?.['card-badge']).toBe('CustomBadge');
    expect(merged.slots?.['card-avatar']).toBe('CustomAvatar');
  });

  it('merges behaviors', () => {
    const fn = () => {};
    const merged = mergeThemes(baseTheme, {
      behaviors: { onRowClick: fn },
    });
    expect(merged.behaviors?.onCardClick).toBeDefined();
    expect(merged.behaviors?.onRowClick).toBe(fn);
  });

  it('preserves base when no override for a layer', () => {
    const merged = mergeThemes(baseTheme, { name: 'partial' });
    expect(merged.tokens).toBe(baseTheme.tokens);
    expect(merged.styles).toBe(baseTheme.styles);
    expect(merged.formatters).toBe(baseTheme.formatters);
  });

  it('does not mutate base theme', () => {
    const originalBg = baseTheme.tokens?.['--card-bg'];
    mergeThemes(baseTheme, { tokens: { '--card-bg': '#000' } });
    expect(baseTheme.tokens?.['--card-bg']).toBe(originalBg);
  });
});

describe('tokensToCss', () => {
  it('converts tokens to CSS string', () => {
    const css = tokensToCss({
      '--card-bg': '#fff',
      '--card-border': '#ddd',
    });
    expect(css).toContain('--card-bg: #fff;');
    expect(css).toContain('--card-border: #ddd;');
  });

  it('returns empty string for empty tokens', () => {
    expect(tokensToCss({})).toBe('');
  });
});

describe('formatValue', () => {
  const theme: ViewsTheme = {
    name: 'test',
    formatters: {
      timestamp: (v: unknown) => `${v} ago`,
      metric: (v: unknown) => `${v}k`,
    },
  };

  it('applies matching formatter', () => {
    expect(formatValue(theme, 'timestamp', '3h')).toBe('3h ago');
  });

  it('returns original value when no formatter', () => {
    expect(formatValue(theme, 'title', 'Hello')).toBe('Hello');
  });

  it('returns original value with default theme', () => {
    expect(formatValue(defaultTheme, 'timestamp', new Date())).toBeInstanceOf(Date);
  });
});

describe('getSlotOverride', () => {
  const theme: ViewsTheme = {
    name: 'test',
    slots: { 'card-badge': 'Chip' },
  };

  it('returns override component name', () => {
    expect(getSlotOverride(theme, 'card-badge')).toBe('Chip');
  });

  it('returns undefined for non-overridden slot', () => {
    expect(getSlotOverride(theme, 'card-title')).toBeUndefined();
  });

  it('returns undefined with default theme', () => {
    expect(getSlotOverride(defaultTheme, 'card-badge')).toBeUndefined();
  });
});

describe('getRenderOverride', () => {
  it('returns override function', () => {
    const fn = (data: unknown) => data;
    const theme: ViewsTheme = {
      name: 'test',
      renderOverrides: { card: fn },
    };
    expect(getRenderOverride(theme, 'card')).toBe(fn);
  });

  it('returns undefined for non-overridden shape', () => {
    const theme: ViewsTheme = { name: 'test' };
    expect(getRenderOverride(theme, 'card')).toBeUndefined();
  });
});

describe('getBehavior', () => {
  it('returns behavior callback', () => {
    const fn = () => {};
    const theme: ViewsTheme = {
      name: 'test',
      behaviors: { onCardClick: fn },
    };
    expect(getBehavior(theme, 'onCardClick')).toBe(fn);
  });

  it('returns undefined for missing behavior', () => {
    const theme: ViewsTheme = { name: 'test' };
    expect(getBehavior(theme, 'onCardClick')).toBeUndefined();
  });
});

describe('getSlotStyles', () => {
  it('returns slot styles', () => {
    const theme: ViewsTheme = {
      name: 'test',
      styles: { 'card-title': { fontSize: '18px' } },
    };
    expect(getSlotStyles(theme, 'card-title')).toEqual({ fontSize: '18px' });
  });

  it('returns undefined for unstyled slot', () => {
    const theme: ViewsTheme = { name: 'test' };
    expect(getSlotStyles(theme, 'card-title')).toBeUndefined();
  });
});
