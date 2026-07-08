import { describe, it, expect, beforeEach } from 'vitest';
import { applyThemeToElement, applyThemeToDOM } from '../ThemeProvider';
import { serializeThemeVars, renderThemeStyle } from '../injectThemeVars';
import { themePresets } from '../presets';
import { REQUIRED_CSS_VARS } from '../auditThemeVars';

describe('applyThemeToElement', () => {
  beforeEach(() => {
    // Clear all inline styles from root before each test
    document.documentElement.removeAttribute('style');
  });

  it('applies CSS variables to a custom element, not documentElement', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    applyThemeToElement(theme, customDiv);

    // Verify CSS vars are set on the custom element
    const bgPrimary = customDiv.style.getPropertyValue('--sk-bg-primary');
    expect(bgPrimary).toBe('#1e1e20');

    const accent = customDiv.style.getPropertyValue('--sk-accent');
    expect(accent).toBe('#5b9cf5');

    // Verify documentElement is NOT affected
    const rootBgPrimary = document.documentElement.style.getPropertyValue('--sk-bg-primary');
    expect(rootBgPrimary).toBe('');
  });

  it('CSS variables are scoped to target element only', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    applyThemeToElement(theme, customDiv);

    // Check that documentElement has NO --sk-* vars
    const rootStyleLength = document.documentElement.style.length;
    let skVarsOnRoot = 0;
    for (let i = 0; i < rootStyleLength; i++) {
      const prop = document.documentElement.style[i];
      if (prop.startsWith('--sk-')) {
        skVarsOnRoot++;
      }
    }

    expect(skVarsOnRoot).toBe(0);

    // Verify custom div DOES have --sk-* vars
    let skVarsOnDiv = 0;
    for (let i = 0; i < customDiv.style.length; i++) {
      const prop = customDiv.style[i];
      if (prop.startsWith('--sk-')) {
        skVarsOnDiv++;
      }
    }

    expect(skVarsOnDiv).toBeGreaterThan(0);
  });

  it('sets all required CSS variables', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    applyThemeToElement(theme, customDiv);

    const missing: string[] = [];
    REQUIRED_CSS_VARS.forEach((varName) => {
      const value = customDiv.style.getPropertyValue(varName);
      if (!value) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `applyThemeToElement is missing ${missing.length} required CSS variables:\n${missing.map((v) => `  - ${v}`).join('\n')}`
      );
    }

    expect(missing.length).toBe(0);
  });

  it('achieves parity with applyThemeToDOM for CSS variables', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    // Apply to custom element via applyThemeToElement
    applyThemeToElement(theme, customDiv);

    // Apply to documentElement via applyThemeToDOM
    applyThemeToDOM(theme);

    // Compare all required CSS vars
    const differences: string[] = [];
    REQUIRED_CSS_VARS.forEach((varName) => {
      const valueOnDiv = customDiv.style.getPropertyValue(varName);
      const valueOnRoot = document.documentElement.style.getPropertyValue(varName);

      if (valueOnDiv !== valueOnRoot) {
        differences.push(`${varName}: div="${valueOnDiv}" vs root="${valueOnRoot}"`);
      }
    });

    if (differences.length > 0) {
      throw new Error(
        `CSS variable mismatch between applyThemeToElement and applyThemeToDOM:\n${differences.map((d) => `  - ${d}`).join('\n')}`
      );
    }

    expect(differences.length).toBe(0);
  });

  it('does NOT set data-sk-platform on custom elements', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['macos-light'];

    applyThemeToElement(theme, customDiv);

    // Verify the custom element does NOT have the platform attribute
    expect(customDiv.getAttribute('data-sk-platform')).toBeNull();
  });

  it('applyThemeToDOM DOES set data-sk-platform on documentElement', () => {
    const theme = themePresets['macos-light'];

    applyThemeToDOM(theme);

    // Verify documentElement HAS the platform attribute
    expect(document.documentElement.getAttribute('data-sk-platform')).toBe('macos');
  });

  it('applyThemeToDOM removes data-sk-platform when theme has no platform', () => {
    const themeWithPlatform = themePresets['macos-light'];
    const themeWithoutPlatform = themePresets['zed-dark'];

    // First apply theme with platform
    applyThemeToDOM(themeWithPlatform);
    expect(document.documentElement.getAttribute('data-sk-platform')).toBe('macos');

    // Then apply theme without platform
    applyThemeToDOM(themeWithoutPlatform);
    expect(document.documentElement.getAttribute('data-sk-platform')).toBeNull();
  });

  it('sets component override variables for themes with components', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['material-light'];

    applyThemeToElement(theme, customDiv);

    // Verify --sk-comp-* vars are present
    const compVars: string[] = [];
    for (let i = 0; i < customDiv.style.length; i++) {
      const prop = customDiv.style[i];
      if (prop.startsWith('--sk-comp-')) {
        compVars.push(prop);
      }
    }

    expect(compVars.length).toBeGreaterThan(0);

    // Verify specific component vars from material-light theme
    expect(customDiv.style.getPropertyValue('--sk-comp-toolbar-height')).toBe('56px');
    expect(customDiv.style.getPropertyValue('--sk-comp-list-item-height')).toBe('56px');
    expect(customDiv.style.getPropertyValue('--sk-comp-button-border-radius')).toBe('20px');
    expect(customDiv.style.getPropertyValue('--sk-comp-input-border-radius')).toBe('28px');
  });

  it('applies derived values from resolveThemeDefaults', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    applyThemeToElement(theme, customDiv);

    // Verify surface variables (derived from defaults)
    expect(customDiv.style.getPropertyValue('--sk-surface-base-bg')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-surface-raised-bg')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-surface-overlay-bg')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-surface-sunken-bg')).toBeTruthy();

    // Verify state variables (derived from defaults)
    expect(customDiv.style.getPropertyValue('--sk-state-hover-bg')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-state-selected-bg')).toBeTruthy();

    // Verify motion variables (derived from defaults)
    expect(customDiv.style.getPropertyValue('--sk-motion-instant')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-motion-fast')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-ease-standard')).toBeTruthy();

    // Verify focus ring variables (derived from defaults)
    expect(customDiv.style.getPropertyValue('--sk-focus-width')).toBeTruthy();
    expect(customDiv.style.getPropertyValue('--sk-focus-color')).toBeTruthy();
  });

  it('applies adaptive font sizes', () => {
    const customDiv = document.createElement('div');
    const theme = themePresets['zed-dark'];

    applyThemeToElement(theme, customDiv);

    // Verify all font size scale steps are set
    const fontSizeVars = [
      '--sk-font-size-xs',
      '--sk-font-size-sm',
      '--sk-font-size-base',
      '--sk-font-size-lg',
      '--sk-font-size-xl',
      '--sk-font-size-2xl',
    ];

    fontSizeVars.forEach((varName) => {
      const value = customDiv.style.getPropertyValue(varName);
      expect(value).toBeTruthy();
      expect(value).toMatch(/^\d+px$/); // Should be in px format
    });
  });

  describe('effects', () => {
    it('writes --sk-effect-* vars when theme defines effects', () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        effects: {
          hover: 'glow' as const,
          press: 'scale' as const,
          selection: 'lift' as const,
          pulse: 'heavy' as const,
          overlayBlur: '12px' as const,
        },
      };

      applyThemeToElement(theme, customDiv);

      expect(customDiv.style.getPropertyValue('--sk-effect-hover')).toBe('glow');
      expect(customDiv.style.getPropertyValue('--sk-effect-press')).toBe('scale');
      expect(customDiv.style.getPropertyValue('--sk-effect-selection')).toBe('lift');
      expect(customDiv.style.getPropertyValue('--sk-effect-pulse')).toBe('heavy');
      expect(customDiv.style.getPropertyValue('--sk-overlay-blur')).toBe('12px');
    });

    it('omits effect vars that the theme does not specify', () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        effects: { pulse: 'soft' as const },
      };

      applyThemeToElement(theme, customDiv);

      expect(customDiv.style.getPropertyValue('--sk-effect-pulse')).toBe('soft');
      expect(customDiv.style.getPropertyValue('--sk-effect-hover')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-effect-press')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-effect-selection')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-overlay-blur')).toBe('');
    });

    it('writes nothing when theme has no effects block at all', () => {
      const customDiv = document.createElement('div');
      const theme = themePresets['zed-dark'];
      // zed-dark has no effects field defined.
      expect(theme.effects).toBeUndefined();

      applyThemeToElement(theme, customDiv);

      // None of the effect vars should land on the element.
      expect(customDiv.style.getPropertyValue('--sk-effect-pulse')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-effect-hover')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-effect-press')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-effect-selection')).toBe('');
      expect(customDiv.style.getPropertyValue('--sk-overlay-blur')).toBe('');
    });

    it('serializeThemeVars mirrors the effect vars for SSR', async () => {
      const theme = {
        ...themePresets['zed-dark'],
        effects: {
          hover: 'glow' as const,
          press: 'ripple' as const,
          selection: 'outline' as const,
          pulse: 'soft' as const,
          overlayBlur: '8px' as const,
        },
      };
      const css = serializeThemeVars(theme);
      expect(css).toContain('--sk-effect-hover:glow');
      expect(css).toContain('--sk-effect-press:ripple');
      expect(css).toContain('--sk-effect-selection:outline');
      expect(css).toContain('--sk-effect-pulse:soft');
      expect(css).toContain('--sk-overlay-blur:8px');
    });

    it('writes --sk-custom-* vars when theme defines customProperties', () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        customProperties: {
          brandLogo: 'url(/logo.svg)',
          tagline: '"hand-built in Casa"',
        },
      };

      applyThemeToElement(theme, customDiv);

      expect(customDiv.style.getPropertyValue('--sk-custom-brand-logo')).toBe('url(/logo.svg)');
      expect(customDiv.style.getPropertyValue('--sk-custom-tagline')).toBe('"hand-built in Casa"');
    });

    it('renderThemeStyle emits a :root rule containing the theme vars', async () => {
      const theme = themePresets['zed-dark'];
      const css = renderThemeStyle(theme);
      expect(css.startsWith(':root{')).toBe(true);
      expect(css.endsWith('}')).toBe(true);
      expect(css).toContain('--sk-bg-primary:#1e1e20');
    });

    it('serializeThemeVars covers component overrides + customProperties', async () => {
      const theme = {
        ...themePresets['material-light'],
        customProperties: { brandHero: 'linear-gradient(...)' },
      };
      const css = serializeThemeVars(theme);
      // Component-override loop body fires only when a value is set + non-empty.
      expect(css).toContain('--sk-comp-toolbar-height');
      // Custom-properties loop body must emit kebab-cased keys.
      expect(css).toContain('--sk-custom-brand-hero:linear-gradient(...)');
    });

    it('serializeThemeVars handles backdropFilter on surfaces + glow focus ring', async () => {
      const theme = {
        ...themePresets['zed-dark'],
        surfaces: {
          base: { background: '#000' as const, backdropFilter: 'blur(8px)' },
          raised: {
            background: '#111' as const,
            backdropFilter: 'blur(12px)',
            border: '1px solid #fff',
            shadow: '0 1px 0 #fff',
          },
          overlay: { background: '#222' as const },
          sunken: { background: '#0a0a0a' as const },
        },
        focusRing: {
          width: '2px' as const,
          offset: '2px' as const,
          color: '#5b9cf5' as const,
          style: 'glow' as const,
          glowSpread: '4px' as const,
          glowColor: '#5b9cf5' as const,
        },
      };
      const css = serializeThemeVars(theme);
      expect(css).toContain('--sk-surface-base-backdrop:blur(8px)');
      expect(css).toContain('--sk-surface-raised-backdrop:blur(12px)');
      expect(css).toContain('--sk-surface-raised-border:1px solid #fff');
      expect(css).toContain('--sk-surface-raised-shadow:0 1px 0 #fff');
      expect(css).toContain('--sk-focus-glow-spread:4px');
      expect(css).toContain('--sk-focus-glow-color:#5b9cf5');
    });

    it('honors adaptiveFontSizing: false (theme-supplied fontSizes override adaptive)', () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        adaptiveFontSizing: false,
        fontSizes: {
          ...themePresets['zed-dark'].fontSizes,
          base: '15px' as const,
        },
      };
      applyThemeToElement(theme, customDiv);
      // theme.fontSizes.base wins over the adaptive default.
      expect(customDiv.style.getPropertyValue('--sk-font-size-base')).toBe('15px');
    });

    it('serializeThemeVars also honors adaptiveFontSizing: false', () => {
      const theme = {
        ...themePresets['zed-dark'],
        adaptiveFontSizing: false,
        fontSizes: {
          ...themePresets['zed-dark'].fontSizes,
          base: '15px' as const,
        },
      };
      const css = serializeThemeVars(theme);
      expect(css).toContain('--sk-font-size-base:15px');
    });

    it('focusRing glow falls back to color when glowColor is omitted', () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        focusRing: {
          width: '2px' as const,
          offset: '2px' as const,
          color: '#ff00aa' as const,
          style: 'glow' as const,
          glowSpread: '6px' as const,
          // glowColor intentionally omitted — should fall back to color
        },
      };
      applyThemeToElement(theme, customDiv);
      expect(customDiv.style.getPropertyValue('--sk-focus-glow-color')).toBe('#ff00aa');
    });

    it('serializeThemeVars: focusRing glow without glowColor falls back to color', () => {
      const theme = {
        ...themePresets['zed-dark'],
        focusRing: {
          width: '2px' as const,
          offset: '2px' as const,
          color: '#ff00aa' as const,
          style: 'glow' as const,
          glowSpread: '6px' as const,
        },
      };
      const css = serializeThemeVars(theme);
      expect(css).toContain('--sk-focus-glow-color:#ff00aa');
    });

    it('applyThemeToDOM removes data-theme attribute when theme has no id', () => {
      const themeWithoutId = {
        ...themePresets['zed-dark'],
        id: '',
      };
      // First set the attribute via a normal theme so we can prove it gets cleared.
      applyThemeToDOM(themePresets['zed-dark']);
      expect(document.documentElement.getAttribute('data-theme')).toBe('zed-dark');

      applyThemeToDOM(themeWithoutId);
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    it("supports the 'off' value for opt-out themes", () => {
      const customDiv = document.createElement('div');
      const theme = {
        ...themePresets['zed-dark'],
        effects: {
          hover: 'off' as const,
          press: 'off' as const,
          selection: 'off' as const,
          pulse: 'off' as const,
        },
      };

      applyThemeToElement(theme, customDiv);

      expect(customDiv.style.getPropertyValue('--sk-effect-hover')).toBe('off');
      expect(customDiv.style.getPropertyValue('--sk-effect-press')).toBe('off');
      expect(customDiv.style.getPropertyValue('--sk-effect-selection')).toBe('off');
      expect(customDiv.style.getPropertyValue('--sk-effect-pulse')).toBe('off');
    });
  });
});
