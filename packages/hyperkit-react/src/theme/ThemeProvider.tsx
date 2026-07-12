/**
 * React port of the HyperKit ThemeProvider. Behavior contract matches the
 * SolidJS implementation: applies the active theme's --sk-* variables to the
 * document root, persists explicit setTheme() picks to localStorage under the
 * same key, and lets a `theme` prop pin the theme (skipping localStorage).
 * The theme engine itself (presets, injectThemeVars) is the shared
 * framework-agnostic core from @ybouhjira/hyperkit-styles.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  themePresets,
  applyThemeToDOM,
  computeAdaptiveFontSizes,
  type ThemeConfig,
} from '@ybouhjira/hyperkit-styles';

export interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (id: string) => void;
  themes: ThemeConfig[];
  customizeTheme: (overrides: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'hyperkit-theme';
const DEFAULT_THEME = 'zed-dark';

function defaultTheme(): ThemeConfig {
  const fallback = themePresets[DEFAULT_THEME];
  if (fallback == null) {
    throw new Error(`Default theme "${DEFAULT_THEME}" not found in presets`);
  }
  return fallback;
}

function loadSavedTheme(): ThemeConfig {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId != null) {
      const saved = themePresets[savedId];
      if (saved != null) return saved;
    }
  } catch {
    // localStorage unavailable — fall through to default
  }
  return defaultTheme();
}

function saveTheme(themeId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // localStorage unavailable — theme still applies for this session
  }
}

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Pin a specific theme; when provided, localStorage is not consulted. */
  theme?: ThemeConfig;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => props.theme ?? defaultTheme());

  // On mount without a pinned theme, restore the saved pick (client-only).
  useEffect(() => {
    if (props.theme == null) {
      setThemeState(loadSavedTheme());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only restore
  }, []);

  // Follow theme-prop changes.
  useEffect(() => {
    if (props.theme != null) {
      setThemeState(props.theme);
    }
  }, [props.theme]);

  // Paint the active theme onto :root whenever it changes.
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Adaptive font sizing on resize — same rule as the Solid provider:
  // themes opt out with adaptiveFontSizing: false.
  useEffect(() => {
    const handleResize = () => {
      if (theme.adaptiveFontSizing === false) return;
      const root = document.documentElement;
      const sizes = computeAdaptiveFontSizes();
      const keys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
      for (const key of keys) {
        const size = sizes[key];
        if (size != null) root.style.setProperty(`--sk-font-size-${key}`, size);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    const next = themePresets[id];
    if (next != null) {
      setThemeState(next);
      saveTheme(id);
    }
  }, []);

  const customizeTheme = useCallback((overrides: Partial<ThemeConfig>) => {
    setThemeState((prev) => ({
      ...prev,
      ...overrides,
      colors: { ...prev.colors, ...(overrides.colors ?? {}) },
      fonts: { ...prev.fonts, ...(overrides.fonts ?? {}) },
      radius: { ...prev.radius, ...(overrides.radius ?? {}) },
      fontSizes: { ...prev.fontSizes, ...(overrides.fontSizes ?? {}) },
      shadows: { ...prev.shadows, ...(overrides.shadows ?? {}) },
    }));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: Object.values(themePresets), customizeTheme }),
    [theme, setTheme, customizeTheme]
  );

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
