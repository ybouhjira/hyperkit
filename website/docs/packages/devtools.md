---
title: DevTools
sidebar_position: 5
description: CSS inspector and component tree panel for HyperKit apps.
---

# `@ybouhjira/hyperkit-devtools`

An in-app inspector for HyperKit UIs: point at any element and see which component rendered it, which CSS classes and `--sk-*` tokens style it, and where each value comes from. Production-safe — the panel is disabled in production builds.

## Installation

```bash
npm install --save-dev @ybouhjira/hyperkit-devtools
```

## Usage

Mount the DevTools once near your app root; toggle with `Ctrl+Shift+D`:

```tsx
import { DevTools } from '@ybouhjira/hyperkit-devtools';

function App() {
  return (
    <>
      <MainApp />
      <DevTools />
    </>
  );
}
```

## Panels

| Tab    | What it shows                                                       |
| ------ | ------------------------------------------------------------------- |
| Inspect | Hover any element to identify the HyperKit component that owns it  |
| Styles  | Matched rules and computed values for the selected element         |
| Tokens  | Every `--sk-*` token in play, with resolution chains               |
| Tree    | The component tree with search                                     |

## Engine

The identification engine recognizes 69+ BEM class prefixes and traces CSS custom properties to their definition:

- `ComponentIdentifier` — maps DOM elements to HyperKit components
- `CssVariableTracer` — follows `var(--sk-x, var(--sk-y))` fallback chains to the winning declaration
- `StylesheetMatcher` — matches elements against parsed stylesheet rules
- `TokenRegistry` — catalog of all known design tokens

## Hooks

`useKeyboardShortcut` (panel toggle), `useInspectMode`, `useComponentTree`, `useCssVarTrace`, `useElementStyles`.

## Explorer Integration

The sub-export `@ybouhjira/hyperkit-devtools/explorer` provides an embeddable `InspectorPanel` used by the [Explorer](./explorer.md) workbench.
