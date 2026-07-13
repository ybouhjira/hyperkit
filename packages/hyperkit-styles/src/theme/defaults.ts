import type {
  ThemeConfig,
  ThemeSurfaces,
  ThemeStates,
  ThemeMotion,
  ThemeFocusRing,
  ThemeScrollbar,
  ThemeTypography,
  ThemeDensity,
  ThemeComponents,
  ThemeSpacing,
  ThemeZIndex,
} from './types.js';

export function resolveThemeDefaults(
  theme: ThemeConfig
): Required<
  Pick<
    ThemeConfig,
    | 'surfaces'
    | 'states'
    | 'motion'
    | 'focusRing'
    | 'scrollbar'
    | 'typography'
    | 'density'
    | 'spacing'
    | 'zIndex'
    | 'components'
    | 'customProperties'
  >
> {
  const c = theme.colors;
  const _r = theme.radius;

  const surfaces: ThemeSurfaces = theme.surfaces ?? {
    base: { background: c.bgPrimary },
    raised: {
      background: c.bgElevated,
      shadow: theme.shadows.md,
      border: `1px solid ${c.border}`,
    },
    overlay: {
      background: c.bgElevated,
      shadow: theme.shadows.xl,
      border: `1px solid ${c.border}`,
    },
    sunken: { background: c.bgSecondary, border: `1px solid ${c.borderSubtle}` },
  };

  const states: ThemeStates = theme.states ?? {
    hover: { background: c.bgTertiary },
    pressed: { background: c.bgTertiary, opacity: 0.9 },
    selected: { background: c.accentMuted },
    focused: { borderColor: c.accent },
    disabled: { opacity: 0.4 },
  };

  const motion: ThemeMotion = theme.motion ?? {
    durations: {
      instant: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      emphasis: '600ms',
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  };

  const focusRing: ThemeFocusRing = theme.focusRing ?? {
    width: '2px',
    offset: '-1px',
    color: c.accent,
    style: 'solid',
  };

  const scrollbar: ThemeScrollbar = theme.scrollbar ?? {
    width: '6px',
    thumbColor: c.border,
    thumbHoverColor: c.textMuted,
    trackColor: 'transparent',
    thumbRadius: '3px',
    behavior: 'overlay',
  };

  const typography: ThemeTypography = theme.typography ?? {
    fonts: theme.fonts,
    fontSizes: theme.fontSizes,
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    letterSpacing: { tight: '-0.02em', normal: '0', wide: '0.04em' },
    lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
  };

  const density: ThemeDensity = theme.density ?? {
    mode: 'default',
    itemHeight: { sm: '28px', md: '36px', lg: '44px' },
    cellPadding: { x: '12px', y: '8px' },
    gap: { sm: '4px', md: '8px', lg: '16px' },
  };

  const spacing: ThemeSpacing = theme.spacing ?? {
    '0': '0px',
    px: '1px',
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  };

  const zIndex: ThemeZIndex = theme.zIndex ?? {
    base: 0,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
    toast: 700,
  };

  const components: ThemeComponents = theme.components ?? {};

  const customProperties: Record<string, string> = theme.customProperties ?? {};

  return {
    surfaces,
    states,
    motion,
    focusRing,
    scrollbar,
    typography,
    density,
    spacing,
    zIndex,
    components,
    customProperties,
  };
}
