import type { ThemeConfig, ThemeSurface, ThemeStateStyle } from './types';
import { resolveThemeDefaults } from './defaults';

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/** Multipliers that preserve the ratio between scale steps */
const FONT_SCALE_MULTIPLIERS: Record<string, number> = {
  xs: 0.857, // ~12px at base 14
  sm: 0.929, // ~13px at base 14
  base: 1, // 14px
  lg: 1.143, // ~16px at base 14
  xl: 1.286, // ~18px at base 14
  '2xl': 1.714, // ~24px at base 14
  '3xl': 2.143, // ~30px at base 14
  '4xl': 2.571, // ~36px at base 14
  '5xl': 3.429, // ~48px at base 14
  '6xl': 4.286, // ~60px at base 14
};

/**
 * Compute font sizes that adapt to viewport width.
 *
 * Algorithm:
 * 1. Calculate a base font size from viewport width using a linear formula
 *    clamped between 14px (min readable for dense UI) and 18px (comfortable max)
 * 2. Derive all scale steps from the base using fixed multipliers
 * 3. Ensure no size falls below 11px (WCAG practical minimum)
 *
 * The formula: base = 12 + (viewportWidth * 0.003125)
 * - At  640px viewport → 14px (mobile minimum)
 * - At 1280px viewport → 16px (standard laptop)
 * - At 1920px viewport → 18px (desktop max, clamped)
 * - At 2560px viewport → 18px (4K, clamped)
 */
export function computeAdaptiveFontSizes(): Record<string, string> {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const base = Math.round(Math.max(14, Math.min(18, 12 + viewportWidth * 0.003125)));

  const sizes: Record<string, string> = {};
  for (const [key, multiplier] of Object.entries(FONT_SCALE_MULTIPLIERS)) {
    const computed = Math.round(base * multiplier);
    // Enforce 11px minimum for any size (WCAG practical floor)
    sizes[key] = `${Math.max(12, computed)}px`;
  }
  return sizes;
}

/**
 * Derived semantic tokens — color-mix expressions over the element's own
 * --sk-* vars. These MUST be re-declared wherever a theme is applied
 * (root or scoped element): a :root-only declaration substitutes its var()
 * references AT :root, so element-scoped themes would inherit values mixed
 * from the host theme instead of their own (token bleed).
 */
export const DERIVED_TOKENS: ReadonlyArray<readonly [string, string]> = [
  ['--sk-border-strong', 'color-mix(in srgb, var(--sk-border) 55%, var(--sk-text-primary))'],
  ['--sk-success-muted', 'color-mix(in srgb, var(--sk-success) 15%, transparent)'],
  ['--sk-warning-muted', 'color-mix(in srgb, var(--sk-warning) 15%, transparent)'],
  ['--sk-error-muted', 'color-mix(in srgb, var(--sk-error) 15%, transparent)'],
  ['--sk-info-muted', 'color-mix(in srgb, var(--sk-info) 15%, transparent)'],
];

/**
 * Apply theme CSS variables to a specific DOM element.
 * Useful for scoped theme rendering (e.g. theme matrix grids).
 */
export function applyThemeToElement(theme: ThemeConfig, element: HTMLElement) {
  // Apply color tokens
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--sk-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    element.style.setProperty(cssVarName, value);
  });

  // Re-declare derived tokens so the scope mixes from ITS OWN colors.
  for (const [name, expr] of DERIVED_TOKENS) element.style.setProperty(name, expr);

  // Apply font tokens
  element.style.setProperty('--sk-font-code', theme.fonts.code);
  element.style.setProperty('--sk-font-ui', theme.fonts.ui);
  element.style.setProperty('--sk-font-mono', theme.fonts.mono);

  // Apply radius tokens
  element.style.setProperty('--sk-radius-sm', theme.radius.sm);
  element.style.setProperty('--sk-radius-md', theme.radius.md);
  element.style.setProperty('--sk-radius-lg', theme.radius.lg);
  element.style.setProperty('--sk-radius-xl', theme.radius.xl);

  // Apply shadow tokens
  element.style.setProperty('--sk-shadow-sm', theme.shadows.sm);
  element.style.setProperty('--sk-shadow-md', theme.shadows.md);
  element.style.setProperty('--sk-shadow-lg', theme.shadows.lg);
  element.style.setProperty('--sk-shadow-xl', theme.shadows.xl);
  element.style.setProperty('--sk-shadow-2xl', theme.shadows['2xl']);
  element.style.setProperty('--sk-shadow-inner', theme.shadows.inner);

  // Apply font-size tokens: use adaptive sizing by default; opt-out via adaptiveFontSizing: false
  const sizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
  const useAdaptive = theme.adaptiveFontSizing !== false; // default true
  const fontSizes = !useAdaptive
    ? { ...computeAdaptiveFontSizes(), ...theme.fontSizes } // theme overrides adaptive defaults
    : computeAdaptiveFontSizes();
  for (const key of sizeKeys) {
    const size = (fontSizes as Record<string, string>)[key];
    if (size != null) {
      element.style.setProperty(`--sk-font-size-${key}`, size);
    }
  }

  // Resolve defaults for new token groups
  const resolved = resolveThemeDefaults(theme);

  // === Surfaces ===
  const surfaceEntries: [string, ThemeSurface][] = [
    ['base', resolved.surfaces.base],
    ['raised', resolved.surfaces.raised],
    ['overlay', resolved.surfaces.overlay],
    ['sunken', resolved.surfaces.sunken],
  ];
  for (const [name, surface] of surfaceEntries) {
    element.style.setProperty(`--sk-surface-${name}-bg`, surface.background);
    if (surface.backdropFilter != null)
      element.style.setProperty(`--sk-surface-${name}-backdrop`, surface.backdropFilter);
    if (surface.border != null)
      element.style.setProperty(`--sk-surface-${name}-border`, surface.border);
    if (surface.shadow != null)
      element.style.setProperty(`--sk-surface-${name}-shadow`, surface.shadow);
  }

  // === States ===
  const stateEntries: [string, ThemeStateStyle | undefined][] = [
    ['hover', resolved.states.hover],
    ['pressed', resolved.states.pressed],
    ['selected', resolved.states.selected],
    ['focused', resolved.states.focused],
    ['disabled', resolved.states.disabled],
    ['dragging', resolved.states.dragging],
  ];
  for (const [name, state] of stateEntries) {
    if (!state) continue;
    if (state.background) element.style.setProperty(`--sk-state-${name}-bg`, state.background);
    if (state.opacity !== undefined)
      element.style.setProperty(`--sk-state-${name}-opacity`, String(state.opacity));
    if (state.scale !== undefined)
      element.style.setProperty(`--sk-state-${name}-scale`, String(state.scale));
    if (state.borderColor)
      element.style.setProperty(`--sk-state-${name}-border`, state.borderColor);
    if (state.shadow) element.style.setProperty(`--sk-state-${name}-shadow`, state.shadow);
  }

  // === Motion ===
  element.style.setProperty('--sk-motion-instant', resolved.motion.durations.instant);
  element.style.setProperty('--sk-motion-fast', resolved.motion.durations.fast);
  element.style.setProperty('--sk-motion-normal', resolved.motion.durations.normal);
  element.style.setProperty('--sk-motion-slow', resolved.motion.durations.slow);
  element.style.setProperty('--sk-motion-emphasis', resolved.motion.durations.emphasis);
  element.style.setProperty('--sk-ease-standard', resolved.motion.easings.standard);
  element.style.setProperty('--sk-ease-decelerate', resolved.motion.easings.decelerate);
  element.style.setProperty('--sk-ease-accelerate', resolved.motion.easings.accelerate);
  element.style.setProperty('--sk-ease-spring', resolved.motion.easings.spring);

  // === Focus Ring ===
  element.style.setProperty('--sk-focus-width', resolved.focusRing.width);
  element.style.setProperty('--sk-focus-offset', resolved.focusRing.offset);
  element.style.setProperty('--sk-focus-color', resolved.focusRing.color);
  element.style.setProperty(
    '--sk-focus-style',
    resolved.focusRing.style === 'glow' ? 'solid' : resolved.focusRing.style
  );
  if (resolved.focusRing.style === 'glow' && resolved.focusRing.glowSpread) {
    element.style.setProperty('--sk-focus-glow-spread', resolved.focusRing.glowSpread);
    element.style.setProperty(
      '--sk-focus-glow-color',
      resolved.focusRing.glowColor ?? resolved.focusRing.color
    );
  }

  // === Scrollbar ===
  element.style.setProperty('--sk-scroll-width', resolved.scrollbar.width);
  element.style.setProperty('--sk-scroll-thumb', resolved.scrollbar.thumbColor);
  element.style.setProperty('--sk-scroll-thumb-hover', resolved.scrollbar.thumbHoverColor);
  element.style.setProperty('--sk-scroll-track', resolved.scrollbar.trackColor);
  element.style.setProperty('--sk-scroll-thumb-radius', resolved.scrollbar.thumbRadius);

  // === Typography ===
  element.style.setProperty(
    '--sk-font-weight-regular',
    String(resolved.typography.fontWeights.regular)
  );
  element.style.setProperty(
    '--sk-font-weight-medium',
    String(resolved.typography.fontWeights.medium)
  );
  element.style.setProperty(
    '--sk-font-weight-semibold',
    String(resolved.typography.fontWeights.semibold)
  );
  element.style.setProperty('--sk-font-weight-bold', String(resolved.typography.fontWeights.bold));
  element.style.setProperty(
    '--sk-font-weight-extrabold',
    String(resolved.typography.fontWeights.extrabold)
  );
  element.style.setProperty(
    '--sk-font-weight-black',
    String(resolved.typography.fontWeights.black)
  );
  element.style.setProperty('--sk-letter-spacing-tight', resolved.typography.letterSpacing.tight);
  element.style.setProperty('--sk-letter-spacing-normal', resolved.typography.letterSpacing.normal);
  element.style.setProperty('--sk-letter-spacing-wide', resolved.typography.letterSpacing.wide);
  element.style.setProperty('--sk-line-height-tight', resolved.typography.lineHeights.tight);
  element.style.setProperty('--sk-line-height-normal', resolved.typography.lineHeights.normal);
  element.style.setProperty('--sk-line-height-relaxed', resolved.typography.lineHeights.relaxed);

  // === Density ===
  element.style.setProperty('--sk-density-item-sm', resolved.density.itemHeight.sm);
  element.style.setProperty('--sk-density-item-md', resolved.density.itemHeight.md);
  element.style.setProperty('--sk-density-item-lg', resolved.density.itemHeight.lg);
  element.style.setProperty('--sk-density-pad-x', resolved.density.cellPadding.x);
  element.style.setProperty('--sk-density-pad-y', resolved.density.cellPadding.y);
  element.style.setProperty('--sk-density-gap-sm', resolved.density.gap.sm);
  element.style.setProperty('--sk-density-gap-md', resolved.density.gap.md);
  element.style.setProperty('--sk-density-gap-lg', resolved.density.gap.lg);

  // === Spacing ===
  for (const [key, value] of Object.entries(resolved.spacing)) {
    element.style.setProperty(`--sk-space-${key}`, value);
  }

  // === Z-Index ===
  for (const [key, value] of Object.entries(resolved.zIndex)) {
    element.style.setProperty(`--sk-z-${key}`, String(value));
  }

  // === Component Overrides ===
  const comp = resolved.components;
  const setCompVars = (prefix: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v != null && v !== '') {
        element.style.setProperty(`--sk-comp-${prefix}-${camelToKebab(k)}`, String(v));
      }
    }
  };
  if (comp.toolbar) setCompVars('toolbar', comp.toolbar as Record<string, unknown>);
  if (comp.listItem) setCompVars('list-item', comp.listItem as Record<string, unknown>);
  if (comp.button) setCompVars('button', comp.button as Record<string, unknown>);
  if (comp.input) setCompVars('input', comp.input as Record<string, unknown>);
  if (comp.card) setCompVars('card', comp.card as Record<string, unknown>);

  // === Custom Properties ===
  for (const [key, value] of Object.entries(resolved.customProperties)) {
    element.style.setProperty(`--sk-custom-${camelToKebab(key)}`, value);
  }

  // === Effects (decorative — opt-in per theme) ===
  // Components read these to decide whether to glow on hover, scale on press,
  // pulse while running, etc. A theme that omits the block stays calm; a
  // theme that sets `pulse: 'heavy'` makes every alive surface breathe harder.
  const effects = theme.effects;
  if (effects) {
    if (effects.hover !== undefined) element.style.setProperty('--sk-effect-hover', effects.hover);
    if (effects.press !== undefined) element.style.setProperty('--sk-effect-press', effects.press);
    if (effects.selection !== undefined) {
      element.style.setProperty('--sk-effect-selection', effects.selection);
    }
    if (effects.pulse !== undefined) element.style.setProperty('--sk-effect-pulse', effects.pulse);
    if (effects.overlayBlur !== undefined) {
      element.style.setProperty('--sk-overlay-blur', effects.overlayBlur);
    }
  }
}

/**
 * Apply theme CSS variables to the document root element.
 */
export function applyThemeToDOM(theme: ThemeConfig) {
  applyThemeToElement(theme, document.documentElement);

  // Set theme ID attribute for theme-specific CSS
  if (theme.id) {
    document.documentElement.setAttribute('data-theme', theme.id);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Set platform attribute for platform-specific CSS (only on document root)
  if (theme.platform) {
    document.documentElement.setAttribute('data-sk-platform', theme.platform);
  } else {
    document.documentElement.removeAttribute('data-sk-platform');
  }
}

/**
 * Serialize a theme to a CSS string suitable for SSR injection.
 *
 * Returns the body of a `:root { ... }` block — i.e. a list of `--sk-*: value;`
 * declarations matching what `applyThemeToElement` would imperatively set.
 *
 * Used by ThemeProvider to render a `<style>` element during SSR so the
 * prerendered HTML carries the full token set on first paint, no FOUC.
 *
 * @param viewportWidth — width to use for adaptive font sizing on the server.
 *                        Defaults to 1280 (matches `computeAdaptiveFontSizes`).
 */
export function serializeThemeVars(theme: ThemeConfig, viewportWidth = 1280): string {
  const decls: string[] = [];
  const set = (name: string, value: string) => {
    decls.push(`${name}:${value}`);
  };

  // Color tokens
  for (const [key, value] of Object.entries(theme.colors)) {
    set(`--sk-${camelToKebab(key)}`, value);
  }

  // Derived tokens (must travel with every theme application — see DERIVED_TOKENS).
  for (const [name, expr] of DERIVED_TOKENS) set(name, expr);

  // Font tokens
  set('--sk-font-code', theme.fonts.code);
  set('--sk-font-ui', theme.fonts.ui);
  set('--sk-font-mono', theme.fonts.mono);

  // Radius tokens
  set('--sk-radius-sm', theme.radius.sm);
  set('--sk-radius-md', theme.radius.md);
  set('--sk-radius-lg', theme.radius.lg);
  set('--sk-radius-xl', theme.radius.xl);

  // Shadow tokens
  set('--sk-shadow-sm', theme.shadows.sm);
  set('--sk-shadow-md', theme.shadows.md);
  set('--sk-shadow-lg', theme.shadows.lg);
  set('--sk-shadow-xl', theme.shadows.xl);
  if (theme.shadows['2xl'] != null) set('--sk-shadow-2xl', theme.shadows['2xl']);
  if (theme.shadows.inner != null) set('--sk-shadow-inner', theme.shadows.inner);

  // Font sizes (compute adaptive sizes from a fixed viewport on the server)
  const sizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
  const useAdaptive = theme.adaptiveFontSizing !== false;
  const adaptiveBase = Math.round(Math.max(14, Math.min(18, 12 + viewportWidth * 0.003125)));
  const adaptiveSizes: Record<string, string> = {};
  for (const [k, multiplier] of Object.entries(FONT_SCALE_MULTIPLIERS)) {
    adaptiveSizes[k] = `${Math.max(12, Math.round(adaptiveBase * multiplier))}px`;
  }
  const fontSizes = useAdaptive ? adaptiveSizes : { ...adaptiveSizes, ...theme.fontSizes };
  for (const key of sizeKeys) {
    const size = (fontSizes as Record<string, string>)[key];
    if (size != null) set(`--sk-font-size-${key}`, size);
  }

  // Resolve the rich token tree (surfaces, states, motion, focus, scrollbar,
  // typography, density, spacing, z-index, components, custom properties)
  const resolved = resolveThemeDefaults(theme);

  // Surfaces
  for (const [name, surface] of [
    ['base', resolved.surfaces.base],
    ['raised', resolved.surfaces.raised],
    ['overlay', resolved.surfaces.overlay],
    ['sunken', resolved.surfaces.sunken],
  ] as const) {
    set(`--sk-surface-${name}-bg`, surface.background);
    if (surface.backdropFilter != null)
      set(`--sk-surface-${name}-backdrop`, surface.backdropFilter);
    if (surface.border != null) set(`--sk-surface-${name}-border`, surface.border);
    if (surface.shadow != null) set(`--sk-surface-${name}-shadow`, surface.shadow);
  }

  // States
  for (const [name, state] of [
    ['hover', resolved.states.hover],
    ['pressed', resolved.states.pressed],
    ['selected', resolved.states.selected],
    ['focused', resolved.states.focused],
    ['disabled', resolved.states.disabled],
    ['dragging', resolved.states.dragging],
  ] as const) {
    if (!state) continue;
    if (state.background) set(`--sk-state-${name}-bg`, state.background);
    if (state.opacity !== undefined) set(`--sk-state-${name}-opacity`, String(state.opacity));
    if (state.scale !== undefined) set(`--sk-state-${name}-scale`, String(state.scale));
    if (state.borderColor) set(`--sk-state-${name}-border`, state.borderColor);
    if (state.shadow) set(`--sk-state-${name}-shadow`, state.shadow);
  }

  // Motion
  set('--sk-motion-instant', resolved.motion.durations.instant);
  set('--sk-motion-fast', resolved.motion.durations.fast);
  set('--sk-motion-normal', resolved.motion.durations.normal);
  set('--sk-motion-slow', resolved.motion.durations.slow);
  set('--sk-motion-emphasis', resolved.motion.durations.emphasis);
  set('--sk-ease-standard', resolved.motion.easings.standard);
  set('--sk-ease-decelerate', resolved.motion.easings.decelerate);
  set('--sk-ease-accelerate', resolved.motion.easings.accelerate);
  set('--sk-ease-spring', resolved.motion.easings.spring);

  // Focus ring
  set('--sk-focus-width', resolved.focusRing.width);
  set('--sk-focus-offset', resolved.focusRing.offset);
  set('--sk-focus-color', resolved.focusRing.color);
  set('--sk-focus-style', resolved.focusRing.style === 'glow' ? 'solid' : resolved.focusRing.style);
  if (resolved.focusRing.style === 'glow' && resolved.focusRing.glowSpread) {
    set('--sk-focus-glow-spread', resolved.focusRing.glowSpread);
    set('--sk-focus-glow-color', resolved.focusRing.glowColor ?? resolved.focusRing.color);
  }

  // Scrollbar
  set('--sk-scroll-width', resolved.scrollbar.width);
  set('--sk-scroll-thumb', resolved.scrollbar.thumbColor);
  set('--sk-scroll-thumb-hover', resolved.scrollbar.thumbHoverColor);
  set('--sk-scroll-track', resolved.scrollbar.trackColor);
  set('--sk-scroll-thumb-radius', resolved.scrollbar.thumbRadius);

  // Typography
  set('--sk-font-weight-regular', String(resolved.typography.fontWeights.regular));
  set('--sk-font-weight-medium', String(resolved.typography.fontWeights.medium));
  set('--sk-font-weight-semibold', String(resolved.typography.fontWeights.semibold));
  set('--sk-font-weight-bold', String(resolved.typography.fontWeights.bold));
  set('--sk-font-weight-extrabold', String(resolved.typography.fontWeights.extrabold));
  set('--sk-font-weight-black', String(resolved.typography.fontWeights.black));
  set('--sk-letter-spacing-tight', resolved.typography.letterSpacing.tight);
  set('--sk-letter-spacing-normal', resolved.typography.letterSpacing.normal);
  set('--sk-letter-spacing-wide', resolved.typography.letterSpacing.wide);
  set('--sk-line-height-tight', resolved.typography.lineHeights.tight);
  set('--sk-line-height-normal', resolved.typography.lineHeights.normal);
  set('--sk-line-height-relaxed', resolved.typography.lineHeights.relaxed);

  // Density
  set('--sk-density-item-sm', resolved.density.itemHeight.sm);
  set('--sk-density-item-md', resolved.density.itemHeight.md);
  set('--sk-density-item-lg', resolved.density.itemHeight.lg);
  set('--sk-density-pad-x', resolved.density.cellPadding.x);
  set('--sk-density-pad-y', resolved.density.cellPadding.y);
  set('--sk-density-gap-sm', resolved.density.gap.sm);
  set('--sk-density-gap-md', resolved.density.gap.md);
  set('--sk-density-gap-lg', resolved.density.gap.lg);

  // Spacing
  for (const [key, value] of Object.entries(resolved.spacing)) {
    set(`--sk-space-${key}`, value);
  }

  // Z-index
  for (const [key, value] of Object.entries(resolved.zIndex)) {
    set(`--sk-z-${key}`, String(value));
  }

  // Component overrides
  const comp = resolved.components;
  const setCompVars = (prefix: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v != null && v !== '') {
        set(`--sk-comp-${prefix}-${camelToKebab(k)}`, String(v));
      }
    }
  };
  if (comp.toolbar) setCompVars('toolbar', comp.toolbar as Record<string, unknown>);
  if (comp.listItem) setCompVars('list-item', comp.listItem as Record<string, unknown>);
  if (comp.button) setCompVars('button', comp.button as Record<string, unknown>);
  if (comp.input) setCompVars('input', comp.input as Record<string, unknown>);
  if (comp.card) setCompVars('card', comp.card as Record<string, unknown>);

  // Custom properties
  for (const [key, value] of Object.entries(resolved.customProperties)) {
    set(`--sk-custom-${camelToKebab(key)}`, value);
  }

  // Effects (decorative — opt-in per theme; mirrored from applyThemeToElement)
  const effects = theme.effects;
  if (effects) {
    if (effects.hover !== undefined) set('--sk-effect-hover', effects.hover);
    if (effects.press !== undefined) set('--sk-effect-press', effects.press);
    if (effects.selection !== undefined) set('--sk-effect-selection', effects.selection);
    if (effects.pulse !== undefined) set('--sk-effect-pulse', effects.pulse);
    if (effects.overlayBlur !== undefined) set('--sk-overlay-blur', effects.overlayBlur);
  }

  return decls.join(';');
}

/**
 * Render a complete `<style>` element body (the inner CSS) for SSR injection.
 * Wraps `serializeThemeVars` output in a `:root` rule and adds the data-theme
 * attribute selector so server-rendered HTML matches what `applyThemeToDOM`
 * does at runtime.
 */
export function renderThemeStyle(theme: ThemeConfig, viewportWidth = 1280): string {
  const vars = serializeThemeVars(theme, viewportWidth);
  return `:root{${vars}}`;
}
