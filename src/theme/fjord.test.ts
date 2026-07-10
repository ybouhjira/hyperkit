/**
 * fjord.test — assert the HyperKit brand-identity contract.
 *
 * Locks the mockup-a-ide palette into a test so a drive-by refactor can't
 * silently change a brand token (e.g. accent mint → blue) without a
 * failing test. Also confirms fjordTheme is registered in themePresets.
 */

import { describe, it, expect } from 'vitest';
import { fjordTheme } from './fjord';
import { themePresets } from './presets';

describe('fjordTheme', () => {
  it('has the canonical id and name', () => {
    expect(fjordTheme.id).toBe('fjord');
    expect(fjordTheme.name).toBe('Fjord');
  });

  it('surfaces follow the fjord slate-blue ladder', () => {
    expect(fjordTheme.colors.bgPrimary).toBe('#0a0e13');
    expect(fjordTheme.colors.bgSecondary).toBe('#10151c');
    expect(fjordTheme.colors.bgTertiary).toBe('#1a2330');
    expect(fjordTheme.colors.bgElevated).toBe('#141b24');
  });

  it('ships a sunken code-pane surface (#0c1117)', () => {
    expect(fjordTheme.surfaces?.sunken?.background).toBe('#0c1117');
    expect(fjordTheme.customProperties?.bgSunken).toBe('#0c1117');
  });

  it('accent is the brand mint with dark ink on top', () => {
    expect(fjordTheme.colors.accent).toBe('#54d6ae');
    expect(fjordTheme.colors.accentHover).toBe('#6ce4c0');
    expect(fjordTheme.colors.accentMuted).toBe('rgba(84, 214, 174, 0.13)');
    expect(fjordTheme.colors.textOnAccent).toBe('#04150e');
  });

  it('borders are visible (#232c38, strong #313d4d) — not the rgba-7% trap', () => {
    expect(fjordTheme.colors.border).toBe('#232c38');
    expect(fjordTheme.customProperties?.borderStrong).toBe('#313d4d');
  });

  it('text ladder matches the mockup (#e3eaf2 / #9fadbc / #68788c)', () => {
    expect(fjordTheme.colors.textPrimary).toBe('#e3eaf2');
    expect(fjordTheme.colors.textSecondary).toBe('#9fadbc');
    expect(fjordTheme.colors.textMuted).toBe('#68788c');
  });

  it('status colors derive from the GitHub-Dark syntax set', () => {
    expect(fjordTheme.colors.success).toBe('#7ee787');
    expect(fjordTheme.colors.warning).toBe('#ffa657');
    expect(fjordTheme.colors.error).toBe('#ff7b72');
    expect(fjordTheme.colors.info).toBe('#79c0ff');
  });

  it('UI, code, and mono fonts are all JetBrains Mono-led', () => {
    for (const font of [fjordTheme.fonts.ui, fjordTheme.fonts.code, fjordTheme.fonts.mono]) {
      expect(font.startsWith("'JetBrains Mono'")).toBe(true);
      expect(font).toContain('ui-monospace');
      expect(font.endsWith('monospace')).toBe(true);
    }
  });

  it('font-size scale is IDE-density (10/12/13/15/18/24)', () => {
    expect(fjordTheme.fontSizes.xs).toBe('10px');
    expect(fjordTheme.fontSizes.sm).toBe('12px');
    expect(fjordTheme.fontSizes.base).toBe('13px');
    expect(fjordTheme.fontSizes.lg).toBe('15px');
    expect(fjordTheme.fontSizes.xl).toBe('18px');
    expect(fjordTheme.fontSizes['2xl']).toBe('24px');
  });

  it('disables adaptive font sizing so values stay literal', () => {
    expect(fjordTheme.adaptiveFontSizing).toBe(false);
  });

  it('radius scale = 4/8/10/12 (mockup r-sm/r-md/r-lg)', () => {
    expect(fjordTheme.radius.sm).toBe('4px');
    expect(fjordTheme.radius.md).toBe('8px');
    expect(fjordTheme.radius.lg).toBe('10px');
    expect(fjordTheme.radius.xl).toBe('12px');
  });

  it('motion durations match the mockup baseline (150 / 200 / 300 / 450ms)', () => {
    expect(fjordTheme.motion?.durations.fast).toBe('150ms');
    expect(fjordTheme.motion?.durations.normal).toBe('200ms');
    expect(fjordTheme.motion?.durations.slow).toBe('300ms');
    expect(fjordTheme.motion?.durations.emphasis).toBe('450ms');
  });

  it('standard easing is the mockup cubic-bezier(0.4, 0, 0.2, 1)', () => {
    expect(fjordTheme.motion?.easings.standard).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('selection state uses the mint-dim wash with a mint line', () => {
    expect(fjordTheme.states?.selected?.background).toBe('rgba(84, 214, 174, 0.13)');
    expect(fjordTheme.states?.selected?.borderColor).toBe('rgba(84, 214, 174, 0.4)');
    expect(fjordTheme.customProperties?.accentLine).toBe('rgba(84, 214, 174, 0.4)');
  });

  it('focus ring is 2px mint', () => {
    expect(fjordTheme.focusRing?.width).toBe('2px');
    expect(fjordTheme.focusRing?.color).toBe('#54d6ae');
  });

  it('caps font-weight at semibold (mono reads heavy already)', () => {
    const w = fjordTheme.typography?.fontWeights;
    expect(w?.semibold).toBe(600);
    expect(w?.bold).toBe(600);
    expect(w?.extrabold).toBe(600);
    expect(w?.black).toBe(600);
  });

  it('letter-spacing: tight -0.02em headings, wide 0.08em group headers', () => {
    expect(fjordTheme.typography?.letterSpacing.tight).toBe('-0.02em');
    expect(fjordTheme.typography?.letterSpacing.wide).toBe('0.08em');
  });

  it('exposes the GitHub-Dark-derived syntax palette as custom properties', () => {
    const c = fjordTheme.customProperties;
    expect(c?.syntaxKeyword).toBe('#ff7b72');
    expect(c?.syntaxString).toBe('#a5d6ff');
    expect(c?.syntaxFunction).toBe('#79c0ff');
    expect(c?.syntaxComponent).toBe('#7ee787');
    expect(c?.syntaxProperty).toBe('#ffa657');
    expect(c?.syntaxComment).toBe('#7d8590');
    expect(c?.syntaxPunctuation).toBe('#c9d1d9');
  });

  it('component overrides keep IDE chrome density', () => {
    expect(fjordTheme.components?.toolbar?.height).toBe('38px');
    expect(fjordTheme.components?.listItem?.height).toBe('26px');
    expect(fjordTheme.components?.button?.height).toBe('28px');
    expect(fjordTheme.components?.input?.height).toBe('28px');
    expect(fjordTheme.components?.input?.background).toBe('#0c1117');
  });

  it('declares restrained visual-effect toggles', () => {
    expect(fjordTheme.effects?.hover).toBe('glow');
    expect(fjordTheme.effects?.press).toBe('scale');
    expect(fjordTheme.effects?.selection).toBe('outline');
    expect(fjordTheme.effects?.pulse).toBe('soft');
    expect(fjordTheme.effects?.overlayBlur).toBe('12px');
  });

  it('is registered in the themePresets map under the "fjord" key', () => {
    expect(themePresets.fjord).toBeDefined();
    expect(themePresets.fjord?.id).toBe('fjord');
  });
});
