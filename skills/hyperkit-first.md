# HyperKit-First Rule (MANDATORY)

## Before Writing ANY UI Code

**STOP. Search HyperKit first.** Claude MUST check if a component already exists before writing custom UI code.

### The Rule

1. **Before creating any UI element** → `search_components` MCP tool with relevant keyword
2. **Before writing custom CSS** → Check if HyperKit tokens cover it (`--sk-*` vars)
3. **Before building a layout** → Search for existing layout components (Flex, Stack, Grid, PanelContainer, etc.)
4. **Before adding interactivity** → Check hooks (useShortcut, useBreakpoint, useNavigation, etc.)

### How to Search

Use the `hyperkit-docs` MCP server (globally available):

- `search_components` — fuzzy search by keyword (e.g., "dialog", "table", "chart")
- `get_component` — get full API docs for a specific component

### What HyperKit Has (Quick Reference)

**133+ components across these categories:**

- Layout: Box, Flex, Stack, Grid, Center, Container, ScrollArea, MasonryGrid, DocumentPage
- Input: Button, Input, Select, Checkbox, Switch, Slider, TagInput, DateInput, ColorInput, FileInput
- Display: Text, Badge, Card, MetricCard, CodeBlock, Markdown, Skeleton, Tooltip, Timeline, Sparkline
- Feedback: Spinner, ProgressBar, ProgressRing, ErrorBanner, EmptyState
- Navigation: Accordion, Dialog, Dropdown, Popover, Tabs, Separator, Table
- Chat/AI: ChatWindow, MessageBubble, MessageInput, ToolApproval, ModelSelector, CostTracker
- IDE: Sidebar, MenuBar, TabBar, StatusBar, CommandPalette, ContextMenu, PanelContainer
- Data: FileExplorer, KanbanBoard, DashboardContainer, ActionForm, DirectoryPicker
- Diagrams: DiagramProvider, Diagram, Controls, MiniMap (via diagram-solid)
- Reports: Report, SummaryGrid, FlowDiagram, LayerStack, GapAnalysis

**Key systems:**

- Panel system (PanelContainer, PanelGroup, PanelResizeHandle)
- Navigation framework (createNavigable, dispatchAction, 55+ exports)
- Theme system (ThemeProvider, 8 presets, useTheme)
- Keyboard system (KeyboardProvider, useShortcut, ShortcutsHelp)
- Animation system (Transition, ScrollReveal, 7 presets)
- Desktop system (DesktopProvider, ElectronAdapter, file dialogs)
- Effect services (WebSocket, Session, FileSystem, Clipboard, Logging)

**23 packages** including: diagram-core, diagram-svg, diagram-solid, devtools, explorer, mcp, ai-renderer, llm-pipeline, views, eslint-plugin

### Violations

If Claude writes custom CSS, a custom component that duplicates HyperKit, or a layout without using HyperKit primitives — that's a bug. The rule is: **zero custom CSS in apps, everything from HyperKit.**

### When HyperKit Doesn't Have It

If search confirms no component exists:

1. Consider if an existing component can be composed/extended
2. If truly missing → build it IN HyperKit (not in the app)
3. Add it to the component catalog with tests and stories
