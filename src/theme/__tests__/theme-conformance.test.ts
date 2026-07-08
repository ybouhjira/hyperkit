import { describe, it, expect } from 'vitest';
import { themePresets } from '../presets';
import type { ThemeConfig } from '../types';

function getThemesByPlatform(platform: string): ThemeConfig[] {
  return Object.values(themePresets).filter((t) => t.platform === platform);
}

describe('Platform Theme Conformance', () => {
  describe('Material Design themes', () => {
    const materialThemes = getThemesByPlatform('material');

    it('has both light and dark variants', () => {
      expect(materialThemes.length).toBe(2);
    });

    it('uses sharp corners for toolbar and list items', () => {
      materialThemes.forEach((theme) => {
        expect(theme.components?.toolbar?.borderRadius).toBe('0');
        expect(theme.components?.listItem?.borderRadius).toBe('0');
      });
    });

    it('uses pill-shaped inputs (Material Design 3)', () => {
      materialThemes.forEach((theme) => {
        expect(theme.components?.input?.borderRadius).toBe('28px');
      });
    });

    it('uses rounded buttons (Material Design 3)', () => {
      materialThemes.forEach((theme) => {
        expect(theme.components?.button?.borderRadius).toBe('20px');
      });
    });

    it('uses Roboto font family', () => {
      materialThemes.forEach((theme) => {
        expect(theme.fonts.ui).toMatch(/Roboto/);
      });
    });

    it('has 56px toolbar height', () => {
      materialThemes.forEach((theme) => {
        expect(theme.components?.toolbar?.height).toBe('56px');
      });
    });
  });

  describe('macOS themes', () => {
    const macThemes = getThemesByPlatform('macos');

    it('has both light and dark variants', () => {
      expect(macThemes.length).toBe(2);
    });

    it('uses SF font family', () => {
      macThemes.forEach((theme) => {
        expect(theme.fonts.ui).toMatch(/SF Pro|system-ui|-apple-system/);
      });
    });

    it('has rounded corners (6px small radius)', () => {
      macThemes.forEach((theme) => {
        expect(theme.radius.sm).toBe('6px');
      });
    });

    it('sets platform to macos', () => {
      macThemes.forEach((theme) => {
        expect(theme.platform).toBe('macos');
      });
    });
  });

  describe('Windows themes', () => {
    const winThemes = getThemesByPlatform('windows');

    it('has both light and dark variants', () => {
      expect(winThemes.length).toBe(2);
    });

    it('uses Segoe UI font family', () => {
      winThemes.forEach((theme) => {
        expect(theme.fonts.ui).toMatch(/Segoe UI/);
      });
    });

    it('has Fluent Design radius (4px small)', () => {
      winThemes.forEach((theme) => {
        expect(theme.radius.sm).toBe('4px');
      });
    });
  });

  describe('Ubuntu themes', () => {
    const ubuntuThemes = getThemesByPlatform('ubuntu');

    it('has both light and dark variants', () => {
      expect(ubuntuThemes.length).toBe(2);
    });

    it('uses Ubuntu or Adwaita font', () => {
      ubuntuThemes.forEach((theme) => {
        expect(theme.fonts.ui).toMatch(/Ubuntu|Adwaita/);
      });
    });

    it('has GNOME Adwaita radius (12px large)', () => {
      ubuntuThemes.forEach((theme) => {
        expect(theme.radius.lg).toBe('12px');
      });
    });
  });

  describe('All platform themes define platform field', () => {
    const platformThemes = Object.values(themePresets).filter((t) => t.platform);

    it('has 8 platform themes total (4 platforms × 2 variants)', () => {
      expect(platformThemes.length).toBe(8);
    });

    it('all platform themes have valid platform values', () => {
      const validPlatforms = ['macos', 'windows', 'ubuntu', 'material'];
      platformThemes.forEach((theme) => {
        expect(validPlatforms).toContain(theme.platform);
      });
    });
  });
});
