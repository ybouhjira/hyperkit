import { describe, it, expect } from 'vitest';
import { themePresets } from '../presets';
import { resolveThemeDefaults } from '../defaults';

const allThemes = Object.values(themePresets);

// Matches: #hex, rgb(), rgba(), hsl(), hsla(), CSS named colors, transparent
const CSS_COLOR_REGEX =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(.+\)|hsla?\(.+\)|transparent|currentColor|inherit)$/;

// Matches: 0, 0px, 12px, 1.5rem, 0.5em, etc.
const CSS_LENGTH_REGEX = /^(0|[0-9]+(\.[0-9]+)?(px|rem|em|%|vw|vh))$/;

describe('Theme Value Sanity Checks', () => {
  describe('Color values', () => {
    it('all color tokens are valid CSS colors', () => {
      const invalid: string[] = [];
      allThemes.forEach((theme) => {
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (!CSS_COLOR_REGEX.test(value)) {
            invalid.push(`${theme.id}.colors.${key} = "${value}"`);
          }
        });
      });
      if (invalid.length > 0) {
        throw new Error(`Invalid CSS colors found:\n${invalid.join('\n')}`);
      }
    });
  });

  describe('Radius values', () => {
    it('all radius tokens are valid CSS lengths', () => {
      const invalid: string[] = [];
      allThemes.forEach((theme) => {
        Object.entries(theme.radius).forEach(([key, value]) => {
          if (!CSS_LENGTH_REGEX.test(value)) {
            invalid.push(`${theme.id}.radius.${key} = "${value}"`);
          }
        });
      });
      if (invalid.length > 0) {
        throw new Error(`Invalid CSS radius values:\n${invalid.join('\n')}`);
      }
    });
  });

  describe('Font size values', () => {
    it('all font sizes are valid CSS lengths', () => {
      const invalid: string[] = [];
      allThemes.forEach((theme) => {
        Object.entries(theme.fontSizes).forEach(([key, value]) => {
          if (!CSS_LENGTH_REGEX.test(value)) {
            invalid.push(`${theme.id}.fontSizes.${key} = "${value}"`);
          }
        });
      });
      if (invalid.length > 0) {
        throw new Error(`Invalid font sizes:\n${invalid.join('\n')}`);
      }
    });

    it('font sizes are within reasonable range (8-64px)', () => {
      allThemes.forEach((theme) => {
        Object.entries(theme.fontSizes).forEach(([key, value]) => {
          const px = parseInt(value);
          if (!isNaN(px)) {
            expect(
              px,
              `${theme.id}.fontSizes.${key} = ${px}px is out of range`
            ).toBeGreaterThanOrEqual(8);
            expect(
              px,
              `${theme.id}.fontSizes.${key} = ${px}px is out of range`
            ).toBeLessThanOrEqual(64);
          }
        });
      });
    });
  });

  describe('State values', () => {
    it('opacity values are between 0 and 1', () => {
      allThemes.forEach((theme) => {
        const resolved = resolveThemeDefaults(theme);
        Object.entries(resolved.states).forEach(([stateName, state]) => {
          if (state && state.opacity !== undefined) {
            expect(
              state.opacity,
              `${theme.id}.states.${stateName}.opacity = ${state.opacity}`
            ).toBeGreaterThanOrEqual(0);
            expect(
              state.opacity,
              `${theme.id}.states.${stateName}.opacity = ${state.opacity}`
            ).toBeLessThanOrEqual(1);
          }
          if (state && state.scale !== undefined) {
            expect(
              state.scale,
              `${theme.id}.states.${stateName}.scale = ${state.scale}`
            ).toBeGreaterThanOrEqual(0);
            expect(
              state.scale,
              `${theme.id}.states.${stateName}.scale = ${state.scale}`
            ).toBeLessThanOrEqual(2);
          }
        });
      });
    });
  });

  describe('Typography values', () => {
    it('font weights are valid numeric values', () => {
      allThemes.forEach((theme) => {
        const resolved = resolveThemeDefaults(theme);
        Object.entries(resolved.typography.fontWeights).forEach(([key, weight]) => {
          // Font weights should be numeric and between 100-900
          // Allow platform-specific values like macOS 510
          expect(weight, `${theme.id} weight ${key}=${weight} is not a number`).toBeTypeOf(
            'number'
          );
          expect(
            weight,
            `${theme.id} weight ${key}=${weight} is out of range`
          ).toBeGreaterThanOrEqual(100);
          expect(weight, `${theme.id} weight ${key}=${weight} is out of range`).toBeLessThanOrEqual(
            900
          );
        });
      });
    });
  });

  describe('Density values', () => {
    it('item heights are valid CSS lengths', () => {
      allThemes.forEach((theme) => {
        const resolved = resolveThemeDefaults(theme);
        Object.entries(resolved.density.itemHeight).forEach(([key, value]) => {
          expect(value, `${theme.id}.density.itemHeight.${key}`).toMatch(CSS_LENGTH_REGEX);
        });
      });
    });

    it('item heights follow size ordering (sm < md < lg)', () => {
      allThemes.forEach((theme) => {
        const resolved = resolveThemeDefaults(theme);
        const sm = parseInt(resolved.density.itemHeight.sm);
        const md = parseInt(resolved.density.itemHeight.md);
        const lg = parseInt(resolved.density.itemHeight.lg);
        expect(sm, `${theme.id}: sm(${sm}) should be < md(${md})`).toBeLessThan(md);
        expect(md, `${theme.id}: md(${md}) should be < lg(${lg})`).toBeLessThan(lg);
      });
    });
  });

  describe('Shadow values', () => {
    it('no shadow token is empty', () => {
      allThemes.forEach((theme) => {
        Object.entries(theme.shadows).forEach(([key, value]) => {
          expect(value, `${theme.id}.shadows.${key} is empty`).not.toBe('');
        });
      });
    });
  });

  describe('Font values', () => {
    it('all font tokens contain at least one font name', () => {
      allThemes.forEach((theme) => {
        Object.entries(theme.fonts).forEach(([key, value]) => {
          expect(value.length, `${theme.id}.fonts.${key} is empty`).toBeGreaterThan(0);
        });
      });
    });
  });
});
