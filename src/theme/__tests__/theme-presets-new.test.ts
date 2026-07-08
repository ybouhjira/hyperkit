import { describe, expect, it } from 'vitest';
import {
  defaultLightTheme,
  highContrastTheme,
  warmDarkTheme,
  oceanTheme,
  roseTheme,
  themePresets,
} from '../presets';

const newPresets = [defaultLightTheme, highContrastTheme, warmDarkTheme, oceanTheme, roseTheme];

const newPresetIds = ['default-light', 'high-contrast', 'warm-dark', 'ocean', 'rose'];

describe('New Theme Presets', () => {
  describe('Required Fields', () => {
    newPresets.forEach((preset) => {
      describe(preset.name, () => {
        it('has all required ThemeConfig fields', () => {
          expect(preset.id).toBeDefined();
          expect(preset.name).toBeDefined();
          expect(preset.colors).toBeDefined();
          expect(preset.fonts).toBeDefined();
          expect(preset.radius).toBeDefined();
          expect(preset.fontSizes).toBeDefined();
          expect(preset.shadows).toBeDefined();
        });

        it('has all required color fields', () => {
          const colors = preset.colors;
          expect(colors.bgPrimary).toBeDefined();
          expect(colors.bgSecondary).toBeDefined();
          expect(colors.bgTertiary).toBeDefined();
          expect(colors.bgElevated).toBeDefined();
          expect(colors.textPrimary).toBeDefined();
          expect(colors.textSecondary).toBeDefined();
          expect(colors.textMuted).toBeDefined();
          expect(colors.accent).toBeDefined();
          expect(colors.accentHover).toBeDefined();
          expect(colors.accentMuted).toBeDefined();
          expect(colors.border).toBeDefined();
          expect(colors.borderSubtle).toBeDefined();
          expect(colors.success).toBeDefined();
          expect(colors.warning).toBeDefined();
          expect(colors.error).toBeDefined();
          expect(colors.info).toBeDefined();
          expect(colors.textOnAccent).toBeDefined();
        });

        it('has all required font fields', () => {
          const fonts = preset.fonts;
          expect(fonts.ui).toBeDefined();
          expect(fonts.code).toBeDefined();
          expect(fonts.mono).toBeDefined();
        });

        it('has all required radius fields', () => {
          const radius = preset.radius;
          expect(radius.sm).toBeDefined();
          expect(radius.md).toBeDefined();
          expect(radius.lg).toBeDefined();
          expect(radius.xl).toBeDefined();
        });

        it('has all required fontSize fields', () => {
          const fontSizes = preset.fontSizes;
          expect(fontSizes.xs).toBeDefined();
          expect(fontSizes.sm).toBeDefined();
          expect(fontSizes.base).toBeDefined();
          expect(fontSizes.lg).toBeDefined();
          expect(fontSizes.xl).toBeDefined();
          expect(fontSizes['2xl']).toBeDefined();
          expect(fontSizes['3xl']).toBeDefined();
          expect(fontSizes['4xl']).toBeDefined();
          expect(fontSizes['5xl']).toBeDefined();
          expect(fontSizes['6xl']).toBeDefined();
        });

        it('has all required shadow fields', () => {
          const shadows = preset.shadows;
          expect(shadows.sm).toBeDefined();
          expect(shadows.md).toBeDefined();
          expect(shadows.lg).toBeDefined();
          expect(shadows.xl).toBeDefined();
          expect(shadows['2xl']).toBeDefined();
          expect(shadows.inner).toBeDefined();
        });
      });
    });
  });

  describe('Color Validation', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    const rgbaColorRegex = /^rgba?\([^)]+\)$/;

    newPresets.forEach((preset) => {
      describe(preset.name, () => {
        it('has valid hex colors for main color fields', () => {
          const colors = preset.colors;
          // Check hex colors (skip rgba colors)
          if (!colors.bgPrimary.startsWith('rgba')) {
            expect(colors.bgPrimary).toMatch(hexColorRegex);
          }
          if (!colors.bgSecondary.startsWith('rgba')) {
            expect(colors.bgSecondary).toMatch(hexColorRegex);
          }
          if (!colors.textPrimary.startsWith('rgba')) {
            expect(colors.textPrimary).toMatch(hexColorRegex);
          }
          if (!colors.accent.startsWith('rgba')) {
            expect(colors.accent).toMatch(hexColorRegex);
          }
        });

        it('has valid rgba colors for muted colors', () => {
          const colors = preset.colors;
          if (colors.accentMuted.startsWith('rgba')) {
            expect(colors.accentMuted).toMatch(rgbaColorRegex);
          }
        });
      });
    });
  });

  describe('Theme Presets Object', () => {
    it('includes all new presets in themePresets object', () => {
      newPresetIds.forEach((id) => {
        expect(themePresets[id]).toBeDefined();
      });
    });

    it('maps preset IDs to correct theme objects', () => {
      expect(themePresets['default-light']).toBe(defaultLightTheme);
      expect(themePresets['high-contrast']).toBe(highContrastTheme);
      expect(themePresets['warm-dark']).toBe(warmDarkTheme);
      expect(themePresets['ocean']).toBe(oceanTheme);
      expect(themePresets['rose']).toBe(roseTheme);
    });
  });

  describe('Theme-Specific Tests', () => {
    it('defaultLightTheme has light backgrounds', () => {
      expect(defaultLightTheme.colors.bgPrimary).toBe('#ffffff');
      expect(defaultLightTheme.colors.textPrimary).toBe('#1a1a1a');
    });

    it('highContrastTheme has pure black/white colors', () => {
      expect(highContrastTheme.colors.bgPrimary).toBe('#000000');
      expect(highContrastTheme.colors.textPrimary).toBe('#ffffff');
      expect(highContrastTheme.colors.accent).toBe('#ffdd00');
    });

    it('warmDarkTheme has warm brown tones', () => {
      expect(warmDarkTheme.colors.bgPrimary).toBe('#1c1917');
      expect(warmDarkTheme.colors.accent).toBe('#f59e0b');
    });

    it('oceanTheme has blue tones', () => {
      expect(oceanTheme.colors.bgPrimary).toBe('#0c1222');
      expect(oceanTheme.colors.accent).toBe('#06b6d4');
    });

    it('roseTheme has pink/rose tones', () => {
      expect(roseTheme.colors.bgPrimary).toBe('#1a1018');
      expect(roseTheme.colors.accent).toBe('#ec4899');
    });
  });
});
