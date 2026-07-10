import { describe, it, expect } from 'vitest';
import { themePresets } from './presets';

describe('Theme Presets', () => {
  it('has 40 themes', () => {
    expect(Object.keys(themePresets)).toHaveLength(40);
  });

  it('each theme has required fields', () => {
    Object.values(themePresets).forEach((theme) => {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.colors).toBeDefined();
      expect(theme.fonts).toBeDefined();
      expect(theme.radius).toBeDefined();
    });
  });

  it('each theme has all color tokens', () => {
    const requiredColors = [
      'bgPrimary',
      'bgSecondary',
      'bgTertiary',
      'bgElevated',
      'textPrimary',
      'textSecondary',
      'textMuted',
      'accent',
      'accentHover',
      'accentMuted',
      'border',
      'borderSubtle',
      'success',
      'warning',
      'error',
      'info',
    ];
    Object.values(themePresets).forEach((theme) => {
      requiredColors.forEach((color) => {
        expect(theme.colors).toHaveProperty(color);
        expect(theme.colors[color as keyof typeof theme.colors]).toBeTruthy();
      });
    });
  });

  it('each theme has all font tokens', () => {
    Object.values(themePresets).forEach((theme) => {
      expect(theme.fonts.ui).toBeTruthy();
      expect(theme.fonts.code).toBeTruthy();
      expect(theme.fonts.mono).toBeTruthy();
    });
  });

  it('each theme has all radius tokens', () => {
    Object.values(themePresets).forEach((theme) => {
      expect(theme.radius.sm).toBeTruthy();
      expect(theme.radius.md).toBeTruthy();
      expect(theme.radius.lg).toBeTruthy();
      expect(theme.radius.xl).toBeTruthy();
    });
  });

  it('has matching dark/light pairs', () => {
    const editorPairs = ['zed', 'cursor', 'sublime', 'warp', 'linear', 'github'];
    editorPairs.forEach((name) => {
      const darkKey =
        name === 'sublime' || name === 'warp' || name === 'linear' ? name : `${name}-dark`;
      const lightKey = `${name}-light`;
      expect(themePresets[darkKey]).toBeDefined();
      expect(themePresets[lightKey]).toBeDefined();
    });

    const platformPairs = ['macos', 'windows', 'ubuntu', 'material'];
    platformPairs.forEach((name) => {
      expect(themePresets[`${name}-dark`]).toBeDefined();
      expect(themePresets[`${name}-light`]).toBeDefined();
    });
  });

  it('light themes have lighter bgPrimary than dark themes', () => {
    // Light themes should have bgPrimary starting with #c, #d, #e, or #f (high hex values)
    const lightThemes = Object.values(themePresets).filter((t) => t.id.includes('light'));
    lightThemes.forEach((theme) => {
      expect(theme.colors.bgPrimary).toMatch(/^#[c-fC-F]/);
    });
  });

  it('dark themes have dark bgPrimary', () => {
    const darkThemes = Object.values(themePresets).filter((t) => !t.id.includes('light'));
    darkThemes.forEach((theme) => {
      // Dark themes should start with #0 or #1 or #2
      expect(theme.colors.bgPrimary).toMatch(/^#[0-2]/);
    });
  });

  it('theme IDs are unique', () => {
    const ids = Object.values(themePresets).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('theme names are unique', () => {
    const names = Object.values(themePresets).map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
