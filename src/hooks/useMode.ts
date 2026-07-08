import { createSignal, createEffect, Accessor } from 'solid-js';

export type Mode = 'developer' | 'focus' | 'tv' | 'distraction-free';

export interface ModeDefinition {
  id: Mode;
  label: string;
  icon: string;
  description: string;
}

export const modeDefinitions: ModeDefinition[] = [
  {
    id: 'developer',
    label: 'Developer',
    icon: '⚙️',
    description: 'Full UI with all features and tooling',
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: '🎯',
    description: 'Minimal UI for distraction-free work',
  },
  {
    id: 'tv',
    label: 'TV Mode',
    icon: '📺',
    description: 'Gamepad-optimized interface for TV displays',
  },
  {
    id: 'distraction-free',
    label: 'Distraction-Free',
    icon: '✨',
    description: 'Hide everything except chat content',
  },
];

export interface UseModeReturn {
  mode: Accessor<Mode>;
  setMode: (mode: Mode) => void;
  getModeDefinition: (mode: Mode) => ModeDefinition;
}

const STORAGE_KEY = 'hyperkit-ui-mode';

/**
 * Hook to manage UI mode state with localStorage persistence.
 * Modes: 'developer' | 'focus' | 'tv' | 'distraction-free'
 */
export function useMode(initialMode: Mode = 'developer'): UseModeReturn {
  // Load from localStorage or use initial mode
  const getStoredMode = (): Mode => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && modeDefinitions.some((m) => m.id === stored)) {
        return stored as Mode;
      }
    } catch {
      // Failed to load mode from localStorage
    }
    return initialMode;
  };

  const [mode, setModeInternal] = createSignal<Mode>(getStoredMode());

  // Persist to localStorage on change
  createEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode());
    } catch {
      // Failed to save mode to localStorage
    }
  });

  const setMode = (newMode: Mode) => {
    setModeInternal(newMode);
  };

  const getModeDefinition = (modeId: Mode): ModeDefinition => {
    const found = modeDefinitions.find((m) => m.id === modeId);
    if (found != null) return found;
    const fallback = modeDefinitions[0];
    if (fallback == null) {
      throw new Error('No mode definitions available');
    }
    return fallback;
  };

  return {
    mode,
    setMode,
    getModeDefinition,
  };
}
