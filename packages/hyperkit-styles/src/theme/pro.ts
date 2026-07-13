/**
 * proTheme — calibrated shipping-default theme for Hyperbuild.
 *
 * The calmer sibling to cyberMaxTheme: Linear/Vercel productivity-tool
 * design language — restrained palette, near-monochrome canvas, accent
 * reserved for active states only, sounds wired but disabled by default,
 * pulse soft, no neon glow halos, motion durations dialed to 150-300ms.
 *
 * This is what ships to colleagues / paying customers / public sale.
 * cyberMaxTheme is opt-in for users who want the full ADHD-friendly
 * stimulation; proTheme is the default that doesn't startle anyone.
 *
 * Design references:
 *   the premium-ui design spec (skills/premium-ui-design.md)
 *   Linear's 2025 redesign — "significantly cut back on color, swapping
 *   monochrome blue for monochrome black/white with even fewer bold colors"
 */

import type { ThemeConfig } from './types.js';

export const proTheme: ThemeConfig = {
  id: 'pro',
  name: 'Pro',

  // ────────────────────────────────────────────────────────────────────────
  // COLORS — Linear-tier cool gray + a single restrained blue accent
  // ────────────────────────────────────────────────────────────────────────
  colors: {
    bgPrimary: '#0d0e10',
    bgSecondary: '#16181c',
    bgTertiary: '#1c1f24',
    bgElevated: '#22252b',
    textPrimary: '#e6e8ee',
    textSecondary: '#a4a8b3',
    textMuted: '#6b7180',
    accent: '#5b8def',
    accentHover: '#4a7ddb',
    accentMuted: 'rgba(91, 141, 239, 0.14)',
    border: 'rgba(255, 255, 255, 0.07)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    success: '#3aa569',
    warning: '#d4a548',
    error: '#d65a5a',
    info: '#5b8def',
    textOnAccent: '#ffffff',
  },

  // ────────────────────────────────────────────────────────────────────────
  // FONTS — same code/UI pairing as cyber-max for consistency on swap
  // ────────────────────────────────────────────────────────────────────────
  fonts: {
    ui: "'Inter Variable', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', monospace",
    mono: "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', monospace",
  },

  // ────────────────────────────────────────────────────────────────────────
  // RADIUS — disciplined small (premium-ui rule)
  // ────────────────────────────────────────────────────────────────────────
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
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

  // ────────────────────────────────────────────────────────────────────────
  // SHADOWS — neutral black, low opacity, NO accent halos
  // ────────────────────────────────────────────────────────────────────────
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.18)',
    md: '0 2px 8px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.36), 0 4px 8px rgba(0, 0, 0, 0.22)',
    '2xl': '0 24px 56px rgba(0, 0, 0, 0.45), 0 8px 16px rgba(0, 0, 0, 0.28)',
    inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
  },

  surfaces: {
    base: { background: '#0d0e10' },
    raised: {
      background: '#16181c',
      border: '1px solid rgba(255, 255, 255, 0.07)',
    },
    overlay: {
      background: 'rgba(34, 37, 43, 0.94)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
    },
    sunken: { background: '#0a0b0d' },
  },

  states: {
    hover: { background: 'rgba(255, 255, 255, 0.04)' },
    pressed: { scale: 0.98, background: 'rgba(255, 255, 255, 0.06)' },
    selected: {
      background: 'rgba(91, 141, 239, 0.14)',
      borderColor: '#5b8def',
    },
    focused: {
      borderColor: '#5b8def',
      shadow: '0 0 0 2px rgba(91, 141, 239, 0.4)',
    },
    disabled: { opacity: 0.4 },
    dragging: { opacity: 0.7 },
  },

  // ────────────────────────────────────────────────────────────────────────
  // MOTION — 150 / 200 / 300ms (calm productivity-tool feel)
  // ────────────────────────────────────────────────────────────────────────
  motion: {
    durations: {
      instant: '60ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      emphasis: '450ms',
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.4, 0, 0.2, 1)', // no overshoot — productivity calm
    },
    spring: { stiffness: 180, damping: 22, mass: 1 },
  },

  // ────────────────────────────────────────────────────────────────────────
  // FOCUS RING — solid, accessible, not flashy
  // ────────────────────────────────────────────────────────────────────────
  focusRing: {
    width: '2px',
    offset: '2px',
    color: '#5b8def',
    style: 'solid',
  },

  scrollbar: {
    width: '8px',
    thumbColor: 'rgba(255, 255, 255, 0.18)',
    thumbHoverColor: 'rgba(255, 255, 255, 0.32)',
    trackColor: 'transparent',
    thumbRadius: '4px',
    behavior: 'overlay',
  },

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
      wide: '0.04em',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.45',
      relaxed: '1.6',
    },
  },

  density: {
    mode: 'default',
    itemHeight: { sm: '24px', md: '32px', lg: '40px' },
    cellPadding: { x: '8px', y: '4px' },
    gap: { sm: '4px', md: '8px', lg: '16px' },
  },

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
  // COMPONENT OVERRIDES — calm, productivity-tool-like
  // ────────────────────────────────────────────────────────────────────────
  components: {
    toolbar: {
      height: '40px',
      background: '#0d0e10',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      padding: '0 12px',
    },
    listItem: {
      height: '32px',
      padding: '0 12px',
      hoverBackground: 'rgba(255, 255, 255, 0.04)',
      selectedBackground: 'rgba(91, 141, 239, 0.14)',
      activeBackground: 'rgba(91, 141, 239, 0.18)',
      borderRadius: '4px',
    },
    button: {
      height: '32px',
      padding: '0 14px',
      borderRadius: '6px',
      fontWeight: '500',
    },
    input: {
      height: '32px',
      background: '#16181c',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      focusBorder: '1px solid #5b8def',
      focusShadow: '0 0 0 2px rgba(91, 141, 239, 0.32)',
      padding: '0 10px',
      borderRadius: '6px',
    },
    card: {
      background: '#16181c',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      shadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
      padding: '14px',
      borderRadius: '8px',
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // SOUNDS — wired with conservative presets, default-disabled
  //
  // Same event surface as cyberMax so users can switch themes without
  // losing per-event audio mappings; volumes dialed for productivity ears.
  // ────────────────────────────────────────────────────────────────────────
  sounds: {
    volume: 0.3,
    enabled: false,
    events: {
      hover: { frequency: 540, duration: 20, volume: 0.04, wave: 'sine' },
      click: { frequency: 720, duration: 35, volume: 0.08, wave: 'sine' },
      select: { frequency: 880, duration: 40, volume: 0.07, wave: 'sine' },
      confirm: { frequency: 660, duration: 60, volume: 0.1, wave: 'triangle' },
      success: { frequency: 880, duration: 90, volume: 0.12, wave: 'triangle' },
      error: { frequency: 280, duration: 140, volume: 0.12, wave: 'triangle' },
      notify: { frequency: 698, duration: 80, volume: 0.1, wave: 'sine' },
      pop: { frequency: 1020, duration: 30, volume: 0.06, wave: 'sine' },
      toggleOn: { frequency: 880, duration: 50, volume: 0.08, wave: 'sine' },
      toggleOff: { frequency: 660, duration: 50, volume: 0.08, wave: 'sine' },
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // EFFECTS — restrained: subtle hover glow, soft pulse, outline selection
  // ────────────────────────────────────────────────────────────────────────
  effects: {
    hover: 'glow',
    press: 'scale',
    selection: 'outline',
    pulse: 'soft',
    overlayBlur: '8px',
  },

  customProperties: {
    glowAccent: '0 0 0 2px rgba(91, 141, 239, 0.32)',
  },
};
