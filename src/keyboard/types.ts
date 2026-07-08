import type { Accessor } from 'solid-js';

/** Configuration for a keyboard shortcut registration. */
export interface ShortcutConfig {
  /** The key to match (e.g. 'Enter', 'Escape', 'k', 'ArrowDown') */
  key: string;
  /** Platform-aware modifier: Cmd on Mac, Ctrl on Win/Linux */
  mod?: boolean;
  /** Always Ctrl regardless of platform */
  ctrl?: boolean;
  /** Always Meta/Cmd regardless of platform */
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Handler called when the shortcut fires */
  handler: () => void;
  /** Human-readable description (shown in help modal) */
  description: string;
  /** Category for help modal grouping (default: 'General') */
  category?: string;
  /** Scope name (default: 'global') */
  scope?: string;
  /** Skip firing when focus is in INPUT/TEXTAREA/contentEditable. Default: true. Escape always passes through. */
  excludeInputs?: boolean;
}

/** Internal registration with generated ID. */
export interface ShortcutRegistration extends ShortcutConfig {
  id: string;
}

/** Scope entry in the scope stack. */
export interface ScopeEntry {
  name: string;
  exclusive: boolean;
}

/** Options when entering a scope. */
export interface ScopeOptions {
  exclusive?: boolean;
}

/** Context value exposed by KeyboardProvider. */
export interface KeyboardContextValue {
  register: (config: ShortcutConfig) => string;
  unregister: (id: string) => void;
  shortcuts: Accessor<ShortcutRegistration[]>;
  enterScope: (name: string, opts?: ScopeOptions) => () => void;
  activeScopes: Accessor<ScopeEntry[]>;
}

import type { JSX } from 'solid-js';

/** Props for KeyboardScope component. */
export interface KeyboardScopeProps {
  name: string;
  exclusive?: boolean;
  children: JSX.Element;
}

/** Props for ShortcutsHelp component. */
export interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  class?: string;
}
