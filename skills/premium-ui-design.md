# Premium UI Design System v5 (Billion-Dollar Product Quality)

> Distilled from studying Linear, Raycast, Superhuman, Vercel, Arc, Figma, Notion, and Slack.
> A reusable design skill — not project-specific.

## The North Star

**If a user can't tell this was made by an indie dev, you've succeeded.**

These products don't share a look — they share a **discipline**. Every pixel earns its place. Every interaction says "we thought about this harder than you'd expect."

---

## PART 1: THE 10 LAWS

### 1. SPEED IS THE FEATURE

_Source: Superhuman targets 50ms internal, claims 100ms. Removing spinners + adding optimistic updates had 10x more impact on perceived speed than actual backend optimization._

- **All interactions under 100ms** — this is the threshold where humans notice delay
- **Target 50-60ms** for critical paths (compose, archive, navigate) — feels like the UI responds BEFORE you finish clicking
- **Optimistic UI everywhere**: remove item from list immediately, sync in background. If it fails, put it back with undo toast
- **Undo > Confirm**: never "Are you sure?" — let users act fast, Z to undo. 5-second undo window
- **Skeleton shimmer** for loading, never spinners. Skeletons feel 20% faster than spinners for identical wait times
- **Key repeat rate**: 65ms (Superhuman overrides macOS default of 100ms)
- **Prefetch predictable content**: if they'll probably click it, load it before they do

### 2. DEPTH THROUGH LAYERS, NOT DECORATION

_Source: Vercel uses pure black #000000 with borders at rgba(255,255,255,0.08). Linear uses LCH color space for perceptually uniform surface tiers._

- Background hierarchy IS your layout — structure should be obvious without labels
- **4 surface tiers** (use SolidKit `surfaces`):
  - `base`: app background (`--sk-bg-primary`)
  - `raised`: cards, sidebar (`--sk-bg-secondary`)
  - `overlay`: modals, command palette (`--sk-bg-elevated`)
  - `sunken`: inset areas, code blocks (`--sk-bg-tertiary`)
- **Borders**: 1px `rgba(255,255,255,0.08)` — barely visible, defines edges without screaming
- **Stronger borders**: `rgba(255,255,255,0.15)` — only for focused/active elements
- **Shadows only float**: modals, dropdowns, command palette. Never on inline cards
- Glass/blur (`backdrop-filter: blur(12px)`) — ONLY for command palette and floating panels

### 3. TYPOGRAPHY DRIVES EVERYTHING

_Source: Linear uses Inter Display for headings + Inter for body. Vercel's Geist: letter-spacing -0.04em on headings. Body text 14px, not 16px._

- **3 sizes max per screen**: heading + body + meta. That's it.
- **Heading**: `--sk-font-size-base` (16px) + `--sk-font-weight-semibold` + `letter-spacing: -0.02em`
  - NOT large. In productivity apps, headings are compact, not hero-sized
- **Body**: `--sk-font-size-sm` (14px) + `--sk-font-weight-regular` — this is the DEFAULT for all UI text
- **Meta/tertiary**: `--sk-font-size-xs` (12px) + `--sk-text-muted` — timestamps, counts, paths
- **Monospace for data**: `--sk-font-code` for token counts, file paths, branch names, IDs, shortcuts
- **Letter-spacing**: `-0.02em` on headings (tighter = premium), `-0.01em` on body
- **Line-height**: `1.375` (`--sk-leading-snug`) for UI, `1.5` for reading content only
- **Weight hierarchy**: semibold (600) for headings, medium (500) for emphasis, regular (400) for body. Never bold (700) in UI text

### 4. COLOR AS INFORMATION, NOT DECORATION

_Source: Linear 2025 redesign "significantly cut back on color, swapping monochrome blue for monochrome black/white with even fewer bold colors." Vercel: two colors, one font, sharp edges, discipline._

- **90% monochrome** — `--sk-bg-*` and `--sk-text-*` only
- **One accent color** — `--sk-accent` for: active sidebar item, primary button, focused input border. Nothing else.
- **Accent presence**: exactly 1-2 spots per screen. If accent is everywhere, it's nowhere
- **Active item pattern**: `--sk-accent-muted` background (12% opacity) + `--sk-accent` 2px left border
- **Unread/attention indicator**: 3px left border in `--sk-accent` (Superhuman pattern — high contrast, no animation)
- **Status colors** (`--sk-success`, `--sk-error`, `--sk-warning`) — ONLY for actual status. Never decorative
- **Avoid pure black** for backgrounds. Use `--sk-bg-primary` which themes handle (Linear uses brand-color-derived dark, not #000)
- Vercel IS the exception (pure #000) — but they pair it with pure #FFF text. The contrast IS the design.

### 5. DENSITY = RESPECT FOR USER'S TIME

_Source: Arc "compresses many UI menu elements to save space." Raycast: "Compact Mode optimized the interface with minimal appearance." Superhuman: 14px body, 11px tertiary._

- **Body text 14px everywhere**. 16px wastes space in productivity apps
- **List items**: 32px height (`--sk-component-height-md`). Not 40px, not 48px
- **Toolbar**: 40px height. Contains: breadcrumb, model pill, meta info
- **Status bar**: 24px height. `--sk-font-size-xs` + `--sk-font-code`
- **Sidebar width**: 200px default, collapsible to 48px icon strip
- **Sidebar item padding**: `--sk-space-xs` (4px) vertical, `--sk-space-sm` (8px) horizontal
- **Section gap**: `--sk-space-md` (16px) between groups. `--sk-space-xs` (4px) between items in a group
- **Truncation mandate**: ALL text in constrained spaces MUST truncate with ellipsis. No wrapping in lists/sidebars
- **Progressive disclosure**: secondary actions appear on hover only. Fewer visible elements = less cognitive load

### 6. MOTION = CONFIDENCE

_Source: Superhuman archive animation: translateX(100px)+opacity:0 over 150ms ease-out. Command palette: spring curve cubic-bezier(0.34,1.56,0.64,1). List reflow: simultaneous slide-up (non-blocking)._

- **All transitions**: 150ms (`--sk-duration-fast`) + `--sk-ease-default` cubic-bezier(0.4,0,0.2,1)
- **Hover states**: background color change over 150ms. NEVER color-only change
- **Active/press**: `scale(0.98)` + slightly darker bg — brief compression = "click registered"
- **Slide-out dismiss**: `translateX(100px) + opacity:0` over 150ms ease-out (Superhuman archive pattern)
- **List reflow**: remaining items slide up simultaneously to fill gap — feels effortless
- **Command palette entry**: scale(0.95→1) + translateY(-8→0) with spring `cubic-bezier(0.34,1.56,0.64,1)` — snappy overshoot
- **Page/view transitions**: content fades in 200ms (`--sk-duration-normal`). Never instant (feels janky), never slow
- **Never bounce** unless celebrating (success state). Bounce = playful. Productivity = precise.
- **Reduced motion**: all durations → 0ms when `prefers-reduced-motion: reduce`

### 7. KEYBOARD-FIRST

_Source: Superhuman's Cmd+K shows shortcut next to every command, creating passive learning. Vim J/K navigation. Key indicator toast on every input. 30-min onboarding drills muscle memory._

- **Every action has a shortcut** — displayed in `--sk-text-muted` next to the action
- **Shortcut display**: `<Badge size="xs" variant="outline" font="mono">⌘K</Badge>`
- **Command palette** (⌘K): glass mode overlay, centered, `--sk-shadow-2xl`, 200ms spring entry
- **Vim navigation**: J/K for up/down in lists, H/L for panel navigation
- **Action shortcuts**: E (archive), R (reply), C (compose), / (search), Z (undo)
- **Key indicator toast**: on every shortcut press, show key + action name briefly (1s fade)
- **Focus rings**: 2px `--sk-accent`, visible ONLY on keyboard navigation (`:focus-visible`, not `:focus`)
- **Tab order**: logical flow — sidebar → toolbar → content → input

### 8. THE SIDEBAR IS SACRED

_Source: Arc's sidebar "is the heart of navigation." Linear redesigned sidebar to "reduce visual noise, maintain alignment, increase hierarchy." Notion's sidebar "is a masterclass in balanced, functional UI."_

- **Sidebar = project list** — this is the primary navigation
- **Structure**: section headers (uppercase, xs, muted) → items (sm, primary) → counts (xs, mono, muted)
- **Active item**: accent-muted bg + 2px left accent border + slightly bolder text
- **Hover**: `--sk-bg-tertiary` background transition 150ms
- **Alignment**: icons, labels, and badges MUST align on their respective baselines. Spend time on this. Linear specifically called out sidebar alignment as a major challenge
- **Collapse behavior**: sidebar collapses to icon strip (48px) — icons remain, labels hide
- **Bottom section**: settings gear + model status indicator (color dot)
- **Scroll**: custom themed scrollbar (`--sk-scroll-*`), thin (6px), only visible on hover

### 9. STATUS IN THE PERIPHERY

_Source: Vercel dashboard status bar. Superhuman's undo toast pattern. Linear's "more neutral and timeless" chrome._

- **Status bar** (bottom 24px): always visible, never demands attention
- **Left**: working directory path (monospace, muted)
- **Center**: git branch + change count (monospace)
- **Right**: model name + connection dot (green=connected, yellow=loading, red=error)
- **Toasts**: slide in from bottom-right, auto-dismiss 5s, include undo action when applicable
- **Progress**: thin accent-colored progress bar at very top of window (1-2px height), like YouTube/GitHub
- **Connection loss**: subtle yellow dot in status bar. NOT a modal. NOT a banner. A dot.
- **Token/cost counter**: monospace in toolbar, updates in real-time, muted color until threshold

### 10. EMPTY STATES ARE FEATURES

_Source: Every billion-dollar app treats "nothing to show" as a design opportunity, not a bug._

- **Centered in content area**: icon (48px, 0.4 opacity) + title (md, secondary) + subtitle (sm, muted) + action button
- **Contextual**: empty project = "Start a conversation with Claude" + model selector. Empty search = "No results" + suggestion
- **Illustration style**: monochrome line art, NOT colorful illustrations. Matches the minimal aesthetic
- **Loading → empty transition**: skeleton shimmer → if empty, crossfade to empty state (never flash both)

---

## PART 2: COMPONENT SPECIFICATIONS

### Sidebar

```css
width: 200px; /* collapsible to 48px */
background: var(--sk-bg-secondary);
border-right: 1px solid rgba(255, 255, 255, 0.08);
padding: var(--sk-space-sm); /* 8px */

/* Section header */
.section-header {
  font-size: var(--sk-font-size-xs); /* 12px */
  font-weight: var(--sk-font-weight-semibold);
  color: var(--sk-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: var(--sk-space-xs) var(--sk-space-sm); /* 4px 8px */
  margin-top: var(--sk-space-md); /* 16px, except first */
}

/* Item */
.sidebar-item {
  height: 32px;
  padding: 0 var(--sk-space-sm); /* 0 8px */
  border-radius: var(--sk-radius-sm); /* 4px */
  font-size: var(--sk-font-size-sm); /* 14px */
  color: var(--sk-text-primary);
  display: flex;
  align-items: center;
  gap: var(--sk-space-sm); /* 8px */
  transition: background var(--sk-duration-fast) var(--sk-ease-default);
  cursor: default; /* not pointer — desktop app convention */
}
.sidebar-item:hover {
  background: var(--sk-bg-tertiary);
}
.sidebar-item.active {
  background: var(--sk-accent-muted);
  border-left: 2px solid var(--sk-accent);
  font-weight: var(--sk-font-weight-medium);
}

/* Badge (unread count) */
.sidebar-badge {
  font-size: var(--sk-font-size-xs);
  font-family: var(--sk-font-code);
  color: var(--sk-text-muted);
  min-width: 20px;
  text-align: right;
}
```

### Toolbar

```css
height: 40px;
background: var(--sk-bg-primary);
border-bottom: 1px solid rgba(255, 255, 255, 0.08);
padding: 0 var(--sk-space-sm); /* 0 8px */
display: flex;
align-items: center;
justify-content: space-between;

/* Title/breadcrumb (left) */
.toolbar-title {
  font-size: var(--sk-font-size-sm);
  font-weight: var(--sk-font-weight-semibold);
  letter-spacing: -0.02em;
}

/* Model pill (center) */
.model-pill {
  height: 24px;
  padding: 0 var(--sk-space-sm);
  background: var(--sk-bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--sk-radius-full); /* pill */
  font-size: var(--sk-font-size-xs);
  font-family: var(--sk-font-code);
  display: flex;
  align-items: center;
  gap: var(--sk-space-xs);
}

/* Meta info (right) */
.toolbar-meta {
  font-size: var(--sk-font-size-xs);
  font-family: var(--sk-font-code);
  color: var(--sk-text-muted);
}
```

### Chat Messages

```css
/* User message */
.msg-user {
  max-width: 80%;
  margin-left: auto;
  padding: var(--sk-space-sm) var(--sk-space-md); /* 8px 16px */
  background: var(--sk-accent-muted);
  border-radius: var(--sk-radius-lg); /* 12px */
  font-size: var(--sk-font-size-sm);
}

/* Assistant message — NO bubble */
.msg-assistant {
  font-size: var(--sk-font-size-sm);
  line-height: var(--sk-leading-normal); /* 1.5 for reading */
  color: var(--sk-text-primary);
}

/* Code block inside message */
.msg-code {
  background: var(--sk-bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--sk-radius-md); /* 8px */
  padding: var(--sk-space-sm); /* 8px */
  font-family: var(--sk-font-code);
  font-size: var(--sk-font-size-xs); /* 12px */
  overflow-x: auto;
}

/* Message spacing */
.msg + .msg {
  margin-top: var(--sk-space-md);
} /* 16px */

/* Timestamp — hover only */
.msg-time {
  font-size: 11px;
  font-family: var(--sk-font-code);
  color: var(--sk-text-muted);
  opacity: 0;
  transition: opacity var(--sk-duration-fast);
}
.msg:hover .msg-time {
  opacity: 1;
}
```

### Input Bar

```css
.input-container {
  background: var(--sk-bg-secondary);
  border: 1px solid var(--sk-border);
  border-radius: var(--sk-radius-lg); /* 12px */
  padding: var(--sk-space-sm); /* 8px */
  margin: var(--sk-space-sm); /* 8px margin from edges */
  transition: border-color var(--sk-duration-fast);
}
.input-container:focus-within {
  border-color: var(--sk-accent);
}

.input-textarea {
  font-size: var(--sk-font-size-sm);
  line-height: var(--sk-leading-snug);
  min-height: 24px;
  max-height: 120px;
  resize: none;
  background: transparent;
  border: none;
  outline: none;
  color: var(--sk-text-primary);
  width: 100%;
}

.send-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--sk-radius-md);
  background: var(--sk-accent);
  opacity: 0; /* hidden when empty */
  transition: opacity var(--sk-duration-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}
.input-container:has(.input-textarea:not(:placeholder-shown)) .send-btn {
  opacity: 1;
}
.send-btn:active {
  transform: scale(0.95);
}
```

### Status Bar

```css
height: 24px;
background: var(--sk-bg-secondary);
border-top: 1px solid rgba(255, 255, 255, 0.08);
padding: 0 var(--sk-space-sm);
display: flex;
align-items: center;
justify-content: space-between;
font-size: 11px; /* even smaller than xs */
font-family: var(--sk-font-code);
color: var(--sk-text-muted);

/* Connection dot */
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--sk-radius-full);
  /* green=connected, yellow=loading, red=error */
}
.status-dot.connected {
  background: var(--sk-success);
}
.status-dot.loading {
  background: var(--sk-warning);
  animation: pulse 2s infinite;
}
.status-dot.error {
  background: var(--sk-error);
}
```

### Command Palette (⌘K)

```css
.palette-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  /* spring entry animation */
}

.palette-container {
  width: 560px;
  max-height: 400px;
  background: var(--sk-bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--sk-radius-lg);
  box-shadow: var(--sk-shadow-2xl);
  overflow: hidden;
  /* entry: scale 0.95→1, translateY -8→0, 200ms spring */
  animation: palette-enter 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.palette-input {
  height: 48px;
  padding: 0 var(--sk-space-md);
  font-size: var(--sk-font-size-base); /* 16px — exception for search */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.palette-item {
  height: 40px;
  padding: 0 var(--sk-space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.palette-item.active {
  background: var(--sk-accent-muted);
}

.palette-shortcut {
  font-size: var(--sk-font-size-xs);
  font-family: var(--sk-font-code);
  color: var(--sk-text-muted);
}

@keyframes palette-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Progress Bar (top of window)

```css
.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--sk-accent);
  transition: width 200ms ease-out;
  z-index: var(--sk-z-toast); /* above everything */
}
```

---

## PART 3: DESIGN MODE & THEME

**Mode**: `ink` — flat surfaces, 1px borders, typography-driven hierarchy, fast transitions, no blur on surfaces
**Theme**: `Linear Dark` or `Ink Mono Dark`
**Cursor**: `default` everywhere (desktop app, not website — no pointer cursors)

---

## PART 4: ANTI-PATTERNS

| Kill                                | Replace with                                                 |
| ----------------------------------- | ------------------------------------------------------------ |
| Colorful sidebar icons              | Monochrome icons, accent only on active                      |
| 16px body text                      | 14px everywhere in UI                                        |
| Large padding (16px+)               | 4-8px padding, 16px only between sections                    |
| Bold (700) in UI text               | Semibold (600) max, medium (500) for emphasis                |
| border-radius: 16px+ on UI elements | 4px buttons, 8px cards, 12px input/chat. Only pills use full |
| Shadows on inline cards             | Shadows only on floating elements                            |
| Loading spinner                     | Skeleton shimmer                                             |
| "Are you sure?" dialog              | Undo toast (5s window, Z shortcut)                           |
| Showing all features at once        | Progressive disclosure, hover reveals                        |
| Colored backgrounds for sections    | Monochrome bg tiers, accent only for active/selected         |
| Multiple font families              | One UI + one mono. Period                                    |
| Slow animations (300ms+)            | 150ms for interactions, 200ms for transitions                |
| Pure #000000 background             | Theme-derived dark (Linear uses LCH color space)             |
| focus ring on mouse click           | `:focus-visible` only (keyboard navigation)                  |

---

## PART 5: CHECKLIST BEFORE SHIPPING

### Visual

- [ ] Only 3 font sizes visible on any screen (heading 16px, body 14px, meta 12px)
- [ ] Letter-spacing: -0.02em on headings, -0.01em on body
- [ ] Every interactive element has hover (bg change) + active (scale 0.98) state
- [ ] Borders are rgba(255,255,255,0.08) — barely visible
- [ ] Accent color appears in exactly 1-2 spots per view
- [ ] No element has both shadow AND thick border
- [ ] Sidebar items are 32px height
- [ ] All constrained text truncates with ellipsis

### Performance

- [ ] Every action responds in under 100ms (target 50ms)
- [ ] Optimistic updates for all mutations (show result before server confirms)
- [ ] Skeleton shimmer for all async content
- [ ] No layout shift when content loads

### Keyboard

- [ ] ⌘K opens command palette
- [ ] J/K navigates lists
- [ ] Every action has a visible shortcut hint
- [ ] Focus rings visible only on keyboard navigation
- [ ] Tab order makes sense without mouse

### Polish

- [ ] Empty states have icon + title + action button
- [ ] Toasts slide in from bottom-right with undo
- [ ] Progress shown as 2px accent bar at top of window
- [ ] Status bar shows git + model + connection state
- [ ] Scrollbars are thin (6px) and only appear on hover

---

## VERSION HISTORY

- **v1**: Basic 7 principles + component specs (initial draft)
- **v2**: Added Vercel token values (exact hex, spacing scale, border opacity)
- **v3**: Added Superhuman speed techniques (50ms target, optimistic UI, vim nav, animation specs)
- **v4**: Added Linear redesign insights (LCH colors, sidebar alignment, 3-param theming, Inter Display)
- **v5**: Added Arc density patterns, Raycast compact mode, command palette spec, progress bar, top-of-window indicators, undo-over-confirm philosophy, cursor:default convention, 11px status bar, key repeat rate override. Restructured into 10 Laws + Component Specs + Anti-patterns + Checklist.

Sources: Linear blog, Vercel Geist, Superhuman design study, Raycast blog, Arc UX analysis, LogRocket design breakdowns, SeedFlip Vercel breakdown.
