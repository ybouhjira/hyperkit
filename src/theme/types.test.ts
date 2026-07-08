import { describe, it, expect } from 'vitest';
import type {
  ThemeColors,
  ThemeFonts,
  ThemeRadius,
  ThemeShadows,
  ThemeAccentPalette,
  ThemeTypography,
  ThemeConfig,
} from './types';

describe('theme/types', () => {
  it('should export ThemeColors interface', () => {
    const colors: ThemeColors = {
      bgPrimary: '#000',
      bgSecondary: '#111',
      bgTertiary: '#222',
      bgElevated: '#333',
      textPrimary: '#fff',
      textSecondary: '#ddd',
      textMuted: '#999',
      accent: '#0080ff',
      accentHover: '#0066cc',
      accentMuted: '#004d99',
      border: '#444',
      borderSubtle: '#555',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00ffff',
    };
    expect(colors).toBeDefined();
    expect(colors.bgPrimary).toBe('#000');
    expect(colors.accent).toBe('#0080ff');
  });

  it('should export ThemeFonts interface', () => {
    const fonts: ThemeFonts = {
      code: 'monospace',
      ui: 'sans-serif',
      mono: 'monospace',
    };
    expect(fonts).toBeDefined();
    expect(fonts.code).toBe('monospace');
  });

  it('should export ThemeRadius interface', () => {
    const radius: ThemeRadius = {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    };
    expect(radius).toBeDefined();
    expect(radius.md).toBe('8px');
  });

  it('should export ThemeShadows interface', () => {
    const shadows: ThemeShadows = {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 2px 8px rgba(0,0,0,0.1)',
      lg: '0 8px 24px rgba(0,0,0,0.15)',
      xl: '0 16px 48px rgba(0,0,0,0.2)',
    };
    expect(shadows).toBeDefined();
    expect(shadows.sm).toBeTruthy();
  });

  it('should export ThemeAccentPalette interface', () => {
    const palette: ThemeAccentPalette = {
      purple: '#9333ea',
      orange: '#ea580c',
      green: '#16a34a',
      blue: '#0284c7',
      pink: '#db2777',
    };
    expect(palette).toBeDefined();
    expect(palette.purple).toBeTruthy();
  });

  it('should export ThemeTypography interface', () => {
    const typography: ThemeTypography = {
      baseSizePx: 16,
      scaleRatio: 1.2,
      minViewportPx: 320,
      maxViewportPx: 1920,
    };
    expect(typography).toBeDefined();
    expect(typography.baseSizePx).toBe(16);
    expect(typography.scaleRatio).toBe(1.2);
  });

  it('should export ThemeConfig interface', () => {
    const config: ThemeConfig = {
      id: 'test-theme',
      name: 'Test Theme',
      colors: {
        bgPrimary: '#000',
        bgSecondary: '#111',
        bgTertiary: '#222',
        bgElevated: '#333',
        textPrimary: '#fff',
        textSecondary: '#ddd',
        textMuted: '#999',
        accent: '#0080ff',
        accentHover: '#0066cc',
        accentMuted: '#004d99',
        border: '#444',
        borderSubtle: '#555',
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#00ffff',
      },
      fonts: {
        code: 'monospace',
        ui: 'sans-serif',
        mono: 'monospace',
      },
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    };
    expect(config).toBeDefined();
    expect(config.id).toBe('test-theme');
    expect(config.name).toBe('Test Theme');
  });

  it('should allow optional fields in ThemeConfig', () => {
    const config: ThemeConfig = {
      id: 'minimal',
      name: 'Minimal',
      colors: {} as ThemeColors,
      fonts: {} as ThemeFonts,
      radius: {} as ThemeRadius,
    };
    expect(config.shadows).toBeUndefined();
    expect(config.accentPalette).toBeUndefined();
    expect(config.typography).toBeUndefined();
  });
});
