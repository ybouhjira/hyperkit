import { describe, it, expect } from 'vitest';
import { proTheme } from './pro';

describe('proTheme', () => {
  describe('identity', () => {
    it('has id "pro" and a human name', () => {
      expect(proTheme.id).toBe('pro');
      expect(proTheme.name).toBe('Pro');
    });
  });

  describe('palette — restrained Linear-calibrated', () => {
    it('uses neutral cool-gray surfaces, not neon', () => {
      // Background tier should be cool gray, NOT deep-black-with-neon-tint.
      expect(proTheme.colors.bgPrimary).toMatch(/^#[0-9a-fA-F]{6}$/);
      // Reject neon-green/cyan/pink/yellow as primary identity.
      expect(proTheme.colors.accent.toLowerCase()).not.toBe('#00ff88');
      expect(proTheme.colors.accent.toLowerCase()).not.toBe('#00ffe5');
    });

    it('borders are subtle rgba whites, not accent-tinted', () => {
      // Pro is calm — borders should be neutral, accent reserved for active.
      expect(proTheme.colors.border).toMatch(/rgba\(255,\s*255,\s*255/);
    });

    it('status colors are desaturated (not neon)', () => {
      // success / warning / error / info should be calm Linear-tier hues.
      // Neon green #00ff88 would be wrong; muted #2bac76-ish is right.
      expect(proTheme.colors.success.toLowerCase()).not.toBe('#00ff88');
      expect(proTheme.colors.error.toLowerCase()).not.toBe('#ff2e88');
    });
  });

  describe('motion — slower than cyberMax, no overshoot by default', () => {
    it('motion durations are calmer (≥150ms for normal)', () => {
      expect(proTheme.motion).toBeDefined();
      const dur = proTheme.motion!.durations;
      // Parse "150ms" → 150
      const ms = (s: string): number => parseInt(s.replace('ms', ''), 10);
      expect(ms(dur.normal)).toBeGreaterThanOrEqual(150);
      expect(ms(dur.slow)).toBeGreaterThanOrEqual(250);
    });

    it('spring stiffness is gentler than cyberMax', () => {
      expect(proTheme.motion!.spring).toBeDefined();
      // cyberMax stiffness is 320 — pro should be ≤200 for calmer landings.
      expect(proTheme.motion!.spring!.stiffness).toBeLessThanOrEqual(200);
    });
  });

  describe('effects — calm, opt-out by default', () => {
    it('pulse is soft or off (not heavy)', () => {
      expect(proTheme.effects).toBeDefined();
      expect(['soft', 'off']).toContain(proTheme.effects!.pulse);
    });

    it('hover is off or glow but not flashy by default', () => {
      // Pro can keep glow on hover but it should be subtle — the rule
      // we enforce: not 'scale' which feels gimmicky in a productivity tool.
      const allowed = ['off', 'glow'];
      expect(allowed).toContain(proTheme.effects!.hover);
    });

    it('selection is outline, not glow', () => {
      expect(proTheme.effects!.selection).toBe('outline');
    });

    it('overlayBlur is moderate (≤12px)', () => {
      expect(proTheme.effects!.overlayBlur).toBeDefined();
      const blur = parseInt(proTheme.effects!.overlayBlur!.replace('px', ''), 10);
      expect(blur).toBeLessThanOrEqual(12);
    });
  });

  describe('sounds — wired but disabled by default', () => {
    it('sound block is present (so users can opt in)', () => {
      expect(proTheme.sounds).toBeDefined();
      expect(proTheme.sounds!.events).toBeDefined();
    });

    it('enabled: false (silence is the default for shipping)', () => {
      expect(proTheme.sounds!.enabled).toBe(false);
    });

    it('master volume is moderate (≤0.4)', () => {
      expect(proTheme.sounds!.volume).toBeLessThanOrEqual(0.4);
    });

    it('events: at minimum click + success + error are configured (so opt-in produces audible feedback)', () => {
      const events = proTheme.sounds!.events;
      expect(events.click).toBeDefined();
      expect(events.success).toBeDefined();
      expect(events.error).toBeDefined();
    });
  });

  describe('focus ring — visible but not flashy', () => {
    it('uses solid style (not glow) by default', () => {
      expect(proTheme.focusRing).toBeDefined();
      expect(proTheme.focusRing!.style).toBe('solid');
    });

    it('width is 2px (WCAG visible)', () => {
      expect(proTheme.focusRing!.width).toBe('2px');
    });
  });

  describe('shadows — subtle, no neon halos', () => {
    it('shadows do not contain accent-color glow halos', () => {
      // cyberMax uses '0 0 24px rgba(0, 255, 136, ...)' style. Pro shadows
      // should be neutral black with low opacity.
      expect(proTheme.shadows.sm.toLowerCase()).not.toMatch(/0,\s*255,\s*136/);
      expect(proTheme.shadows.md.toLowerCase()).not.toMatch(/0,\s*255,\s*136/);
      expect(proTheme.shadows.lg.toLowerCase()).not.toMatch(/0,\s*255,\s*136/);
      expect(proTheme.shadows.xl.toLowerCase()).not.toMatch(/0,\s*255,\s*136/);
    });
  });

  describe('typography', () => {
    it('keeps the canonical 10-step font scale', () => {
      const sizes = proTheme.fontSizes;
      ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].forEach((k) => {
        expect((sizes as Record<string, string>)[k]).toMatch(/^\d+px$/);
      });
    });

    it('letterSpacing is tight on headings (-0.02em) per premium-ui rule', () => {
      expect(proTheme.typography).toBeDefined();
      expect(proTheme.typography!.letterSpacing.tight).toBe('-0.02em');
    });
  });

  describe('radius — disciplined', () => {
    it('sm/md/lg/xl all between 4px and 12px (no toy radii)', () => {
      const px = (s: string): number => parseInt(s.replace('px', ''), 10);
      expect(px(proTheme.radius.sm)).toBeGreaterThanOrEqual(4);
      expect(px(proTheme.radius.xl)).toBeLessThanOrEqual(12);
    });
  });

  describe('completeness — every premium-ui token group is present', () => {
    it('declares all theme blocks needed for a shipping default', () => {
      expect(proTheme.surfaces).toBeDefined();
      expect(proTheme.states).toBeDefined();
      expect(proTheme.motion).toBeDefined();
      expect(proTheme.focusRing).toBeDefined();
      expect(proTheme.scrollbar).toBeDefined();
      expect(proTheme.typography).toBeDefined();
      expect(proTheme.density).toBeDefined();
      expect(proTheme.spacing).toBeDefined();
      expect(proTheme.zIndex).toBeDefined();
      expect(proTheme.components).toBeDefined();
      expect(proTheme.sounds).toBeDefined();
      expect(proTheme.effects).toBeDefined();
    });

    it('density mode is "compact" or "default" (productivity tier)', () => {
      expect(['compact', 'default']).toContain(proTheme.density!.mode);
    });

    it('scrollbar behavior is overlay (modern apps)', () => {
      expect(proTheme.scrollbar!.behavior).toBe('overlay');
    });

    it('spacing and zIndex have all required keys', () => {
      const spacingKeys = ['0', 'px', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
      spacingKeys.forEach((k) => {
        expect((proTheme.spacing as Record<string, string>)[k]).toBeDefined();
      });
      const zKeys = [
        'base',
        'dropdown',
        'sticky',
        'overlay',
        'modal',
        'popover',
        'tooltip',
        'toast',
      ];
      zKeys.forEach((k) => {
        expect((proTheme.zIndex as Record<string, number>)[k]).toBeDefined();
      });
    });
  });

  describe('component overrides — present + restrained', () => {
    it('declares toolbar / listItem / button / input / card overrides', () => {
      expect(proTheme.components!.toolbar).toBeDefined();
      expect(proTheme.components!.listItem).toBeDefined();
      expect(proTheme.components!.button).toBeDefined();
      expect(proTheme.components!.input).toBeDefined();
      expect(proTheme.components!.card).toBeDefined();
    });

    it('button radius is 6px or smaller (not pill, not toy-large)', () => {
      const r = proTheme.components!.button!.borderRadius!;
      const px = parseInt(String(r).replace('px', ''), 10);
      expect(px).toBeLessThanOrEqual(6);
    });
  });
});
