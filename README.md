# HyperKit

[![npm version](https://img.shields.io/npm/v/@ybouhjira/hyperkit)](https://www.npmjs.com/package/@ybouhjira/hyperkit)
[![CI](https://img.shields.io/github/actions/workflow/status/ybouhjira/hyperkit/ci.yml?branch=main&label=CI)](https://github.com/ybouhjira/hyperkit/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@ybouhjira/hyperkit)](https://bundlephobia.com/package/@ybouhjira/hyperkit)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**An application platform with a framework-agnostic core — 130+ components for SolidJS today, React next. IDE-grade panels, a navigation/action registry, a diagram engine, theming, Effect services, and AI-native tooling.**

**[▶ Live docs & demo apps](https://ybouhjira.github.io/hyperkit/)** · **[Component explorer](https://hyperkit-explorer.vercel.app)** — every component runs live, editable in the browser.

HyperKit is not another button library. It is a full application layer: accessible primitives (built on [@kobalte/core](https://kobalte.dev)), feature-rich composites (chat, kanban, file explorer, command palette), resizable IDE panels, a keyboard system, 40 theme presets driven entirely by CSS custom properties, typed [Effect](https://effect.website) services, and an MCP server so AI assistants can look up its API like a teammate would.

The long-term goal is **one component API, many renderers** — the SolidJS renderer ships today, a React adapter is the next milestone, and the core (diagram engine, design tokens, theme system, behavior tests) is already framework-agnostic. Alongside the UI, a full-stack platform layer (services, realtime, persistence, desktop) is taking shape. See the [Roadmap](ROADMAP.md).

## Why HyperKit

- **One API, many renderers** — the component contract, `--sk-*` tokens, themes, and behavior tests are renderer-independent; SolidJS is the first renderer, React ([roadmap](ROADMAP.md)) is next. `diagram-core` is already fully framework-agnostic.
- **AI-native by design** — Ships an [MCP server](#ai-integration) for component-doc lookup, `llms.txt`/`llms-full.txt` for machine consumption, and a navigation registry that can expose your UI's actions as MCP tools (`generateMCPTools`) so agents can drive the interface.
- **IDE-grade systems, not just widgets** — Resizable panel layouts, a navigable action registry with middleware (permissions, undo/redo, rate limiting), transport adapters (WebSocket, MessagePort, Tauri), and recording/replay.
- **Token-first theming** — Every visual value flows through `--sk-*` CSS custom properties. 40 built-in presets (editor, OS, and product-inspired). A custom ESLint plugin enforces the token discipline in this repo's own CI.
- **Feature-scaled components** — Fewer, larger components that grow with props instead of fragmenting into micro-packages: `FileExplorer` scales from a file list to a two-pane browser with preview, sort, filter, and picker/save modes.
- **Effect-TS services** — WebSocket, Session, FileSystem, Clipboard, and Logging services with typed errors — no `try/catch` soup.
- **Tested** — 5,000+ unit tests across the monorepo, plus visual regression, publint/attw packaging checks, bundle-size budgets, and dead-export detection (knip) in one quality gate.

## Install

```bash
npm install @ybouhjira/hyperkit
```

`solid-js` and `effect` are peer dependencies (npm ≥7 and pnpm install them automatically) — they must be single-instance in your app because HyperKit shares Solid's reactivity graph and Effect's service tags with your code.

```tsx
import '@ybouhjira/hyperkit/dist/index.css';
```

## Quick Start

```tsx
import { Button, ThemeProvider, themePresets } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css';

function App() {
  return (
    <ThemeProvider theme={themePresets['zed-dark']}>
      <Button variant="primary" size="md">
        Get Started
      </Button>
    </ThemeProvider>
  );
}
```

SSR (SolidStart) works out of the box — see the [SSR Guide](docs/SSR.md) and the [SolidStart example](examples/solid-start/).

## What's Inside

### Components (130+)

| Category                 | Highlights                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Layout**               | Box, Flex, Stack, Grid, ScrollArea, MasonryGrid, DocumentPage                                                  |
| **Input**                | Button, Input, Select, Slider, RangeSlider, TagInput, DateInput, ColorInput, FileInput, AudioInput, VideoInput |
| **Display**              | Text, Badge, Card, MetricCard, CodeBlock, Markdown, Timeline, Sparkline, TerminalOutput, StreamingText         |
| **Feedback**             | Spinner, ProgressBar, ProgressRing, Skeleton, ErrorBanner, EmptyState                                          |
| **Overlay & Navigation** | Dialog, Popover, Dropdown, Tabs, Accordion, Tooltip, Table                                                     |
| **Chat & AI**            | ChatWindow, LLMChatBox, MessageList, ToolApproval, SubagentTracker, CostTracker, ModelSelector                 |
| **Data & Apps**          | FileExplorer, FilePicker, KanbanBoard, IssueBoard, DashboardContainer, ActionForm                              |
| **Utilities**            | CommandPalette, ContextMenu, Toast, SettingsPanel, ThemeBuilder, GuidedTour                                    |

Full catalog with props and examples: [`llms.txt`](llms.txt) (index) / [`llms-full.txt`](llms-full.txt) (complete API).

### Systems

| System                   | What it provides                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Panel system**         | IDE-style resizable/dockable panel layouts with drag-and-drop rearranging                                                                                                |
| **Navigation framework** | Navigable registry + action dispatch, 5 middleware (permissions, undo/redo, logging, analytics, rate limiting), transports, persistence, recording/replay, health checks |
| **Theme system**         | ThemeProvider, 40 presets, theme sounds (Web-Audio), visual effect toggles                                                                                               |
| **Keyboard system**      | Scoped shortcuts, conflict handling, searchable ShortcutsHelp dialog                                                                                                     |
| **Animation**            | Transition presets, scroll reveal, `prefers-reduced-motion` respected                                                                                                    |
| **Effect services**      | Logging (transports/redaction/sampling), WebSocket, Session, FileSystem, Clipboard                                                                                       |

### Packages

| Package                                                                                                       | Description                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`diagram-core`](packages/diagram-core)                                                                       | Framework-agnostic graph engine — branded IDs, dagre/ELK/force layouts, A\* edge routing, serialization |
| [`diagram-svg`](packages/diagram-svg)                                                                         | Vanilla SVG renderer — pan/zoom, themes, grid, markers                                                  |
| [`diagram-solid`](packages/diagram-solid)                                                                     | SolidJS diagram bindings — 7 components, 13 hooks                                                       |
| [`devtools`](packages/devtools)                                                                               | In-app CSS inspector — component tree, token tracing, theme audit                                       |
| [`explorer`](packages/explorer)                                                                               | A self-built Storybook alternative (this repo dogfoods it)                                              |
| [`views`](packages/views)                                                                                     | Schema-driven view generation from Effect Schema                                                        |
| [`editor`](packages/editor)                                                                                   | WYSIWYG component-tree editor                                                                           |
| [`mcp`](packages/mcp)                                                                                         | Effect-TS MCP server framework                                                                          |
| [`ai-renderer`](packages/ai-renderer)                                                                         | Intent → validated UI schema via LLM                                                                    |
| [`llm-pipeline`](packages/llm-pipeline)                                                                       | Multi-LLM orchestration with typed steps and cost tracing                                               |
| [`eslint-plugin-hyperkit`](packages/eslint-plugin-hyperkit)                                                   | 6 rules enforcing the design-token system                                                               |
| [`gantt`](packages/gantt) / [`timeline`](packages/timeline) / [`sequence-diagram`](packages/sequence-diagram) | Token-styled visualization components                                                                   |

## Theme System

40 presets, all driven by `--sk-*` CSS custom properties:

```tsx
import { ThemeProvider, themePresets } from '@ybouhjira/hyperkit';

// Editor-inspired: 'zed-dark', 'cursor-dark', 'sublime', 'github-dark', 'linear', 'warp', …
// OS-native: 'macos-dark', 'windows-light', 'ubuntu-dark', 'material-dark', …
<ThemeProvider theme={themePresets['zed-dark']}>
  <App />
</ThemeProvider>

// Or define your own ThemeConfig
<ThemeProvider theme={{
  colors: { bg: '#1a1a2e', fg: '#eaeaea', accent: '#e94560' /* … */ },
  fonts: { body: 'Inter', mono: 'JetBrains Mono' },
  radius: { sm: '4px', md: '8px', lg: '12px' },
}}>
  <App />
</ThemeProvider>
```

Themes can also define **sound presets** (Web-Audio synthesized, no assets shipped) and **effect toggles** (hover glow, press ripple, selection lift) — both opt-in.

## AI Integration

HyperKit treats AI assistants as first-class consumers of its documentation:

- **MCP server** — `mcp-server.js` (configured via `.mcp.json`, stdio transport) exposes `search_components` and `get_component` tools. Claude Code, Cursor, and other MCP-compatible editors pick it up automatically.
- **`llms.txt` / `llms-full.txt`** — component API index and full reference in the emerging llms.txt convention.
- **UI-as-tools** — `generateMCPTools` turns any registered navigable component into MCP tool definitions, and `routeMCPToolCall` dispatches incoming calls back into the UI. Your app's interface becomes drivable by an agent.
- **`ai-renderer`** — feed it data + intent, get back schema-validated HyperKit UI.

## Effect Services

```ts
import { makeLoggingLayer, ConsoleTransport, HttpTransport } from '@ybouhjira/hyperkit';

const LoggingLayer = makeLoggingLayer({
  maxHistory: 500,
  context: { app: 'my-app', env: 'production' },
  redact: ['token', 'password'], // masked as [REDACTED]
  sampling: { rate: 0.1 }, // 10% sent to external transports
  transports: [
    ConsoleTransport({ format: 'pretty' }),
    HttpTransport({ url: 'https://logs.example.com/ingest' }),
  ],
});
```

All services export typed errors (`WebSocketConnectionError`, `SessionNotFoundError`, `ClipboardError`, …) — failures are values, not surprises.

## CLI

```bash
npx hyperkit init            # scaffold a theme.ts
npx hyperkit theme generate  # type-safe declarations for custom theme properties
npx hyperkit tokens          # list all design token types and values
```

See [cli/README.md](cli/README.md).

## Development

```bash
pnpm install
pnpm build            # TypeScript + Vite build
pnpm test             # Vitest unit tests (5,000+)
cd packages/explorer && pnpm dev   # component explorer on port 6007
```

### Quality gate

Every change must pass:

```bash
npm run quality
# format:check → lint → lint:css → audit:css-vars → test → build → publint → attw → size → knip
```

Bundle budgets are enforced: `dist/index.js` ≤ 340 kB, `dist/index.css` ≤ 36 kB.

## Documentation

- [Docs site](https://ybouhjira.github.io/hyperkit/) — getting started, guides, all 131 component pages
- [Live Explorer](https://hyperkit-explorer.vercel.app) — every component, interactive
- [Roadmap](ROADMAP.md) — multi-renderer vision and the full-stack platform plan
- [Design principles](PRINCIPLES.md) — the feature-scale philosophy
- [Patterns](PATTERNS.md) / [Cookbook](COOKBOOK.md)
- [CSS variables reference](docs/CSS_VARIABLES.md)
- [Migration guide](docs/MIGRATION.md)

## License

[MIT](LICENSE)
