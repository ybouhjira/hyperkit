import type { ShortcutConfig } from './types';

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
}

const KEY_SYMBOLS: Record<string, string> = {
  Enter: '↵',
  Escape: 'Esc',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backspace: '⌫',
  Delete: '⌦',
  Tab: '⇥',
  ' ': 'Space',
};

/** Format a shortcut config for display. Platform-aware: uses symbols on Mac, text on Win/Linux. */
export function formatShortcut(
  config: Pick<ShortcutConfig, 'key' | 'mod' | 'ctrl' | 'meta' | 'shift' | 'alt'>
): string {
  const mac = isMac();
  const parts: string[] = [];

  if (config.mod) parts.push(mac ? '⌘' : 'Ctrl');
  if (config.ctrl) parts.push(mac ? '⌃' : 'Ctrl');
  if (config.meta) parts.push(mac ? '⌘' : 'Win');
  if (config.shift) parts.push(mac ? '⇧' : 'Shift');
  if (config.alt) parts.push(mac ? '⌥' : 'Alt');

  const keyDisplay = KEY_SYMBOLS[config.key] ?? config.key.toUpperCase();
  parts.push(keyDisplay);

  return mac ? parts.join(' ') : parts.join('+');
}
