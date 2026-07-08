# HyperKit AI Reference Documentation

> Per-component deep-dive documentation for LLMs and developers

This directory contains comprehensive API documentation for every HyperKit component, optimized for both LLMs and developers.

## Documentation Structure

### Primitives (Layout)

- [Box](./Box.md) — Foundational layout primitive
- [Flex](./Flex.md) — Flexbox container
- [Stack](./Stack.md) — Vertical/horizontal stack
- [Grid](./Grid.md) — CSS Grid layout
- [Container](./Container.md) — Responsive centered container
- [Center](./Center.md) — Centered content shorthand
- [ScrollArea](./ScrollArea.md) — Custom scrollable area

### Primitives (Typography & Interactive)

- [Text](./Text.md) — Typography with gradients
- [Button](./Button.md) — Buttons with variants
- [Input](./Input.md) — Text input with validation
- [Select](./Select.md) — Dropdown select
- [Kbd](./Kbd.md) — Keyboard key display

### Primitives (UI Components)

- [Card](./Card.md) — Card with compound components
- [Badge](./Badge.md) — Label/dot/count badges
- [Tabs](./Tabs.md) — Tab navigation
- [Dialog](./Dialog.md) — Modal dialogs
- [Tooltip](./Tooltip.md) — Tooltips
- [Dropdown](./Dropdown.md) — Dropdown menus
- [Collapsible](./Collapsible.md) — Collapsible panels
- [Table](./Table.md) — Data tables with sorting

### Primitives (Feedback & State)

- [StreamingIndicator](./StreamingIndicator.md) — Loading dots
- [ErrorBanner](./ErrorBanner.md) — Error/warning banners
- [EmptyState](./EmptyState.md) — Empty state placeholders
- [Skeleton](./Skeleton.md) — Loading skeletons
- [ProgressBar](./ProgressBar.md) — Linear progress
- [ProgressRing](./ProgressRing.md) — Circular progress
- [StatusDot](./StatusDot.md) — Status indicators
- [ColorDot](./ColorDot.md) — Color indicators

### Primitives (Specialized)

- [SearchInput](./SearchInput.md) — Search input
- [ImagePreview](./ImagePreview.md) — Image thumbnails
- [CodeBlock](./CodeBlock.md) — Syntax-highlighted code
- [Timeline](./Timeline.md) — Timeline component
- [ProjectCard](./ProjectCard.md) — Project cards
- [SuggestionChips](./SuggestionChips.md) — Suggestion chips

### Composite Components

- [Composites](./Composites.md) — All composite components (chat, navigation, file management, etc.)

### Systems

- [Theme](./Theme.md) — Theme system (ThemeProvider, presets, customization)
- [Keyboard](./Keyboard.md) — Keyboard shortcuts (KeyboardProvider, useShortcut, ShortcutsHelp)
- [Panels](./Panels.md) — Panel layout system (PanelContainer, PanelGroup, resizing)
- [Hooks](./Hooks.md) — Custom hooks (effects, streams, breakpoints, mode)
- [Animation](./Animation.md) — Animation system (Transition, ScrollReveal, AnimationProvider)
- [Report](./Report.md) — Report module (all Report components for documentation/analysis pages)

## Quick Reference Links

- **Main Index**: [/llms.txt](../../llms.txt) — Compact component index
- **Full API Reference**: [/llms-full.txt](../../llms-full.txt) — Complete API reference
- **Project README**: [/README.md](../../README.md) — Project overview

## Documentation Format

Each component doc follows this structure:

1. **One-line description** — What the component does
2. **Props table** — All props with types, defaults, and descriptions
3. **CSS Variables** — Customizable CSS custom properties
4. **Examples** — 2-3 realistic usage examples
5. **Gotchas** — Common pitfalls and important notes
6. **Navigation links** — Links back to index and full reference

## Coverage

- ✅ **52+ Components documented**
- ✅ **All primitives** (Box, Text, Button, Card, etc.)
- ✅ **All composites** (Chat, Navigation, File Management, etc.)
- ✅ **All systems** (Theme, Keyboard, Panels, Hooks, Animation, Report)
- ✅ **Realistic examples** for every component
- ✅ **Gotchas & common mistakes** documented

## Usage for LLMs

When building with HyperKit:

1. Start with [llms.txt](../../llms.txt) for component discovery
2. Reference component-specific docs for detailed API
3. Check [Theme.md](./Theme.md) for theming patterns
4. Use [Composites.md](./Composites.md) for complex UI patterns

## Contributing

When adding new components:

1. Create a new `.md` file following the existing format
2. Include props table, examples, CSS variables, and gotchas
3. Add links to main index files
4. Update this README

---

**Built for**: Claude Code, GitHub Copilot, Cursor, and human developers
**Format**: Markdown with code examples
**Last Updated**: 2026-02-28
