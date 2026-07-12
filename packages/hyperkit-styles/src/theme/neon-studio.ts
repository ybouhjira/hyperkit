import type { ThemeConfig } from './types';

export const neonStudioTheme: ThemeConfig = {
  id: 'neon-studio',
  name: 'AI Video Studio',

  colors: {
    // Ultra-dark backgrounds with subtle blue/purple tint
    bgPrimary: '#0a0b14',
    bgSecondary: '#12131f',
    bgTertiary: '#1a1b2e',
    bgElevated: '#16172a',
    // Cool white text with lavender tones
    textPrimary: '#e8eaff',
    textSecondary: '#9498c4',
    textMuted: '#5c6094',
    // Electric cyan — the hero accent
    accent: '#00fff0',
    accentHover: '#33fff3',
    accentMuted: 'rgba(0, 255, 240, 0.12)',
    // Very subtle purple-tinted borders
    border: 'rgba(100, 110, 200, 0.15)',
    borderSubtle: 'rgba(100, 110, 200, 0.08)',
    // Vivid neon status colors
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff3366',
    info: '#6c8fff',
    textOnAccent: '#0a0b14',
  },

  fonts: {
    ui: "'Inter', -apple-system, sans-serif",
    code: "'JetBrains Mono', 'Fira Code', monospace",
    mono: "'JetBrains Mono', monospace",
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
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

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 255, 240, 0.05)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 255, 240, 0.08)',
    '2xl': '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 255, 240, 0.1)',
    inner: 'inset 0 1px 4px rgba(0, 0, 0, 0.4)',
  },

  // 4-tier surface system with neon-tinted overlays
  surfaces: {
    base: { background: '#0a0b14' },
    raised: { background: '#12131f', border: '1px solid rgba(100, 110, 200, 0.15)' },
    overlay: {
      background: 'rgba(18, 19, 31, 0.95)',
      border: '1px solid rgba(100, 110, 200, 0.2)',
      shadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 255, 240, 0.1)',
      backdropFilter: 'blur(12px)',
    },
    sunken: { background: '#070810' },
  },

  // Cyan-tinted interaction states
  states: {
    hover: { background: 'rgba(0, 255, 240, 0.06)' },
    pressed: { scale: 0.98, background: 'rgba(0, 255, 240, 0.12)' },
    selected: { background: 'rgba(0, 255, 240, 0.15)', borderColor: '#00fff0' },
    focused: { borderColor: '#00fff0', shadow: '0 0 0 2px rgba(0, 255, 240, 0.2)' },
    disabled: { opacity: 0.4 },
    dragging: { opacity: 0.7, shadow: '0 8px 32px rgba(0, 0, 0, 0.6)' },
  },

  // Energetic motion system
  motion: {
    durations: {
      instant: '50ms',
      fast: '120ms',
      normal: '180ms',
      slow: '250ms',
      emphasis: '400ms',
    },
    easings: {
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Neon glow focus ring
  focusRing: {
    style: 'glow',
    width: '2px',
    offset: '2px',
    color: '#00fff0',
    glowColor: 'rgba(0, 255, 240, 0.4)',
    glowSpread: '4px',
  },

  // Thin themed scrollbar
  scrollbar: {
    width: '6px',
    thumbColor: 'rgba(0, 255, 240, 0.15)',
    thumbHoverColor: 'rgba(0, 255, 240, 0.3)',
    trackColor: 'transparent',
    thumbRadius: '3px',
    behavior: 'overlay',
  },

  // Typography — law 3 (14px body, Inter)
  typography: {
    fonts: {
      ui: "'Inter', -apple-system, sans-serif",
      code: "'JetBrains Mono', 'Fira Code', monospace",
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
      tight: '1.375',
      normal: '1.5',
      relaxed: '1.625',
    },
  },

  // Default density (not compact — studio apps breathe more)
  density: {
    mode: 'default',
    itemHeight: {
      sm: '24px',
      md: '32px',
      lg: '40px',
    },
    cellPadding: {
      x: '8px',
      y: '4px',
    },
    gap: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
  },

  // Spacing scale
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

  // Z-index stack
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

  // Component overrides — neon studio style
  components: {
    toolbar: {
      height: '40px',
      background: '#0a0b14',
      borderBottom: '1px solid rgba(100, 110, 200, 0.15)',
      padding: '0 8px',
    },
    listItem: {
      height: '32px',
      padding: '0 8px',
      hoverBackground: 'rgba(0, 255, 240, 0.06)',
      selectedBackground: 'rgba(0, 255, 240, 0.15)',
      activeBackground: 'rgba(0, 255, 240, 0.15)',
      borderRadius: '4px',
    },
    button: {
      height: '32px',
      padding: '0 12px',
      borderRadius: '6px',
      fontWeight: '500',
    },
    input: {
      height: '32px',
      background: '#12131f',
      border: '1px solid rgba(100, 110, 200, 0.15)',
      focusBorder: '#00fff0',
      focusShadow: '0 0 0 2px rgba(0, 255, 240, 0.2)',
      padding: '0 8px',
      borderRadius: '6px',
    },
    card: {
      background: '#12131f',
      border: '1px solid rgba(100, 110, 200, 0.15)',
      shadow: '0 0 20px rgba(0, 255, 240, 0.08)',
      padding: '12px',
      borderRadius: '8px',
    },
  },

  // Custom properties for neon studio-specific theming
  customProperties: {
    neonCyan: '#00fff0',
    neonMagenta: '#ff00aa',
    neonPurple: '#8b5cf6',
    neonGreen: '#00ff88',
    accentGlow: 'rgba(0, 255, 240, 0.2)',
    magentaGlow: 'rgba(255, 0, 170, 0.15)',
    cardGlow: '0 0 20px rgba(0, 255, 240, 0.08)',
    headerGradient: 'linear-gradient(135deg, rgba(0, 255, 240, 0.05), rgba(255, 0, 170, 0.05))',
  },

  adaptiveFontSizing: false,
};
