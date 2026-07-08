# Keyboard System

> Global keyboard shortcut management with scopes and help UI

## Components & Hooks

- **KeyboardProvider** — Root provider for keyboard system
- **useKeyboard** — Access keyboard context
- **useShortcut** — Register keyboard shortcuts
- **KeyboardScope** — Scoped keyboard shortcuts
- **ShortcutsHelp** — UI component showing registered shortcuts

## KeyboardProvider

### Props

| Prop       | Type          | Default      | Description |
| ---------- | ------------- | ------------ | ----------- |
| `children` | `JSX.Element` | **required** | App content |

### Example

```tsx
import { KeyboardProvider } from '@ybouhjira/hyperkit';

function App() {
  return (
    <KeyboardProvider>
      <YourApp />
    </KeyboardProvider>
  );
}
```

## useShortcut Hook

Register keyboard shortcuts anywhere in your app.

### Signature

```typescript
useShortcut(
  key: string,
  handler: () => void,
  options?: {
    scope?: string;
    description?: string;
    enabled?: boolean;
  }
)
```

### Examples

```tsx
import { useShortcut } from '@ybouhjira/hyperkit';

function Editor() {
  useShortcut('Cmd+S', () => save(), {
    description: 'Save document',
    enabled: true,
  });

  useShortcut('Cmd+K', () => openCommandPalette(), {
    description: 'Open command palette',
  });

  return <div>...</div>;
}
```

### Scoped Shortcuts

```tsx
import { KeyboardScope } from '@ybouhjira/hyperkit';

<KeyboardScope scope="editor">
  <useShortcut('Cmd+B', () => toggleBold(), {
    scope: 'editor',
    description: 'Toggle bold'
  })/>
</KeyboardScope>
```

## ShortcutsHelp Component

Display a list of registered keyboard shortcuts.

```tsx
import { ShortcutsHelp } from '@ybouhjira/hyperkit';

<Dialog open={showHelp()} onOpenChange={setShowHelp} title="Keyboard Shortcuts">
  <ShortcutsHelp />
</Dialog>;
```

## Keyboard Patterns

### Modifier Keys

- **macOS**: `Cmd`, `Option`, `Ctrl`, `Shift`
- **Windows/Linux**: `Ctrl`, `Alt`, `Shift`
- **Universal**: Use `Cmd` in definitions, library handles platform detection

### Common Patterns

```tsx
// Global shortcuts
useShortcut('/', () => focusSearch());
useShortcut('Escape', () => closeModal());

// Document shortcuts
useShortcut('Cmd+S', () => save());
useShortcut('Cmd+Z', () => undo());
useShortcut('Cmd+Shift+Z', () => redo());

// UI shortcuts
useShortcut('Cmd+K', () => openCommandPalette());
useShortcut('Cmd+P', () => openFilePicker());
useShortcut('Cmd+,', () => openSettings());
```

## Gotchas

- **Provider required**: Must wrap app with `KeyboardProvider` for shortcuts to work
- **Platform detection**: `Cmd` is automatically mapped to `Ctrl` on Windows/Linux
- **Scope isolation**: Scoped shortcuts only work when that scope is active
- **Cleanup automatic**: Shortcuts are automatically unregistered when component unmounts
- **Case insensitive**: Key combinations are case-insensitive

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
