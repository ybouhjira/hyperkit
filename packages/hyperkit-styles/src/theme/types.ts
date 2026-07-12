// === CSS Value Types ===
export type CSSLength = `${number}px` | `${number}rem` | `${number}em` | `${number}%` | '0';
export type CSSColor =
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`
  | `hsl(${string})`
  | `hsla(${string})`
  | 'transparent'
  | 'currentColor'
  | 'inherit';
export type CSSDuration = `${number}ms` | `${number}s`;

export interface ThemeColors {
  bgPrimary: CSSColor;
  bgSecondary: CSSColor;
  bgTertiary: CSSColor;
  bgElevated: CSSColor;
  textPrimary: CSSColor;
  textSecondary: CSSColor;
  textMuted: CSSColor;
  accent: CSSColor;
  accentHover: CSSColor;
  accentMuted: CSSColor;
  border: CSSColor;
  borderSubtle: CSSColor;
  success: CSSColor;
  warning: CSSColor;
  error: CSSColor;
  info: CSSColor;
  textOnAccent: CSSColor;
}

export interface ThemeFonts {
  code: string;
  ui: string;
  mono: string;
}

export interface ThemeRadius {
  sm: CSSLength;
  md: CSSLength;
  lg: CSSLength;
  xl: CSSLength;
}

export interface ThemeFontSizes {
  xs: CSSLength; // 10px — tiny labels, indicators
  sm: CSSLength; // 12px — secondary text, badges, meta
  base: CSSLength; // 14px — default body text, inputs, buttons
  lg: CSSLength; // 16px — slightly larger (button lg)
  xl: CSSLength; // 18px — headings (dialog title)
  '2xl': CSSLength; // 24px — large headings
  '3xl': CSSLength; // 30px
  '4xl': CSSLength; // 36px
  '5xl': CSSLength; // 48px
  '6xl': CSSLength; // 60px
}

export interface ThemeShadows {
  sm: string; // Subtle — cards, buttons
  md: string; // Default — dropdowns, popovers
  lg: string; // Elevated — modals, dialogs
  xl: string; // High — floating panels
  '2xl': string; // Dramatic — command palette
  inner: string; // Inset shadow
}

// === NEW: Surface System ===
export interface ThemeSurface {
  background: CSSColor;
  backdropFilter?: string;
  border?: string;
  shadow?: string;
}

export interface ThemeSurfaces {
  base: ThemeSurface;
  raised: ThemeSurface;
  overlay: ThemeSurface;
  sunken: ThemeSurface;
}

// === NEW: Interaction State Styles ===
export interface ThemeStateStyle {
  background?: CSSColor;
  opacity?: number;
  scale?: number;
  borderColor?: CSSColor;
  shadow?: string;
}

export interface ThemeStates {
  hover: ThemeStateStyle;
  pressed: ThemeStateStyle;
  selected: ThemeStateStyle;
  focused: ThemeStateStyle;
  disabled: ThemeStateStyle;
  dragging?: ThemeStateStyle;
}

// === NEW: Motion System ===
export interface ThemeMotionDurations {
  instant: CSSDuration;
  fast: CSSDuration;
  normal: CSSDuration;
  slow: CSSDuration;
  emphasis: CSSDuration;
}

export interface ThemeMotionEasings {
  standard: string;
  decelerate: string;
  accelerate: string;
  spring: string;
}

export interface ThemeSpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface ThemeMotion {
  durations: ThemeMotionDurations;
  easings: ThemeMotionEasings;
  spring?: ThemeSpringConfig;
}

// === NEW: Focus Ring ===
export interface ThemeFocusRing {
  width: CSSLength;
  offset: CSSLength;
  color: CSSColor;
  style: 'solid' | 'dashed' | 'double' | 'glow';
  glowSpread?: CSSLength;
  glowColor?: CSSColor;
}

// === NEW: Scrollbar ===
export interface ThemeScrollbar {
  width: CSSLength;
  thumbColor: CSSColor;
  thumbHoverColor: CSSColor;
  trackColor: CSSColor;
  thumbRadius: CSSLength;
  behavior: 'overlay' | 'always' | 'auto';
}

// === NEW: Extended Typography ===
export interface ThemeFontWeights {
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface ThemeLetterSpacing {
  tight: CSSLength;
  normal: CSSLength;
  wide: CSSLength;
}

export interface ThemeLineHeights {
  tight: string;
  normal: string;
  relaxed: string;
}

export interface ThemeTypography {
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  fontWeights: ThemeFontWeights;
  letterSpacing: ThemeLetterSpacing;
  lineHeights: ThemeLineHeights;
}

// === NEW: Density ===
export interface ThemeDensityItems {
  sm: CSSLength;
  md: CSSLength;
  lg: CSSLength;
}

export interface ThemeDensityCellPadding {
  x: CSSLength;
  y: CSSLength;
}

export interface ThemeDensity {
  mode: 'compact' | 'default' | 'comfortable';
  itemHeight: ThemeDensityItems;
  cellPadding: ThemeDensityCellPadding;
  gap: ThemeDensityItems;
}

// === NEW: Spacing ===
export interface ThemeSpacing {
  '0': CSSLength;
  px: CSSLength;
  '2xs': CSSLength;
  xs: CSSLength;
  sm: CSSLength;
  md: CSSLength;
  lg: CSSLength;
  xl: CSSLength;
  '2xl': CSSLength;
  '3xl': CSSLength;
  '4xl': CSSLength;
}

// === NEW: Z-Index ===
export interface ThemeZIndex {
  base: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

// === NEW: Component Overrides ===
export interface ThemeToolbarOverride {
  height?: CSSLength;
  background?: string;
  borderBottom?: string;
  backdropFilter?: string;
  padding?: string;
  borderRadius?: CSSLength;
}

export interface ThemeListItemOverride {
  height?: CSSLength;
  padding?: string;
  hoverBackground?: string;
  selectedBackground?: string;
  activeBackground?: string;
  separator?: string;
  borderRadius?: CSSLength;
}

export interface ThemeButtonOverride {
  height?: CSSLength;
  padding?: string;
  borderRadius?: CSSLength;
  fontWeight?: string;
}

export interface ThemeInputOverride {
  height?: CSSLength;
  background?: string;
  border?: string;
  focusBorder?: string;
  focusShadow?: string;
  padding?: string;
  borderRadius?: CSSLength;
}

export interface ThemeCardOverride {
  background?: string;
  border?: string;
  shadow?: string;
  padding?: string;
  borderRadius?: CSSLength;
}

export interface ThemeComponents {
  toolbar?: ThemeToolbarOverride;
  listItem?: ThemeListItemOverride;
  button?: ThemeButtonOverride;
  input?: ThemeInputOverride;
  card?: ThemeCardOverride;
}

// === NEW: Sound design ===
/** A single sound preset — synthesized tone or URL-loaded sample. */
export interface ThemeSoundPreset {
  /** Frequency in Hz when synthesized. Ignored for url-based. */
  frequency?: number;
  /** Tone duration in ms. */
  duration?: number;
  /** Per-sound gain multiplier (0..1). Combined with master volume. */
  volume?: number;
  /** Oscillator wave type. */
  wave?: 'sine' | 'square' | 'triangle' | 'sawtooth';
  /** Optional URL to an audio file (overrides synthesis). */
  url?: string;
}

/** Names a theme can wire to events. New keys can be added freely — `useThemeSounds` only plays what's configured. */
export interface ThemeSounds {
  /** Master gain 0..1. */
  volume: number;
  /** Default-on or default-off. User can flip via `useThemeSounds`. */
  enabled: boolean;
  /** Per-event presets. Sound is silent when the key is missing — opt-in. */
  events: {
    hover?: ThemeSoundPreset;
    click?: ThemeSoundPreset;
    select?: ThemeSoundPreset;
    confirm?: ThemeSoundPreset;
    success?: ThemeSoundPreset;
    error?: ThemeSoundPreset;
    notify?: ThemeSoundPreset;
    pop?: ThemeSoundPreset;
    toggleOn?: ThemeSoundPreset;
    toggleOff?: ThemeSoundPreset;
  };
}

// === NEW: Visual effects (decorative polish) ===
/** Decorative effects the theme applies across primitives. */
export interface ThemeEffects {
  /** Hover treatment on interactive elements. */
  hover?: 'off' | 'glow' | 'scale';
  /** Press feedback. */
  press?: 'off' | 'scale' | 'ripple';
  /** Selection emphasis. */
  selection?: 'off' | 'lift' | 'outline' | 'glow';
  /** Active/running pulse strength. */
  pulse?: 'off' | 'soft' | 'heavy';
  /** Backdrop blur on overlays. */
  overlayBlur?: CSSLength;
}

// === UPDATED: ThemeConfig ===
export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
  fontSizes: ThemeFontSizes;
  shadows: ThemeShadows;
  platform?: 'macos' | 'windows' | 'ubuntu' | 'material';
  surfaces?: ThemeSurfaces;
  states?: ThemeStates;
  motion?: ThemeMotion;
  focusRing?: ThemeFocusRing;
  scrollbar?: ThemeScrollbar;
  typography?: ThemeTypography;
  density?: ThemeDensity;
  spacing?: ThemeSpacing;
  zIndex?: ThemeZIndex;
  components?: ThemeComponents;
  /** Theme-level sound design (volume + per-event presets). Opt-in. */
  sounds?: ThemeSounds;
  /** Theme-level visual polish toggles (hover/press/selection/pulse). */
  effects?: ThemeEffects;
  customProperties?: Record<string, string>;
  /** When false, theme's explicit fontSizes are used as-is. When true (default), fontSizes are computed from viewport width. */
  adaptiveFontSizing?: boolean;
}

// === Platform-Specific Theme Configs ===
export interface MaterialThemeConfig extends ThemeConfig {
  platform: 'material';
  components: Required<Pick<ThemeComponents, 'toolbar' | 'listItem' | 'button' | 'input'>>;
}

export interface MacOSThemeConfig extends ThemeConfig {
  platform: 'macos';
}

export interface WindowsThemeConfig extends ThemeConfig {
  platform: 'windows';
}

export interface UbuntuThemeConfig extends ThemeConfig {
  platform: 'ubuntu';
}
