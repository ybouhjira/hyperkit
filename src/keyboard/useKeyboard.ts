import { useContext } from 'solid-js';
import { KeyboardContext } from './KeyboardProvider';
import type { KeyboardContextValue } from './types';

export function useKeyboard(): KeyboardContextValue {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
}
