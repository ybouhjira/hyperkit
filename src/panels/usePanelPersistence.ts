import type { PanelLayoutState } from './types';

export function loadFromStorage(storageKey: string): PanelLayoutState | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Failed to load panel layout from storage
  }
  return null;
}

export function saveToStorage(storageKey: string, state: PanelLayoutState): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Failed to save panel layout to storage
  }
}
