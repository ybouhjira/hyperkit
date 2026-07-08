/**
 * hyperlabs.test — assert the premium-design-system contract.
 *
 * Locks the spec values into a test so a drive-by refactor can't silently
 * change a token (e.g. font-size base 14 → 16) without a failing test.
 * Also confirms hyperlabsTheme is registered in themePresets.
 */

import { describe, it, expect } from 'vitest';
import { hyperlabsTheme } from './hyperlabs';
import { themePresets } from './presets';

describe('hyperlabsTheme', () => {
  it('has the canonical id and name', () => {
    expect(hyperlabsTheme.id).toBe('hyperlabs');
    expect(hyperlabsTheme.name).toBe('Hyperlabs');
  });

  it('font-size scale matches premium-ui spec (10/12/14/16/18/24)', () => {
    expect(hyperlabsTheme.fontSizes.xs).toBe('10px');
    expect(hyperlabsTheme.fontSizes.sm).toBe('12px');
    expect(hyperlabsTheme.fontSizes.base).toBe('14px');
    expect(hyperlabsTheme.fontSizes.lg).toBe('16px');
    expect(hyperlabsTheme.fontSizes.xl).toBe('18px');
    expect(hyperlabsTheme.fontSizes['2xl']).toBe('24px');
  });

  it('disables adaptive font sizing so values stay literal', () => {
    expect(hyperlabsTheme.adaptiveFontSizing).toBe(false);
  });

  it('radius scale = 4/6/8/12 (small only, premium-diagram)', () => {
    expect(hyperlabsTheme.radius.sm).toBe('4px');
    expect(hyperlabsTheme.radius.md).toBe('6px');
    expect(hyperlabsTheme.radius.lg).toBe('8px');
    expect(hyperlabsTheme.radius.xl).toBe('12px');
  });

  it('borders are visible (Slack-recipe #2c2d30 not the rgba-7% trap)', () => {
    expect(hyperlabsTheme.colors.border).toBe('#2c2d30');
  });

  it('accent is the Slack channel-active blue', () => {
    expect(hyperlabsTheme.colors.accent).toBe('#1264a3');
  });

  it('surfaces follow the Slack dark recipe', () => {
    expect(hyperlabsTheme.colors.bgPrimary).toBe('#1a1d21');
    expect(hyperlabsTheme.colors.bgSecondary).toBe('#222529');
    expect(hyperlabsTheme.colors.bgTertiary).toBe('#2c2d30');
    expect(hyperlabsTheme.colors.bgElevated).toBe('#27292d');
  });

  it('motion durations match premium-ui (150 / 200 / 300 / 450ms)', () => {
    expect(hyperlabsTheme.motion?.durations.fast).toBe('150ms');
    expect(hyperlabsTheme.motion?.durations.normal).toBe('200ms');
    expect(hyperlabsTheme.motion?.durations.slow).toBe('300ms');
    expect(hyperlabsTheme.motion?.durations.emphasis).toBe('450ms');
  });

  it('ships a spring easing for celebratory micro-interactions', () => {
    expect(hyperlabsTheme.motion?.easings.spring).toContain('cubic-bezier');
  });

  it('caps font-weight at semibold (no bold per premium-ui law #3)', () => {
    const w = hyperlabsTheme.typography?.fontWeights;
    expect(w?.semibold).toBe(600);
    expect(w?.bold).toBe(600);
    expect(w?.extrabold).toBe(600);
    expect(w?.black).toBe(600);
  });

  it('letter-spacing tight = -0.02em on headings', () => {
    expect(hyperlabsTheme.typography?.letterSpacing.tight).toBe('-0.02em');
  });

  it('declares a sound-design block (default off, opt-in)', () => {
    expect(hyperlabsTheme.sounds).toBeDefined();
    expect(hyperlabsTheme.sounds?.enabled).toBe(false);
    expect(hyperlabsTheme.sounds?.volume).toBeGreaterThan(0);
    expect(hyperlabsTheme.sounds?.volume).toBeLessThanOrEqual(1);
  });

  it('ships presets for the 10 named events', () => {
    const events = hyperlabsTheme.sounds?.events ?? {};
    expect(events.hover).toBeDefined();
    expect(events.click).toBeDefined();
    expect(events.select).toBeDefined();
    expect(events.confirm).toBeDefined();
    expect(events.success).toBeDefined();
    expect(events.error).toBeDefined();
    expect(events.notify).toBeDefined();
    expect(events.pop).toBeDefined();
    expect(events.toggleOn).toBeDefined();
    expect(events.toggleOff).toBeDefined();
  });

  it('every sound preset has a finite frequency in audible range (20Hz–20kHz)', () => {
    const events = hyperlabsTheme.sounds?.events ?? {};
    for (const [name, p] of Object.entries(events)) {
      if (!p || p.url) continue;
      expect(typeof p.frequency).toBe('number');
      expect(p.frequency, `${name} frequency`).toBeGreaterThan(20);
      expect(p.frequency, `${name} frequency`).toBeLessThan(20000);
    }
  });

  it('declares visual-effect toggles', () => {
    expect(hyperlabsTheme.effects?.hover).toBe('glow');
    expect(hyperlabsTheme.effects?.press).toBe('scale');
    expect(hyperlabsTheme.effects?.selection).toBe('lift');
    expect(hyperlabsTheme.effects?.pulse).toBe('soft');
    expect(hyperlabsTheme.effects?.overlayBlur).toBe('12px');
  });

  it('component overrides keep activity-bar density (28-32px)', () => {
    expect(hyperlabsTheme.components?.toolbar?.height).toBe('32px');
    expect(hyperlabsTheme.components?.button?.height).toBe('28px');
    expect(hyperlabsTheme.components?.input?.height).toBe('28px');
    expect(hyperlabsTheme.components?.listItem?.height).toBe('28px');
  });

  it('is registered in the themePresets map under the "hyperlabs" key', () => {
    expect(themePresets.hyperlabs).toBeDefined();
    expect(themePresets.hyperlabs?.id).toBe('hyperlabs');
  });
});
