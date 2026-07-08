import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  JSX,
  Accessor,
  Component,
} from 'solid-js';
import { AnimationConfig } from './types';

export interface AnimationContextValue {
  config: Accessor<AnimationConfig>;
  setEnabled: (enabled: boolean) => void;
  setSpeedMultiplier: (multiplier: number) => void;
  setRespectReducedMotion: (respect: boolean) => void;
  isActive: Accessor<boolean>;
}

export const AnimationContext = createContext<AnimationContextValue>();

const STORAGE_KEY = 'sk-animation-config';

const DEFAULT_CONFIG: AnimationConfig = {
  enabled: true,
  speedMultiplier: 1,
  respectReducedMotion: true,
};

function loadSavedConfig(): AnimationConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Failed to load saved animation config - using defaults
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: AnimationConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Failed to save animation config
  }
}

function applyAnimationToDOM(config: AnimationConfig, prefersReducedMotion: boolean) {
  const root = document.documentElement;

  const isActive = config.enabled && !(config.respectReducedMotion && prefersReducedMotion);
  const duration = isActive ? 200 * config.speedMultiplier : 0;
  const animationDuration = isActive ? config.speedMultiplier : 0;

  root.style.setProperty('--sk-transition-duration', `${duration}ms`);
  root.style.setProperty('--sk-transition-timing', 'cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--sk-animation-duration', `${animationDuration}s`);
}

interface AnimationProviderProps {
  children: JSX.Element;
}

export const AnimationProvider: Component<AnimationProviderProps> = (props) => {
  const [config, setConfig] = createSignal<AnimationConfig>(DEFAULT_CONFIG);
  const [prefersReducedMotion, setPrefersReducedMotion] = createSignal(false);

  onMount(() => {
    // Load saved config
    const savedConfig = loadSavedConfig();
    setConfig(savedConfig);

    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);

    // Apply initial config
    applyAnimationToDOM(savedConfig, mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  });

  createEffect(() => {
    const currentConfig = config();
    const reduced = prefersReducedMotion();
    applyAnimationToDOM(currentConfig, reduced);
  });

  const setEnabled = (enabled: boolean) => {
    const newConfig = { ...config(), enabled };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const setSpeedMultiplier = (multiplier: number) => {
    const newConfig = { ...config(), speedMultiplier: multiplier };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const setRespectReducedMotion = (respect: boolean) => {
    const newConfig = { ...config(), respectReducedMotion: respect };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const isActive = (): boolean => {
    const cfg = config();
    return cfg.enabled && !(cfg.respectReducedMotion && prefersReducedMotion());
  };

  const value: AnimationContextValue = {
    config,
    setEnabled,
    setSpeedMultiplier,
    setRespectReducedMotion,
    isActive,
  };

  return <AnimationContext.Provider value={value}>{props.children}</AnimationContext.Provider>;
};

export function useAnimationContext(): AnimationContextValue {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
}
