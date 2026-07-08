# HyperKit — Agent Instructions

> Universal instructions for AI coding assistants. This file follows the AGENTS.md standard.

## Overview

HyperKit is a comprehensive SolidJS component library with 133+ components, built on Effect for type-safe services and @kobalte/core for accessible primitives. It uses a token-based theming system via `--sk-*` CSS custom properties.

- **Package**: `@ybouhjira/hyperkit`
- **Version**: `2.5.0`
- **Peer deps**: `solid-js ^1.8.0`, `@kobalte/core ^0.13.0`, `effect ^3.0.0`
- **Bundle limits**: JS ≤ 250 kB, CSS ≤ 30 kB

---

## Component Categories

### Primitives — Basic UI Building Blocks

#### Layout

| Component     | Description                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Box`         | Generic container with spacing tokens (`p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`). Supports `as` prop for polymorphic rendering. |
| `Flex`        | Flexbox layout with `direction`, `align`, `justify`, `gap`, `wrap` props using tokens.                                         |
| `Stack`       | Shorthand flex stack (`direction: 'vertical' \| 'horizontal'`) with spacing.                                                   |
| `Grid`        | CSS grid with `columns`, `rows`, `gap` (SpaceToken) props.                                                                     |
| `Container`   | Max-width container with `maxW`, `px`, `py`, `center` props.                                                                   |
| `Center`      | Centers children both axes.                                                                                                    |
| `Section`     | Full-width page section with `bg`, `py`, `maxWidth`, `fullBleed`.                                                              |
| `Spacer`      | Flexible spacer for flex/grid layouts.                                                                                         |
| `Wrap`        | Flex wrap layout for tag clouds and chip groups.                                                                               |
| `AspectRatio` | Maintains aspect ratio via `ratio` prop.                                                                                       |
| `MasonryGrid` | CSS masonry grid layout.                                                                                                       |
| `MediaGrid`   | Responsive grid optimized for media tiles.                                                                                     |

#### Typography

| Component  | Description                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`     | Typography with `size` (FontSizeToken), `weight` (FontWeightToken), `color` (TextColorToken), `align`, `truncate`. Supports `as` prop. |
| `Markdown` | Renders markdown content with HyperKit styling.                                                                                        |

#### Input Controls

| Component      | Description                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | Primary action component. Props: `variant` (`primary \| secondary \| ghost \| danger \| outline \| link`), `size` (`sm \| md \| lg`), `loading`, `disabled`, `fullWidth`. Supports `as` prop. |
| `Input`        | Text input with `label`, `value`, `onInput`, `placeholder`, `error`, `disabled`, `size`.                                                                                                      |
| `Select`       | Dropdown select with `options: SelectOption[]`, `value`, `onChange`, `placeholder`.                                                                                                           |
| `Switch`       | Toggle with `checked`, `defaultChecked`, `onChange`, `label`, `disabled`.                                                                                                                     |
| `Checkbox`     | Checkbox with `checked`, `defaultChecked`, `onChange`, `label`, `indeterminate`.                                                                                                              |
| `Slider`       | Range slider with `value`, `min`, `max`, `step`, `onChange`.                                                                                                                                  |
| `RangeSlider`  | Dual-handle range with `value: [number, number]`, `onChange`.                                                                                                                                 |
| `NumberInput`  | Numeric input with stepper, `value`, `min`, `max`, `step`, `onChange`.                                                                                                                        |
| `SearchInput`  | Search input with debounce, keyboard shortcut badge, `onSearch`, `onChange`.                                                                                                                  |
| `TagInput`     | Multi-value tag input with `value: string[]`, `suggestions`, `onChange`.                                                                                                                      |
| `ColorInput`   | Color picker with `value`, `format` (`hex \| rgb \| hsl`), `showAlpha`, `onChange`.                                                                                                           |
| `DateInput`    | Date picker with `value`, `min`, `max`, `onChange`.                                                                                                                                           |
| `RecordButton` | Audio/video record toggle button.                                                                                                                                                             |

#### File & Media Inputs

| Component      | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| `FileInput`    | File upload with `mode` (`single \| list`), `accept`, `maxSize`, `onChange`.         |
| `ImageInput`   | Image file input with preview, `mode` (`single \| multiple`).                        |
| `VideoInput`   | Video file input, `mode` (`single \| list`).                                         |
| `AudioInput`   | Audio file input, `mode` (`single \| list`).                                         |
| `DropZone`     | Drag-and-drop file area with `onDrop`, `accept`, `multiple`, `maxSize`.              |
| `ImagePreview` | Thumbnail strip with remove, `images: ImagePreviewItem[]`, `onRemove`, `maxVisible`. |

#### Display & Data

| Component        | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `Card`           | Surface container with `variant`, `padding`, `radius`, `shadow`.                              |
| `Badge`          | Label/dot/count indicator with `variant` (`default \| success \| warning \| danger \| info`). |
| `Tooltip`        | Hover tooltip with `content`, `placement`, `delay`.                                           |
| `Dialog`         | Modal dialog with `open`, `onOpenChange`, `title`, `description`.                             |
| `Popover`        | Non-modal overlay anchored to trigger.                                                        |
| `Dropdown`       | Menu dropdown with `items: DropdownItem[]`, `trigger`.                                        |
| `Collapsible`    | Expand/collapse with `open`, `defaultOpen`, `trigger`.                                        |
| `Accordion`      | Collapsible sections with `items: AccordionItemData[]`, `type` (`single \| multiple`).        |
| `Tabs`           | Tab group with `items: TabItem[]`, `value`, `onChange`, `orientation`.                        |
| `Table`          | Data table with `columns: TableColumn<T>[]`, `data`, `onRowClick`, `selectedKey`.             |
| `Timeline`       | Vertical/horizontal timeline with `steps: TimelineStep[]`.                                    |
| `Separator`      | Visual divider, `orientation` (`horizontal \| vertical`).                                     |
| `CodeBlock`      | Syntax-highlighted code with `code`, `language`, `showLineNumbers`.                           |
| `TerminalOutput` | Terminal-style output display.                                                                |
| `Kbd`            | Keyboard key display with `keys: string[]`.                                                   |
| `ScrollArea`     | Scrollable container with custom scrollbar, `maxHeight`.                                      |
| `DocumentPage`   | A4/letter document page wrapper.                                                              |

#### Feedback & Status

| Component            | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `Spinner`            | Loading spinner with `size`, `color`, `label`.                                |
| `Skeleton`           | Loading placeholder with `variant` (`rect \| circle \| text`), `lines`.       |
| `ProgressBar`        | Linear progress with `value`, `indeterminate`, `size`, `color`.               |
| `ProgressRing`       | Circular progress with `value`, `size`, `strokeWidth`.                        |
| `StatusDot`          | Online/offline dot with `status`, `pulse`, `size`.                            |
| `ColorDot`           | Solid-color dot indicator.                                                    |
| `EmptyState`         | Zero-state placeholder with `icon`, `title`, `description`, `action`.         |
| `ErrorBanner`        | Error/warning banner with `message`, `onDismiss`, `variant`, `autoDismissMs`. |
| `StreamingIndicator` | LLM streaming animation with `visible`, `message`.                            |
| `StreamingText`      | Character-by-character streaming text renderer.                               |

#### Data Visualization

| Component         | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `Sparkline`       | Mini line chart for trend display.                                             |
| `WaterfallChart`  | Waterfall/cascade chart.                                                       |
| `SegmentedBar`    | Multi-segment proportional bar.                                                |
| `SignalGrid`      | Signal strength / grid-of-dots visualization.                                  |
| `MetricCard`      | KPI metric card with value, label, trend.                                      |
| `FilterChip`      | Selectable filter chip with `selected`, `onClick`, `onRemove`.                 |
| `SuggestionChips` | Horizontal suggestion chip group with `chips`, `onSelect`.                     |
| `ProjectCard`     | Project overview card with `name`, `icon`, `color`, `subtitle`, `description`. |

---

### Composites — Complex Multi-Primitive Components

#### Chat & AI

| Component          | Description                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `ChatWindow`       | Full chat UI with messages, toolbar, model selector. Props: `messages`, `connectionState`, `models`, `selectedModel`, `onSend`. |
| `MessageList`      | Scrollable message list with `messages`, `autoScroll`, `onCopyMessage`.                                                         |
| `MessageBubble`    | Individual message with `role`, `content`, `timestamp`, `isStreaming`.                                                          |
| `MessageInput`     | Chat input with attachment support, `onSend`, `onInterrupt`, `isStreaming`.                                                     |
| `LLMChatBox`       | Self-contained chat tied to `LLMUIControllerReturn`.                                                                            |
| `ToolExecution`    | Tool call display with `toolName`, `status`, `input`, `output`, `duration`.                                                     |
| `ToolApproval`     | Approve/reject pending tool calls.                                                                                              |
| `PromptQueue`      | Queued prompt list with `items: QueuedPrompt[]`, `onRemove`.                                                                    |
| `SubagentTracker`  | Agent spawn tracker with `agents: SubagentInfo[]`, `onCancel`.                                                                  |
| `CostTracker`      | Token cost display with `cost`, `inputTokens`, `outputTokens`, `compact`.                                                       |
| `ConnectionStatus` | WebSocket connection indicator with `state: ConnectionState`.                                                                   |

#### Session Management

| Component          | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `SessionTabs`      | Browser-like tab strip with `tabs: SessionTab[]`, `onTabSelect`, `onTabClose`, `onNewTab`. |
| `SessionIndicator` | Session status badge with `status`, `name`, `model`, `unreadCount`.                        |
| `SessionSearch`    | Session search dialog with `sessions: SessionData[]`, `onSelect`.                          |
| `SessionManager`   | Full session list/management panel.                                                        |
| `ModelSelector`    | Model dropdown with `models: ModelOption[]`, `value`, `onChange`.                          |

#### Navigation & Layout

| Component         | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `Sidebar`         | Collapsible sidebar with `open`, `onToggle`, `width`, `header`, `footer`. |
| `MenuBar`         | Application menu bar with `menus: MenuDefinition[]`.                      |
| `TabBar`          | Browser-style tab bar with `tabs: TabBarTab[]`, add/close/reorder.        |
| `StatusBar`       | Bottom status bar with `items: StatusBarItem[]`.                          |
| `Breadcrumb`      | Navigation breadcrumb with `items: BreadcrumbItem[]`, `separator`.        |
| `MobileNav`       | Mobile bottom navigation with `sessions`, `activeSessionId`.              |
| `MobilePanelView` | Tab-based panel switcher for mobile with `tabs: MobilePanelTab[]`.        |
| `ModeSwitcher`    | Application mode toggle (e.g., light/dark/IDE).                           |
| `CommandPalette`  | Spotlight-style command palette with `actions: CommandAction[]`.          |

#### File System

| Component             | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `FileExplorer`        | Full file browser with `items: FileItem[]`, `currentPath`, `onNavigate`, `onSelect`. |
| `FileExplorerToolbar` | Toolbar for file explorer with `currentPath`, `viewMode`, navigation controls.       |
| `TreeView`            | Collapsible tree with `items`, `selectedPaths`, `expandedPaths`.                     |
| `TreeNode`            | Single tree node (used internally or standalone).                                    |
| `DirectoryPicker`     | Directory selection modal with breadcrumb navigation.                                |
| `FileIcon`            | File type icon with `item: FileIconItem`, `size`.                                    |

#### Dashboards & Data

| Component            | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `KanbanBoard`        | Drag-and-drop kanban with `columns: KanbanColumn[]`, `onCardClick`. |
| `IssueBoard`         | GitHub-style issue board.                                           |
| `DashboardContainer` | Drag-and-drop card grid container.                                  |
| `DashboardGrid`      | Dashboard layout grid with configurable card positions.             |
| `ProjectDashboard`   | Full project overview dashboard.                                    |
| `StatBar`            | Horizontal stats bar.                                               |
| `RepoCard`           | Repository info card.                                               |

#### Forms & Settings

| Component          | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `ActionForm`       | Form tied to a NavigableRegistry action definition.         |
| `SettingsPanel`    | Settings page with sections and controls.                   |
| `ThemeBuilder`     | Interactive theme customization panel.                      |
| `ThemePickerModal` | Modal wrapper around ThemeBuilder.                          |
| `ExamBuilder`      | Exam/quiz builder UI.                                       |
| `ConfirmDialog`    | Confirm/cancel modal with `title`, `onConfirm`, `onClose`.  |
| `ContextMenu`      | Right-click context menu.                                   |
| `SplitButton`      | Button with dropdown split (`label`, `options`, `variant`). |
| `Toast`            | Toast notification system with auto-dismiss.                |
| `GuidedTour`       | Step-by-step UI tour with `steps`, `active`.                |

---

### Panel System

The panel system provides a full IDE-like resizable/dockable layout.

| Export              | Description                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PanelContainer`    | Root panel layout container. Props: `panels: PanelConfig[]`, `storageKey`, `onLayoutChange`, `chrome` (`full \| minimal \| none \| auto-hide \| edge-peek \| fade-on-idle`). |
| `PanelGroup`        | Group of panels in one direction with resize handles.                                                                                                                        |
| `PanelResizeHandle` | Drag handle between panels.                                                                                                                                                  |
| `PanelDropZone`     | Drop target for dragging panels between positions.                                                                                                                           |
| `usePanelLayout`    | Hook returning `PanelLayoutState` and `PanelLayoutActions`.                                                                                                                  |
| `usePanelDrag`      | Hook for panel drag state.                                                                                                                                                   |

Panel positions: `'left' \| 'right' \| 'bottom' \| 'center'`
Panel modes: `'docked' \| 'floating' \| 'drawer'`

---

### Report System

Schema-driven report builder for generating documents programmatically.

| Export                     | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `Report`                   | Schema-driven renderer. Props: `schema: ReportSchema`. |
| `ReportShell`              | Outer shell with nav and scrollable body.              |
| `ReportNav`                | Sticky sidebar navigation with section links.          |
| `ReportHero`               | Hero header with title, score, badges.                 |
| `ReportSection`            | Content section container with heading.                |
| `ReportScoreCard`          | Numeric score visualization card.                      |
| `SummaryGrid`              | Grid of summary stat items.                            |
| `FlowDiagram`              | Layered flow visualization.                            |
| `LayerStack`               | Architecture layer stack diagram.                      |
| `GapAnalysis`              | Gap/issue analysis list with severity.                 |
| `GapCard`                  | Individual gap item card.                              |
| `PackageTree`              | Package dependency tree visualization.                 |
| `PresetGrid`               | Grid of preset/option cards.                           |
| `SourceList`               | Grouped source/reference list.                         |
| `DecisionGrid`             | Decision comparison grid.                              |
| `Poll`                     | Interactive poll component.                            |
| `FormFields`               | Dynamic form fields from schema.                       |
| `ReportFooter`             | Report footer with metadata.                           |
| `architectureReviewSchema` | Preset schema for architecture review reports.         |

---

### Navigation System (NavigableRegistry)

Framework for making UI components discoverable and controllable by AI/LLM tools.

| Export                                      | Description                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `createNavigable`                           | Register a component as an AI-controllable navigable with typed actions. |
| `registerNavigable` / `unregisterNavigable` | Manual registration lifecycle.                                           |
| `dispatchAction`                            | Invoke a registered action by name with typed payload.                   |
| `NavigationProvider`                        | Context provider for navigation graph.                                   |
| `useNavigation` / `useNavigable`            | Hooks for consuming navigation context.                                  |
| `NavigationMenu`                            | Auto-generated navigation menu from registry.                            |
| `connectTransport`                          | Connect WebSocket/MessagePort/Tauri IPC transport.                       |
| `createNavigableDevTools`                   | DevTools panel for inspecting/controlling navigables.                    |
| `addActionMiddleware`                       | Middleware for permissions, undo/redo, rate limiting, analytics.         |
| `enableStatePersistence`                    | Persist/hydrate navigable state to storage.                              |
| `startActionRecording` / `replaySession`    | Record and replay UI action sessions.                                    |

---

### Theme System

| Export          | Description                                              |
| --------------- | -------------------------------------------------------- |
| `ThemeProvider` | Root provider. Wraps app and applies theme to `:root`.   |
| `useTheme`      | Hook returning `{ theme, setTheme, preset, setPreset }`. |
| `ThemePicker`   | Inline theme selection UI.                               |
| `FontSelect`    | Font family selector dropdown.                           |
| `themePresets`  | Array of all built-in theme presets.                     |

Built-in presets: `galleryHubDarkTheme`, `reportDarkTheme`, `defaultLightTheme`, `highContrastTheme`, `warmDarkTheme`, `oceanTheme`, `roseTheme`, `devtoolsTheme`

---

### Animation System

| Export                                                                              | Description                                                      |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `AnimationProvider`                                                                 | Root provider for animation preferences.                         |
| `Transition`                                                                        | Preset CSS transition wrapper with `preset`, `duration`.         |
| `ScrollReveal`                                                                      | Reveal on scroll with `animation`, `delay`, `threshold`, `once`. |
| `AnimateOnScroll`                                                                   | Scroll-triggered animation wrapper.                              |
| `fadeIn`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `scaleFade` | Animation preset helpers.                                        |

---

### Hooks

| Hook                                               | Description                                                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useBreakpoint`                                    | Returns `{ isPhone, isTablet, isDesktop, isTv, isMobile }` reactive booleans.                                                          |
| `useMode`                                          | Returns current app mode (IDE, chat, viewer, etc.) with `setMode`.                                                                     |
| `createEffectResource`                             | SolidJS resource backed by an Effect program — async data loading with type-safe errors.                                               |
| `createEffectStream`                               | SolidJS signal backed by an Effect stream — real-time reactive streams.                                                                |
| `useHaptic` / `createHaptic`                       | Haptic feedback on supported devices.                                                                                                  |
| `useNotificationSound` / `createNotificationSound` | Audio notification system.                                                                                                             |
| `createEventBus` / `useEventBus`                   | App-wide typed event bus.                                                                                                              |
| `useVideoPreview`                                  | Video thumbnail generation and preview.                                                                                                |
| `createLLMUIController`                            | Complete LLM conversation controller (messages, streaming, tool calls, adapters).                                                      |
| `useLogger`                                        | Subscribe a `LoggingService` stream to SolidJS signals — returns `{ entries, latest, active, stop }`. Auto-stops on component cleanup. |

---

### Keyboard System

| Export             | Description                                   |
| ------------------ | --------------------------------------------- |
| `KeyboardProvider` | Root keyboard shortcut provider.              |
| `useKeyboard`      | Access keyboard context.                      |
| `useShortcut`      | Register a single shortcut.                   |
| `useShortcuts`     | Register multiple shortcuts.                  |
| `KeyboardScope`    | Scope shortcuts to a component subtree.       |
| `ShortcutsHelp`    | Auto-generated keyboard shortcuts help modal. |
| `formatShortcut`   | Format shortcut to human-readable string.     |

---

### Effect Services

Type-safe services for infrastructure concerns built with Effect-TS.

| Export                                                                                                                    | Description                              |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `LoggingService`                                                                                                          | Effect layer for structured log capture. |
| `WebSocketService`                                                                                                        | Effect layer for WebSocket connections.  |
| `SessionService`                                                                                                          | Effect layer for session CRUD.           |
| `FileSystemService`                                                                                                       | Effect layer for file system operations. |
| `ClipboardService`                                                                                                        | Effect layer for clipboard read/write.   |
| Errors: `WebSocketError`, `SessionNotFoundError`, `SessionCreationError`, `FileSystemError`, `ClipboardError`, `ApiError` | Typed error classes for each service.    |

#### LoggingService

Captures all Effect log output into a reactive stream with in-memory history, enrichment, redaction, sampling, and pluggable transports.

```ts
interface LoggingService {
  readonly stream: Stream.Stream<LogEntry>; // live log stream (subscribe via useLogger)
  readonly getHistory: Effect.Effect<ReadonlyArray<LogEntry>>;
  readonly clear: Effect.Effect<void>;
}
```

Factory: `makeLoggingLayer(config?: LoggingServiceConfig)`

**`LoggingServiceConfig`**

| Field        | Type                      | Default | Description                                                |
| ------------ | ------------------------- | ------- | ---------------------------------------------------------- |
| `maxHistory` | `number`                  | `500`   | Max in-memory entries kept in the ring buffer              |
| `context`    | `Record<string, unknown>` | —       | Global annotations merged into every log entry             |
| `redact`     | `string[]`                | —       | Annotation keys to mask as `[REDACTED]` (case-insensitive) |
| `sampling`   | `{ rate: number }`        | —       | Session-based sampling — rate 0–1 (e.g. `0.1` = 10%)       |
| `transports` | `LogTransportDef[]`       | —       | External sinks (Console, HTTP, Beacon, Sentry, custom)     |

**Processing pipeline** (applied per log event): `enrichOptions` → `redactOptions` → `shouldSample`

**`LogEntry` shape**

```ts
interface LogEntry {
  readonly id: string; // "log-000042"
  readonly timestamp: Date;
  readonly level: string; // "Debug" | "Info" | "Warning" | "Error" | "Fatal"
  readonly message: unknown;
  readonly fiberId: string;
  readonly spans: ReadonlyArray<{ label: string; durationMs: number }>;
  readonly annotations: Readonly<Record<string, unknown>>;
  readonly cause: string | undefined; // Cause.pretty output, if present
}
```

**Built-in transports**

| Constructor                 | Type   | Notes                                                    |
| --------------------------- | ------ | -------------------------------------------------------- |
| `ConsoleTransport(config?)` | Simple | Formats: `pretty` / `json` / `logfmt`                    |
| `HttpTransport(config)`     | Scoped | Batched `POST` to an HTTP endpoint                       |
| `BeaconTransport(config)`   | Scoped | `navigator.sendBeacon` — fires on page unload            |
| `SentryTransport(config)`   | Simple | Accepts any object satisfying the `SentryLike` interface |

**Custom transports** — use the `LogTransportDef` discriminated union:

```ts
// Synchronous (Console, Sentry pattern)
SimpleTransport(logger: Logger.Logger<unknown, unknown>): LogTransportDef

// Scoped lifecycle (HTTP batching, Beacon)
ScopedTransport(
  effect: Effect.Effect<Logger.Logger<unknown, unknown>, never, Scope.Scope>
): LogTransportDef
```

**Usage example**

```ts
import {
  makeLoggingLayer,
  ConsoleTransport,
  HttpTransport,
  SimpleTransport,
} from '@ybouhjira/hyperkit';

const LoggingLayer = makeLoggingLayer({
  maxHistory: 1000,
  context: { app: 'my-app', env: 'production' },
  redact: ['token', 'password'],
  sampling: { rate: 0.1 },
  transports: [
    ConsoleTransport({ format: 'pretty' }),
    SimpleTransport(HttpTransport({ url: '/api/logs', batchSize: 50 })),
  ],
});
```

---

### Layout Templates

| Export             | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `ChatLayout`       | IDE-style layout with sidebar, tab strip, and chat area.           |
| `OnboardingLayout` | Multi-step onboarding flow layout.                                 |
| `ViewSwitcher`     | Switches between registered view renderers (table/kanban/gallery). |

---

### Icons

| Export      | Description                                                                          |
| ----------- | ------------------------------------------------------------------------------------ |
| `Icon`      | Base icon component. Props: `name`, `size` (`sm \| md \| lg \| xl`), `class`.        |
| Named icons | All named icon exports from `./icons/named` (e.g., `ChevronIcon`, `CloseIcon`, etc.) |

---

## Import Pattern

```tsx
// Always import from the package root
import { Button, Input, Card, Flex, Stack } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css';

// NEVER import from internal paths
// import { Button } from "@ybouhjira/hyperkit/src/primitives/Button"; // WRONG
```

---

## SolidJS Patterns (Critical — Not React)

HyperKit is built on SolidJS. Components run ONCE; only signals re-execute.

```tsx
// Correct SolidJS
import { createSignal, createEffect, Show, For } from "solid-js";

const [count, setCount] = createSignal(0);
const [items, setItems] = createSignal<string[]>([]);

// Access signal values by CALLING them
<div>{count()}</div>

// Conditional rendering
<Show when={count() > 0} fallback={<span>empty</span>}>
  <span>has items</span>
</Show>

// List rendering
<For each={items()}>
  {(item, index) => <div>{index()} - {item}</div>}
</For>

// NEVER destructure props (kills reactivity)
// const { value, onChange } = props; // WRONG
// Use mergeProps or access props.value directly
```

```tsx
// React patterns that DO NOT work in SolidJS
// const [count, setCount] = useState(0);       // WRONG — use createSignal
// useEffect(() => {}, [deps]);                  // WRONG — use createEffect
// {condition && <Component />}                  // WRONG — use <Show>
// {array.map(item => <Item />)}                 // WRONG — use <For>
```

---

## CSS Tokens Reference

All styling uses `--sk-*` CSS custom properties. Never hardcode colors, spacing, or font sizes.

```css
/* ── Spacing (SpaceToken) ────────────────────────── */
/* '0' '1px' 'xs'(4px) 'sm'(8px) 'md'(16px) 'lg'(24px) 'xl'(32px) '2xl'(48px) '3xl'(64px) '4xl'(80px) */
padding: var(--sk-space-md); /* 16px */
gap: var(--sk-space-sm); /* 8px */
margin-top: var(--sk-space-lg); /* 24px */

/* ── Colors ──────────────────────────────────────── */
background: var(--sk-bg-primary);
background: var(--sk-bg-secondary); /* cards, inputs */
background: var(--sk-bg-tertiary); /* hover states */
background: var(--sk-bg-elevated); /* elevated surfaces */
color: var(--sk-text-primary);
color: var(--sk-text-secondary);
color: var(--sk-text-muted);
border: 1px solid var(--sk-border);
background: var(--sk-accent); /* primary action color */

/* Status colors */
color: var(--sk-success);
color: var(--sk-warning);
color: var(--sk-error);
color: var(--sk-info);

/* ── Typography ──────────────────────────────────── */
/* FontSizeToken: 'xs' 'sm' 'base' 'lg' 'xl' '2xl' '3xl' '4xl' '5xl' '6xl' */
font-size: var(--sk-font-size-base); /* ~14px body */
font-size: var(--sk-font-size-sm); /* ~12px labels */
font-size: var(--sk-font-size-xs); /* ~10px metadata */
font-size: var(--sk-font-size-lg); /* ~18px headings */

/* FontWeightToken: 'regular' 'medium' 'semibold' 'bold' 'extrabold' 'black' */

/* ── Border Radius (RadiusToken) ─────────────────── */
/* 'sm' 'md' 'lg' 'xl' 'full' */
border-radius: var(--sk-radius-md);

/* ── Shadows (ShadowToken) ───────────────────────── */
/* 'sm' 'md' 'lg' 'xl' '2xl' 'inner' */
box-shadow: var(--sk-shadow-md);

/* ── Transitions ─────────────────────────────────── */
transition: all var(--sk-duration-fast) var(--sk-ease-out);

/* ── Component Heights ───────────────────────────── */
height: var(--sk-height-md); /* 32px — standard input height */

/* ── Semi-transparent fills ──────────────────────── */
background: color-mix(in srgb, var(--sk-accent) 15%, transparent);
```

---

## Common Composition Patterns

### Page Layout

```tsx
import { Flex, Stack, Text, Button } from '@ybouhjira/hyperkit';

<Flex direction="column" style={{ height: '100vh' }}>
  <Flex
    align="center"
    justify="between"
    style={{ padding: 'var(--sk-space-md)', 'border-bottom': '1px solid var(--sk-border)' }}
  >
    <Text size="lg" weight="semibold">
      Title
    </Text>
    <Button variant="primary">Action</Button>
  </Flex>
  <Stack style={{ flex: 1, padding: 'var(--sk-space-md)', 'overflow-y': 'auto' }}>
    {/* Content */}
  </Stack>
</Flex>;
```

### Form Pattern

```tsx
import { Input, Select, Button, Stack } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

const [name, setName] = createSignal('');
const [role, setRole] = createSignal('');

<Stack style={{ gap: 'var(--sk-space-md)' }}>
  <Input label="Name" value={name()} onInput={(e) => setName(e.currentTarget.value)} />
  <Select
    label="Role"
    options={[
      { value: 'admin', label: 'Admin' },
      { value: 'viewer', label: 'Viewer' },
    ]}
    value={role()}
    onChange={setRole}
  />
  <Button variant="primary" onClick={handleSubmit}>
    Save
  </Button>
</Stack>;
```

### Card Grid

```tsx
import { Grid, Card, Text, Badge } from '@ybouhjira/hyperkit';
import { For } from 'solid-js';

<Grid columns={3} gap="md">
  <For each={items()}>
    {(item) => (
      <Card style={{ padding: 'var(--sk-space-md)' }}>
        <Text size="base" weight="semibold">
          {item.title}
        </Text>
        <Text size="sm" color="secondary">
          {item.description}
        </Text>
        <Badge variant={item.status === 'ok' ? 'success' : 'warning'}>{item.status}</Badge>
      </Card>
    )}
  </For>
</Grid>;
```

### IDE Panel Layout

```tsx
import { PanelContainer } from '@ybouhjira/hyperkit';
import type { PanelConfig } from '@ybouhjira/hyperkit';

const panels: PanelConfig[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    icon: '📁',
    defaultPosition: 'left',
    defaultSize: 250,
    collapsible: true,
    render: () => <FileTree />,
  },
  {
    id: 'editor',
    title: 'Editor',
    defaultPosition: 'center',
    render: () => <CodeEditor />,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    defaultPosition: 'bottom',
    defaultSize: 200,
    collapsible: true,
    render: () => <Terminal />,
  },
];

<PanelContainer panels={panels} storageKey="my-app-layout" chrome="full" />;
```

### LLM Chat Integration

```tsx
import { LLMChatBox, createLLMUIController } from '@ybouhjira/hyperkit';

const controller = createLLMUIController({
  adapter: myLLMAdapter,
  systemPrompt: 'You are a helpful assistant.',
});

<LLMChatBox controller={controller} title="Assistant" placeholder="Ask anything..." />;
```

### Schema-Driven Report

```tsx
import { Report } from '@ybouhjira/hyperkit';
import type { ReportSchema } from '@ybouhjira/hyperkit';

const schema: ReportSchema = {
  title: 'Architecture Review',
  subtitle: 'Q1 2025',
  score: 87,
  sections: [
    {
      id: 'summary',
      title: 'Summary',
      content: [
        { type: 'summary-grid', items: [{ label: 'Components', value: '133' }] },
        { type: 'gap-analysis', items: [{ title: 'Missing tests', severity: 'medium' }] },
      ],
    },
  ],
};

<Report schema={schema} />;
```

### NavigableRegistry (AI-Controllable Components)

```tsx
import { createNavigable, dispatchAction } from '@ybouhjira/hyperkit';

// Register a component's actions
const { handle } = createNavigable({
  id: 'file-list',
  description: 'Shows and manages project files',
  state: () => ({ selectedFile: selectedFile() }),
  actions: {
    selectFile: {
      description: 'Select a file by path',
      schema: { path: { type: 'string' } },
      handler: ({ path }) => setSelectedFile(path),
    },
    refresh: {
      description: 'Refresh the file list',
      handler: () => loadFiles(),
    },
  },
});

// LLM/external code dispatches actions by name
await dispatchAction('file-list', 'selectFile', { path: '/src/main.tsx' });
```

---

## Testing Pattern

```tsx
import { render, screen } from '@solidjs/testing-library';
import { Button, Badge } from '@ybouhjira/hyperkit';

test('renders button with correct text', () => {
  render(() => <Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('badge shows correct variant', () => {
  render(() => <Badge variant="success">Active</Badge>);
  expect(screen.getByText('Active')).toBeInTheDocument();
});
```

Run tests: `npm test` (vitest + @solidjs/testing-library + jsdom)

---

## Key Conventions

1. **One component per directory** — Each component lives at `src/primitives/{Name}/index.ts` or `src/composites/{Name}/index.ts`.
2. **Props interfaces** — Every component exports a `{Component}Props` type co-located in the same file.
3. **Tokens over raw values** — Use `SpaceToken` (`'md'`), not `'16px'`. Use `--sk-*` CSS vars, not hex codes.
4. **CSS variable scoping** — Override component appearance via `--sk-{component}-{property}` on a parent element. No `!important` needed.
5. **Polymorphic rendering** — `Box`, `Text`, `Button` accept an `as` prop to change the rendered element.
6. **Effect for services** — Business logic uses Effect layers (`WebSocketService`, `SessionService`, etc.), not raw `try/catch`.
7. **No React patterns** — Props don't destructure. Components run once. Use `<Show>` and `<For>`.
8. **splitProps for HTML passthrough** — Use SolidJS `splitProps()` to separate component props from HTML attributes.
9. **Accessibility first** — Components built on `@kobalte/core` for ARIA compliance; don't break aria roles.
10. **Strict TypeScript** — `noUncheckedIndexedAccess` enabled. No `any`. Use `unknown` with type guards.

---

## File Structure

```
src/
├── primitives/         # Basic UI building blocks
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── layout/         # SpaceToken, BgToken, mapSpace(), etc.
│   └── index.ts        # Barrel export
│
├── composites/         # Complex multi-primitive components
│   └── index.ts        # Barrel export
│
├── panels/             # IDE panel system (PanelContainer, PanelGroup, ...)
├── navigation/         # NavigableRegistry framework
├── hooks/              # SolidJS hooks (createEffectResource, useBreakpoint, ...)
├── theme/              # ThemeProvider, presets, types
├── animation/          # Transition, ScrollReveal, AnimateOnScroll
├── keyboard/           # KeyboardProvider, useShortcut
├── layouts/            # ChatLayout, OnboardingLayout
├── effects/            # Effect-TS service layers
├── report/             # Report builder system
├── editor/             # introspectSchema, EditorSchema
├── icons/              # Icon, named icon components
├── views/              # ViewSwitcher, ViewMode types
├── tokens/             # tokens.css (heights, durations, easings)
├── server/             # createNavigableRouter, generateMCPTools
├── typography/         # useKnuthPlass (LaTeX-quality line breaking)
├── utils/              # validateProps
└── index.ts            # All public exports
```

---

## Quality Gate

All checks must pass before committing:

```bash
npm run quality
# Runs: format:check + lint + lint:css + audit:css-vars + test + build + publint + attw + size:check + knip
```

Individual commands:

```bash
npm test                 # Vitest unit tests
npm run lint             # ESLint
npm run lint:css         # Stylelint on CSS files
npm run build            # TypeScript + Vite build
npm run size:check       # Bundle size limits (JS ≤ 250 kB, CSS ≤ 30 kB)
npm run knip             # Dead code / unused exports
npm run audit:css-vars   # Validate all CSS variables are defined
```

---

## MCP Server (AI Tool Integration)

HyperKit ships with an MCP server for IDE integrations.

```bash
# Auto-configured via .mcp.json (Claude Code reads this automatically)
# Manual start:
node mcp-server.js
```

MCP tools: `search_components`, `get_component`
MCP resources: `file:///llms.txt`, `file:///llms-full.txt`

---

## Additional AI Context

- **Quick API index**: `llms.txt` — all component props in one file
- **Full API reference**: `llms-full.txt` — detailed with examples
- **Per-component docs**: `docs/ai/{ComponentName}.md`
- **CSS variables**: `docs/CSS_VARIABLES.md`
- **Design principles**: `PRINCIPLES.md` — scale philosophy, compound components, token-first
