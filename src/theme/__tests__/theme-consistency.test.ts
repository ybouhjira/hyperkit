import { describe, it, expect } from 'vitest';
import { themePresets } from '../presets';

const allThemes = Object.values(themePresets);

describe('Cross-Theme Consistency', () => {
  it('all themes define the same color token keys', () => {
    const referenceKeys = Object.keys(allThemes[0].colors).sort();
    allThemes.forEach((theme) => {
      const keys = Object.keys(theme.colors).sort();
      expect(keys).toEqual(referenceKeys);
    });
  });

  it('all themes define the same font token keys', () => {
    const referenceKeys = Object.keys(allThemes[0].fonts).sort();
    allThemes.forEach((theme) => {
      const keys = Object.keys(theme.fonts).sort();
      expect(keys).toEqual(referenceKeys);
    });
  });

  it('all themes define the same radius token keys', () => {
    const referenceKeys = Object.keys(allThemes[0].radius).sort();
    allThemes.forEach((theme) => {
      const keys = Object.keys(theme.radius).sort();
      expect(keys).toEqual(referenceKeys);
    });
  });

  it('all themes define the same font size keys', () => {
    const referenceKeys = Object.keys(allThemes[0].fontSizes).sort();
    allThemes.forEach((theme) => {
      const keys = Object.keys(theme.fontSizes).sort();
      expect(keys).toEqual(referenceKeys);
    });
  });

  it('all themes define the same shadow keys', () => {
    const referenceKeys = Object.keys(allThemes[0].shadows).sort();
    allThemes.forEach((theme) => {
      const keys = Object.keys(theme.shadows).sort();
      expect(keys).toEqual(referenceKeys);
    });
  });

  it('all themes have unique IDs', () => {
    const ids = allThemes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all themes have unique names', () => {
    const names = allThemes.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all theme IDs match their key in themePresets', () => {
    Object.entries(themePresets).forEach(([key, theme]) => {
      expect(theme.id).toBe(key);
    });
  });

  it('each dark theme has a matching light variant (and vice versa) for platform themes', () => {
    const platformPairs = ['macos', 'windows', 'ubuntu', 'material'];
    platformPairs.forEach((platform) => {
      expect(themePresets[`${platform}-light`]).toBeDefined();
      expect(themePresets[`${platform}-dark`]).toBeDefined();
    });
  });

  it('no color token has an empty string value', () => {
    allThemes.forEach((theme) => {
      Object.entries(theme.colors).forEach(([key, value]) => {
        expect(value, `${theme.id}.colors.${key} is empty`).not.toBe('');
      });
    });
  });

  it('no radius token has an empty string value', () => {
    allThemes.forEach((theme) => {
      Object.entries(theme.radius).forEach(([key, value]) => {
        expect(value, `${theme.id}.radius.${key} is empty`).not.toBe('');
      });
    });
  });
});
