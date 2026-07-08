/**
 * cyber-max.test — assert the maximum-energy stress-test theme contract.
 *
 * Locks the spec values into a test so a drive-by refactor can't silently
 * tone the theme down (e.g. drop pulse from heavy → soft, mute the green).
 * Also confirms cyberMaxTheme is registered in themePresets.
 */

import { describe, it, expect } from 'vitest';
import { cyberMaxTheme } from './cyber-max';
import { themePresets } from './presets';

describe('cyberMaxTheme', () => {
  // ─── Identity ──────────────────────────────────────────────────────────────

  it('has the canonical id and name', () => {
    expect(cyberMaxTheme.id).toBe('cyber-max');
    expect(cyberMaxTheme.name).toBe('Cyber Max');
  });

  // ─── Palette — neon stress-test ────────────────────────────────────────────

  it('uses the deep neon-canvas surface tiers', () => {
    expect(cyberMaxTheme.colors.bgPrimary).toBe('#06070d');
    expect(cyberMaxTheme.colors.bgSecondary).toBe('#0f1119');
    expect(cyberMaxTheme.colors.bgTertiary).toBe('#171a26');
    expect(cyberMaxTheme.colors.bgElevated).toBe('#1c2030');
  });

  it('uses cool-white text on dark with the muted ramp', () => {
    expect(cyberMaxTheme.colors.textPrimary).toBe('#e6e9f5');
    expect(cyberMaxTheme.colors.textSecondary).toBe('#9ba0c1');
    expect(cyberMaxTheme.colors.textMuted).toBe('#6c7194');
  });

  it('primary accent is electric green #00ff88', () => {
    expect(cyberMaxTheme.colors.accent).toBe('#00ff88');
    expect(cyberMaxTheme.colors.accentHover).toBe('#33ff99');
    expect(cyberMaxTheme.colors.accentMuted).toBe('rgba(0, 255, 136, 0.15)');
  });

  it('borders are accent-tinted (subtle and strong)', () => {
    expect(cyberMaxTheme.colors.border).toBe('rgba(0, 255, 136, 0.18)');
    expect(cyberMaxTheme.colors.borderSubtle).toBe('rgba(0, 255, 136, 0.08)');
  });

  it('status palette is the neon-quartet (green/yellow/pink/cyan)', () => {
    expect(cyberMaxTheme.colors.success).toBe('#00ff88');
    expect(cyberMaxTheme.colors.warning).toBe('#ffd000');
    expect(cyberMaxTheme.colors.error).toBe('#ff2e88');
    expect(cyberMaxTheme.colors.info).toBe('#00ffe5');
  });

  it('text-on-accent is the deep canvas (max contrast on neon)', () => {
    expect(cyberMaxTheme.colors.textOnAccent).toBe('#06070d');
  });

  // ─── Typography ────────────────────────────────────────────────────────────

  it('code font is JetBrains Mono Variable first', () => {
    expect(cyberMaxTheme.fonts.code).toContain('JetBrains Mono Variable');
    expect(cyberMaxTheme.fonts.code).toContain('JetBrains Mono');
    expect(cyberMaxTheme.fonts.mono).toContain('JetBrains Mono');
  });

  it('ui font is Inter Variable first', () => {
    expect(cyberMaxTheme.fonts.ui).toContain('Inter Variable');
    expect(cyberMaxTheme.fonts.ui).toContain('Inter');
  });

  it('font-size scale matches the premium-ui spec (10/12/14/16/18/24)', () => {
    expect(cyberMaxTheme.fontSizes.xs).toBe('10px');
    expect(cyberMaxTheme.fontSizes.sm).toBe('12px');
    expect(cyberMaxTheme.fontSizes.base).toBe('14px');
    expect(cyberMaxTheme.fontSizes.lg).toBe('16px');
    expect(cyberMaxTheme.fontSizes.xl).toBe('18px');
    expect(cyberMaxTheme.fontSizes['2xl']).toBe('24px');
    expect(cyberMaxTheme.fontSizes['3xl']).toBe('30px');
    expect(cyberMaxTheme.fontSizes['4xl']).toBe('36px');
    expect(cyberMaxTheme.fontSizes['5xl']).toBe('48px');
    expect(cyberMaxTheme.fontSizes['6xl']).toBe('60px');
  });

  it('disables adaptive font sizing so values stay literal', () => {
    expect(cyberMaxTheme.adaptiveFontSizing).toBe(false);
  });

  // ─── Radius — IDE-tight, not toy-large ─────────────────────────────────────

  it('radius scale is 4/8/12/18 — small but distinct', () => {
    expect(cyberMaxTheme.radius.sm).toBe('4px');
    expect(cyberMaxTheme.radius.md).toBe('8px');
    expect(cyberMaxTheme.radius.lg).toBe('12px');
    expect(cyberMaxTheme.radius.xl).toBe('18px');
  });

  // ─── Shadows — glow-shaped, ramp up with intensity ─────────────────────────

  it('shadows ramp into accent-glow at higher tiers', () => {
    expect(cyberMaxTheme.shadows.sm).toContain('rgba(0, 255, 136');
    expect(cyberMaxTheme.shadows.md).toContain('rgba(0, 255, 136');
    expect(cyberMaxTheme.shadows.lg).toContain('rgba(0, 255, 136');
    expect(cyberMaxTheme.shadows.xl).toContain('rgba(0, 255, 136');
    expect(cyberMaxTheme.shadows['2xl']).toContain('rgba(0, 255, 136');
    expect(cyberMaxTheme.shadows.inner).toBeTruthy();
  });

  // ─── Surfaces ──────────────────────────────────────────────────────────────

  it('surfaces are dark across all tiers', () => {
    expect(cyberMaxTheme.surfaces?.base.background).toBe('#06070d');
    expect(cyberMaxTheme.surfaces?.raised.background).toBe('#0f1119');
    expect(cyberMaxTheme.surfaces?.overlay.background).toBeTruthy();
    expect(cyberMaxTheme.surfaces?.sunken.background).toBeTruthy();
  });

  it('overlay surface carries backdrop blur', () => {
    expect(cyberMaxTheme.surfaces?.overlay.backdropFilter).toContain('blur');
  });

  // ─── States ────────────────────────────────────────────────────────────────

  it('press state scales down for tactile feedback', () => {
    expect(cyberMaxTheme.states?.pressed.scale).toBeLessThan(1);
    expect(cyberMaxTheme.states?.pressed.scale).toBeGreaterThan(0.9);
  });

  it('selected state borders with the neon accent', () => {
    expect(cyberMaxTheme.states?.selected.borderColor).toBe('#00ff88');
  });

  it('disabled state drops opacity', () => {
    expect(cyberMaxTheme.states?.disabled.opacity).toBeLessThan(1);
  });

  // ─── Motion — fast & energetic ─────────────────────────────────────────────

  it('motion durations are short (max 380ms emphasis)', () => {
    expect(cyberMaxTheme.motion?.durations.instant).toBe('40ms');
    expect(cyberMaxTheme.motion?.durations.fast).toBe('110ms');
    expect(cyberMaxTheme.motion?.durations.normal).toBe('180ms');
    expect(cyberMaxTheme.motion?.durations.slow).toBe('260ms');
    expect(cyberMaxTheme.motion?.durations.emphasis).toBe('380ms');
  });

  it('ships an overshoot spring for celebratory motion', () => {
    expect(cyberMaxTheme.motion?.easings.spring).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)');
  });

  it('declares standard / decelerate / accelerate easings', () => {
    expect(cyberMaxTheme.motion?.easings.standard).toContain('cubic-bezier');
    expect(cyberMaxTheme.motion?.easings.decelerate).toContain('cubic-bezier');
    expect(cyberMaxTheme.motion?.easings.accelerate).toContain('cubic-bezier');
  });

  // ─── Focus ring — glow style is the load-bearing one ───────────────────────

  it('focus ring uses the glow style', () => {
    expect(cyberMaxTheme.focusRing?.style).toBe('glow');
    expect(cyberMaxTheme.focusRing?.color).toBe('#00ff88');
    expect(cyberMaxTheme.focusRing?.glowColor).toBeTruthy();
    expect(cyberMaxTheme.focusRing?.glowSpread).toBeTruthy();
  });

  // ─── Scrollbar ─────────────────────────────────────────────────────────────

  it('scrollbar is themed with the accent', () => {
    expect(cyberMaxTheme.scrollbar?.thumbColor).toContain('0, 255, 136');
    expect(cyberMaxTheme.scrollbar?.thumbHoverColor).toContain('0, 255, 136');
    expect(cyberMaxTheme.scrollbar?.behavior).toBe('overlay');
  });

  // ─── Typography block (extended) ───────────────────────────────────────────

  it('typography block declares the full weight scale', () => {
    const w = cyberMaxTheme.typography?.fontWeights;
    expect(w?.regular).toBe(400);
    expect(w?.medium).toBe(500);
    expect(w?.semibold).toBe(600);
    expect(w?.bold).toBe(700);
    expect(w?.extrabold).toBe(800);
    expect(w?.black).toBe(900);
  });

  it('typography letter-spacing is tight on headings', () => {
    expect(cyberMaxTheme.typography?.letterSpacing.tight).toBe('-0.02em');
  });

  it('typography line-heights are defined', () => {
    expect(cyberMaxTheme.typography?.lineHeights.tight).toBeTruthy();
    expect(cyberMaxTheme.typography?.lineHeights.normal).toBeTruthy();
    expect(cyberMaxTheme.typography?.lineHeights.relaxed).toBeTruthy();
  });

  it('typography fonts mirror the top-level fonts', () => {
    expect(cyberMaxTheme.typography?.fonts.ui).toContain('Inter');
    expect(cyberMaxTheme.typography?.fonts.code).toContain('JetBrains Mono');
    expect(cyberMaxTheme.typography?.fonts.mono).toContain('JetBrains Mono');
  });

  it('typography fontSizes mirror the top-level fontSizes', () => {
    expect(cyberMaxTheme.typography?.fontSizes.base).toBe('14px');
    expect(cyberMaxTheme.typography?.fontSizes['2xl']).toBe('24px');
  });

  // ─── Density / spacing / z-index — full token coverage ─────────────────────

  it('density block is defined with all tiers', () => {
    expect(cyberMaxTheme.density?.mode).toBeTruthy();
    expect(cyberMaxTheme.density?.itemHeight.sm).toBeTruthy();
    expect(cyberMaxTheme.density?.itemHeight.md).toBeTruthy();
    expect(cyberMaxTheme.density?.itemHeight.lg).toBeTruthy();
    expect(cyberMaxTheme.density?.cellPadding.x).toBeTruthy();
    expect(cyberMaxTheme.density?.cellPadding.y).toBeTruthy();
    expect(cyberMaxTheme.density?.gap.sm).toBeTruthy();
    expect(cyberMaxTheme.density?.gap.md).toBeTruthy();
    expect(cyberMaxTheme.density?.gap.lg).toBeTruthy();
  });

  it('spacing scale is the canonical 4/8/16/24/32/48/64/96', () => {
    expect(cyberMaxTheme.spacing?.['0']).toBe('0');
    expect(cyberMaxTheme.spacing?.px).toBe('1px');
    expect(cyberMaxTheme.spacing?.['2xs']).toBe('2px');
    expect(cyberMaxTheme.spacing?.xs).toBe('4px');
    expect(cyberMaxTheme.spacing?.sm).toBe('8px');
    expect(cyberMaxTheme.spacing?.md).toBe('16px');
    expect(cyberMaxTheme.spacing?.lg).toBe('24px');
    expect(cyberMaxTheme.spacing?.xl).toBe('32px');
    expect(cyberMaxTheme.spacing?.['2xl']).toBe('48px');
    expect(cyberMaxTheme.spacing?.['3xl']).toBe('64px');
    expect(cyberMaxTheme.spacing?.['4xl']).toBe('96px');
  });

  it('z-index stack is monotonically increasing', () => {
    const z = cyberMaxTheme.zIndex;
    expect(z).toBeDefined();
    expect(z!.base).toBeLessThan(z!.dropdown);
    expect(z!.dropdown).toBeLessThan(z!.sticky);
    expect(z!.sticky).toBeLessThan(z!.overlay);
    expect(z!.overlay).toBeLessThan(z!.modal);
    expect(z!.modal).toBeLessThan(z!.popover);
    expect(z!.popover).toBeLessThan(z!.tooltip);
    expect(z!.tooltip).toBeLessThan(z!.toast);
  });

  // ─── Component overrides ───────────────────────────────────────────────────

  it('component overrides cover toolbar/listItem/button/input/card', () => {
    expect(cyberMaxTheme.components?.toolbar?.height).toBeTruthy();
    expect(cyberMaxTheme.components?.listItem?.height).toBeTruthy();
    expect(cyberMaxTheme.components?.button?.height).toBeTruthy();
    expect(cyberMaxTheme.components?.input?.height).toBeTruthy();
    expect(cyberMaxTheme.components?.card?.background).toBeTruthy();
  });

  // ─── Sounds — ALL 10 events configured at full intensity ───────────────────

  it('sounds are enabled by default (cyberMax is opt-in via theme picker)', () => {
    expect(cyberMaxTheme.sounds?.enabled).toBe(true);
  });

  it('master volume is loud (0.5)', () => {
    expect(cyberMaxTheme.sounds?.volume).toBe(0.5);
  });

  it('ships presets for ALL 10 named events', () => {
    const events = cyberMaxTheme.sounds?.events ?? {};
    const required = [
      'hover',
      'click',
      'select',
      'confirm',
      'success',
      'error',
      'notify',
      'pop',
      'toggleOn',
      'toggleOff',
    ] as const;
    required.forEach((name) => {
      expect(events[name], `missing sound preset: ${name}`).toBeDefined();
    });
  });

  it('every sound preset has a finite frequency in audible range', () => {
    const events = cyberMaxTheme.sounds?.events ?? {};
    for (const [name, p] of Object.entries(events)) {
      if (!p || p.url) continue;
      expect(typeof p.frequency, `${name} frequency type`).toBe('number');
      expect(p.frequency, `${name} frequency lower`).toBeGreaterThan(20);
      expect(p.frequency, `${name} frequency upper`).toBeLessThan(20000);
    }
  });

  it('every sound preset has a duration and volume', () => {
    const events = cyberMaxTheme.sounds?.events ?? {};
    for (const [name, p] of Object.entries(events)) {
      if (!p) continue;
      expect(typeof p.duration, `${name} duration type`).toBe('number');
      expect(p.duration, `${name} duration positive`).toBeGreaterThan(0);
      expect(typeof p.volume, `${name} volume type`).toBe('number');
      expect(p.volume, `${name} volume in 0..1`).toBeGreaterThan(0);
      expect(p.volume, `${name} volume in 0..1`).toBeLessThanOrEqual(1);
    }
  });

  it('locks the per-event sound spec (frequency + wave) so a refactor cannot silently retune', () => {
    const e = cyberMaxTheme.sounds?.events ?? {};
    expect(e.hover?.frequency).toBe(600);
    expect(e.hover?.wave).toBe('sine');
    expect(e.click?.frequency).toBe(880);
    expect(e.click?.wave).toBe('triangle');
    expect(e.select?.frequency).toBe(1100);
    expect(e.select?.wave).toBe('sine');
    expect(e.confirm?.frequency).toBe(660);
    expect(e.confirm?.wave).toBe('sawtooth');
    expect(e.success?.frequency).toBe(988);
    expect(e.success?.wave).toBe('triangle');
    expect(e.error?.frequency).toBe(220);
    expect(e.error?.wave).toBe('square');
    expect(e.notify?.frequency).toBe(783);
    expect(e.notify?.wave).toBe('sine');
    expect(e.pop?.frequency).toBe(1320);
    expect(e.pop?.wave).toBe('square');
    expect(e.toggleOn?.frequency).toBe(1046);
    expect(e.toggleOn?.wave).toBe('sine');
    expect(e.toggleOff?.frequency).toBe(783);
    expect(e.toggleOff?.wave).toBe('sine');
  });

  // ─── Effects — heavy / glow / scale across the board ───────────────────────

  it('effects block matches the cyber-max spec exactly', () => {
    expect(cyberMaxTheme.effects?.hover).toBe('glow');
    expect(cyberMaxTheme.effects?.press).toBe('scale');
    expect(cyberMaxTheme.effects?.selection).toBe('glow');
    expect(cyberMaxTheme.effects?.pulse).toBe('heavy');
    expect(cyberMaxTheme.effects?.overlayBlur).toBe('14px');
  });

  // ─── Custom properties — decorative tokens for hooks downstream ────────────

  it('declares the decorative custom properties (glow + scanline + RGB hues)', () => {
    const cp = cyberMaxTheme.customProperties ?? {};
    expect(cp.glowAccent).toBe('0 0 12px rgba(0, 255, 136, 0.55)');
    expect(cp.glowSubtle).toBe('0 0 8px rgba(0, 255, 136, 0.25)');
    expect(cp.scanlineOpacity).toBe('0.04');
    expect(cp.rgbHueA).toBe('#00ffe5');
    expect(cp.rgbHueB).toBe('#ff2e88');
    expect(cp.rgbHueC).toBe('#ffd000');
  });

  // ─── Registration ──────────────────────────────────────────────────────────

  it('is registered in the themePresets map under the "cyber-max" key', () => {
    expect(themePresets['cyber-max']).toBeDefined();
    expect(themePresets['cyber-max']?.id).toBe('cyber-max');
  });

  it('the registered entry is the same object exported from cyber-max.ts', () => {
    expect(themePresets['cyber-max']).toBe(cyberMaxTheme);
  });
});
