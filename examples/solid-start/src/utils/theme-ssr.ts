import { ThemeConfig, resolveThemeDefaults } from '@ybouhjira/hyperkit';


function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Generate CSS variable declarations from a theme config for SSR.
 * This allows theme CSS variables to be available during server-side rendering,
 * preventing FOUC (Flash of Unstyled Content).
 */
export function generateThemeCSS(theme: ThemeConfig): string {
  const vars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars.push(`--sk-${camelToKebab(key)}: ${value};`);
  });

  // Fonts
  vars.push(`--sk-font-code: ${theme.fonts.code};`);
  vars.push(`--sk-font-ui: ${theme.fonts.ui};`);
  vars.push(`--sk-font-mono: ${theme.fonts.mono};`);

  // Radius
  vars.push(`--sk-radius-sm: ${theme.radius.sm};`);
  vars.push(`--sk-radius-md: ${theme.radius.md};`);
  vars.push(`--sk-radius-lg: ${theme.radius.lg};`);
  vars.push(`--sk-radius-xl: ${theme.radius.xl};`);

  // Shadows
  vars.push(`--sk-shadow-sm: ${theme.shadows.sm};`);
  vars.push(`--sk-shadow-md: ${theme.shadows.md};`);
  vars.push(`--sk-shadow-lg: ${theme.shadows.lg};`);
  vars.push(`--sk-shadow-xl: ${theme.shadows.xl};`);
  vars.push(`--sk-shadow-2xl: ${theme.shadows['2xl']};`);
  vars.push(`--sk-shadow-inner: ${theme.shadows.inner};`);

  // Font sizes (static values for SSR - adaptive sizing happens client-side)
  vars.push(`--sk-font-size-xs: 12px;`);
  vars.push(`--sk-font-size-sm: 13px;`);
  vars.push(`--sk-font-size-base: 14px;`);
  vars.push(`--sk-font-size-lg: 16px;`);
  vars.push(`--sk-font-size-xl: 18px;`);
  vars.push(`--sk-font-size-2xl: 24px;`);
  vars.push(`--sk-font-size-3xl: 30px;`);
  vars.push(`--sk-font-size-4xl: 36px;`);
  vars.push(`--sk-font-size-5xl: 48px;`);
  vars.push(`--sk-font-size-6xl: 60px;`);

  // Resolve defaults for new token groups
  const resolved = resolveThemeDefaults(theme);

  // Surfaces
  const surfaceEntries: [string, any][] = [
    ['base', resolved.surfaces.base],
    ['raised', resolved.surfaces.raised],
    ['overlay', resolved.surfaces.overlay],
    ['sunken', resolved.surfaces.sunken],
  ];
  for (const [name, surface] of surfaceEntries) {
    vars.push(`--sk-surface-${name}-bg: ${surface.background};`);
    if (surface.backdropFilter) vars.push(`--sk-surface-${name}-backdrop: ${surface.backdropFilter};`);
    if (surface.border) vars.push(`--sk-surface-${name}-border: ${surface.border};`);
    if (surface.shadow) vars.push(`--sk-surface-${name}-shadow: ${surface.shadow};`);
  }

  // States
  const stateEntries: [string, any][] = [
    ['hover', resolved.states.hover],
    ['pressed', resolved.states.pressed],
    ['selected', resolved.states.selected],
    ['focused', resolved.states.focused],
    ['disabled', resolved.states.disabled],
  ];
  if (resolved.states.dragging) {
    stateEntries.push(['dragging', resolved.states.dragging]);
  }
  for (const [name, state] of stateEntries) {
    if (!state) continue;
    if (state.background) vars.push(`--sk-state-${name}-bg: ${state.background};`);
    if (state.opacity !== undefined) vars.push(`--sk-state-${name}-opacity: ${state.opacity};`);
    if (state.scale !== undefined) vars.push(`--sk-state-${name}-scale: ${state.scale};`);
    if (state.borderColor) vars.push(`--sk-state-${name}-border: ${state.borderColor};`);
    if (state.shadow) vars.push(`--sk-state-${name}-shadow: ${state.shadow};`);
  }

  // Motion
  vars.push(`--sk-motion-instant: ${resolved.motion.durations.instant};`);
  vars.push(`--sk-motion-fast: ${resolved.motion.durations.fast};`);
  vars.push(`--sk-motion-normal: ${resolved.motion.durations.normal};`);
  vars.push(`--sk-motion-slow: ${resolved.motion.durations.slow};`);
  vars.push(`--sk-motion-emphasis: ${resolved.motion.durations.emphasis};`);
  vars.push(`--sk-ease-standard: ${resolved.motion.easings.standard};`);
  vars.push(`--sk-ease-decelerate: ${resolved.motion.easings.decelerate};`);
  vars.push(`--sk-ease-accelerate: ${resolved.motion.easings.accelerate};`);
  vars.push(`--sk-ease-spring: ${resolved.motion.easings.spring};`);

  // Focus Ring
  vars.push(`--sk-focus-width: ${resolved.focusRing.width};`);
  vars.push(`--sk-focus-offset: ${resolved.focusRing.offset};`);
  vars.push(`--sk-focus-color: ${resolved.focusRing.color};`);
  vars.push(`--sk-focus-style: ${resolved.focusRing.style === 'glow' ? 'solid' : resolved.focusRing.style};`);
  if (resolved.focusRing.style === 'glow' && resolved.focusRing.glowSpread) {
    vars.push(`--sk-focus-glow-spread: ${resolved.focusRing.glowSpread};`);
    vars.push(`--sk-focus-glow-color: ${resolved.focusRing.glowColor ?? resolved.focusRing.color};`);
  }

  // Scrollbar
  vars.push(`--sk-scroll-width: ${resolved.scrollbar.width};`);
  vars.push(`--sk-scroll-thumb: ${resolved.scrollbar.thumbColor};`);
  vars.push(`--sk-scroll-thumb-hover: ${resolved.scrollbar.thumbHoverColor};`);
  vars.push(`--sk-scroll-track: ${resolved.scrollbar.trackColor};`);
  vars.push(`--sk-scroll-thumb-radius: ${resolved.scrollbar.thumbRadius};`);

  // Typography
  vars.push(`--sk-font-weight-regular: ${resolved.typography.fontWeights.regular};`);
  vars.push(`--sk-font-weight-medium: ${resolved.typography.fontWeights.medium};`);
  vars.push(`--sk-font-weight-semibold: ${resolved.typography.fontWeights.semibold};`);
  vars.push(`--sk-font-weight-bold: ${resolved.typography.fontWeights.bold};`);
  vars.push(`--sk-font-weight-extrabold: ${resolved.typography.fontWeights.extrabold};`);
  vars.push(`--sk-font-weight-black: ${resolved.typography.fontWeights.black};`);
  vars.push(`--sk-letter-spacing-tight: ${resolved.typography.letterSpacing.tight};`);
  vars.push(`--sk-letter-spacing-normal: ${resolved.typography.letterSpacing.normal};`);
  vars.push(`--sk-letter-spacing-wide: ${resolved.typography.letterSpacing.wide};`);
  vars.push(`--sk-line-height-tight: ${resolved.typography.lineHeights.tight};`);
  vars.push(`--sk-line-height-normal: ${resolved.typography.lineHeights.normal};`);
  vars.push(`--sk-line-height-relaxed: ${resolved.typography.lineHeights.relaxed};`);

  // Density
  vars.push(`--sk-density-item-sm: ${resolved.density.itemHeight.sm};`);
  vars.push(`--sk-density-item-md: ${resolved.density.itemHeight.md};`);
  vars.push(`--sk-density-item-lg: ${resolved.density.itemHeight.lg};`);
  vars.push(`--sk-density-pad-x: ${resolved.density.cellPadding.x};`);
  vars.push(`--sk-density-pad-y: ${resolved.density.cellPadding.y};`);
  vars.push(`--sk-density-gap-sm: ${resolved.density.gap.sm};`);
  vars.push(`--sk-density-gap-md: ${resolved.density.gap.md};`);
  vars.push(`--sk-density-gap-lg: ${resolved.density.gap.lg};`);

  // Spacing
  for (const [key, value] of Object.entries(resolved.spacing)) {
    vars.push(`--sk-space-${key}: ${value};`);
  }

  // Z-Index
  for (const [key, value] of Object.entries(resolved.zIndex)) {
    vars.push(`--sk-z-${key}: ${value};`);
  }

  // Component Overrides
  const setCompVars = (prefix: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v != null && v !== '') {
        vars.push(`--sk-comp-${prefix}-${camelToKebab(k)}: ${v};`);
      }
    }
  };
  if (resolved.components.toolbar) setCompVars('toolbar', resolved.components.toolbar as Record<string, unknown>);
  if (resolved.components.listItem) setCompVars('list-item', resolved.components.listItem as Record<string, unknown>);
  if (resolved.components.button) setCompVars('button', resolved.components.button as Record<string, unknown>);
  if (resolved.components.input) setCompVars('input', resolved.components.input as Record<string, unknown>);
  if (resolved.components.card) setCompVars('card', resolved.components.card as Record<string, unknown>);

  // Custom Properties
  for (const [key, value] of Object.entries(resolved.customProperties)) {
    vars.push(`--sk-custom-${camelToKebab(key)}: ${value};`);
  }

  return `:root { ${vars.join(' ')} }`;
}
