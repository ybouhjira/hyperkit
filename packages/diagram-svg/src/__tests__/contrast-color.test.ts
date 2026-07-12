import { describe, it, expect } from 'vitest';
import { getContrastColor } from '../renderer-nodes';

describe('getContrastColor', () => {
  it('picks white text on dark opaque fills', () => {
    expect(getContrastColor('#1e293b')).toBe('#ffffff');
    expect(getContrastColor('#3b82f6')).toBe('#ffffff');
  });

  it('picks near-black text on light opaque fills', () => {
    expect(getContrastColor('#ffffff')).toBe('#0f172a');
    expect(getContrastColor('#22c55e')).toBe('#0f172a');
  });

  it('supports 3-digit shorthand hex', () => {
    expect(getContrastColor('#000')).toBe('#ffffff');
    expect(getContrastColor('#fff')).toBe('#0f172a');
  });

  it('returns null for non-hex values so the themed label color wins', () => {
    expect(getContrastColor('rgba(34, 197, 94, 0.1)')).toBeNull();
    expect(getContrastColor('var(--sk-accent)')).toBeNull();
    expect(getContrastColor('#12')).toBeNull();
  });

  it('defers to the themed label color for translucent fills (alpha < 0.6)', () => {
    // 8-digit hex: bright green at 13% opacity would wrongly luminance-pick dark
    // text; alpha awareness returns null so the label keeps the theme color.
    expect(getContrastColor('#22c55e22')).toBeNull();
    // 4-digit shorthand with low alpha.
    expect(getContrastColor('#0f01')).toBeNull();
  });

  it('still contrasts opaque and near-opaque 8-digit fills', () => {
    expect(getContrastColor('#1e293bff')).toBe('#ffffff');
    expect(getContrastColor('#ffffffff')).toBe('#0f172a');
    // alpha exactly at threshold (0.6 ≈ 0x99=153/255) is treated as opaque.
    expect(getContrastColor('#22c55e99')).toBe('#0f172a');
  });
});
