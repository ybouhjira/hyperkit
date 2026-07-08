# GitHub Copilot Instructions for HyperKit

## Project Context

HyperKit is a SolidJS component library — **not React**. Package: `@ybouhjira/hyperkit` v2.5.0.
Peer dependencies: `solid-js ^1.8.0`, `@kobalte/core ^0.13.0`, `effect ^3.0.0`.
Bundle limits: JS ≤ 250 kB, CSS ≤ 30 kB.

---

## Critical: SolidJS — Not React

| React                     | SolidJS (correct)                            |
| ------------------------- | -------------------------------------------- |
| `useState()`              | `createSignal()`                             |
| `useEffect()`             | `createEffect()`                             |
| `useMemo()`               | `createMemo()`                               |
| `{cond && <X>}`           | `<Show when={cond}>`                         |
| `{arr.map()}`             | `<For each={arr}>`                           |
| Destructure props         | `props.value` (never destructure)            |
| Rerenders on state change | Components run once; only signals re-execute |

Key rules:

- Access signal values with `()` — write `count()`, not `count`
- NEVER destructure props — kills reactivity
- Use `splitProps()` to separate component-specific props from HTML attributes
- Use `mergeProps()` for default prop values
- Use `<Switch>` / `<Match>` for multi-branch conditionals

---

## Import Pattern

Always import from package root:

```ts
import { Button, Stack, Card, useTheme } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css'; // once at app entry
```

Never from internal paths:

```ts
// ❌ import { Button } from "@ybouhjira/hyperkit/src/primitives/Button";
```

---

## Available Components

### Primitives

**Layout:** `Box`, `Flex`, `Stack`, `Grid`, `Wrap`, `Center`, `Container`, `Spacer`, `AspectRatio`, `Section`

**Input:** `Button`, `Input`, `Select`, `Switch`, `NumberInput`, `SearchInput`, `ColorInput`, `RangeSlider`, `Slider`, `Checkbox`, `TagInput`, `DateInput`, `FileInput`, `ImageInput`, `VideoInput`, `AudioInput`, `RecordButton`

**Display:** `Text`, `Badge`, `Card`, `MetricCard`, `ProjectCard`, `StatusDot`, `ProgressBar`, `ProgressRing`, `Skeleton`, `Spinner`, `Tooltip`, `Kbd`, `Separator`, `ColorDot`, `StreamingIndicator`, `StreamingText`

**Data:** `Table`, `ScrollArea`, `MasonryGrid`, `MediaGrid`

**Feedback:** `Dialog`, `EmptyState`, `ErrorBanner`, `DropZone`

**Rich content:** `Markdown`, `CodeBlock`, `TerminalOutput`, `DocumentPage`, `ImagePreview`

**Navigation:** `Tabs`, `Accordion`, `Collapsible`, `Dropdown`, `Popover`

**Charts/Viz:** `Sparkline`, `SegmentedBar`, `WaterfallChart`, `SignalGrid`

**Other:** `SuggestionChips`, `FilterChip`, `Timeline`

### Composites

**Chat/AI:** `ChatWindow`, `LLMChatBox`, `MessageBubble`, `MessageList`, `MessageInput`, `ToolApproval`, `ToolExecution`, `SubagentTracker`, `CostTracker`, `PromptQueue`

**Navigation:** `Breadcrumb`, `MenuBar`, `Sidebar`, `TabBar`, `CommandPalette`, `ContextMenu`, `MobileNav`, `NavigationMenu`

**Layout systems:** `DashboardContainer`, `DashboardGrid`, `MobilePanelView`, `SettingsPanel`

**Sessions:** `SessionManager`, `SessionTabs`, `SessionSearch`, `SessionIndicator`

**File/Project:** `FileExplorer`, `DirectoryPicker`, `RepoCard`, `ProjectDashboard`

**Data:** `KanbanBoard`, `IssueBoard`

**Forms:** `ActionForm`, `ConfirmDialog`, `SplitButton`, `ModelSelector`, `ModeSwitcher`

**Status:** `StatusBar`, `StatBar`, `ConnectionStatus`, `Toast`

**Theme:** `ThemeBuilder`, `ThemePickerModal`, `ThemeProvider`, `ThemePicker`, `FontSelect`

**Other:** `GuidedTour`, `MediaTrimmer`, `ExamBuilder`

### Report Components

`Report`, `ReportShell`, `ReportNav`, `ReportHero`, `ReportSection`, `ReportScoreCard`, `SummaryGrid`, `FlowDiagram`, `LayerStack`, `GapAnalysis`, `PackageTree`, `PresetGrid`, `SourceList`, `ReportFooter`

### Panel System

`PanelContainer`, `PanelGroup`, `PanelResizeHandle`, `PanelDropZone`, `usePanelLayout`

### Keyboard Shortcuts

`KeyboardProvider`, `useKeyboard`, `useShortcut`, `useShortcuts`, `KeyboardScope`, `ShortcutsHelp`

### Hooks

`useBreakpoint`, `useMode`, `createEffectResource`, `createEffectStream`, `useEventBus`, `useHaptic`, `useVideoPreview`, `createLLMUIController`

### Navigation / Navigable System

`NavigationProvider`, `useNavigation`, `createNavigable`, `registerNavigable`, `dispatchAction`, `NavigationMenu`

### Effects (service layer)

`WebSocketService`, `SessionService`, `FileSystemService`, `ClipboardService`

### Animation

`AnimationProvider`, `Transition`, `ScrollReveal`, `AnimateOnScroll`

---

## CSS Token System — NEVER hardcode values

```css
/* Spacing */
--sk-space-2xs  --sk-space-xs  --sk-space-sm  --sk-space-md
--sk-space-lg   --sk-space-xl  --sk-space-2xl --sk-space-3xl

/* Colors */
--sk-bg-primary  --sk-bg-secondary  --sk-bg-tertiary
--sk-text-primary  --sk-text-secondary  --sk-text-muted
--sk-border  --sk-accent
--sk-success  --sk-warning  --sk-error  --sk-info

/* Typography */
--sk-font-size-xs  --sk-font-size-sm  --sk-font-size-base
--sk-font-size-md  --sk-font-size-lg  --sk-font-size-xl

/* Border radius */
--sk-radius-sm  --sk-radius-md  --sk-radius-lg  --sk-radius-xl

/* Component heights */
--sk-height-xs  --sk-height-sm  --sk-height-md  --sk-height-lg  --sk-height-xl

/* Animation */
--sk-duration-fast  --sk-duration-normal  --sk-duration-slow
--sk-ease-default  --sk-ease-out  --sk-ease-bounce
```

Component-level override pattern:

```css
.sk-btn {
  background: var(--sk-btn-bg, var(--sk-bg-secondary));
  /* Component var first → falls back to theme token */
}
```

---

## Component Design Principles

Components follow a **feature scale** — minimal to maximal via props:

```tsx
// Minimal — just works
<Progress value={62} />

// Scaled up — same component
<Progress value={62} variant="ring" size="lg" showLabel animated />
```

- Prefer `variant` / `size` / boolean props over separate components for variants
- Use compound sub-components for complex composition (e.g. `<Chat.MessageList>`)
- Unused sub-components are tree-shaken from the bundle

---

## Testing

Framework: `vitest` + `@solidjs/testing-library`. Tests co-located as `Component.test.tsx`.

```tsx
import { render, screen } from '@solidjs/testing-library';
import { Button } from '@ybouhjira/hyperkit';

it('renders label', () => {
  render(() => <Button>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
});
```

Coverage thresholds: 50% statements/lines/functions, 40% branches.

---

## Conventions

- Props interfaces: `{Component}Props`, exported from component file
- Every component accepts `style?: JSX.CSSProperties`
- `Box`, `Text`, `Button` support `as` prop (polymorphic rendering)
- Use `SpaceToken` string values (`'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'`) not raw `px`
- Import order: `solid-js` → `@kobalte/*` → `effect` → internal (`@/*`) → relative (`./`)
- File names: kebab-case. Component names: PascalCase. Hook names: camelCase with `use` prefix.
- Strict TypeScript — no `any`, use `unknown` with type guards

---

## Quality Gate

```bash
npm run quality   # full check: format + lint + css-lint + audit-css-vars + test + build + publint + attw + size + knip
npm run test      # vitest run
npm run build     # tsc + vite build
npm run lint:css  # stylelint CSS files
npm run audit:css-vars  # validate all CSS variable references
```
