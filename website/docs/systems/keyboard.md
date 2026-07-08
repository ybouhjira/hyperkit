---
title: Keyboard System
sidebar_position: 3
description: Shortcut registration, scoping, and a searchable shortcuts help dialog.
---

# Keyboard System

The keyboard system centralizes shortcut handling: one provider, declarative registration hooks with automatic cleanup, scoped shortcut groups, and a built-in help dialog.

## API

| Export                    | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `KeyboardProvider`        | Root context; attaches a `window.keydown` listener                   |
| `KeyboardScope`           | Scoped shortcuts; supports exclusive mode                            |
| `ShortcutsHelp`           | Modal dialog showing all shortcuts (searchable, grouped by category) |
| `useKeyboard`             | Access the full keyboard context (`KeyboardContextValue`)            |
| `useShortcut(config)`     | Register one shortcut; auto-cleans on component unmount              |
| `useShortcuts(configs[])` | Register multiple shortcuts at once                                  |
| `formatShortcut`          | Format a `ShortcutConfig` as a human-readable string                 |

## Registering Shortcuts

```tsx
import { KeyboardProvider, useShortcut } from '@ybouhjira/hyperkit';

function App() {
  return (
    <KeyboardProvider>
      <Editor />
    </KeyboardProvider>
  );
}

function Editor() {
  useShortcut({
    key: 'k',
    mod: true, // Cmd on macOS, Ctrl elsewhere
    handler: () => openCommandPalette(),
    description: 'Open command palette',
    category: 'Navigation',
  });

  useShortcut({
    key: 's',
    mod: true,
    handler: () => save(),
    description: 'Save document',
    category: 'File',
  });

  return <main>{/* ... */}</main>;
}
```

`ShortcutConfig` shape: `{ key, mod?, ctrl?, meta?, shift?, alt?, handler, description, category?, scope? }`.

## Scopes

Wrap a subtree in `KeyboardScope` to activate its shortcuts only while that region is active. Exclusive mode suppresses shortcuts from outer scopes — useful for modal dialogs:

```tsx
import { KeyboardScope } from '@ybouhjira/hyperkit';

<KeyboardScope id="dialog" exclusive>
  <Dialog open>{/* Escape, Enter, etc. handled here only */}</Dialog>
</KeyboardScope>
```

## Shortcuts Help Dialog

`ShortcutsHelp` renders every registered shortcut, grouped by `category`, with search. Pair it with a `?` shortcut:

```tsx
import { ShortcutsHelp, useShortcut } from '@ybouhjira/hyperkit';
import { createSignal, Show } from 'solid-js';

function HelpOverlay() {
  const [open, setOpen] = createSignal(false);
  useShortcut({ key: '?', shift: true, handler: () => setOpen(true), description: 'Show shortcuts' });

  return (
    <Show when={open()}>
      <ShortcutsHelp onClose={() => setOpen(false)} />
    </Show>
  );
}
```

## Displaying Keys

Use the [Kbd](../components/display/Kbd.md) component to render shortcut hints in menus and tooltips, and `formatShortcut` to produce the platform-correct label.
