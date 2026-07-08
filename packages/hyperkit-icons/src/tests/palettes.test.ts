import { describe, it, expect } from 'vitest';
import { CATEGORY_PALETTES } from '../palettes';
import type { IconCategory } from '../types';

const ALL_CATEGORIES: IconCategory[] = ['transform', 'annotate', 'convert', 'security', 'optimize', 'ai'];

describe('CATEGORY_PALETTES', () => {
  it('has an entry for every category', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_PALETTES[cat]).toBeDefined();
    }
  });

  it('every palette has primary, primaryDark, and light', () => {
    for (const cat of ALL_CATEGORIES) {
      const palette = CATEGORY_PALETTES[cat];
      expect(palette.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(palette.primaryDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(palette.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('primary and primaryDark are different colors', () => {
    for (const cat of ALL_CATEGORIES) {
      const { primary, primaryDark } = CATEGORY_PALETTES[cat];
      expect(primary).not.toBe(primaryDark);
    }
  });

  it('transform category has red palette', () => {
    expect(CATEGORY_PALETTES.transform.primary).toBe('#E5322D');
  });

  it('ai category has indigo palette', () => {
    expect(CATEGORY_PALETTES.ai.primary).toBe('#6366F1');
  });
});
