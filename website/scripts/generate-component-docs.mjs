/**
 * Generates per-component documentation pages from ../docs-manifest.json.
 *
 * Usage: node scripts/generate-component-docs.mjs
 *
 * Output: docs/components/<category>/<Component>.md plus category index pages.
 * Thumbnails are read from static/img/components/<Component>.webp when present.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const websiteDir = resolve(__dirname, '..');
const repoDir = resolve(websiteDir, '..');
const outDir = join(websiteDir, 'docs', 'components');
const thumbsDir = join(websiteDir, 'static', 'img', 'components');

const manifest = JSON.parse(readFileSync(join(repoDir, 'docs-manifest.json'), 'utf8'));

/** Entries that are not real components. */
const SKIP = new Set(['layout']);

/** Category slugs and display metadata, in sidebar order. */
const CATEGORIES = {
  layout: { label: 'Layout', position: 1, blurb: 'Structural primitives for arranging content.' },
  input: { label: 'Input', position: 2, blurb: 'Form controls and user-input components.' },
  display: { label: 'Display', position: 3, blurb: 'Content presentation and data display.' },
  feedback: { label: 'Feedback', position: 4, blurb: 'Loading, progress, and status indicators.' },
  navigation: {
    label: 'Navigation',
    position: 5,
    blurb: 'Menus, overlays, and app navigation chrome.',
  },
  'chat-ai': { label: 'Chat & AI', position: 6, blurb: 'Chat interfaces and LLM tooling.' },
  data: { label: 'Data', position: 7, blurb: 'Tables, boards, dashboards, and file browsing.' },
  utilities: {
    label: 'Utilities',
    position: 8,
    blurb: 'Palettes, dialogs, settings, and developer tools.',
  },
};

/** component name -> [category slug, one-line description] */
const COMPONENTS = {
  // Layout
  Box: ['layout', 'Base polymorphic container with spacing and color tokens.'],
  Flex: ['layout', 'Flexbox container with direction, align, justify, gap, and wrap props.'],
  Stack: ['layout', 'Vertical flex column with a consistent spacing token.'],
  Grid: ['layout', 'CSS grid with columns, gap, and auto-fit/fill.'],
  Center: ['layout', 'Centers content on both axes.'],
  Container: ['layout', 'Max-width page wrapper with padding.'],
  Section: ['layout', 'Labeled page section with a heading.'],
  Spacer: ['layout', 'Flexible space filler for flex and grid layouts.'],
  Wrap: ['layout', 'Flex-wrap container for tag and chip layouts.'],
  AspectRatio: ['layout', 'Maintains the aspect ratio of its child.'],
  ScrollArea: ['layout', 'Custom-scrollbar scroll container.'],
  MasonryGrid: ['layout', 'Pinterest-style masonry layout.'],
  MediaGrid: ['layout', 'Responsive media card grid.'],
  DocumentPage: ['layout', 'A4/letter page container with margin simulation.'],

  // Input
  Button: ['input', 'Polymorphic button with size and variant props.'],
  Input: ['input', 'Text input with label, error, and size variants.'],
  NumberInput: ['input', 'Numeric input with increment/decrement controls.'],
  SearchInput: ['input', 'Input with search icon and clear button.'],
  Select: ['input', 'Accessible dropdown selection built on @kobalte/core.'],
  Checkbox: ['input', 'Checkbox with indeterminate state.'],
  Switch: ['input', 'On/off toggle switch.'],
  Slider: ['input', 'Single-value range slider.'],
  RangeSlider: ['input', 'Dual-handle range slider.'],
  TagInput: ['input', 'Multi-value tag/token input.'],
  DateInput: ['input', 'Date and time picker input.'],
  ColorInput: ['input', 'Color picker input.'],
  FileInput: ['input', 'File upload input with drag support.'],
  AudioInput: ['input', 'Microphone recording input.'],
  VideoInput: ['input', 'Camera/video capture input.'],
  ImageInput: ['input', 'Image upload with preview.'],
  RecordButton: ['input', 'Pulsing record/stop button.'],
  DropZone: ['input', 'Drag-and-drop file drop target.'],
  FilterChip: ['input', 'Toggle chip for filtering.'],
  SegmentedBar: ['input', 'Segmented control / pill selector.'],
  SegmentedControl: ['input', 'Segmented option control.'],

  // Display
  Text: ['display', 'Polymorphic text with size, weight, and color tokens.'],
  Badge: ['display', 'Status and count label with variants.'],
  Card: ['display', 'Content card with padding, radius, and shadow.'],
  MetricCard: ['display', 'KPI card with value, label, and trend.'],
  ProjectCard: ['display', 'Project summary card with metadata.'],
  CodeBlock: ['display', 'Syntax-highlighted code with copy button.'],
  Markdown: ['display', 'Markdown renderer with streaming support.'],
  ImagePreview: ['display', 'Image with zoom and overlay.'],
  Skeleton: ['display', 'Loading placeholder shimmer.'],
  Tooltip: ['display', 'Hover tooltip built on @kobalte/core.'],
  Kbd: ['display', 'Keyboard key display.'],
  StatusDot: ['display', 'Colored status indicator dot.'],
  ColorDot: ['display', 'Decorative color dot.'],
  StreamingText: ['display', 'Animated text that streams character by character.'],
  TerminalOutput: ['display', 'ANSI-aware terminal text display.'],
  Timeline: ['display', 'Vertical event timeline.'],
  Sparkline: ['display', 'Mini inline chart.'],
  WaterfallChart: ['display', 'Waterfall/bar breakdown chart.'],
  SignalGrid: ['display', 'Grid of signal strength indicators.'],
  DiffView: ['display', 'Side-by-side and inline diff viewer.'],
  Lightbox: ['display', 'Fullscreen media lightbox.'],
  AnnotationLayer: ['display', 'Overlay layer for annotating content.'],

  // Feedback
  Spinner: ['feedback', 'Loading spinner with size variants.'],
  ProgressBar: ['feedback', 'Horizontal progress bar.'],
  ProgressRing: ['feedback', 'Circular ring progress indicator.'],
  StreamingIndicator: ['feedback', 'Animated typing/streaming dots.'],
  ErrorBanner: ['feedback', 'Error, warning, and info banners.'],
  EmptyState: ['feedback', 'Empty content placeholder with icon, title, and CTA.'],
  TopProgressBar: ['feedback', 'Top-of-page route progress bar.'],
  LivePulse: ['feedback', 'Live status pulse indicator.'],
  SpeakingIndicator: ['feedback', 'Voice-activity indicator.'],

  // Navigation
  Accordion: ['navigation', 'Collapsible section group.'],
  Collapsible: ['navigation', 'Single collapsible section.'],
  Dialog: ['navigation', 'Modal dialog built on @kobalte/core.'],
  Dropdown: ['navigation', 'Trigger with floating menu.'],
  Popover: ['navigation', 'Anchored floating content.'],
  Tabs: ['navigation', 'Horizontal tabbed content.'],
  Separator: ['navigation', 'Horizontal or vertical divider.'],
  Breadcrumb: ['navigation', 'Path breadcrumb trail.'],
  Sidebar: ['navigation', 'Collapsible navigation sidebar.'],
  MobileNav: ['navigation', 'Bottom navigation bar for mobile.'],
  BottomNav: ['navigation', 'Bottom navigation bar.'],
  MobileBottomBar: ['navigation', 'Mobile bottom action bar.'],
  MenuBar: ['navigation', 'Application menu bar (File/Edit/…).'],
  TabBar: ['navigation', 'Horizontal tab bar with icons.'],
  MobilePanelView: ['navigation', 'Mobile-optimized panel switcher.'],
  ModeSwitcher: ['navigation', 'App mode/workspace switcher.'],
  StatusBar: ['navigation', 'Bottom status bar with segments.'],
  Pagination: ['navigation', 'Page navigation control.'],
  Drawer: ['navigation', 'Slide-in drawer panel.'],
  BottomSheet: ['navigation', 'Mobile bottom sheet overlay.'],
  SuggestionChips: ['navigation', 'Horizontal chip row for suggestions.'],

  // Chat & AI
  ChatWindow: ['chat-ai', 'Full chat UI with messages and input.'],
  LLMChatBox: ['chat-ai', 'LLM chat with tool rendering, approval, and cost tracking.'],
  MessageBubble: ['chat-ai', 'Single chat message bubble.'],
  MessageList: ['chat-ai', 'Virtualized message list.'],
  MessageInput: ['chat-ai', 'Multi-line message composer.'],
  SessionTabs: ['chat-ai', 'Multi-session tab switcher.'],
  SessionManager: ['chat-ai', 'Session CRUD panel.'],
  SessionSearch: ['chat-ai', 'Session search and filter.'],
  SessionIndicator: ['chat-ai', 'Active session badge.'],
  ToolApproval: ['chat-ai', 'Approve or reject AI tool calls.'],
  ToolExecution: ['chat-ai', 'Tool execution status display.'],
  SubagentTracker: ['chat-ai', 'Multi-agent progress tracker.'],
  CostTracker: ['chat-ai', 'Token and cost usage display.'],
  ModelSelector: ['chat-ai', 'LLM model picker dropdown.'],
  PromptQueue: ['chat-ai', 'Queued prompt list.'],
  AiCompanion: ['chat-ai', 'Floating AI assistant companion widget.'],

  // Data
  Table: ['data', 'Data table with typed columns, sorting, and selection.'],
  FileExplorer: ['data', 'File browser with tree, list, icons, and gallery views.'],
  DirectoryPicker: ['data', 'Directory selection dialog.'],
  KanbanBoard: ['data', 'Drag-and-drop Kanban board.'],
  IssueBoard: ['data', 'GitHub-style issue tracker board.'],
  DashboardContainer: ['data', 'Drag-and-drop card dashboard.'],
  DashboardGrid: ['data', 'Responsive dashboard grid.'],
  ProjectDashboard: ['data', 'Project overview dashboard.'],
  ActionForm: ['data', 'Schema-driven form builder.'],
  RepoCard: ['data', 'Git repository summary card.'],
  StatBar: ['data', 'Horizontal stats bar.'],
  MediaTrimmer: ['data', 'Video/audio trim range selector.'],
  VideoSourcePicker: ['data', 'Video source selection (library, URL, or local file).'],
  LogViewer: ['data', 'Structured log stream viewer.'],

  // Utilities
  CommandPalette: ['utilities', 'Keyboard-driven command palette with fuzzy search.'],
  ContextMenu: ['utilities', 'Right-click context menu.'],
  ConfirmDialog: ['utilities', 'Confirmation modal with OK/Cancel.'],
  Toast: ['utilities', 'Toast notification system.'],
  SettingsPanel: ['utilities', 'Tabbed settings drawer.'],
  ThemeBuilder: ['utilities', 'Interactive theme editor.'],
  ThemePickerModal: ['utilities', 'Theme selection modal.'],
  GuidedTour: ['utilities', 'Step-by-step onboarding tour.'],
  SplitButton: ['utilities', 'Button with dropdown arrow.'],
  ConnectionStatus: ['utilities', 'Network/WebSocket connection indicator.'],
  Inspector: ['utilities', 'Component and state inspector panel.'],
  DevToolbar: ['utilities', 'Development toolbar overlay.'],
  BugReporter: ['utilities', 'In-app bug report dialog.'],
  UserProvider: ['utilities', 'User identity context provider.'],
};

// --- helpers ---------------------------------------------------------------

/** Extracts the `args: {...}` object literal from a story source, or null. */
function extractArgs(source) {
  const idx = source.indexOf('args:');
  if (idx === -1) return null;
  const start = source.indexOf('{', idx);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function hasFunction(value) {
  if (typeof value === 'function') return true;
  if (Array.isArray(value)) return value.some(hasFunction);
  if (value && typeof value === 'object') return Object.values(value).some(hasFunction);
  return false;
}

/** Serializes a JS value as a JSX expression body. */
function serialize(value) {
  return inspect(value, { depth: null, breakLength: 72, compact: 3 });
}

function indent(text, pad) {
  return text
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n');
}

/** Converts evaluated story args into a JSX snippet, or null if not representable. */
function argsToJsx(name, args) {
  const { children, ...rest } = args;
  if (children !== undefined && typeof children !== 'string' && typeof children !== 'number') {
    return null;
  }
  const attrs = [];
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    if (typeof value === 'string' && !value.includes('"') && !value.includes('\n')) {
      attrs.push(`${key}="${value}"`);
    } else if (value === true) {
      attrs.push(key);
    } else if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'string'
    ) {
      attrs.push(`${key}={${JSON.stringify(value)}}`);
    } else {
      attrs.push(`${key}={${indent(serialize(value), '  ')}}`);
    }
  }
  const oneLine = attrs.every((a) => !a.includes('\n'));
  const openInline = `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  let open;
  if (oneLine && openInline.length <= 78) {
    open = openInline;
  } else {
    open = `<${name}\n${attrs.map((a) => '  ' + indent(a, '  ')).join('\n')}\n`;
  }
  if (children !== undefined) {
    return `${open}>${String(children)}</${name}>`;
  }
  return `${open.endsWith('\n') ? open : open + ' '}/>`;
}

function escapeCell(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function propsTable(props) {
  const rows = props.map((p) => {
    const name = `\`${p.name}\`${p.required ? ' *' : ''}`;
    const type = `\`${escapeCell(p.type ?? '')}\``;
    const def = p.defaultValue !== undefined ? `\`${escapeCell(p.defaultValue)}\`` : '—';
    const desc = p.description ? escapeCell(p.description) : '—';
    return `| ${name} | ${type} | ${def} | ${desc} |`;
  });
  return [
    '| Prop | Type | Default | Description |',
    '| ---- | ---- | ------- | ----------- |',
    ...rows,
  ].join('\n');
}

// --- generation ------------------------------------------------------------

const entries = manifest.entries.filter((e) => !SKIP.has(e.name));
const unmapped = entries.filter((e) => !COMPONENTS[e.name]);
if (unmapped.length > 0) {
  throw new Error(`Unmapped components: ${unmapped.map((e) => e.name).join(', ')}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, '_category_.json'),
  JSON.stringify({ label: 'Components', position: 3 }, null, 2) + '\n'
);

const byCategory = new Map(Object.keys(CATEGORIES).map((slug) => [slug, []]));
let exampleCount = 0;

for (const entry of entries) {
  const [slug, description] = COMPONENTS[entry.name];
  byCategory.get(slug).push({ entry, description });

  const lines = [
    '---',
    `title: ${entry.name}`,
    `description: ${description}`,
    // Explicit slug so files whose name matches the directory (e.g. input/Input.md)
    // are not treated as category index pages, which would collide with index.md.
    `slug: /components/${slug}/${entry.name}`,
    '---',
    '',
    `# ${entry.name}`,
    '',
    description,
    '',
  ];

  if (existsSync(join(thumbsDir, `${entry.name}.webp`))) {
    lines.push(`![${entry.name} preview](/img/components/${entry.name}.webp)`, '');
  }

  lines.push('```tsx', `import { ${entry.name} } from '@ybouhjira/hyperkit';`, '```', '');

  // Examples from story args
  const examples = [];
  for (const example of entry.examples ?? []) {
    if (examples.length >= 3) break;
    const argsText = extractArgs(example.source ?? '');
    if (!argsText) continue;
    let args;
    try {
      args = vm.runInNewContext(`(${argsText})`, {}, { timeout: 1000 });
    } catch {
      continue;
    }
    if (!args || typeof args !== 'object' || hasFunction(args)) continue;
    const jsx = argsToJsx(entry.name, args);
    if (!jsx) continue;
    examples.push({ name: example.name, jsx });
  }
  if (examples.length > 0) {
    lines.push('## Examples', '');
    for (const ex of examples) {
      lines.push(`### ${ex.name.replace(/([a-z])([A-Z])/g, '$1 $2')}`, '');
      lines.push('```tsx', ex.jsx, '```', '');
      exampleCount++;
    }
  }

  if ((entry.props ?? []).length > 0) {
    lines.push('## Props', '', propsTable(entry.props), '');
    if (entry.props.some((p) => p.required)) {
      lines.push('`*` required prop.', '');
    }
  }

  if (entry.a11y) {
    lines.push('## Accessibility', '', entry.a11y, '');
  }

  if (entry.dosAndDonts) {
    const { do: dos = [], dont = [] } = entry.dosAndDonts;
    if (dos.length > 0 || dont.length > 0) {
      lines.push('## Usage Notes', '');
      for (const d of dos) lines.push(`- **Do:** ${d}`);
      for (const d of dont) lines.push(`- **Don't:** ${d}`);
      lines.push('');
    }
  }

  if ((entry.tokens ?? []).length > 0) {
    lines.push(
      '## Design Tokens',
      '',
      `This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).`,
      '',
      entry.tokens.map((t) => `\`${t}\``).join(', '),
      ''
    );
  }

  const dir = join(outDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${entry.name}.md`), lines.join('\n'));
}

// Category index + metadata
for (const [slug, meta] of Object.entries(CATEGORIES)) {
  const items = byCategory.get(slug).sort((a, b) => a.entry.name.localeCompare(b.entry.name));
  const dir = join(outDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '_category_.json'),
    JSON.stringify(
      { label: meta.label, position: meta.position, link: { type: 'doc', id: `components/${slug}/index` } },
      null,
      2
    ) + '\n'
  );
  const rows = items.map(
    ({ entry, description }) => `| [${entry.name}](./${entry.name}.md) | ${description} |`
  );
  writeFileSync(
    join(dir, 'index.md'),
    [
      '---',
      `title: ${meta.label}`,
      `description: ${meta.blurb}`,
      'sidebar_position: 0',
      '---',
      '',
      `# ${meta.label}`,
      '',
      meta.blurb,
      '',
      '| Component | Description |',
      '| --------- | ----------- |',
      ...rows,
      '',
    ].join('\n')
  );
}

// Components overview page
const overviewSections = Object.entries(CATEGORIES).map(([slug, meta]) => {
  const items = byCategory.get(slug).sort((a, b) => a.entry.name.localeCompare(b.entry.name));
  const links = items.map(({ entry }) => `[${entry.name}](./${slug}/${entry.name}.md)`).join(' · ');
  return `### [${meta.label}](./${slug}/)\n\n${meta.blurb}\n\n${links}\n`;
});
writeFileSync(
  join(outDir, 'index.md'),
  [
    '---',
    'title: Components',
    'description: The full HyperKit component catalog, organized by category.',
    'sidebar_position: 0',
    '---',
    '',
    '# Components',
    '',
    `HyperKit ships ${entries.length} components. Every component is themed through \`--sk-*\` CSS custom properties and imported from a single package:`,
    '',
    '```tsx',
    "import { Button, Card, Table } from '@ybouhjira/hyperkit';",
    '```',
    '',
    ...overviewSections,
    '',
  ].join('\n')
);

console.log(
  `Generated ${entries.length} component pages in ${Object.keys(CATEGORIES).length} categories (${exampleCount} examples).`
);
