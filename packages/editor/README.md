# @ybouhjira/hyperkit-editor

WYSIWYG editor for HyperKit component trees. Build layouts visually — drag components from the palette, configure props in the inspector, then export clean TSX code.

## Usage

```tsx
import { HyperkitEditor } from '@ybouhjira/hyperkit-editor';

// Wrap with HyperKit providers in your app root:
import { ThemeProvider, KeyboardProvider } from '@ybouhjira/hyperkit';

export default function App() {
  return (
    <ThemeProvider>
      <KeyboardProvider>
        <HyperkitEditor height="100vh" />
      </KeyboardProvider>
    </ThemeProvider>
  );
}
```

## Features

- **Palette** — 15 HyperKit components in 3 groups (Layout / Input / Display)
- **Canvas** — live rendering using real HyperKit components
- **Drag & Drop** — drag from palette or re-order existing nodes
- **Inspector** — schema-driven prop editor; changes apply live
- **Undo / Redo** — full history (up to 50 steps)
- **Export** — generates importable TSX code
- **Navigable registry** — every action is AI-dispatchable via `dispatchAction('hyperkit-editor', 'drop', { component: 'Button', targetId: 'root' })`

## Keyboard shortcuts

| Shortcut               | Action               |
| ---------------------- | -------------------- |
| `Delete` / `Backspace` | Remove selected node |
| `Cmd/Ctrl + Z`         | Undo                 |
| `Cmd/Ctrl + Shift + Z` | Redo                 |
| `Escape`               | Deselect             |

## Supported components

Box, Flex, Stack, Grid, Center, Spacer, Separator (Layout) · Button, Input, Select, Checkbox (Input) · Text, Badge, Card, EmptyState (Display)

## AI control

The editor registers itself as a navigable at mount time:

```ts
import { dispatchAction } from '@ybouhjira/hyperkit';

// Add a Button to the canvas root
await dispatchAction('hyperkit-editor', 'drop', { component: 'Button', targetId: 'root' });

// Update a prop
await dispatchAction('hyperkit-editor', 'update-prop', {
  nodeId: 'node-1',
  key: 'children',
  value: 'Save',
});

// Undo
await dispatchAction('hyperkit-editor', 'undo');
```

## Peer dependencies

```json
{
  "@ybouhjira/hyperkit": "workspace:*",
  "effect": "^3.0.0",
  "solid-js": "^1.8.0"
}
```
