import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  untrack,
  lazy,
  Show,
  Suspense,
  JSX,
  Accessor,
  Component,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { ThemeConfig } from './types';
import { themePresets } from './presets';
import { applyThemeToDOM, computeAdaptiveFontSizes, renderThemeStyle } from './injectThemeVars';
import type { BugReportStorage } from '../composites/BugReporter/BugReporter';

// ─── DevTools types ───────────────────────────────────────────────────────────

interface DevToolsLogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  annotations?: Record<string, unknown>;
}

/** Configuration for auto-injected DevTools panel */
export interface DevToolsConfig {
  product?: string;
  version?: string;
  bugStorage?: BugReportStorage;
  logEntries?: () => DevToolsLogEntry[];
  onLogClear?: () => void;
  onInspect?: () => void;
  onBugReport?: () => void;
  onThemeToggle?: () => void;
}

/**
 * Full props surface for the DevTools component.
 * Defined locally to avoid circular dependency on the devtools dist types.
 */
interface DevToolsFullProps {
  themeName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  product?: string;
  version?: string;
  bugStorage?: BugReportStorage;
  logEntries?: () => DevToolsLogEntry[];
  onLogClear?: () => void;
  onInspect?: () => void;
  onBugReport?: () => void;
  onThemeToggle?: () => void;
}

// Lazy-loaded DevTools — code-split so it never ships in production bundles.
// Wrapper with explicit props signature avoids relying on stale dist type declarations.
const _LazyDevToolsInner = lazy(() =>
  import('@ybouhjira/hyperkit-devtools').then((m) => ({ default: m.DevTools }))
);
function LazyDevTools(props: DevToolsFullProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <_LazyDevToolsInner {...(props as any)} />;
}

// Re-export for backwards compatibility — consumers import from ThemeProvider
export {
  applyThemeToDOM,
  applyThemeToElement,
  serializeThemeVars,
  renderThemeStyle,
} from './injectThemeVars';

interface ThemeContextValue {
  theme: Accessor<ThemeConfig>;
  setTheme: (id: string) => void;
  themes: ThemeConfig[];
  customizeTheme: (overrides: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextValue>();

const STORAGE_KEY = 'hyperkit-theme';
const DEFAULT_THEME = 'zed-dark';

function loadSavedTheme(): ThemeConfig {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId != null) {
      const savedTheme = themePresets[savedId];
      if (savedTheme != null) {
        return savedTheme;
      }
    }
  } catch {
    // Failed to load saved theme
  }
  const fallback = themePresets[DEFAULT_THEME];
  if (fallback == null) {
    throw new Error(`Default theme "${DEFAULT_THEME}" not found in presets`);
  }
  return fallback;
}

function saveTheme(themeId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // Failed to save theme
  }
}

interface ThemeProviderProps {
  children: JSX.Element;
  theme?: ThemeConfig;
  /** Enable DevTools panel. Pass `true` for defaults or a config object. */
  devtools?: boolean | DevToolsConfig;
}

export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const defaultTheme = themePresets[DEFAULT_THEME];
  if (defaultTheme == null) {
    throw new Error(`Default theme "${DEFAULT_THEME}" not found in presets`);
  }
  const [theme, setThemeSignal] = createSignal<ThemeConfig>(
    untrack(() => props.theme) ?? defaultTheme
  );

  onMount(() => {
    if (props.theme) {
      // When theme prop provided, use it directly (skip localStorage)
      applyThemeToDOM(props.theme);
    } else {
      const savedTheme = loadSavedTheme();
      setThemeSignal(savedTheme);
      applyThemeToDOM(savedTheme);
    }
  });

  // Watch for theme prop changes
  createEffect(() => {
    if (props.theme) {
      setThemeSignal(props.theme);
      applyThemeToDOM(props.theme);
    }
  });

  createEffect(() => {
    const currentTheme = theme();
    applyThemeToDOM(currentTheme);
  });

  // Re-compute font sizes on viewport resize (only for themes using adaptive sizing)
  onMount(() => {
    const handleResize = () => {
      const currentTheme = theme();
      const useAdaptive = currentTheme.adaptiveFontSizing !== false; // default true
      if (!useAdaptive) return; // Theme controls its own font sizes
      const root = document.documentElement;
      const adaptiveSizes = computeAdaptiveFontSizes();
      const sizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
      for (const key of sizeKeys) {
        const size = adaptiveSizes[key];
        if (size != null) {
          root.style.setProperty(`--sk-font-size-${key}`, size);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const setTheme = (id: string) => {
    const newTheme = themePresets[id];
    if (newTheme != null) {
      setThemeSignal(newTheme);
      saveTheme(id);
    }
  };

  const customizeTheme = (overrides: Partial<ThemeConfig>) => {
    setThemeSignal((prev) => ({
      ...prev,
      ...overrides,
      colors: { ...prev.colors, ...(overrides.colors || {}) },
      fonts: { ...prev.fonts, ...(overrides.fonts || {}) },
      radius: { ...prev.radius, ...(overrides.radius || {}) },
      fontSizes: { ...prev.fontSizes, ...(overrides.fontSizes || {}) },
      shadows: { ...prev.shadows, ...(overrides.shadows || {}) },
    }));
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themes: Object.values(themePresets),
    customizeTheme,
  };

  // Server-rendered <style> block — carries the full --sk-* token set so the
  // prerendered HTML is fully styled on first paint, no FOUC. Client-side the
  // onMount/createEffect above re-applies the same tokens via setProperty for
  // runtime theme switching. Skip this block on the client to avoid duplicate
  // style nodes after hydration (the document root carries the live tokens).
  const ssrStyleContent = (): string | null => (isServer ? renderThemeStyle(theme()) : null);

  return (
    <ThemeContext.Provider value={value}>
      <Show when={ssrStyleContent()}>
        {(css) => (
          // eslint-disable-next-line solid/no-innerhtml
          <style data-sk-theme="" innerHTML={css()} />
        )}
      </Show>
      {props.children}
      {/* Auto-injected DevTools — PROD guard is inside DevTools itself (not here,
         because import.meta.env.PROD gets baked to `true` during library build). */}
      <Show when={props.devtools}>
        {(() => {
          const config = typeof props.devtools === 'object' ? props.devtools : {};
          return (
            <Suspense>
              <LazyDevTools
                themeName={theme().id}
                product={config.product}
                version={config.version}
                bugStorage={config.bugStorage}
                logEntries={config.logEntries}
                onLogClear={config.onLogClear}
                onInspect={config.onInspect}
                onBugReport={config.onBugReport}
                onThemeToggle={config.onThemeToggle}
              />
            </Suspense>
          );
        })()}
      </Show>
    </ThemeContext.Provider>
  );
};

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
