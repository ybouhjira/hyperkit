# HyperKit Explorer — Implementation Spec

## Package: `@ybouhjira/explorer`

Location: `packages/explorer/`

## What This Is

A Storybook replacement that tests UI components AND non-UI modules (services, algorithms, schemas).
Built with SolidJS + HyperKit UI components. Runs as a Vite dev server.

## File Structure

```
packages/explorer/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html                    ← Dev server entry
├── src/
│   ├── main.tsx                  ← Mount App
│   ├── App.tsx                   ← Shell layout (sidebar + main + bottom)
│   ├── api/                      ← Public API (story definition functions)
│   │   ├── index.ts              ← Re-exports all APIs
│   │   ├── types.ts              ← All TypeScript interfaces
│   │   ├── defineStory.ts        ← UI component story factory
│   │   ├── defineServiceStory.ts ← Effect service story factory
│   │   ├── defineAlgorithmStory.ts ← Algorithm story factory
│   │   ├── controls.ts           ← Control factories (text, number, boolean, select, json)
│   │   └── registry.ts           ← Story registry (register + lookup)
│   ├── components/
│   │   ├── Shell.tsx             ← Top-level layout (resizable panels)
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx       ← Sidebar container
│   │   │   ├── StoryTree.tsx     ← Tree view of stories grouped by category
│   │   │   └── SearchBar.tsx     ← Filter stories by name
│   │   ├── Preview/
│   │   │   ├── Preview.tsx       ← Renders selected story
│   │   │   ├── ComponentPreview.tsx  ← Renders UI component stories
│   │   │   ├── ServicePreview.tsx    ← Renders service stories (action buttons + output)
│   │   │   └── AlgorithmPreview.tsx  ← Renders algorithm stories (input + run + output)
│   │   ├── Controls/
│   │   │   ├── ControlsPanel.tsx  ← Renders controls for current story
│   │   │   ├── TextControl.tsx
│   │   │   ├── NumberControl.tsx
│   │   │   ├── BooleanControl.tsx
│   │   │   ├── SelectControl.tsx
│   │   │   └── JsonControl.tsx    ← Textarea with JSON validation
│   │   ├── Output/
│   │   │   ├── OutputPanel.tsx    ← Tabbed bottom panel
│   │   │   ├── ConsoleTab.tsx     ← Console log capture
│   │   │   ├── ActionsTab.tsx     ← Action/event log
│   │   │   └── SourceTab.tsx      ← Story source code display
│   │   └── shared/
│   │       ├── ResizablePanel.tsx ← Draggable panel divider
│   │       └── EmptyState.tsx     ← "Select a story" placeholder
│   ├── stores/
│   │   ├── explorerStore.ts      ← Global state (createStore)
│   │   └── types.ts              ← Store type definitions
│   └── utils/
│       └── groupByCategory.ts    ← Group stories into tree structure
├── stories/                       ← Built-in example stories
│   ├── Welcome.story.tsx          ← Welcome/landing story
│   └── Button.story.tsx           ← Example: HyperKit Button
└── __tests__/
    ├── registry.test.ts
    ├── controls.test.ts
    ├── StoryTree.test.tsx
    └── ControlsPanel.test.tsx
```

## Core Types (src/api/types.ts)

```typescript
import type { JSX } from 'solid-js';

// ─── Controls ───────────────────────────────────────

export interface TextControlDef {
  readonly type: 'text';
  readonly defaultValue: string;
  readonly label?: string;
}

export interface NumberControlDef {
  readonly type: 'number';
  readonly defaultValue: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly label?: string;
}

export interface BooleanControlDef {
  readonly type: 'boolean';
  readonly defaultValue: boolean;
  readonly label?: string;
}

export interface SelectControlDef {
  readonly type: 'select';
  readonly options: readonly string[];
  readonly defaultValue: string;
  readonly label?: string;
}

export interface JsonControlDef {
  readonly type: 'json';
  readonly defaultValue: unknown;
  readonly label?: string;
}

export type ControlDef =
  | TextControlDef
  | NumberControlDef
  | BooleanControlDef
  | SelectControlDef
  | JsonControlDef;

// ─── Stories ────────────────────────────────────────

export interface ComponentStoryDef {
  readonly kind: 'component';
  readonly title: string;
  readonly category: string;
  readonly component?: (props: Record<string, unknown>) => JSX.Element;
  readonly render?: (props: Record<string, unknown>) => JSX.Element;
  readonly controls: Record<string, ControlDef>;
}

export interface ServiceStoryDef {
  readonly kind: 'service';
  readonly title: string;
  readonly category: string;
  readonly description?: string;
  readonly actions: Record<string, () => Promise<unknown> | unknown>;
  readonly output?: {
    readonly showLogs?: boolean;
    readonly showTiming?: boolean;
  };
}

export interface AlgorithmStoryDef {
  readonly kind: 'algorithm';
  readonly title: string;
  readonly category: string;
  readonly description?: string;
  readonly controls: Record<string, ControlDef>;
  readonly run: (inputs: Record<string, unknown>) => unknown;
  readonly visualize?: 'json' | 'table' | 'dag';
}

export type StoryDef = ComponentStoryDef | ServiceStoryDef | AlgorithmStoryDef;

// ─── Registry ───────────────────────────────────────

export interface StoryEntry {
  readonly id: string; // e.g. "primitives--button--primary"
  readonly title: string;
  readonly category: string; // e.g. "Primitives/Button"
  readonly def: StoryDef;
}

export interface StoryGroup {
  readonly name: string;
  readonly children: ReadonlyArray<StoryGroup | StoryEntry>;
}

// ─── Store ──────────────────────────────────────────

export interface ExplorerState {
  readonly stories: readonly StoryEntry[];
  readonly selectedId: string | null;
  readonly searchQuery: string;
  readonly controlValues: Record<string, unknown>;
  readonly outputLogs: readonly LogEntry[];
  readonly activeOutputTab: 'console' | 'actions' | 'source';
  readonly sidebarWidth: number;
  readonly bottomPanelHeight: number;
}

export interface LogEntry {
  readonly timestamp: number;
  readonly level: 'info' | 'warn' | 'error';
  readonly message: string;
  readonly data?: unknown;
}
```

## Story Definition API (src/api/)

### defineStory.ts

```typescript
export function defineStory(config: {
  title?: string;
  category?: string;
  component?: (props: Record<string, unknown>) => JSX.Element;
  render?: (props: Record<string, unknown>) => JSX.Element;
  controls?: Record<string, ControlDef>;
}): ComponentStoryDef {
  return {
    kind: 'component',
    title: config.title ?? 'Untitled',
    category: config.category ?? 'Components',
    component: config.component,
    render: config.render,
    controls: config.controls ?? {},
  };
}
```

### defineServiceStory.ts

```typescript
export function defineServiceStory(config: {
  name: string;
  category?: string;
  description?: string;
  actions: Record<string, () => Promise<unknown> | unknown>;
  output?: { showLogs?: boolean; showTiming?: boolean };
}): ServiceStoryDef {
  return {
    kind: 'service',
    title: config.name,
    category: config.category ?? 'Services',
    description: config.description,
    actions: config.actions,
    output: config.output,
  };
}
```

### defineAlgorithmStory.ts

```typescript
export function defineAlgorithmStory(config: {
  name: string;
  category?: string;
  description?: string;
  controls?: Record<string, ControlDef>;
  run: (inputs: Record<string, unknown>) => unknown;
  visualize?: 'json' | 'table' | 'dag';
}): AlgorithmStoryDef {
  return {
    kind: 'algorithm',
    title: config.name,
    category: config.category ?? 'Algorithms',
    description: config.description,
    controls: config.controls ?? {},
    run: config.run,
    visualize: config.visualize ?? 'json',
  };
}
```

### controls.ts

```typescript
export const control = {
  text: (defaultValue: string, label?: string): TextControlDef => ({
    type: 'text',
    defaultValue,
    label,
  }),

  number: (
    defaultValue: number,
    opts?: { min?: number; max?: number; step?: number; label?: string }
  ): NumberControlDef => ({ type: 'number', defaultValue, ...opts }),

  boolean: (defaultValue: boolean, label?: string): BooleanControlDef => ({
    type: 'boolean',
    defaultValue,
    label,
  }),

  select: (options: readonly string[], defaultValue: string, label?: string): SelectControlDef => ({
    type: 'select',
    options,
    defaultValue,
    label,
  }),

  json: (defaultValue: unknown, label?: string): JsonControlDef => ({
    type: 'json',
    defaultValue,
    label,
  }),
};
```

### registry.ts

```typescript
// In-memory registry. Stories register themselves via import side-effects.
const stories: Map<string, StoryEntry> = new Map();

export function registerStory(entry: StoryEntry): void {
  stories.set(entry.id, entry);
}

export function getAllStories(): StoryEntry[] {
  return Array.from(stories.values());
}

export function getStory(id: string): StoryEntry | undefined {
  return stories.get(id);
}

export function searchStories(query: string): StoryEntry[] {
  const q = query.toLowerCase();
  return getAllStories().filter(
    (s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );
}
```

## Shell Layout (src/App.tsx)

```
┌──────────────────────────────────────────────────┐
│ TopBar: "HyperKit Explorer"  [theme toggle] [⚙️] │
├────────────┬─────────────────────────────────────┤
│            │                                      │
│  Sidebar   │  Preview Area                        │
│  (250px    │  (renders selected story)             │
│  resizable)│                                      │
│            │                                      │
│  Search    ├──────────────────────────────────────┤
│  ────────  │  Controls Panel                      │
│  📦 Comp.  │  (props/inputs for current story)     │
│   ├ Button │                                      │
│   └ Card   ├──────────────────────────────────────┤
│  ⚡ Svc.   │  Output Panel (tabbed)               │
│   └ Logger │  [Console] [Actions] [Source]         │
│            │                                      │
└────────────┴──────────────────────────────────────┘
```

Use flexbox layout with draggable dividers (ResizablePanel component).

## State Management (src/stores/explorerStore.ts)

Use SolidJS `createStore` with actions:

```typescript
import { createStore } from 'solid-js/store'

const [state, setState] = createStore<ExplorerState>({
  stories: [],
  selectedId: null,
  searchQuery: '',
  controlValues: {},
  outputLogs: [],
  activeOutputTab: 'console',
  sidebarWidth: 250,
  bottomPanelHeight: 200,
})

// Actions
function selectStory(id: string): void { ... }
function setSearchQuery(query: string): void { ... }
function setControlValue(key: string, value: unknown): void { ... }
function addLog(entry: LogEntry): void { ... }
function clearLogs(): void { ... }
function setActiveOutputTab(tab: ExplorerState['activeOutputTab']): void { ... }
function setSidebarWidth(width: number): void { ... }
function setBottomPanelHeight(height: number): void { ... }

// Provide via context
```

## Styling

Use HyperKit theme CSS variables:

- `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`
- `--sk-text-primary`, `--sk-text-secondary`
- `--sk-border`, `--sk-accent`
- `--sk-font-ui`, `--sk-font-mono`

Write all styles as inline JSX styles — no CSS files.

## Story Discovery

For MVP, use **Vite's `import.meta.glob`** to auto-discover story files:

```typescript
// src/discovery.ts
const storyModules = import.meta.glob(
  [
    '../../src/**/*.story.tsx',
    '../../src/**/*.stories.tsx',
    '../../packages/**/*.story.tsx',
    '../../packages/**/*.stories.tsx',
    './stories/**/*.story.tsx',
  ],
  { eager: true }
);

// Each module exports named stories or a default
for (const [path, mod] of Object.entries(storyModules)) {
  // Parse path into category, register stories
}
```

## package.json

```json
{
  "name": "@ybouhjira/explorer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@ybouhjira/hyperkit": "*"
  },
  "peerDependencies": {
    "solid-js": "^1.8.0"
  },
  "devDependencies": {
    "@solidjs/testing-library": "^0.8.10",
    "@testing-library/jest-dom": "^6.9.1",
    "jsdom": "^28.1.0",
    "solid-js": "^1.9.11",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-solid": "^2.11.10",
    "vitest": "^4.0.18"
  }
}
```

## vite.config.ts

```typescript
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 6007, // different from existing Storybook (6006)
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
```

## index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HyperKit Explorer</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body,
      #root {
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## MVP Scope (what to build now)

### Must Have

1. Shell with resizable sidebar + preview + controls + output
2. Story registry + auto-discovery via import.meta.glob
3. ComponentPreview: render component with live controls
4. ServicePreview: action buttons + output log
5. Controls: text, number, boolean, select, json
6. Output: console tab + actions tab
7. Sidebar: tree view + search
8. 2 example stories (Welcome + Button from HyperKit)
9. Theme integration (dark mode via HyperKit ThemeProvider)
10. Tests for registry, controls, and key components

### Not Now

- AlgorithmPreview + visualizations
- Monaco editor for JSON controls (use textarea)
- Source tab (show story source code)
- Viewport size presets
- Visual regression
- Hot module replacement for stories (Vite HMR handles this)

## Test Strategy

- **Registry**: register, lookup, search, group by category
- **Controls**: each control type renders, updates value, calls onChange
- **StoryTree**: renders grouped stories, search filters correctly
- **ControlsPanel**: renders controls for selected story, syncs values
- **Preview**: renders component/service stories correctly

Use vitest + @solidjs/testing-library (same as diagram-solid).

## Key Design Decisions

1. **No iframe** for preview — direct render in the same page (simpler, HyperKit theme works automatically)
2. **Inline styles** — no CSS files
3. **SolidJS stores** — not Effect, since this is a UI-only package
4. **import.meta.glob** — zero config story discovery, Vite handles it
5. **Private package** — not published to npm, development tool only
