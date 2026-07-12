/**
 * fjordTheme — the HyperKit brand-identity preset.
 *
 * Derived from the "site is an IDE" homepage mockup
 * (designs/website-mockups/mockup-a-ide.html): fjord slate-blue dark
 * surfaces, a single mint accent, monospace-led UI labels, and
 * GitHub-Dark-derived syntax colors repurposed as status colors.
 *
 * Palette contract (locked by fjord.test.ts):
 *   • base        #0a0e13   — page background
 *   • surfaces    #10151c / #141b24 — window body / raised chrome
 *   • hover tint  #1a2330
 *   • sunken      #0c1117   — code panes, terminals
 *   • borders     #232c38   — VISIBLE (~18% lift), strong #313d4d
 *   • accent      #54d6ae   — mint, dark text (#04150e) on top
 *   • status      #7ee787 / #ffa657 / #ff7b72 / #79c0ff (syntax-derived)
 *   • fonts       JetBrains Mono-led for UI, code, and mono
 */

import type { ThemeConfig } from './types';

const FJORD_MONO =
  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, 'SF Mono', 'Menlo', 'Consolas', monospace";

export const fjordTheme: ThemeConfig = {
  id: 'fjord',
  name: 'Fjord',

  // --------------------------------------------------------------------
  // COLORS — fjord slate-blue dark + single mint accent
  // --------------------------------------------------------------------
  colors: {
    bgPrimary: '#0a0e13', // page base
    bgSecondary: '#10151c', // window body, cards, sidebar
    bgTertiary: '#1a2330', // hover / active tint
    bgElevated: '#141b24', // raised chrome: tabbar, popovers, modals
    textPrimary: '#e3eaf2',
    textSecondary: '#9fadbc',
    textMuted: '#68788c',
    accent: '#54d6ae', // mint
    accentHover: '#6ce4c0',
    accentMuted: 'rgba(84, 214, 174, 0.13)',
    border: '#232c38', // VISIBLE ~18% lift — not the rgba-7% trap
    borderSubtle: '#1a212b',
    success: '#7ee787', // syntax component-green
    warning: '#ffa657', // syntax prop-orange
    error: '#ff7b72', // syntax keyword-red
    info: '#79c0ff', // syntax fn-blue
    textOnAccent: '#04150e', // dark ink on mint
  },

  // --------------------------------------------------------------------
  // FONTS — monospace-led UI, per the IDE-chrome identity
  // --------------------------------------------------------------------
  fonts: {
    ui: FJORD_MONO,
    code: FJORD_MONO,
    mono: FJORD_MONO,
  },

  // --------------------------------------------------------------------
  // RADIUS — mockup r-sm 4 / r-md 8 / r-lg 10
  // --------------------------------------------------------------------
  radius: {
    sm: '4px',
    md: '8px',
    lg: '10px',
    xl: '12px',
  },

  // --------------------------------------------------------------------
  // FONT SIZES — IDE density: 13px base (menu items / editor chrome)
  // --------------------------------------------------------------------
  fontSizes: {
    xs: '10px', // status-bar micro labels
    sm: '12px', // tree leaves, tabs, chips
    base: '13px', // menu items, body chrome — DEFAULT
    lg: '15px', // prose
    xl: '18px', // section headers
    '2xl': '24px', // page headings
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  // Keep the IDE-density values literal — no viewport scaling.
  adaptiveFontSizing: false,

  // --------------------------------------------------------------------
  // SHADOWS — deep window shadows + faint mint bloom on the largest
  // --------------------------------------------------------------------
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 2px 6px rgba(0, 0, 0, 0.45)',
    lg: '0 8px 20px -10px rgba(0, 0, 0, 0.6)',
    xl: '0 14px 40px -18px rgba(0, 0, 0, 0.6)',
    '2xl': '0 24px 70px -18px rgba(0, 0, 0, 0.75), 0 0 90px -30px rgba(84, 214, 174, 0.18)',
    inner: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',
  },

  // --------------------------------------------------------------------
  // SURFACES — mirror the mockup's bg ladder
  // --------------------------------------------------------------------
  surfaces: {
    base: { background: '#0a0e13' },
    raised: { background: '#141b24', border: '1px solid #232c38' },
    overlay: {
      background: '#141b24',
      border: '1px solid #313d4d',
      shadow: '0 24px 70px -18px rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
    },
    sunken: { background: '#0c1117' },
  },

  // --------------------------------------------------------------------
  // STATES — hover tint bg3, mint-dim selection with mint line
  // --------------------------------------------------------------------
  states: {
    hover: { background: '#1a2330' },
    pressed: { background: '#1a2330', scale: 0.98 },
    selected: { background: 'rgba(84, 214, 174, 0.13)', borderColor: 'rgba(84, 214, 174, 0.4)' },
    focused: { borderColor: '#54d6ae' },
    disabled: { opacity: 0.5 },
  },

  // --------------------------------------------------------------------
  // MOTION — mockup .15s cubic-bezier(.4,0,.2,1) baseline
  // --------------------------------------------------------------------
  motion: {
    durations: {
      instant: '0ms',
      fast: '150ms', // hover / press / menu items
      normal: '200ms', // panel transitions
      slow: '300ms', // dialog enter
      emphasis: '450ms',
    },
    easings: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    spring: { stiffness: 240, damping: 22, mass: 1 },
  },

  // --------------------------------------------------------------------
  // FOCUS RING — 2px mint on :focus-visible
  // --------------------------------------------------------------------
  focusRing: {
    width: '2px',
    offset: '1px',
    color: '#54d6ae',
    style: 'solid',
  },

  // --------------------------------------------------------------------
  // SCROLLBAR — overlay-thin
  // --------------------------------------------------------------------
  scrollbar: {
    width: '8px',
    thumbColor: 'rgba(255, 255, 255, 0.14)',
    thumbHoverColor: 'rgba(255, 255, 255, 0.26)',
    trackColor: 'transparent',
    thumbRadius: '8px',
    behavior: 'overlay',
  },

  // --------------------------------------------------------------------
  // TYPOGRAPHY — mono-led, semibold max, tight headings
  // --------------------------------------------------------------------
  typography: {
    fonts: {
      ui: FJORD_MONO,
      code: FJORD_MONO,
      mono: FJORD_MONO,
    },
    fontSizes: {
      xs: '10px',
      sm: '12px',
      base: '13px',
      lg: '15px',
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
      bold: 600, // capped at semibold — mono reads heavy already
      extrabold: 600,
      black: 600,
    },
    letterSpacing: {
      tight: '-0.02em', // mono headings (mockup h1/h2)
      normal: '-0.01em',
      wide: '0.08em', // uppercase tracked group headers (.side-h)
    },
    lineHeights: {
      tight: '1.2',
      normal: '1.55', // mockup body line-height
      relaxed: '1.75', // code panes
    },
  },

  // --------------------------------------------------------------------
  // DENSITY — IDE chrome density (menu items, tree rows, status bar)
  // --------------------------------------------------------------------
  density: {
    mode: 'default',
    itemHeight: { sm: '24px', md: '28px', lg: '32px' },
    cellPadding: { x: '8px', y: '4px' },
    gap: { sm: '4px', md: '8px', lg: '16px' },
  },

  // --------------------------------------------------------------------
  // SPACING — 4 / 8 / 16 / 24 / 32 / 48
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
  // COMPONENT OVERRIDES — IDE chrome measurements from the mockup
  // --------------------------------------------------------------------
  components: {
    toolbar: {
      height: '38px', // .ide-title height
      background: '#141b24',
      borderBottom: '1px solid #232c38',
      padding: '0 14px',
    },
    listItem: {
      height: '26px', // tree rows
      padding: '0 8px',
      hoverBackground: '#1a2330',
      selectedBackground: 'rgba(84, 214, 174, 0.13)',
      activeBackground: 'rgba(84, 214, 174, 0.13)',
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
      background: '#0c1117',
      border: '1px solid #232c38',
      focusBorder: '1px solid rgba(84, 214, 174, 0.4)',
      focusShadow: '0 0 0 3px rgba(84, 214, 174, 0.13)',
      padding: '0 8px',
      borderRadius: '4px',
    },
    card: {
      background: '#10151c',
      border: '1px solid #232c38',
      shadow: 'none',
      padding: '16px',
      borderRadius: '8px',
    },
  },

  // --------------------------------------------------------------------
  // CUSTOM PROPERTIES — mockup extras apps can reach via --sk-custom-*
  // --------------------------------------------------------------------
  customProperties: {
    borderStrong: '#313d4d', // .ide window frame, resize handles
    accentLine: 'rgba(84, 214, 174, 0.4)', // active-tab underline, live edges
    bgSunken: '#0c1117', // code panes / terminals
    syntaxKeyword: '#ff7b72',
    syntaxString: '#a5d6ff',
    syntaxFunction: '#79c0ff',
    syntaxComponent: '#7ee787',
    syntaxProperty: '#ffa657',
    syntaxComment: '#7d8590',
    syntaxPunctuation: '#c9d1d9',
  },

  // --------------------------------------------------------------------
  // VISUAL EFFECTS — restrained: mint glow on hover, scale on press
  // --------------------------------------------------------------------
  effects: {
    hover: 'glow',
    press: 'scale',
    selection: 'outline',
    pulse: 'soft',
    overlayBlur: '12px',
  },
};
