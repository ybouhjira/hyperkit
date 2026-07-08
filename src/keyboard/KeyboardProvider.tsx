import { createContext, createSignal, onMount, onCleanup } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { KeyboardRegistry } from './KeyboardRegistry';
import type {
  ShortcutConfig,
  ShortcutRegistration,
  ScopeEntry,
  ScopeOptions,
  KeyboardContextValue,
} from './types';

export const KeyboardContext = createContext<KeyboardContextValue>();

export interface KeyboardProviderProps {
  children: JSX.Element;
}

export const KeyboardProvider: Component<KeyboardProviderProps> = (props) => {
  const registry = new KeyboardRegistry();
  const [shortcuts, setShortcuts] = createSignal<ShortcutRegistration[]>([]);
  const [scopes, setScopes] = createSignal<ScopeEntry[]>([]);

  const register = (config: ShortcutConfig): string => {
    const id = registry.register(config);
    setShortcuts(registry.getAll());
    return id;
  };

  const unregister = (id: string): void => {
    registry.unregister(id);
    setShortcuts(registry.getAll());
  };

  const enterScope = (name: string, opts?: ScopeOptions): (() => void) => {
    const entry: ScopeEntry = { name, exclusive: opts?.exclusive ?? false };
    setScopes((prev) => [...prev, entry]);
    return () => {
      setScopes((prev) => prev.filter((s) => s !== entry));
    };
  };

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      registry.handleEvent(e, scopes());
    };
    window.addEventListener('keydown', handleKeydown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeydown);
      registry.destroy();
    });
  });

  const value: KeyboardContextValue = {
    register,
    unregister,
    shortcuts,
    enterScope,
    activeScopes: scopes,
  };

  return <KeyboardContext.Provider value={value}>{props.children}</KeyboardContext.Provider>;
};
