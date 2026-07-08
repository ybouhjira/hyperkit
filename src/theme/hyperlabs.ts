/**
 * hyperlabsTheme — premium HyperBuild design-system preset.
 *
 * Bakes the entire premium-ui-design.md spec into one theme so apps
 * using `<ThemeProvider theme={hyperlabsTheme}>` get the correct
 * defaults without overriding any tokens.
 *
 * Spec sources:
 *   • premium-ui-design.md        — typography, density, motion
 *   • premium-dashboard-design.md — color discipline (90% mono + accent)
 *   • premium-diagram-design.md   — 6/8px radius, 1.5px borders
 *   • dark-theme-readability.md   — Slack-recipe surface borders #2c2d30
 *
 * Sounds + effects are enabled by default — apps can opt-out via the
 * `useThemeSounds().setEnabled(false)` user toggle. All synthesis is
 * Web Audio (no asset shipping needed).
 */

import type { ThemeConfig } from './types';

export const hyperlabsTheme: ThemeConfig = {
  id: 'hyperlabs',
  name: 'Hyperlabs',

  // --------------------------------------------------------------------
  // COLORS — Slack-dark recipe + premium-dashboard discipline
  // --------------------------------------------------------------------
  colors: {
    bgPrimary: '#1a1d21', // workspace
    bgSecondary: '#222529', // cards, sidebar, popovers
    bgTertiary: '#2c2d30', // hover surfaces / general hover
    bgElevated: '#27292d', // modals, command palette
    textPrimary: '#d1d2d3',
    textSecondary: '#ababad',
    textMuted: '#8d8d8e',
    accent: '#1264a3', // Slack channel-active blue
    accentHover: '#0b5394',
    accentMuted: 'rgba(18, 100, 163, 0.18)',
    border: '#2c2d30', // VISIBLE — not the rgba(255,255,255,0.07) trap
    borderSubtle: 'rgba(255,255,255,0.06)',
    success: '#2bac76',
    warning: '#ecb22e',
    error: '#e01e5a',
    info: '#36c5f0',
    textOnAccent: '#ffffff',
  },

  // --------------------------------------------------------------------
  // FONTS — Lato for prose warmth, Inter as fallback, JetBrains Mono for code
  // --------------------------------------------------------------------
  fonts: {
    ui: "'Lato', 'Inter Variable', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // --------------------------------------------------------------------
  // RADIUS — small radii (premium-diagram + premium-ui)
  // --------------------------------------------------------------------
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },

  // --------------------------------------------------------------------
  // FONT SIZES — explicit px per spec; no rem ambiguity
  // --------------------------------------------------------------------
  fontSizes: {
    xs: '10px', // tiny labels, indicators
    sm: '12px', // secondary text, badges, meta
    base: '14px', // body text, inputs, buttons — DEFAULT
    lg: '16px', // dialog titles, slightly larger
    xl: '18px', // section headers
    '2xl': '24px', // KPI headlines
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  // Disable adaptive scaling; we want the spec values as-is.
  adaptiveFontSizing: false,

  // --------------------------------------------------------------------
  // SHADOWS — only on floating UI (per premium-ui law #6)
  // --------------------------------------------------------------------
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.30)',
    md: '0 2px 6px rgba(0,0,0,0.36)',
    lg: '0 4px 12px rgba(0,0,0,0.42)',
    xl: '0 8px 24px rgba(0,0,0,0.48)',
    '2xl': '0 16px 48px rgba(0,0,0,0.55)',
    inner: 'inset 0 1px 3px rgba(0,0,0,0.30)',
  },

  // --------------------------------------------------------------------
  // SURFACES — mirror the Slack-dark recipe
  // --------------------------------------------------------------------
  surfaces: {
    base: { background: '#1a1d21' },
    raised: { background: '#222529', border: '1px solid #2c2d30' },
    overlay: {
      background: '#27292d',
      border: '1px solid #2c2d30',
      shadow: '0 16px 48px rgba(0,0,0,0.55)',
      backdropFilter: 'blur(12px)',
    },
    sunken: { background: '#161719' },
  },

  // --------------------------------------------------------------------
  // STATES — premium-ui law #1 + #6 (subtle hover, no shadow at rest)
  // --------------------------------------------------------------------
  states: {
    hover: { background: '#222529' },
    pressed: { background: '#2c2d30', scale: 0.98 },
    selected: { background: 'rgba(18,100,163,0.18)', borderColor: '#1264a3' },
    focused: { borderColor: '#1264a3' },
    disabled: { opacity: 0.5 },
  },

  // --------------------------------------------------------------------
  // MOTION — 150ms standard, 200ms transitions, 300ms emphasis (Material-ish)
  // --------------------------------------------------------------------
  motion: {
    durations: {
      instant: '0ms',
      fast: '150ms', // hover / press / state changes
      normal: '200ms', // transitions / view changes
      slow: '300ms', // emphasis / dialog enter
      emphasis: '450ms', // celebratory
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // playful overshoot
    },
    spring: { stiffness: 240, damping: 22, mass: 1 },
  },

  // --------------------------------------------------------------------
  // FOCUS RING — 2px accent, only on :focus-visible (handled in CSS)
  // --------------------------------------------------------------------
  focusRing: {
    width: '2px',
    offset: '1px',
    color: '#1264a3',
    style: 'solid',
  },

  // --------------------------------------------------------------------
  // SCROLLBAR — overlay-thin, themed
  // --------------------------------------------------------------------
  scrollbar: {
    width: '8px',
    thumbColor: 'rgba(255,255,255,0.16)',
    thumbHoverColor: 'rgba(255,255,255,0.28)',
    trackColor: 'transparent',
    thumbRadius: '8px',
    behavior: 'overlay',
  },

  // --------------------------------------------------------------------
  // TYPOGRAPHY — semibold max, tight letter-spacing on headings
  // --------------------------------------------------------------------
  typography: {
    fonts: {
      ui: "'Lato', 'Inter Variable', 'Inter', system-ui, sans-serif",
      code: "'JetBrains Mono', monospace",
      mono: "'JetBrains Mono', monospace",
    },
    fontSizes: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
    },
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 600, // capped at semibold per premium-ui law #3
      extrabold: 600,
      black: 600,
    },
    letterSpacing: {
      tight: '-0.02em', // semibold headings
      normal: '-0.01em', // body
      wide: '0.06em', // uppercase tracked group headers
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.4',
      relaxed: '1.5',
    },
  },

  // --------------------------------------------------------------------
  // DENSITY — comfortable default; matches activity-bar item heights
  // --------------------------------------------------------------------
  density: {
    mode: 'default',
    itemHeight: { sm: '24px', md: '28px', lg: '32px' },
    cellPadding: { x: '8px', y: '4px' },
    gap: { sm: '4px', md: '8px', lg: '16px' },
  },

  // --------------------------------------------------------------------
  // SPACING — 4 / 8 / 16 / 24 / 32 / 48 (premium-ui law #5)
  // --------------------------------------------------------------------
  spacing: {
    '0': '0',
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
  },

  // --------------------------------------------------------------------
  // Z-INDEX
  // --------------------------------------------------------------------
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    overlay: 1000,
    modal: 1100,
    popover: 1200,
    tooltip: 1300,
    toast: 1400,
  },

  // --------------------------------------------------------------------
  // COMPONENT OVERRIDES
  // --------------------------------------------------------------------
  components: {
    toolbar: {
      height: '32px',
      background: '#222529',
      borderBottom: '1px solid #2c2d30',
      padding: '0 16px',
    },
    listItem: {
      height: '28px',
      padding: '0 8px',
      hoverBackground: '#222529',
      selectedBackground: 'rgba(18,100,163,0.18)',
      activeBackground: 'rgba(18,100,163,0.18)',
      borderRadius: '4px',
    },
    button: {
      height: '28px',
      padding: '0 12px',
      borderRadius: '4px',
      fontWeight: '500',
    },
    input: {
      height: '28px',
      background: '#161719',
      border: '1px solid #2c2d30',
      focusBorder: '1px solid #1264a3',
      focusShadow: '0 0 0 3px rgba(18,100,163,0.18)',
      padding: '0 8px',
      borderRadius: '4px',
    },
    card: {
      background: '#222529',
      border: '1px solid #2c2d30',
      shadow: 'none',
      padding: '16px',
      borderRadius: '6px',
    },
  },

  // --------------------------------------------------------------------
  // SOUND DESIGN — opt-in subtle UI tones, Web-Audio synthesized
  // --------------------------------------------------------------------
  sounds: {
    volume: 0.35,
    enabled: false, // user must opt in via useThemeSounds().setEnabled(true)
    events: {
      hover: { frequency: 1200, duration: 25, volume: 0.1, wave: 'sine' },
      click: { frequency: 640, duration: 60, volume: 0.3, wave: 'triangle' },
      select: { frequency: 880, duration: 80, volume: 0.35, wave: 'triangle' },
      confirm: { frequency: 988, duration: 120, volume: 0.45, wave: 'sine' },
      success: { frequency: 1318, duration: 180, volume: 0.5, wave: 'sine' },
      error: { frequency: 220, duration: 220, volume: 0.55, wave: 'sawtooth' },
      notify: { frequency: 784, duration: 140, volume: 0.4, wave: 'sine' },
      pop: { frequency: 520, duration: 50, volume: 0.35, wave: 'square' },
      toggleOn: { frequency: 900, duration: 80, volume: 0.35, wave: 'triangle' },
      toggleOff: { frequency: 600, duration: 80, volume: 0.35, wave: 'triangle' },
    },
  },

  // --------------------------------------------------------------------
  // VISUAL EFFECTS — premium polish toggles
  // --------------------------------------------------------------------
  effects: {
    hover: 'glow',
    press: 'scale',
    selection: 'lift',
    pulse: 'soft',
    overlayBlur: '12px',
  },
};
