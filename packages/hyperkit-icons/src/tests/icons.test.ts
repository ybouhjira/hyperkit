import { describe, it, expect } from 'vitest';
import * as icons from '../icons';
import type { IconDef } from '../types';

const ALL_ICONS = Object.values(icons) as IconDef[];

describe('Icon definitions', () => {
  it('exports at least 16 icon definitions', () => {
    expect(ALL_ICONS.length).toBeGreaterThanOrEqual(16);
  });

  it('every icon has a non-empty name', () => {
    for (const icon of ALL_ICONS) {
      expect(icon.name.length).toBeGreaterThan(0);
    }
  });

  it('every icon has a valid category', () => {
    const validCategories = new Set(['transform', 'annotate', 'convert', 'security', 'optimize', 'ai']);
    for (const icon of ALL_ICONS) {
      expect(validCategories.has(icon.category), `${icon.name} has invalid category: ${icon.category}`).toBe(true);
    }
  });

  it('every icon has at least one tag', () => {
    for (const icon of ALL_ICONS) {
      expect(icon.tags.length, `${icon.name} has no tags`).toBeGreaterThan(0);
    }
  });

  it('every icon has at least one layer', () => {
    for (const icon of ALL_ICONS) {
      expect(icon.layers.length, `${icon.name} has no layers`).toBeGreaterThan(0);
    }
  });

  it('every layer has a valid tag', () => {
    const validTags = new Set(['rect', 'circle', 'ellipse', 'path', 'text']);
    for (const icon of ALL_ICONS) {
      for (const layer of icon.layers) {
        expect(
          validTags.has(layer.tag),
          `${icon.name} layer has invalid tag: ${layer.tag}`
        ).toBe(true);
      }
    }
  });

  it('every layer has a valid role', () => {
    const validRoles = new Set(['bg', 'main', 'accent', 'detail']);
    for (const icon of ALL_ICONS) {
      for (const layer of icon.layers) {
        expect(
          validRoles.has(layer.role),
          `${icon.name} layer has invalid role: ${layer.role}`
        ).toBe(true);
      }
    }
  });

  it('every layer has an attrs object', () => {
    for (const icon of ALL_ICONS) {
      for (const layer of icon.layers) {
        expect(typeof layer.attrs).toBe('object');
        expect(layer.attrs).not.toBeNull();
      }
    }
  });

  it('icon names are unique', () => {
    const names = ALL_ICONS.map((i) => i.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('transform icon defs exist', () => {
    const { MergeIconDef, SplitIconDef, RotateIconDef, CropIconDef } = icons;
    expect(MergeIconDef).toBeDefined();
    expect(SplitIconDef).toBeDefined();
    expect(RotateIconDef).toBeDefined();
    expect(CropIconDef).toBeDefined();
  });

  it('convert icon defs exist', () => {
    const { PdfToWordIconDef, PdfToExcelIconDef, PdfToImageIconDef } = icons;
    expect(PdfToWordIconDef).toBeDefined();
    expect(PdfToExcelIconDef).toBeDefined();
    expect(PdfToImageIconDef).toBeDefined();
  });

  it('security icon defs exist', () => {
    const { PasswordProtectIconDef, UnlockIconDef, RedactIconDef } = icons;
    expect(PasswordProtectIconDef).toBeDefined();
    expect(UnlockIconDef).toBeDefined();
    expect(RedactIconDef).toBeDefined();
  });

  it('ai icon defs exist', () => {
    const { AiSummarizeIconDef, AiChatIconDef, AiFillFormsIconDef } = icons;
    expect(AiSummarizeIconDef).toBeDefined();
    expect(AiChatIconDef).toBeDefined();
    expect(AiFillFormsIconDef).toBeDefined();
  });
});
