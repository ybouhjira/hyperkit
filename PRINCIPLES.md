# HyperKit Design Principles

## Core Philosophy

**A few big, scalable components is better than many small ones.**

Every component should work like a video player: usable as a minimal 3-control preview, but capable of scaling to a full Netflix/YouTube experience with playlists, chapters, subtitles, and quality selection — all from the same import.

Features you don't use must cost zero bundle size (tree-shaking + conditional rendering). A component's minimal form should be as light as a purpose-built small component.

## The Feature Scale

Every component has a **feature scale** — a spectrum from minimal to maximal:

```
Minimal ──────────────────────────────────── Maximal

Progress:  bar          ring          ring + label + animation + steps
Chat:      message list + input       + tools + sessions + AI + cost tracking
DataView:  table        + sort/filter + kanban + tree view + gallery
Navigation: links       + sidebar     + mobile drawer + command palette
Report:    sections     + nav + score + schema-driven rendering
```

Consumers pick their point on the scale via props and sub-components. The API should make the minimal case trivial:

```tsx
// Minimal — just works
<Progress value={62} />

// Scaled up — same component
<Progress value={62} variant="ring" size="lg" showLabel animated />
```

## Component Design Rules

### 1. Scale, don't split

When adding a new feature to a domain, add it to the existing component as an opt-in prop or sub-component. Don't create a new top-level export.

**Do:** `<Progress variant="ring" />` — one component, two shapes.
**Don't:** `<ProgressBar />` and `<ProgressRing />` — same concept split in two.

### 2. Compound components for complex features

Big components expose sub-components for composition:

```tsx
// Simple — just use the root
<Chat messages={msgs} onSend={send} />

// Full — compose sub-components
<Chat>
  <Chat.SessionTabs sessions={sessions} />
  <Chat.MessageList messages={msgs} />
  <Chat.ToolApproval pending={tools} />
  <Chat.Input onSend={send} />
  <Chat.StatusBar model="gpt-4" cost={0.12} />
</Chat>
```

Unused sub-components are tree-shaken from the bundle.

### 3. Props over components for variants

If two things share 80%+ of their logic/styling, they should be one component with a prop:

- `variant` for visual differences (bar/ring, error/empty/info)
- `size` for scale (sm/md/lg)
- `features` or boolean props for opt-in capabilities

### 4. Token-first, always

No raw CSS values in components. Everything flows through `--sk-*` CSS custom properties. This enables full theming without code changes.

Two-tier variable system:

```css
.sk-btn {
  /* Component var → falls back to theme token */
  background: var(--sk-btn-bg, var(--sk-accent));
}
```

### 5. Schema-driven for data-heavy components

Components that render structured data (reports, dashboards, data views) should accept a typed JSON schema. This enables:

- Server-side content generation
- Dynamic content without JSX
- Serializable configurations

```tsx
<Report schema={architectureReviewSchema} />
<DataView schema={tableSchema} view="kanban" />
```

## Backwards Compatibility

### Migration rules (non-negotiable)

When merging components:

1. **Old imports must still work.** Re-export the old name as an alias:

   ```tsx
   // Old: import { ProgressBar } from '@ybouhjira/hyperkit'
   // New: ProgressBar is re-exported as alias
   export { Progress as ProgressBar } from './Progress';
   ```

2. **Old props must still work.** Accept legacy prop names alongside new ones. Use runtime mapping, not breaking changes:

   ```tsx
   // If ProgressBar had `percent` and Progress uses `value`:
   const resolvedValue = props.value ?? props.percent;
   ```

3. **Deprecation warnings in dev only.** Use SolidJS `DEV` flag:

   ```tsx
   if (DEV && props.percent !== undefined) {
     console.warn('ProgressBar: `percent` is deprecated, use `value` instead');
   }
   ```

4. **One major version for removal.** Deprecated aliases stay for one full major version (e.g., deprecated in 3.0, removed in 4.0).

5. **No visual regressions.** Merged components must render identically to their predecessors for existing prop combinations. The CSS comparison test validates this.

### Merge phases

- **Phase 1 (safe):** Re-export aliases, no code changes. Zero risk.
- **Phase 2 (consolidate):** Unify internals, keep all old APIs working via mapping.
- **Phase 3 (clean up):** Remove deprecated aliases in next major version.

## Component Inventory Target

The library should converge toward ~25 exports (from current ~69):

### Primitives (~15)

| Component     | Absorbs                                 |
| ------------- | --------------------------------------- |
| **Box**       | (layout foundation)                     |
| **Flex**      | Center                                  |
| **Stack**     | (vertical layout)                       |
| **Grid**      | MasonryGrid                             |
| **Text**      | (typography)                            |
| **Button**    | SplitButton                             |
| **Input**     | SearchInput, Textarea                   |
| **Select**    | (dropdown selection)                    |
| **Badge**     | Kbd, SuggestionChips                    |
| **Card**      | ProjectCard                             |
| **Progress**  | ProgressBar, ProgressRing               |
| **Indicator** | StatusDot, ColorDot, StreamingIndicator |
| **Alert**     | ErrorBanner, EmptyState                 |
| **Dialog**    | (modal)                                 |
| **Tooltip**   | (popover)                               |

### Composites (~10)

| Component          | Absorbs                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chat**           | ChatWindow, LLMChatBox, MessageBubble, MessageList, MessageInput, SessionTabs, SessionSearch, SessionIndicator, ToolApproval, ToolExecution, SubagentTracker, CostTracker, ModelSelector, PromptQueue |
| **Navigation**     | Sidebar, MobileNav, MenuBar, Breadcrumb, MobilePanelView, TabBar                                                                                                                                      |
| **DataView**       | Table, KanbanBoard, FileExplorer                                                                                                                                                                      |
| **Report**         | (already consolidated — schema-driven)                                                                                                                                                                |
| **Settings**       | SettingsPanel + sub-panels                                                                                                                                                                            |
| **CommandPalette** | (standalone — unique interaction pattern)                                                                                                                                                             |
| **ContextMenu**    | (standalone — unique trigger)                                                                                                                                                                         |
| **Toast**          | (standalone — portal-based)                                                                                                                                                                           |
| **Panels**         | PanelContainer, PanelGroup, PanelResizeHandle                                                                                                                                                         |

### System (~5, not components)

- **ThemeProvider** + useTheme + presets
- **KeyboardProvider** + useShortcut
- **AnimationProvider** + Transition
- **Effect services** (WebSocket, Session, FileSystem, Clipboard)

## Size Budget

- **JS:** ≤ 180 kB (total bundle)
- **CSS:** ≤ 20 kB (total bundle)
- **Per-component guideline:** No single component should exceed 15 kB gzipped when tree-shaken
- **Tree-shaking is mandatory:** Unused sub-features must not appear in the bundle

## Storybook Requirements

Every component must be fully explorable in Storybook. Developers should never need to read source code to understand what a component can do.

### Every prop gets a control

All exported props must have a Storybook control (argType) so devs can toggle them live:

```tsx
// Button.stories.tsx
argTypes: {
  variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
  size: { control: 'select', options: ['sm', 'md', 'lg'] },
  loading: { control: 'boolean' },
  disabled: { control: 'boolean' },
  fullWidth: { control: 'boolean' },
}
```

### Story structure for scalable components

Components with a feature scale need stories that demonstrate each level:

```
Progress/
  ├── Minimal.stories.tsx      — bar with just a value
  ├── Ring.stories.tsx          — ring variant with label
  ├── WithSteps.stories.tsx     — multi-step progress
  ├── Animated.stories.tsx      — all animation options
  └── Playground.stories.tsx    — all controls exposed
```

The **Playground** story is mandatory for every component — it exposes every single prop as a control so devs can freely experiment.

### Required story types

| Story Type      | Purpose                                   | Required?                       |
| --------------- | ----------------------------------------- | ------------------------------- |
| **Default**     | Simplest possible usage, minimal props    | Yes                             |
| **Playground**  | All props exposed as controls             | Yes                             |
| **Variants**    | Every visual variant side by side         | Yes, if variants exist          |
| **Sizes**       | Every size option side by side            | Yes, if sizes exist             |
| **States**      | Disabled, loading, error, empty, etc.     | Yes, if states exist            |
| **Composition** | Sub-component composition patterns        | Yes, for compound components    |
| **Responsive**  | How the component adapts to screen sizes  | Yes, for layout components      |
| **Theming**     | Component rendered across multiple themes | Yes, for themed components      |
| **Realistic**   | Production-like data and context          | Yes, for data-driven components |

### Data-driven components need real mock data

Components like Chat, DataView, and Report must have stories with realistic mock data — not `"Lorem ipsum"` or `"Test item 1"`. Mock data should represent actual use cases:

```tsx
// Good — realistic
const messages = [
  { role: 'user', content: 'How do I deploy to production?' },
  { role: 'assistant', content: 'Run `npm run deploy`...', tools: [...] },
];

// Bad — meaningless
const messages = [
  { role: 'user', content: 'Test message 1' },
  { role: 'assistant', content: 'Test response 1' },
];
```

### Interactive stories for complex components

Compound components (Chat, Navigation, DataView) need interactive stories where actions trigger state changes — not just static renders. Use Storybook actions and state management:

- Chat: type a message → it appears in the list
- DataView: click a column header → rows sort
- Navigation: click a link → active state changes
- Report: switch theme → entire report re-renders

### Storybook as the visual regression baseline

Storybook stories serve as the source of truth for visual testing. The CSS comparison and pixel-diff tests render Storybook stories in Playwright. If a story doesn't exist for a state, that state can't be visually tested.

## Quality Gate

Every component must pass before merge:

- `npm run quality` (format + lint + CSS lint + test + build + size + publint + attw + knip)
- Visual regression test (CSS comparison + pixel diff) for components with reference designs
- Backwards compatibility test (old import paths + old props still work)
