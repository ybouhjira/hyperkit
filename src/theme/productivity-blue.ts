import type { ThemeConfig } from './types';

export const productivityBlueTheme: ThemeConfig = {
  id: 'productivity-blue',
  name: 'Productivity Blue',

  colors: {
    // Neutral dark backgrounds — ZERO color tint (the #1 most important change)
    bgPrimary: '#0a0a0a',
    bgSecondary: '#111111',
    bgTertiary: '#1a1a1a',
    bgElevated: '#1e1e1e',
    // Text — pure neutral gray scale
    textPrimary: '#ededed',
    textSecondary: '#a1a1a1',
    textMuted: '#666666',
    // Apple Blue accent
    accent: '#007AFF',
    accentHover: '#0066CC',
    accentMuted: 'rgba(0, 122, 255, 0.12)',
    // Borders — barely visible, defines edges
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    // Semantic
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#007AFF',
    textOnAccent: '#ffffff',
  },

  fonts: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Premium UI v5 law: 14px body, NOT 16px
  fontSizes: {
    xs: '10px',
    sm: '12px',
    base: '14px', // body default — 14px, not 16px
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 2px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.55)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.6)',
    '2xl': '0 16px 64px rgba(0, 0, 0, 0.7)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },

  // Surface system — 4 tiers per premium UI v5 law 2
  surfaces: {
    base: { background: '#0a0a0a' },
    raised: { background: '#111111', border: '1px solid rgba(255,255,255,0.08)' },
    overlay: {
      background: '#1e1e1e',
      border: '1px solid rgba(255,255,255,0.1)',
      shadow: '0 16px 64px rgba(0,0,0,0.7)',
      backdropFilter: 'blur(12px)',
    },
    sunken: { background: '#080808' },
  },

  // Interaction states — law 6
  states: {
    hover: { background: 'rgba(255, 255, 255, 0.04)' },
    pressed: { scale: 0.98, background: 'rgba(255, 255, 255, 0.06)' },
    selected: { background: 'rgba(0, 122, 255, 0.12)', borderColor: '#007AFF' },
    focused: { borderColor: '#007AFF', shadow: '0 0 0 2px rgba(0, 122, 255, 0.3)' },
    disabled: { opacity: 0.4 },
    dragging: { opacity: 0.7, shadow: '0 8px 32px rgba(0, 0, 0, 0.6)' },
  },

  // Motion system — law 6
  motion: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      emphasis: '400ms',
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Focus ring — law 7
  focusRing: {
    width: '2px',
    offset: '2px',
    color: '#007AFF',
    style: 'solid',
  },

  // Scrollbar — law 8
  scrollbar: {
    width: '6px',
    thumbColor: 'rgba(255, 255, 255, 0.08)',
    thumbHoverColor: 'rgba(255, 255, 255, 0.15)',
    trackColor: 'transparent',
    thumbRadius: '3px',
    behavior: 'overlay',
  },

  // Typography — law 3
  typography: {
    fonts: {
      ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
      mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
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
      tight: '-0.02em', // headings
      normal: '-0.01em', // body
      wide: '0.04em', // uppercase section headers
    },
    lineHeights: {
      tight: '1.375', // UI elements
      normal: '1.5', // reading content
      relaxed: '1.625', // spacious
    },
  },

  // Density — law 5 (compact for productivity)
  density: {
    mode: 'compact',
    itemHeight: {
      sm: '24px', // status bar
      md: '32px', // sidebar items, list items
      lg: '40px', // toolbar
    },
    cellPadding: {
      x: '8px',
      y: '4px',
    },
    gap: {
      sm: '4px', // between items in group
      md: '8px', // standard gap
      lg: '16px', // between sections
    },
  },

  // Spacing
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

  // Z-index
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

  // Component overrides
  components: {
    toolbar: {
      height: '40px',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 8px',
    },
    listItem: {
      height: '32px',
      padding: '0 8px',
      hoverBackground: 'rgba(255, 255, 255, 0.04)',
      selectedBackground: 'rgba(0, 122, 255, 0.12)',
      activeBackground: 'rgba(0, 122, 255, 0.12)',
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
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.08)',
      focusBorder: '#007AFF',
      focusShadow: '0 0 0 2px rgba(0, 122, 255, 0.2)',
      padding: '0 8px',
      borderRadius: '6px',
    },
    card: {
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.08)',
      shadow: 'none',
      padding: '12px',
      borderRadius: '8px',
    },
  },

  // Custom properties for PDFly-specific needs
  customProperties: {
    'surface-canvas': '#080808',
    'page-shadow': '0 2px 12px rgba(0, 0, 0, 0.5)',
    'accent-glow': 'rgba(0, 122, 255, 0.15)',
  },

  // Disable adaptive font sizing — use exact sizes above
  adaptiveFontSizing: false,
};
