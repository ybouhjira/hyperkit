# HyperKit

> 133+ SolidJS components with Effect services, @kobalte/core accessibility, and CSS token theming.

## CRITICAL RULES

- **ZERO custom CSS in any app.** Every style must come from HyperKit tokens, component props, or theme config. No inline `style={}`, no `.css` files in apps, no hardcoded colors/spacing. If a component can't be styled via props/tokens, fix the component — never work around it in the app.
- **All visual values via `--sk-*` tokens.** See CSS Token Quick Reference below.

## Quick Reference

| I want to...             | Do this                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| Use a component          | `import { Name } from "@ybouhjira/hyperkit"`                                     |
| Find components          | See catalog below or read `llms.txt`                                             |
| Run tests                | `pnpm test` or `npm test`                                                        |
| Run explorer (Storybook) | `cd packages/explorer && pnpm dev` (port 6007)                                   |
| Run quality gate         | `npm run quality`                                                                |
| Add a component          | Create dir in `src/primitives/` or `src/composites/`, export from `src/index.ts` |
| Use CSS tokens           | `var(--sk-space-md)`, `var(--sk-bg-primary)`, etc.                               |
| Check bundle size        | `npm run size` (JS ≤ 250 kB, CSS ≤ 30 kB)                                        |
| AI docs                  | Read `llms.txt` (index) or `llms-full.txt` (full API)                            |
| MCP server               | Runs via `.mcp.json` — tools: `search_components`, `get_component`               |

## Architecture

- **SolidJS** (NOT React) — signals, stores, `Show`/`For`, no prop destructuring
- **@kobalte/core** — accessible primitives (Dialog, Select, Tabs, Dropdown, etc.)
- **Effect** — type-safe services, error handling, dependency injection
- **CSS tokens** — `--sk-*` custom properties for all theming (no hardcoded values ever)
- **Two-tier CSS vars**: `.sk-btn { background: var(--sk-btn-bg, var(--sk-accent)) }`

## Component Catalog

### Primitives — Layout (14)

| Component        | Description                                             |
| ---------------- | ------------------------------------------------------- |
| **Box**          | Base polymorphic container; `as` prop for element type  |
| **Flex**         | Flexbox with direction, align, justify, gap, wrap props |
| **Stack**        | Vertical flex column with spacing token                 |
| **Grid**         | CSS grid with columns, gap, auto-fit/fill               |
| **Center**       | Centers content both axes                               |
| **Container**    | Max-width page wrapper with padding                     |
| **Section**      | Labeled page section with heading                       |
| **Spacer**       | Flexible space filler in flex/grid                      |
| **Wrap**         | Flex wrap for tag/chip layouts                          |
| **AspectRatio**  | Maintains aspect ratio of child                         |
| **ScrollArea**   | Custom scrollbar container                              |
| **MasonryGrid**  | Pinterest-style masonry layout                          |
| **MediaGrid**    | Responsive media card grid                              |
| **DocumentPage** | A4/letter page with margin simulation                   |

### Primitives — Input (15)

| Component       | Description                                 |
| --------------- | ------------------------------------------- |
| **Button**      | Polymorphic button with size/variant props  |
| **Input**       | Text input with label, error, size variants |
| **NumberInput** | Numeric input with increment/decrement      |
| **SearchInput** | Input with search icon and clear button     |
| **Select**      | Accessible dropdown selection (@kobalte)    |
| **Checkbox**    | Checkbox with indeterminate state           |
| **Switch**      | Toggle switch (on/off)                      |
| **Slider**      | Single-value range slider                   |
| **RangeSlider** | Dual-handle range slider                    |
| **TagInput**    | Multi-value tag/token input                 |
| **DateInput**   | Date/time picker input                      |
| **ColorInput**  | Color picker input                          |
| **FileInput**   | File upload input with drag support         |
| **AudioInput**  | Microphone recording input                  |
| **VideoInput**  | Camera/video capture input                  |
| **ImageInput**  | Image upload with preview                   |

### Primitives — Display (19)

| Component          | Description                                       |
| ------------------ | ------------------------------------------------- |
| **Text**           | Polymorphic text with size, weight, color tokens  |
| **Badge**          | Status/count label with variants                  |
| **Card**           | Content card with padding, radius, shadow         |
| **MetricCard**     | KPI card with value, label, trend                 |
| **ProjectCard**    | Project summary card with meta                    |
| **CodeBlock**      | Syntax-highlighted code with copy                 |
| **Markdown**       | Markdown renderer                                 |
| **ImagePreview**   | Image with zoom and overlay                       |
| **Skeleton**       | Loading placeholder shimmer                       |
| **Tooltip**        | Hover tooltip (@kobalte Tooltip)                  |
| **Kbd**            | Keyboard key display (`⌘K`)                       |
| **StatusDot**      | Colored status indicator dot                      |
| **ColorDot**       | Decorative color dot                              |
| **StreamingText**  | Animated text that streams character by character |
| **TerminalOutput** | ANSI-aware terminal text display                  |
| **Timeline**       | Vertical event timeline                           |
| **Sparkline**      | Mini inline chart                                 |
| **WaterfallChart** | Waterfall/bar breakdown chart                     |
| **SignalGrid**     | Grid of signal strength indicators                |

### Primitives — Feedback (6)

| Component              | Description                        |
| ---------------------- | ---------------------------------- |
| **Spinner**            | Loading spinner with size variants |
| **ProgressBar**        | Horizontal progress bar            |
| **ProgressRing**       | Circular ring progress             |
| **StreamingIndicator** | Animated "AI is typing" dots       |
| **ErrorBanner**        | Error message with icon            |
| **EmptyState**         | Empty state with icon, title, CTA  |

### Primitives — Navigation / Overlay (13)

| Component           | Description                          |
| ------------------- | ------------------------------------ |
| **Accordion**       | Collapsible section group            |
| **Collapsible**     | Single collapsible section           |
| **Dialog**          | Modal dialog (@kobalte Dialog)       |
| **Dropdown**        | Trigger + floating menu              |
| **Popover**         | Anchored floating content            |
| **Tabs**            | Horizontal tabbed content            |
| **Separator**       | Horizontal/vertical divider          |
| **FilterChip**      | Toggle chip for filtering            |
| **SuggestionChips** | Horizontal chip row (AI suggestions) |
| **SegmentedBar**    | Segmented control / pill selector    |
| **RecordButton**    | Pulsing record/stop button           |
| **DropZone**        | Drag-and-drop file drop target       |
| **Table**           | Data table with sort, select         |

### Composites — Chat & AI (15)

| Component            | Description                           |
| -------------------- | ------------------------------------- |
| **ChatWindow**       | Full chat UI with messages + input    |
| **LLMChatBox**       | LLM-specific chat with tool rendering |
| **MessageBubble**    | Single chat message bubble            |
| **MessageList**      | Virtualized message list              |
| **MessageInput**     | Multi-line message composer           |
| **SessionTabs**      | Multi-session tab switcher            |
| **SessionManager**   | Session CRUD panel                    |
| **SessionSearch**    | Session search/filter                 |
| **SessionIndicator** | Active session badge                  |
| **ToolApproval**     | Approve/reject AI tool calls          |
| **ToolExecution**    | Tool execution status display         |
| **SubagentTracker**  | Multi-agent progress tracker          |
| **CostTracker**      | Token/cost usage display              |
| **ModelSelector**    | LLM model picker dropdown             |
| **PromptQueue**      | Queued prompt list                    |

### Composites — Navigation & Layout (8)

| Component           | Description                        |
| ------------------- | ---------------------------------- |
| **Sidebar**         | Collapsible navigation sidebar     |
| **MobileNav**       | Bottom navigation bar (mobile)     |
| **MenuBar**         | Application menu bar (File/Edit/…) |
| **TabBar**          | Horizontal tab bar with icons      |
| **Breadcrumb**      | Path breadcrumb trail              |
| **MobilePanelView** | Mobile-optimized panel switcher    |
| **ModeSwitcher**    | App mode/workspace switcher        |
| **StatusBar**       | Bottom status bar with segments    |

### Composites — Data & Content (11)

| Component              | Description                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FileExplorer**       | File tree with list/icons/gallery views; two-pane, preview pane, sort/filter/hidden-files toolbar, controlled selection, `mode` prop (browser/picker/save) |
| **FilePicker**         | Drop-in file-selection dialog wrapping FileExplorer; `open/onClose/onPick/filter/multiple`                                                                 |
| **FileSavePicker**     | Drop-in save dialog with filename input and overwrite-confirm flow                                                                                         |
| **FilePreview**        | Auto-detecting preview pane (image/video/audio/text/PDF/unknown)                                                                                           |
| **FileContextMenu**    | Right-click context menu for file items; consumer controls position + open state                                                                           |
| **PathBreadcrumb**     | Clickable path breadcrumb with optional `editable` inline-edit mode                                                                                        |
| **KanbanBoard**        | Drag-and-drop Kanban board                                                                                                                                 |
| **IssueBoard**         | GitHub-style issue tracker board                                                                                                                           |
| **DashboardContainer** | Drag-and-drop card dashboard                                                                                                                               |
| **DashboardGrid**      | Responsive dashboard grid                                                                                                                                  |
| **ProjectDashboard**   | Project overview dashboard                                                                                                                                 |
| **ActionForm**         | Schema-driven form builder                                                                                                                                 |
| **DirectoryPicker**    | Directory selection dialog                                                                                                                                 |
| **RepoCard**           | Git repository summary card                                                                                                                                |
| **StatBar**            | Horizontal stats bar                                                                                                                                       |
| **MediaTrimmer**       | Video/audio trim range selector                                                                                                                            |

### Composites — UI Utilities (10)

| Component            | Description                          |
| -------------------- | ------------------------------------ |
| **CommandPalette**   | ⌘K command palette with fuzzy search |
| **ContextMenu**      | Right-click context menu             |
| **ConfirmDialog**    | Confirmation modal with OK/Cancel    |
| **Toast**            | Toast notification system (portal)   |
| **SettingsPanel**    | Tabbed settings drawer               |
| **ThemeBuilder**     | Interactive theme editor             |
| **ThemePickerModal** | Theme selection modal                |
| **GuidedTour**       | Step-by-step onboarding tour         |
| **SplitButton**      | Button with dropdown arrow           |
| **ConnectionStatus** | Network/WS connection indicator      |

### Panel System

The panel system exports 4 public components and 2 hooks from `@ybouhjira/hyperkit`. Additional panel internals (PanelTabBar, PanelCollapsedStrip, FloatingPanel, DrawerPanel, PipPanel, MaximizedView) exist in `src/panels/` but are not part of the public API surface.

| Export                | Description                             |
| --------------------- | --------------------------------------- |
| **PanelContainer**    | Root IDE panel layout                   |
| **PanelGroup**        | Split panel group (horizontal/vertical) |
| **PanelResizeHandle** | Drag handle between panels              |
| **PanelDropZone**     | Drop target for panel rearranging       |
| `usePanelLayout`      | Panel layout state accessor             |
| `usePanelDrag`        | Panel drag-and-drop state               |

Key types: `PanelConfig`, `PanelState`, `PanelLayoutState`, `PanelLayoutActions`, `PanelPosition`, `PanelDirection`, `DropZoneInfo`, `PanelDragState`

### Report System (15)

| Export                     | Description                        |
| -------------------------- | ---------------------------------- |
| **Report**                 | Schema-driven full report renderer |
| **ReportShell**            | Report outer shell/frame           |
| **ReportNav**              | Report section navigation          |
| **ReportHero**             | Report header with score/summary   |
| **ReportSection**          | Individual report section          |
| **ReportScoreCard**        | Score/grade card                   |
| **SummaryGrid**            | Grid of summary items              |
| **FlowDiagram**            | Architecture flow diagram          |
| **LayerStack**             | Layered architecture visualization |
| **GapAnalysis**            | Gap analysis table                 |
| **GapCard**                | Individual gap item card           |
| **PackageTree**            | Package dependency tree            |
| **PresetGrid**             | Preset options grid                |
| **SourceList**             | Source/reference list              |
| **ReportFooter**           | Report footer                      |
| `architectureReviewSchema` | Built-in schema for arch reviews   |

### Navigation Framework

The navigation framework (55+ exports) provides a navigable registry, action dispatch, middleware, transport adapters, persistence, state subscriptions, recording/replay, and DevTools.

#### Core Registry

| Export                                      | Description                                              |
| ------------------------------------------- | -------------------------------------------------------- |
| `registerNavigable` / `unregisterNavigable` | Register/unregister a navigable component                |
| `getNavigable` / `getAllNavigables`         | Lookup navigables by id or get all                       |
| `inspectNavigables`                         | Returns `NavigableInfo[]` — serializable registry dump   |
| `dispatchAction(target, action, params?)`   | Dispatch action to a navigable, returns `DispatchResult` |
| `clearNavigables`                           | Clear registry (testing)                                 |

#### createNavigable — SolidJS Primitive

```ts
const handle = createNavigable(options: CreateNavigableOptions): NavigableHandle
```

Auto-registers on mount, unregisters on cleanup. `NavigableHandle` provides `addAction`, `removeAction`, `notifyStateChange`.

#### Content Registry

| Export                                        | Description                                      |
| --------------------------------------------- | ------------------------------------------------ |
| `registerContentType`                         | Register a content type with panel configuration |
| `getContentType` / `getAllContentTypes`       | Lookup content types                             |
| `getDefaultPanel` / `getPanelsForContentType` | Query panel assignments                          |
| `clearContentTypes`                           | Clear registry (testing)                         |

#### Action Event Stream

| Export                                             | Description                         |
| -------------------------------------------------- | ----------------------------------- |
| `onActionDispatched(listener)`                     | Subscribe to all dispatched actions |
| `getActionHistory()`                               | Get recorded action history array   |
| `clearActionHistory` / `clearActionEventListeners` | Reset (testing)                     |

#### Reactive State Subscriptions

| Export                              | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `onStateChange(targetId, listener)` | Subscribe to state changes for one navigable |
| `onAnyStateChange(listener)`        | Subscribe to all navigable state changes     |
| `notifyStateChange(id, state)`      | Emit state change from a navigable           |
| `clearStateListeners`               | Reset (testing)                              |

#### Global State Snapshot

| Export                         | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `captureGlobalState()`         | Returns `AppStateSnapshot` of all navigable states |
| `restoreGlobalState(snapshot)` | Restore from snapshot                              |
| `diffState(a, b)`              | Compute diff between two snapshots                 |

#### Middleware (5 built-in)

| Export                                           | Description                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `createPermissionMiddleware`                     | read/write/admin permission levels per action                              |
| `setActionPermission` / `clearActionPermissions` | Configure permissions                                                      |
| `createUndoRedoMiddleware`                       | State capture, undo/redo stack with `UndoRedoHandle`                       |
| `createLoggingMiddleware`                        | console.group with timing per action                                       |
| `createAnalyticsMiddleware`                      | Action counts, durations, error rates; returns `AnalyticsMiddlewareHandle` |
| `createRateLimitMiddleware`                      | Token bucket + debounce per rule set                                       |

#### Transport Adapters

| Export                        | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `connectTransport(adapter)`   | Wire a transport into the registry          |
| `WebSocketTransportAdapter`   | Auto-reconnect, JSON over WebSocket         |
| `MessagePortTransportAdapter` | Worker/iframe communication via MessagePort |
| `TauriIPCAdapter`             | Tauri desktop bridge                        |

#### Persistence Adapters

| Export                                        | Description                                  |
| --------------------------------------------- | -------------------------------------------- |
| `LocalStorageAdapter`                         | Serializes state to localStorage with prefix |
| `MemoryStorageAdapter`                        | In-memory — for testing/SSR                  |
| `BroadcastChannelAdapter`                     | Cross-tab state sync                         |
| `enableStatePersistence(adapter, options)`    | Wire persistence into registry               |
| `serializeGlobalState` / `hydrateGlobalState` | Manual serialization helpers                 |

#### Composition (Transactions & Composite Actions)

| Export                                            | Description                                                    |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `dispatchTransaction(steps)`                      | Atomic multi-step action dispatch, returns `TransactionResult` |
| `registerCompositeAction` / `getCompositeActions` | Named reusable action sequences                                |

#### Recording & Replay

| Export                               | Description                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `startActionRecording()`             | Returns `RecordingHandle` with `stop()` and `eventCount`                           |
| `replaySession(recording, options?)` | Returns `ReplayHandle`: `start`, `pause`, `resume`, `stop`, `setSpeed`, `progress` |

#### Health Checks

| Export                           | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `checkNavigableHealth(options?)` | Returns `NavigableHealth[]` with `HealthStatus` per navigable |

#### DevTools

| Export                      | Description                                                          |
| --------------------------- | -------------------------------------------------------------------- |
| `createNavigableDevTools()` | Action log, state tree, filter UI; returns `NavigableDevToolsHandle` |
| `useDevTools()`             | SolidJS hook wrapping DevTools state                                 |

#### Testing Utilities

| Export                                         | Description            |
| ---------------------------------------------- | ---------------------- |
| `TestNavigableRegistry` / `createTestRegistry` | Isolated test registry |

#### SolidJS Components

| Component              | Description                           |
| ---------------------- | ------------------------------------- |
| **NavigationProvider** | App-level navigation context          |
| **NavigationMenu**     | Auto-generated nav from registry      |
| **PanelContentSlot**   | Renders registered content in a panel |

Hook: `useNavigation()` — access `NavigationContextValue`; `useNavigable()` — register current component as navigable.

### Theme System

| Export            | Description                                                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ThemeProvider** | Sets `--sk-*` CSS vars on `:root`                                                                                                                                                                                 |
| **ThemePicker**   | Inline theme switcher UI                                                                                                                                                                                          |
| **FontSelect**    | Font family selector                                                                                                                                                                                              |
| `useTheme`        | Access + update current theme; returns `UseThemeReturn`                                                                                                                                                           |
| `useThemeSounds`  | Theme-driven sound design — `play(event)` synthesizes Web-Audio tones from the active theme's `sounds` block. Persists user volume + enabled toggle to localStorage.                                              |
| `playTone`        | Pure helper — synthesize a single tone from a `ThemeSoundPreset`                                                                                                                                                  |
| `playUrl`         | Pure helper — load + play a URL sample (volume-clamped)                                                                                                                                                           |
| `themePresets`    | All built-in themes array                                                                                                                                                                                         |
| Built-in themes   | `defaultLightTheme`, `galleryHubDarkTheme`, `reportDarkTheme`, `highContrastTheme`, `warmDarkTheme`, `oceanTheme`, `roseTheme`, `devtoolsTheme`, `productivityBlueTheme`, `neonStudioTheme`, **`hyperlabsTheme`** |

#### `hyperlabsTheme` — premium design-system preset

Bakes the full premium-ui-design.md spec into one ThemeConfig so apps using `<ThemeProvider theme={hyperlabsTheme}>` get correct defaults without overriding any token. Spec sources: premium-ui-design.md (typography, density, motion), premium-dashboard-design.md (color discipline), premium-diagram-design.md (radii, borders), dark-theme-readability.md (Slack-recipe surfaces).

Token highlights (locked by `hyperlabs.test.ts`):

- font sizes 10/12/14/16/18/24px (no rem ambiguity, `adaptiveFontSizing: false`)
- spacing 4/8/16/24/32/48px
- radius 4/6/8/12px
- motion 150 / 200 / 300 / 450ms + spring `cubic-bezier(0.34, 1.56, 0.64, 1)`
- accent `#1264a3` (Slack channel-active blue)
- surfaces `#1a1d21 / #222529 / #2c2d30 / #27292d` (Slack-dark recipe)
- borders `#2c2d30` (visible — not the rgba(255,255,255,0.07) trap)
- fonts Lato → Inter → system; JetBrains Mono for code
- font-weight capped at semibold (no bold per premium-ui law #3)
- shadows only on floating UI

#### NEW `ThemeConfig` fields

| Field      | Shape          | Notes                                                                                                                                                                    |
| ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sounds?`  | `ThemeSounds`  | Master volume, enabled flag, per-event presets (`hover/click/select/confirm/success/error/notify/pop/toggleOn/toggleOff`). Opt-in.                                       |
| `effects?` | `ThemeEffects` | Visual polish toggles: `hover` (`'glow'\|'scale'`), `press` (`'scale'\|'ripple'`), `selection` (`'lift'\|'outline'\|'glow'`), `pulse` (`'soft'\|'heavy'`), `overlayBlur` |

#### `useThemeSounds()` — usage

```tsx
import { useThemeSounds } from '@ybouhjira/hyperkit';

const sounds = useThemeSounds();
<button onClick={() => sounds.play('click')}>Save</button>;

// Settings panel
sounds.setEnabled(true); // user opt-in
sounds.setVolume(0.5); // 0..1, persisted to localStorage
sounds.toggle(); // shortcut handler
```

Silent for unknown event names. Default `enabled = false` (theme-level + user-level both required to play). SSR-safe. Sounds are Web-Audio synthesized (no asset shipping).

Types: `ThemeConfig`, `ThemeColors`, `ThemeFonts`, `ThemeRadius`, `ThemeSounds`, `ThemeSoundPreset`, `ThemeEffects`, `UseThemeSoundsReturn`, `ThemeSoundEventName`

### Animation

| Export                              | Description                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| **AnimationProvider**               | Animation context — `localStorage` persistence, respects `prefers-reduced-motion`          |
| **Transition**                      | CSS transition wrapper; presets: `fade`, `slide-up/down/left/right`, `scale`, `scale-fade` |
| **ScrollReveal**                    | IntersectionObserver reveal (fade-up, fade-in, scale-in, slide-left/right)                 |
| **AnimateOnScroll**                 | CSS class-based scroll animation trigger                                                   |
| `useAnimation`                      | Returns `{ config, setEnabled, setSpeedMultiplier, isActive }`                             |
| Preset functions                    | `fadeIn`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `scaleFade`        |
| `enterAnimation` / `animationClass` | Low-level animation class helpers                                                          |

Types: `AnimationConfig`, `TransitionPreset`, `TransitionConfig`

### Keyboard System

| Export                    | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| **KeyboardProvider**      | Root context; attaches `window.keydown` listener                     |
| **KeyboardScope**         | Scoped shortcuts; supports exclusive mode                            |
| **ShortcutsHelp**         | Modal dialog showing all shortcuts (searchable, grouped by category) |
| `useKeyboard`             | Access full keyboard context (`KeyboardContextValue`)                |
| `useShortcut(config)`     | Register one shortcut; auto-cleans on component unmount              |
| `useShortcuts(configs[])` | Register multiple shortcuts at once                                  |
| `formatShortcut`          | Format a `ShortcutConfig` as a human-readable string                 |

`ShortcutConfig` shape: `{ key, mod?, ctrl?, meta?, shift?, alt?, handler, description, category?, scope? }`

### Hooks

| Hook                      | Signature                     | Returns                                                                    |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `useBreakpoint`           | `()`                          | `Accessor<'phone' \| 'tablet' \| 'desktop' \| 'wide' \| 'tv'>`             |
| `useMode`                 | `(initial?)`                  | `{ mode, setMode, getModeDefinition }`                                     |
| `useTheme`                | `()`                          | `UseThemeReturn` — theme, setTheme, and helpers                            |
| `useKeyboard`             | `()`                          | `KeyboardContextValue`                                                     |
| `useShortcut`             | `(config: ShortcutConfig)`    | `void` (auto-cleanup)                                                      |
| `useShortcuts`            | `(configs: ShortcutConfig[])` | `void` (auto-cleanup)                                                      |
| `useNavigation`           | `()`                          | `NavigationContextValue`                                                   |
| `useNavigable`            | `(options)`                   | Registers component as navigable                                           |
| `usePanelLayout`          | `()`                          | Panel layout state and actions                                             |
| `usePanelDrag`            | `()`                          | Panel drag-and-drop state                                                  |
| `useDesktop`              | `()`                          | `UseDesktopReturn` — file dialogs, capabilities                            |
| `useAnimation`            | `()`                          | `{ config, setEnabled, setSpeedMultiplier, isActive }`                     |
| `useHaptic`               | `(options?)`                  | `{ light, medium, heavy, custom, supported, enabled }`                     |
| `createHaptic`            | `(options?)`                  | Same as useHaptic — non-reactive factory                                   |
| `useNotificationSound`    | `(options?)`                  | `{ play, setEnabled, setVolume, enabled, volume }`                         |
| `createNotificationSound` | `(options?)`                  | Same as useNotificationSound — non-reactive factory                        |
| `useVideoPreview`         | `(src)`                       | `{ thumbnail, duration, width, height, loading, error }`                   |
| `useLogger`               | `(stream, options?)`          | `{ entries, latest, active, stop }`                                        |
| `createEffectResource`    | `(effectFn, options?)`        | `{ data, error, loading, refetch }`                                        |
| `createEffectStream`      | `(stream, options?)`          | `{ items, latest, error, active, stop }`                                   |
| `createEventBus`          | `()`                          | `EventBus` — `{ emit, on, once, onAny, off, clear }`                       |
| `useEventBus`             | `(bus)`                       | `{ emit, on }` (auto-cleanup)                                              |
| `createLLMUIController`   | `(options)`                   | `{ messages, isProcessing, sendMessage, registerAction, ... }`             |
| `useFileNavigation`       | `(initialPath?)`              | `{ current, history, navigateTo, back, forward, canGoBack, canGoForward }` |
| `useDragDropFiles`        | `(onDrop?)`                   | `{ isDragOver, droppedFiles, dragHandlers }` — HTML5 file-drop hook        |

### Effect Services

#### LoggingService

```ts
interface LoggingService {
  readonly stream: Stream.Stream<LogEntry>;
  readonly getHistory: Effect.Effect<ReadonlyArray<LogEntry>>;
  readonly clear: Effect.Effect<void>;
}
```

Factory: `makeLoggingLayer(config?: LoggingServiceConfig)`

`LoggingServiceConfig` options:

- `maxHistory` — max in-memory entries (default 500)
- `context` — global annotations merged into every entry
- `redact` — annotation keys to mask with `[REDACTED]` (case-insensitive)
- `sampling` — `{ rate: 0-1 }` session-based external transport sampling
- `transports` — array of `LogTransportDef`

Pipeline: `enrichOptions` → `redactOptions` → `shouldSample`

Transport constructors:
| Constructor | Type | Notes |
| ----------- | ---- | ----- |
| `ConsoleTransport(config?)` | Simple | Formats: pretty / json / logfmt |
| `HttpTransport(config)` | Scoped | Batched POST to endpoint |
| `BeaconTransport(config)` | Scoped | `navigator.sendBeacon` on page unload |
| `SentryTransport(config)` | Simple | Accepts any `SentryLike` interface |

Transport wrappers: `SimpleTransport(logger)` / `ScopedTransport(effect)` — use when building custom transports.

`LogEntry` fields: `id`, `timestamp`, `level`, `message`, `fiberId`, `spans`, `annotations`, `cause`

#### SessionService

```ts
interface SessionService {
  readonly create: (params: CreateSessionParams) => Effect.Effect<Session, SessionCreationError>;
  readonly get: (id: string) => Effect.Effect<Session, SessionNotFoundError>;
  readonly list: Effect.Effect<ReadonlyArray<Session>>;
  readonly remove: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly setActive: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly getActive: Effect.Effect<Session | null>;
}
```

`Session`: `{ id, name, workingDirectory, createdAt, model? }`

#### WebSocketService

```ts
interface WebSocketService {
  readonly connect: (url: string) => Effect.Effect<void, WebSocketConnectionError>;
  readonly disconnect: Effect.Effect<void, WebSocketError>;
  readonly send: (message: WsMessage) => Effect.Effect<void, WebSocketError>;
  readonly messages: Stream.Stream<WsMessage, WebSocketError>;
  readonly isConnected: Effect.Effect<boolean>;
}
```

#### FileSystemService

```ts
interface FileSystemService {
  readonly listDirectory: (
    path: string
  ) => Effect.Effect<ReadonlyArray<FileEntry>, FileSystemError | DirectoryNotFoundError>;
  readonly getParentDirectory: (path: string) => Effect.Effect<string>;
  readonly isDirectory: (path: string) => Effect.Effect<boolean, FileSystemError>;
}
```

`FileEntry`: `{ name, path, isDirectory, size?, modifiedAt? }`

#### ClipboardService

```ts
interface ClipboardService {
  readonly copy: (text: string) => Effect.Effect<void, ClipboardError>;
  readonly paste: Effect.Effect<string, ClipboardError>;
}
```

Error types exported: `WebSocketError`, `WebSocketConnectionError`, `SessionNotFoundError`, `SessionCreationError`, `FileSystemError`, `DirectoryNotFoundError`, `ClipboardError`, `ApiError`

### Desktop System

| Export              | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| **DesktopProvider** | Root context wrapping a `DesktopAdapter`                              |
| `useDesktop`        | Returns `UseDesktopReturn` — file dialogs, `DesktopCapability` checks |
| **WebAdapter**      | Browser-compatible adapter                                            |
| **ElectronAdapter** | Electron bridge adapter                                               |
| `DesktopCapability` | Enum of optional capabilities                                         |

Types: `DesktopAdapter`, `FileDialogOptions`

### Layouts

| Component            | Description                      |
| -------------------- | -------------------------------- |
| **OnboardingLayout** | Full-page onboarding flow        |
| **ChatLayout**       | Two-pane chat application layout |

### Views (in-package)

| Export           | Description                               |
| ---------------- | ----------------------------------------- |
| **ViewSwitcher** | Toggle between list/grid/kanban renderers |

Types: `ViewMode`, `ViewModeConfig`, `ViewRendererProps`, `ViewSwitcherProps`, `ViewRendererMap`

### Server Utilities

| Export                  | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `createNavigableRouter` | Express/Hono-compatible router for navigable actions     |
| `generateMCPTools`      | Generate MCP tool definitions from navigable registry    |
| `routeMCPToolCall`      | Route an incoming MCP tool call to the correct navigable |
| `buildToolName`         | Construct an MCP tool name from navigable + action       |

Types: `NavigableRouterOptions`, `NavigableRouterHandle`, `IncomingRequest`, `ServerResponse`, `NextFunction`, `MCPToolDefinition`

### MCP Server

- File: `mcp-server.js`
- Config: `.mcp.json` (server name: `hyperkit-docs`)
- Transport: stdio
- Tools:
  - `search_components` — fuzzy search `llms-full.txt` by keyword
  - `get_component` — lookup a component by exact name
- Resources:
  - `file:///llms.txt` — component API index
  - `file:///llms-full.txt` — full API with examples

### Editor / Schema Introspection

`introspectSchema` (from `src/editor/`) — prop introspection for schema-driven UI generation.

### Typography

`useKnuthPlass` — Knuth-Plass optimal line-breaking algorithm hook.

### Utils

`validateProps(schema, props)` — runtime prop validation with `PropRule` / `PropSchema`.

### Token Map Helpers

Re-exported from `src/primitives/layout`:

| Function        | Type alias        |
| --------------- | ----------------- |
| `mapSpace`      | `SpaceToken`      |
| `mapBg`         | `BgToken`         |
| `mapTextColor`  | `TextColorToken`  |
| `mapRadius`     | `RadiusToken`     |
| `mapShadow`     | `ShadowToken`     |
| `mapZ`          | `ZToken`          |
| `mapFontSize`   | `FontSizeToken`   |
| `mapFontWeight` | `FontWeightToken` |
| `resolveSize`   | —                 |

---

## Packages

The monorepo contains 16 packages under `packages/`.

### @ybouhjira/hyperkit-llm-pipeline (`packages/llm-pipeline`)

Multi-LLM orchestration framework. Peer dep: `effect ^3.0.0`.

- `LlmProvider` — Effect `Context.Tag` with `call(request) => Effect<LlmResponse, LlmError>`
- `CliProvider` — Layer routing to Claude CLI or Gemini CLI by model name
- `MockProvider(responses | fn)` — Layer factory for testing
- `Step` / `defineStep` — typed pipeline step with Effect Schema validation + retry
- `Pipeline.from/pipe/run` — linear step composition with full trace
- `Trace` — per-step and aggregate token/cost/duration tracking
- Pricing: opus $15/$75, sonnet $3/$15, haiku $0.25/$1.25, gemini $0/$0
- 25+ tests
- **Note:** `CliProvider` uses `execFileSync` (synchronous). Streaming support planned.

### @ybouhjira/hyperkit-ai-renderer (`packages/ai-renderer`)

Transforms raw data/intent into validated HyperKit UI schemas via cheap LLM. Peer dep: `effect ^3.0.0`.

- `renderData(intent, options?)` — main entry: intent string → `SectionContent[]` + trace
- `rendererStep(options?)` — `Step<string, SectionContent[]>`, default model: haiku
- `CONTENT_TYPE_CATALOG` — compressed system prompt with all 18 content type specs
- `extractJson()` — strips markdown code fences from LLM output
- 30+ tests using MockProvider
- Depends on: `hyperkit-llm-pipeline` + `hyperkit-mcp`

### @ybouhjira/hyperkit-mcp (`packages/mcp`)

Effect-TS based MCP (Model Context Protocol) server framework. Peer dep: `effect ^3.0.0`, `@modelcontextprotocol/sdk ^1.27.1`.

- `defineTool<A, I>()` — tool definition with Effect Schema input validation
- `makeServer(config)` — creates MCP Server, wires tool handlers
- `connectStdio(server)` — stdio transport
- `ContentSchema.ts` — 18 Effect Schema definitions for all HyperKit UI content types
- `ReportSchema.ts` — full structured report schema

### @ybouhjira/hyperkit-devtools (`packages/devtools`)

CSS inspector + component tree panel. Production-safe (disabled in PROD builds).

- Sub-export: `@ybouhjira/hyperkit-devtools/explorer` — embeddable `InspectorPanel` for the Explorer
- Engine components: `ComponentIdentifier` (69+ BEM prefixes), CSS parser, `CssVariableTracer`, `StylesheetMatcher`, `TokenRegistry`
- Hooks: `useKeyboardShortcut` (Ctrl+Shift+D toggle), `useInspectMode`, `useComponentTree`, `useCssVarTrace`, `useElementStyles`
- 4 tabs: Inspect, Styles, Tokens, Tree
- 5 test files
- Peer deps: `solid-js ^1.8.0`
- Depends on: `@ybouhjira/hyperkit`

### @ybouhjira/explorer (`packages/explorer`)

Storybook alternative built with SolidJS. Port 6007.

- 3 story types: Component, Service, Algorithm
- Control system: text, number, boolean, select, json
- Auto-discovers stories via `import.meta.glob`
- CSF compatibility layer (converts Storybook `.stories.tsx` format)
- Output panel: console capture + action log
- PM views: Board, Dashboard, Graph, Kanban, Timeline
- 11 test files, ~95 tests
- Depends on: `@ybouhjira/hyperkit`, `diagram-core`, `diagram-svg`, `diagram-solid`

Run: `cd packages/explorer && pnpm dev`

### @ybouhjira/diagram-core (`packages/diagram-core`)

Framework-agnostic graph engine. Peer dep: `effect ^3.0.0`.

- Graph model with branded ID types (`Effect.Brand`)
- Layout algorithms: Dagre hierarchical (`./layout/hierarchical/dagre`), D3 force-directed (`./layout/force/d3-force`)
- Edge routing: straight (`./edge/straight`), bezier (`./edge/bezier`), step (`./edge/step`)
- Port validation, shape registry, serialization
- Group operations for node hierarchies
- 70+ tests

### @ybouhjira/diagram-svg (`packages/diagram-svg`)

Vanilla SVG renderer for diagram-core. Peer dep: `effect ^3.0.0`.

- Pan/zoom viewport controller
- Themeable (light/dark), grid overlay
- Arrow markers: triangle, diamond, circle, vee, tee
- 4 test files
- Depends on: `@ybouhjira/diagram-core`

### @ybouhjira/diagram-solid (`packages/diagram-solid`)

SolidJS bindings for diagram-core. Peer deps: `effect ^3.0.0`, `solid-js ^1.8.0`.

Components: `DiagramProvider`, `Diagram`, `Controls`, `MiniMap`, `NodePalette`, `ContextMenu`, `ConnectionEditor`

13 hooks: `useDiagram`, `useLayout`, `useSelection`, `useGraphQuery`, `useEditMode`, `useHistory`, `useClipboard`, `useViewport`, `useKeyboardShortcuts`, `usePortConnection`, `useNodePalette`, `useContextMenu`, `useGroups`

- 7 test files
- CSS: import `@ybouhjira/diagram-solid/dist/index.css`

### @ybouhjira/hyperkit-views (`packages/views`)

Schema-driven view generation from Effect Schema. Peer deps: `effect ^3.0.0`, `solid-js ^1.8.0`.

- Blueprint annotation system — annotate Effect Schemas to drive rendering
- Slot-based rendering: kind × shape → slot
- Field state management, drag-drop, inline editing
- FLIP animations, skeleton loading states
- Vite plugin for compile-time code generation: `import { hyperkitViewsPlugin } from "@ybouhjira/hyperkit-views/vite"`
- 19 test files

### @ybouhjira/eslint-plugin-hyperkit (`packages/eslint-plugin-hyperkit`)

ESLint plugin enforcing HyperKit conventions. Peer dep: `eslint ^9.0.0`.

6 rules:

- `no-hardcoded-colors` — reject hex/rgb in CSS-in-JS or inline styles
- `no-hardcoded-font-size` — require font-size tokens
- `no-hardcoded-spacing` — require spacing tokens
- `no-important` — ban `!important`
- `require-keyed-show` — `<Show>` must have a key when wrapping lists
- `no-props-assign-outside-jsx` — props must not be mutated outside JSX

---

## CSS Token Quick Reference

### Spacing

| Token            | Value | Use              |
| ---------------- | ----- | ---------------- |
| `--sk-space-2xs` | 2px   | Hairline gaps    |
| `--sk-space-xs`  | 4px   | Tight padding    |
| `--sk-space-sm`  | 8px   | Compact spacing  |
| `--sk-space-md`  | 16px  | Standard padding |
| `--sk-space-lg`  | 24px  | Section spacing  |
| `--sk-space-xl`  | 32px  | Large gaps       |
| `--sk-space-2xl` | 48px  | Hero sections    |
| `--sk-space-3xl` | 64px  | Empty states     |

### Colors

| Token                                                        | Use                    |
| ------------------------------------------------------------ | ---------------------- |
| `--sk-bg-primary`                                            | Main background        |
| `--sk-bg-secondary`                                          | Cards, inputs          |
| `--sk-bg-tertiary`                                           | Hover, subtle fills    |
| `--sk-bg-elevated`                                           | Floating surfaces      |
| `--sk-text-primary`                                          | Main text              |
| `--sk-text-secondary`                                        | Descriptions           |
| `--sk-text-muted`                                            | Hints, timestamps      |
| `--sk-border`                                                | Standard borders       |
| `--sk-border-subtle`                                         | Faint dividers         |
| `--sk-accent`                                                | Primary action color   |
| `--sk-accent-hover`                                          | Accent hover state     |
| `--sk-accent-muted`                                          | Accent background tint |
| `--sk-success` / `--sk-warning` / `--sk-error` / `--sk-info` | Status colors          |

### Typography

| Token                 | ~Size | Use                    |
| --------------------- | ----- | ---------------------- |
| `--sk-font-size-xs`   | 10px  | Tiny labels            |
| `--sk-font-size-sm`   | 12px  | Secondary text, badges |
| `--sk-font-size-base` | 14px  | Body text, inputs      |
| `--sk-font-size-lg`   | 16px  | Slightly larger        |
| `--sk-font-size-xl`   | 18px  | Headings               |
| `--sk-font-size-2xl`  | 24px  | Large headings         |

### Radius

| Token            | Value |
| ---------------- | ----- |
| `--sk-radius-sm` | 4px   |
| `--sk-radius-md` | 8px   |
| `--sk-radius-lg` | 12px  |
| `--sk-radius-xl` | 24px  |

### Component Heights

`--sk-height-xs` (24px), `--sk-height-sm` (28px), `--sk-height-md` (32px), `--sk-height-lg` (40px), `--sk-height-xl` (48px)

### Motion

`--sk-duration-fast` (150ms), `--sk-duration-normal` (200ms), `--sk-duration-slow` (300ms)
`--sk-ease-default`, `--sk-ease-out`, `--sk-ease-bounce`

### Icons

`--sk-icon-xs` (12px), `--sk-icon-sm` (14px), `--sk-icon-md` (16px), `--sk-icon-lg` (20px), `--sk-icon-xl` (24px)

### Panel system

`--sk-panel-header-padding` (`2px 8px`), `--sk-panel-border-radius` (4px), `--sk-panel-resize-handle-size` (6px). Added with the 2026-04-29 SCSS → plain CSS migration. Panels also reuse `--sk-duration-fast` / `--sk-duration-normal` / `--sk-ease-default` for transitions (no hardcoded `0.15s ease`).

---

## Top 10 Composition Patterns

1. **Page Layout**: `<Flex column> <Stack> Header + Content </Stack> </Flex>`
2. **Card Grid**: `<Grid columns={3}> <For each={items}> <Card> <Text> + <Badge> </For>`
3. **Form**: `<Stack spacing="md"> <Input> + <Select> + <Button>`
4. **Dashboard**: `<DashboardContainer> <MetricCard> + <WaterfallChart>`
5. **Settings Page**: `<Tabs> <Stack> <Switch> / <Select> / <Input>`
6. **Data Table**: `<Stack> <SearchInput> + <Table sort filter> + pagination`
7. **Chat**: `<ChatLayout> <MessageList> + <MessageInput> + <ToolApproval>`
8. **File Browser**: `<Flex> <Sidebar> <FileExplorer> + <PanelContainer>`
9. **Modal Flow**: `<Dialog> <Stack> <ProgressBar steps> + form content`
10. **Notification**: `<Toast.Provider> + <Badge count> + <Dropdown list>`

---

## Conventions

- Import from `@ybouhjira/hyperkit` (never internal paths)
- SolidJS patterns: `createSignal`, `Show`, `For`, `splitProps` — never destructure props
- CSS tokens for ALL visual values — no raw px, hex, or rgb in components
- Component files: kebab-case (`date-picker.tsx`), components: PascalCase
- Hooks: camelCase with `use` prefix (`useDisclosure`)
- One component per directory; co-locate `.test.tsx` and `.stories.tsx`
- Effect for business logic — no raw `try/catch` in services
- All accessibility via @kobalte/core primitives
- `customProperties` in `ThemeConfig` → `--sk-custom-{key}` CSS vars
- Props interfaces: `{Component}Props` co-located with component file
- Every component accepts a `style` prop (`JSX.CSSProperties`)
- No `any` — use `unknown` with type guards
- Strict mode: `noUncheckedIndexedAccess`, `noImplicitReturns`

---

## File Structure

```
src/
├── primitives/     # 68 basic building blocks (layout, input, display, feedback)
├── composites/     # 44 complex components (chat, navigation, data, utilities)
├── hooks/          # SolidJS hooks (breakpoint, mode, events, LLM, haptic, logger)
├── panels/         # IDE panel system (4 public exports + hooks)
├── report/         # Schema-driven report builder (15 exports)
├── navigation/     # NavigableRegistry framework (55+ exports)
├── theme/          # ThemeProvider, presets, useTheme
├── animation/      # Transition, ScrollReveal, AnimateOnScroll
├── keyboard/       # KeyboardProvider, useShortcut, ShortcutsHelp
├── effects/        # Effect services (WebSocket, Session, FileSystem, Clipboard, Logging)
├── editor/         # introspectSchema — prop introspection for schema-driven UI
├── desktop/        # DesktopProvider, WebAdapter, ElectronAdapter
├── layouts/        # OnboardingLayout, ChatLayout
├── icons/          # Icon + named icon components
├── views/          # ViewSwitcher (list/grid/kanban view toggle)
├── typography/     # useKnuthPlass — Knuth-Plass line breaking
├── server/         # createNavigableRouter, generateMCPTools
├── tokens/         # tokens.css (heights, durations, easings, line-heights)
└── index.ts        # All public exports

packages/
├── llm-pipeline/   # @ybouhjira/hyperkit-llm-pipeline — multi-LLM orchestration (Effect-TS)
├── ai-renderer/    # @ybouhjira/hyperkit-ai-renderer — data→UI schema via cheap LLM
├── mcp/            # @ybouhjira/hyperkit-mcp — Effect-TS MCP server framework
├── devtools/       # @ybouhjira/hyperkit-devtools — CSS inspector, component tree
├── explorer/       # @ybouhjira/explorer — Storybook alternative (port 6007)
├── diagram-core/   # @ybouhjira/diagram-core — framework-agnostic graph engine
├── diagram-svg/    # @ybouhjira/diagram-svg — SVG renderer for diagram-core
├── diagram-solid/  # @ybouhjira/diagram-solid — SolidJS diagram bindings
├── views/          # @ybouhjira/hyperkit-views — schema-driven view generation
├── editor/         # @ybouhjira/hyperkit-editor — WYSIWYG component tree editor
├── eslint-plugin-hyperkit/ # @ybouhjira/eslint-plugin-hyperkit — 6 lint rules
```

---

## Commands

```bash
# Main package (hyperkit)
npm run dev              # Vite dev server
npm run build            # TypeScript + Vite build → dist/
npm run test             # Run all tests (vitest)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (50% threshold)
npm run quality          # Full gate: format + lint + css-lint + test + build + publint + attw + size + knip
npm run lint             # ESLint
npm run lint:css         # Stylelint
npm run format           # Prettier write
npm run size             # Bundle size check (JS ≤ 250 kB, CSS ≤ 30 kB)
npm run knip             # Find unused exports
npm run audit:css-vars   # Validate CSS variable usage

# Explorer (Storybook alternative)
cd packages/explorer && pnpm dev    # Port 6007

# Individual package tests
cd packages/diagram-core && npm test
cd packages/diagram-solid && npm test
cd packages/views && npm test
cd packages/devtools && npm test
```

---

## Package Info

- **Name**: `@ybouhjira/hyperkit`
- **Version**: 3.4.1
- **Peer deps**: `solid-js ^1.8.0`, `@kobalte/core ^0.13.0`, `effect ^3.0.0`
- **Registry**: npmjs.org (public)
- **Exports**: `@ybouhjira/hyperkit` (JS) + `@ybouhjira/hyperkit/dist/index.css` (CSS)
- **Tests**: 5,000+ tests across main package + all sub-packages
