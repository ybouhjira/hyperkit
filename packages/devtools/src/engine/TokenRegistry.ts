import type { VarSource } from '../context/types';

/** Mapping of CSS variable name to theme config path */
interface TokenMapping {
  group: string;
  key: string;
}

/**
 * 13 groups matching CSS_VAR_GROUPS from auditThemeVars.ts
 */
export const TOKEN_GROUPS: Record<string, readonly string[]> = {
  Colors: [
    '--sk-bg-primary', '--sk-bg-secondary', '--sk-bg-tertiary', '--sk-bg-elevated',
    '--sk-text-primary', '--sk-text-secondary', '--sk-text-muted',
    '--sk-accent', '--sk-accent-hover', '--sk-accent-muted',
    '--sk-border', '--sk-border-subtle',
    '--sk-success', '--sk-warning', '--sk-error', '--sk-info', '--sk-text-on-accent',
  ],
  Fonts: ['--sk-font-code', '--sk-font-ui', '--sk-font-mono'],
  Radius: ['--sk-radius-sm', '--sk-radius-md', '--sk-radius-lg', '--sk-radius-xl'],
  Shadows: [
    '--sk-shadow-sm', '--sk-shadow-md', '--sk-shadow-lg',
    '--sk-shadow-xl', '--sk-shadow-2xl', '--sk-shadow-inner',
  ],
  'Font Sizes': [
    '--sk-font-size-xs', '--sk-font-size-sm', '--sk-font-size-base',
    '--sk-font-size-lg', '--sk-font-size-xl', '--sk-font-size-2xl',
  ],
  Surfaces: [
    '--sk-surface-base-bg', '--sk-surface-raised-bg',
    '--sk-surface-overlay-bg', '--sk-surface-sunken-bg',
  ],
  States: ['--sk-state-hover-bg', '--sk-state-selected-bg'],
  'Motion Durations': [
    '--sk-motion-instant', '--sk-motion-fast', '--sk-motion-normal',
    '--sk-motion-slow', '--sk-motion-emphasis',
  ],
  'Motion Easings': [
    '--sk-ease-standard', '--sk-ease-decelerate',
    '--sk-ease-accelerate', '--sk-ease-spring',
  ],
  Focus: ['--sk-focus-width', '--sk-focus-offset', '--sk-focus-color', '--sk-focus-style'],
  Scrollbar: [
    '--sk-scroll-width', '--sk-scroll-thumb', '--sk-scroll-thumb-hover',
    '--sk-scroll-track', '--sk-scroll-thumb-radius',
  ],
  Typography: [
    '--sk-font-weight-regular', '--sk-font-weight-medium',
    '--sk-font-weight-semibold', '--sk-font-weight-bold',
    '--sk-letter-spacing-tight', '--sk-letter-spacing-normal', '--sk-letter-spacing-wide',
    '--sk-line-height-tight', '--sk-line-height-normal', '--sk-line-height-relaxed',
  ],
  Density: [
    '--sk-density-item-sm', '--sk-density-item-md', '--sk-density-item-lg',
    '--sk-density-pad-x', '--sk-density-pad-y',
    '--sk-density-gap-sm', '--sk-density-gap-md', '--sk-density-gap-lg',
  ],
  Spacing: [
    '--sk-space-0', '--sk-space-px', '--sk-space-xs', '--sk-space-sm',
    '--sk-space-md', '--sk-space-lg', '--sk-space-xl', '--sk-space-2xl',
    '--sk-space-3xl', '--sk-space-4xl',
  ],
};

/** CSS var name → ThemeConfig property path */
const VAR_TO_THEME_KEY: Record<string, string> = {
  '--sk-bg-primary': 'colors.bgPrimary',
  '--sk-bg-secondary': 'colors.bgSecondary',
  '--sk-bg-tertiary': 'colors.bgTertiary',
  '--sk-bg-elevated': 'colors.bgElevated',
  '--sk-text-primary': 'colors.textPrimary',
  '--sk-text-secondary': 'colors.textSecondary',
  '--sk-text-muted': 'colors.textMuted',
  '--sk-accent': 'colors.accent',
  '--sk-accent-hover': 'colors.accentHover',
  '--sk-accent-muted': 'colors.accentMuted',
  '--sk-border': 'colors.border',
  '--sk-border-subtle': 'colors.borderSubtle',
  '--sk-success': 'colors.success',
  '--sk-warning': 'colors.warning',
  '--sk-error': 'colors.error',
  '--sk-info': 'colors.info',
  '--sk-text-on-accent': 'colors.textOnAccent',
  '--sk-font-code': 'fonts.code',
  '--sk-font-ui': 'fonts.ui',
  '--sk-font-mono': 'fonts.mono',
  '--sk-radius-sm': 'radius.sm',
  '--sk-radius-md': 'radius.md',
  '--sk-radius-lg': 'radius.lg',
  '--sk-radius-xl': 'radius.xl',
  '--sk-shadow-sm': 'shadows.sm',
  '--sk-shadow-md': 'shadows.md',
  '--sk-shadow-lg': 'shadows.lg',
  '--sk-shadow-xl': 'shadows.xl',
  '--sk-shadow-2xl': 'shadows.xxl',
  '--sk-shadow-inner': 'shadows.inner',
  '--sk-font-size-xs': 'fontSizes.xs',
  '--sk-font-size-sm': 'fontSizes.sm',
  '--sk-font-size-base': 'fontSizes.base',
  '--sk-font-size-lg': 'fontSizes.lg',
  '--sk-font-size-xl': 'fontSizes.xl',
  '--sk-font-size-2xl': 'fontSizes.xxl',
  '--sk-surface-base-bg': 'surfaces.base',
  '--sk-surface-raised-bg': 'surfaces.raised',
  '--sk-surface-overlay-bg': 'surfaces.overlay',
  '--sk-surface-sunken-bg': 'surfaces.sunken',
  '--sk-state-hover-bg': 'states.hover',
  '--sk-state-selected-bg': 'states.selected',
  '--sk-motion-instant': 'motion.durations.instant',
  '--sk-motion-fast': 'motion.durations.fast',
  '--sk-motion-normal': 'motion.durations.normal',
  '--sk-motion-slow': 'motion.durations.slow',
  '--sk-motion-emphasis': 'motion.durations.emphasis',
  '--sk-ease-standard': 'motion.easings.standard',
  '--sk-ease-decelerate': 'motion.easings.decelerate',
  '--sk-ease-accelerate': 'motion.easings.accelerate',
  '--sk-ease-spring': 'motion.easings.spring',
  '--sk-focus-width': 'focusRing.width',
  '--sk-focus-offset': 'focusRing.offset',
  '--sk-focus-color': 'focusRing.color',
  '--sk-focus-style': 'focusRing.style',
  '--sk-scroll-width': 'scrollbar.width',
  '--sk-scroll-thumb': 'scrollbar.thumb',
  '--sk-scroll-thumb-hover': 'scrollbar.thumbHover',
  '--sk-scroll-track': 'scrollbar.track',
  '--sk-scroll-thumb-radius': 'scrollbar.thumbRadius',
  '--sk-font-weight-regular': 'typography.weights.regular',
  '--sk-font-weight-medium': 'typography.weights.medium',
  '--sk-font-weight-semibold': 'typography.weights.semibold',
  '--sk-font-weight-bold': 'typography.weights.bold',
  '--sk-letter-spacing-tight': 'typography.letterSpacing.tight',
  '--sk-letter-spacing-normal': 'typography.letterSpacing.normal',
  '--sk-letter-spacing-wide': 'typography.letterSpacing.wide',
  '--sk-line-height-tight': 'typography.lineHeights.tight',
  '--sk-line-height-normal': 'typography.lineHeights.normal',
  '--sk-line-height-relaxed': 'typography.lineHeights.relaxed',
  '--sk-density-item-sm': 'density.itemSm',
  '--sk-density-item-md': 'density.itemMd',
  '--sk-density-item-lg': 'density.itemLg',
  '--sk-density-pad-x': 'density.padX',
  '--sk-density-pad-y': 'density.padY',
  '--sk-density-gap-sm': 'density.gapSm',
  '--sk-density-gap-md': 'density.gapMd',
  '--sk-density-gap-lg': 'density.gapLg',
  '--sk-space-0': 'spacing.0',
  '--sk-space-px': 'spacing.px',
  '--sk-space-xs': 'spacing.xs',
  '--sk-space-sm': 'spacing.sm',
  '--sk-space-md': 'spacing.md',
  '--sk-space-lg': 'spacing.lg',
  '--sk-space-xl': 'spacing.xl',
  '--sk-space-2xl': 'spacing.xxl',
  '--sk-space-3xl': 'spacing.xxxl',
  '--sk-space-4xl': 'spacing.xxxxl',
};

/** Build the internal lookup map (group + key for each var) */
const tokenMap = new Map<string, TokenMapping>();
for (const [group, vars] of Object.entries(TOKEN_GROUPS)) {
  for (const varName of vars) {
    tokenMap.set(varName, { group, key: VAR_TO_THEME_KEY[varName] ?? varName });
  }
}

/**
 * Check if a CSS variable name is a known SolidKit theme token.
 */
export function isThemeToken(varName: string): boolean {
  return tokenMap.has(varName);
}

/**
 * Get the group and theme key for a known token.
 */
export function getTokenMapping(varName: string): TokenMapping | null {
  return tokenMap.get(varName) ?? null;
}

/**
 * Determine the VarSource for a CSS variable name.
 */
export function resolveVarSource(varName: string, themeName: string): VarSource {
  const mapping = tokenMap.get(varName);
  if (mapping) {
    return { type: 'theme', group: mapping.group, key: mapping.key, themeName };
  }
  // Component-scoped override (e.g., --sk-btn-primary-bg)
  if (varName.startsWith('--sk-')) {
    return { type: 'component-override', variable: varName };
  }
  // Generic custom property
  return { type: 'custom-property', key: varName };
}

/**
 * Get all token groups with their variables.
 */
export function getAllTokenGroups(): Record<string, readonly string[]> {
  return TOKEN_GROUPS;
}

/**
 * Get the ThemeConfig property path for a variable, or null.
 */
export function getThemeKey(varName: string): string | null {
  return VAR_TO_THEME_KEY[varName] ?? null;
}

/**
 * Get all known token variable names.
 */
export function getAllTokenNames(): string[] {
  return Array.from(tokenMap.keys());
}
