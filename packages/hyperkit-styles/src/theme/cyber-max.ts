/**
 * cyberMaxTheme — maximum-energy stress-test theme for Hyperbuild.
 *
 * Exercises every theme token at full intensity: neon palette, all 10 sound
 * events at loud volume, heavy pulse + glow effects, fast motion, and a
 * decorative custom-properties block (glow shadows, RGB hues, scanline) for
 * downstream components that want to lean into the cyber aesthetic.
 *
 * Pair theme: `proTheme` (Linear-calibrated, calm). cyber-max is the loud
 * sibling — opt-in via the theme picker, not a default.
 *
 * Design choices documented in the premium-ui design spec (skills/premium-ui-design.md) law #11
 * ("realtime = always animated") and the motion-system rule's game-energy
 * mandate. Synthesized tones (no asset shipping) keep the bundle clean.
 */

import type { ThemeConfig } from './types.js';

export const cyberMaxTheme: ThemeConfig = {
  id: 'cyber-max',
  name: 'Cyber Max',

  // ────────────────────────────────────────────────────────────────────────
  // COLORS — neon-on-black, electric green primary
  // ────────────────────────────────────────────────────────────────────────
  colors: {
    bgPrimary: '#06070d', // deep canvas
    bgSecondary: '#0f1119', // cards / sidebar
    bgTertiary: '#171a26', // hover surfaces
    bgElevated: '#1c2030', // modals / overlays
    textPrimary: '#e6e9f5', // cool white
    textSecondary: '#9ba0c1',
    textMuted: '#6c7194',
    accent: '#00ff88', // electric green — the hero
    accentHover: '#33ff99',
    accentMuted: 'rgba(0, 255, 136, 0.15)',
    border: 'rgba(0, 255, 136, 0.18)', // accent-tinted, visible on dark
    borderSubtle: 'rgba(0, 255, 136, 0.08)',
    success: '#00ff88',
    warning: '#ffd000', // electric yellow
    error: '#ff2e88', // magenta-pink
    info: '#00ffe5', // cyan
    textOnAccent: '#06070d', // deep canvas reads sharp on neon green
  },

  // ────────────────────────────────────────────────────────────────────────
  // FONTS — JetBrains Mono Variable for code, Inter Variable for UI
  // ────────────────────────────────────────────────────────────────────────
  fonts: {
    ui: "'Inter Variable', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', monospace",
    mono: "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', monospace",
  },

  // ────────────────────────────────────────────────────────────────────────
  // RADIUS — small but distinct (still feels like an IDE, not a toy)
  // ────────────────────────────────────────────────────────────────────────
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '18px',
  },

  // ────────────────────────────────────────────────────────────────────────
  // FONT SIZES — premium-ui canonical scale
  // ────────────────────────────────────────────────────────────────────────
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

  // Disable adaptive scaling — values stay literal so the cyber aesthetic
  // doesn't drift on tiny / huge viewports.
  adaptiveFontSizing: false,

  // ────────────────────────────────────────────────────────────────────────
  // SHADOWS — ramp from subtle accent-glow to dramatic
  // ────────────────────────────────────────────────────────────────────────
  shadows: {
    sm: '0 0 0 1px rgba(0, 255, 136, 0.2), 0 1px 4px rgba(0, 255, 136, 0.1)',
    md: '0 0 0 1px rgba(0, 255, 136, 0.25), 0 4px 12px rgba(0, 255, 136, 0.18)',
    lg: '0 0 0 1px rgba(0, 255, 136, 0.3), 0 8px 24px rgba(0, 255, 136, 0.25)',
    xl: '0 0 0 1px rgba(0, 255, 136, 0.35), 0 12px 32px rgba(0, 255, 136, 0.32), 0 0 24px rgba(0, 255, 136, 0.18)',
    '2xl':
      '0 0 0 1px rgba(0, 255, 136, 0.4), 0 16px 48px rgba(0, 255, 136, 0.4), 0 0 48px rgba(0, 255, 136, 0.22)',
    inner: 'inset 0 1px 4px rgba(0, 0, 0, 0.6)',
  },

  // ────────────────────────────────────────────────────────────────────────
  // SURFACES — 4-tier system, overlay carries blur
  // ────────────────────────────────────────────────────────────────────────
  surfaces: {
    base: { background: '#06070d' },
    raised: {
      background: '#0f1119',
      border: '1px solid rgba(0, 255, 136, 0.18)',
    },
    overlay: {
      background: 'rgba(28, 32, 48, 0.92)',
      border: '1px solid rgba(0, 255, 136, 0.35)',
      shadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 255, 136, 0.22)',
      backdropFilter: 'blur(14px)',
    },
    sunken: { background: '#04050a' },
  },

  // ────────────────────────────────────────────────────────────────────────
  // STATES — accent-tinted hover/press/selection
  // ────────────────────────────────────────────────────────────────────────
  states: {
    hover: { background: 'rgba(0, 255, 136, 0.08)' },
    pressed: { scale: 0.97, background: 'rgba(0, 255, 136, 0.16)' },
    selected: {
      background: 'rgba(0, 255, 136, 0.18)',
      borderColor: '#00ff88',
    },
    focused: {
      borderColor: '#00ff88',
      shadow: '0 0 0 2px rgba(0, 255, 136, 0.4)',
    },
    disabled: { opacity: 0.4 },
    dragging: { opacity: 0.7, shadow: '0 8px 32px rgba(0, 255, 136, 0.4)' },
  },

  // ────────────────────────────────────────────────────────────────────────
  // MOTION — fast & energetic (40 / 110 / 180 / 260 / 380ms)
  // ────────────────────────────────────────────────────────────────────────
  motion: {
    durations: {
      instant: '40ms',
      fast: '110ms',
      normal: '180ms',
      slow: '260ms',
      emphasis: '380ms',
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // overshoot
    },
    spring: { stiffness: 320, damping: 18, mass: 1 },
  },

  // ────────────────────────────────────────────────────────────────────────
  // FOCUS RING — glow style, accent-green
  // ────────────────────────────────────────────────────────────────────────
  focusRing: {
    width: '2px',
    offset: '2px',
    color: '#00ff88',
    style: 'glow',
    glowSpread: '6px',
    glowColor: 'rgba(0, 255, 136, 0.5)',
  },

  // ────────────────────────────────────────────────────────────────────────
  // SCROLLBAR — accent-tinted, overlay-thin
  // ────────────────────────────────────────────────────────────────────────
  scrollbar: {
    width: '8px',
    thumbColor: 'rgba(0, 255, 136, 0.25)',
    thumbHoverColor: 'rgba(0, 255, 136, 0.5)',
    trackColor: 'transparent',
    thumbRadius: '4px',
    behavior: 'overlay',
  },

  // ────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY — full weight scale (premium-ui encourages semibold but the
  // cyber aesthetic earns bold/extrabold hero displays)
  // ────────────────────────────────────────────────────────────────────────
  typography: {
    fonts: {
      ui: "'Inter Variable', 'Inter', system-ui, sans-serif",
      code: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
      mono: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
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
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.01em',
      wide: '0.06em',
    },
    lineHeights: {
      tight: '1.2',
      normal: '1.45',
      relaxed: '1.6',
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // DENSITY — default tier; gaming UIs prefer some breathing room
  // ────────────────────────────────────────────────────────────────────────
  density: {
    mode: 'default',
    itemHeight: { sm: '24px', md: '32px', lg: '40px' },
    cellPadding: { x: '8px', y: '4px' },
    gap: { sm: '4px', md: '8px', lg: '16px' },
  },

  // ────────────────────────────────────────────────────────────────────────
  // SPACING — 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96
  // ────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────
  // Z-INDEX
  // ────────────────────────────────────────────────────────────────────────
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPONENT OVERRIDES — neon-tinted variants
  // ────────────────────────────────────────────────────────────────────────
  components: {
    toolbar: {
      height: '40px',
      background: '#06070d',
      borderBottom: '1px solid rgba(0, 255, 136, 0.18)',
      padding: '0 12px',
    },
    listItem: {
      height: '32px',
      padding: '0 12px',
      hoverBackground: 'rgba(0, 255, 136, 0.08)',
      selectedBackground: 'rgba(0, 255, 136, 0.18)',
      activeBackground: 'rgba(0, 255, 136, 0.22)',
      borderRadius: '6px',
    },
    button: {
      height: '32px',
      padding: '0 14px',
      borderRadius: '6px',
      fontWeight: '600',
    },
    input: {
      height: '32px',
      background: '#0f1119',
      border: '1px solid rgba(0, 255, 136, 0.18)',
      focusBorder: '1px solid #00ff88',
      focusShadow: '0 0 0 2px rgba(0, 255, 136, 0.4)',
      padding: '0 10px',
      borderRadius: '6px',
    },
    card: {
      background: '#0f1119',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      shadow: '0 0 24px rgba(0, 255, 136, 0.12)',
      padding: '14px',
      borderRadius: '10px',
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // SOUND DESIGN — all 10 events at full intensity, default-on
  // ────────────────────────────────────────────────────────────────────────
  sounds: {
    volume: 0.5,
    enabled: true,
    events: {
      hover: { frequency: 600, duration: 30, volume: 0.08, wave: 'sine' },
      click: { frequency: 880, duration: 50, volume: 0.15, wave: 'triangle' },
      select: { frequency: 1100, duration: 60, volume: 0.12, wave: 'sine' },
      confirm: {
        frequency: 660,
        duration: 80,
        volume: 0.18,
        wave: 'sawtooth',
      },
      success: {
        frequency: 988,
        duration: 120,
        volume: 0.22,
        wave: 'triangle',
      },
      error: { frequency: 220, duration: 180, volume: 0.18, wave: 'square' },
      notify: { frequency: 783, duration: 100, volume: 0.15, wave: 'sine' },
      pop: { frequency: 1320, duration: 40, volume: 0.1, wave: 'square' },
      toggleOn: { frequency: 1046, duration: 70, volume: 0.13, wave: 'sine' },
      toggleOff: { frequency: 783, duration: 70, volume: 0.13, wave: 'sine' },
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // EFFECTS — heavy / glow / scale (max intensity)
  // ────────────────────────────────────────────────────────────────────────
  effects: {
    hover: 'glow',
    press: 'scale',
    selection: 'glow',
    pulse: 'heavy',
    overlayBlur: '14px',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CUSTOM PROPERTIES — decorative tokens for opt-in components
  // ────────────────────────────────────────────────────────────────────────
  customProperties: {
    glowAccent: '0 0 12px rgba(0, 255, 136, 0.55)',
    glowSubtle: '0 0 8px rgba(0, 255, 136, 0.25)',
    scanlineOpacity: '0.04',
    rgbHueA: '#00ffe5',
    rgbHueB: '#ff2e88',
    rgbHueC: '#ffd000',
  },
};
