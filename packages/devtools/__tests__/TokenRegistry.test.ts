import { describe, it, expect } from 'vitest';
import {
  isThemeToken,
  getTokenMapping,
  resolveVarSource,
  getAllTokenGroups,
  getThemeKey,
  getAllTokenNames,
} from '../src/engine/TokenRegistry';

describe('TokenRegistry', () => {
  describe('isThemeToken', () => {
    it('recognizes core color tokens', () => {
      expect(isThemeToken('--sk-accent')).toBe(true);
      expect(isThemeToken('--sk-bg-primary')).toBe(true);
      expect(isThemeToken('--sk-text-muted')).toBe(true);
    });

    it('recognizes spacing tokens', () => {
      expect(isThemeToken('--sk-space-md')).toBe(true);
      expect(isThemeToken('--sk-space-4xl')).toBe(true);
    });

    it('rejects unknown variables', () => {
      expect(isThemeToken('--custom-color')).toBe(false);
      expect(isThemeToken('--sk-btn-primary-bg')).toBe(false);
    });
  });

  describe('getTokenMapping', () => {
    it('returns group and key for known tokens', () => {
      const mapping = getTokenMapping('--sk-accent');
      expect(mapping).toEqual({ group: 'Colors', key: 'colors.accent' });
    });

    it('returns group for radius token', () => {
      const mapping = getTokenMapping('--sk-radius-md');
      expect(mapping).toEqual({ group: 'Radius', key: 'radius.md' });
    });

    it('returns null for unknown variables', () => {
      expect(getTokenMapping('--unknown')).toBeNull();
    });
  });

  describe('resolveVarSource', () => {
    it('resolves theme tokens with group and key', () => {
      const source = resolveVarSource('--sk-accent', 'Zed Dark');
      expect(source).toEqual({
        type: 'theme',
        group: 'Colors',
        key: 'colors.accent',
        themeName: 'Zed Dark',
      });
    });

    it('resolves component overrides', () => {
      const source = resolveVarSource('--sk-btn-primary-bg', 'Zed Dark');
      expect(source).toEqual({
        type: 'component-override',
        variable: '--sk-btn-primary-bg',
      });
    });

    it('resolves generic custom properties', () => {
      const source = resolveVarSource('--my-custom-prop', 'Zed Dark');
      expect(source).toEqual({
        type: 'custom-property',
        key: '--my-custom-prop',
      });
    });
  });

  describe('getAllTokenGroups', () => {
    it('returns all 14 groups', () => {
      const groups = getAllTokenGroups();
      expect(Object.keys(groups).length).toBe(14);
      expect(groups['Colors']).toBeDefined();
      expect(groups['Spacing']).toBeDefined();
      expect(groups['Typography']).toBeDefined();
    });

    it('Colors group has 17 variables', () => {
      const groups = getAllTokenGroups();
      expect(groups['Colors']!.length).toBe(17);
    });
  });

  describe('getThemeKey', () => {
    it('maps --sk-accent to colors.accent', () => {
      expect(getThemeKey('--sk-accent')).toBe('colors.accent');
    });

    it('maps --sk-radius-md to radius.md', () => {
      expect(getThemeKey('--sk-radius-md')).toBe('radius.md');
    });

    it('returns null for unknown vars', () => {
      expect(getThemeKey('--unknown')).toBeNull();
    });
  });

  describe('getAllTokenNames', () => {
    it('returns all token names', () => {
      const names = getAllTokenNames();
      expect(names.length).toBe(88);
      expect(names).toContain('--sk-accent');
      expect(names).toContain('--sk-space-md');
    });
  });
});
