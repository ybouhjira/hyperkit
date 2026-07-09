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
import Babel from '@babel/standalone';

const { parser } = Babel.packages;
const babelTraverse = Babel.packages.traverse.default ?? Babel.packages.traverse;

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

/**
 * Components whose primary example cannot run standalone in the playground
 * (they need app-level services, browser permissions, or real backends).
 * These keep the static thumbnail + code example instead.
 */
const STATIC_ONLY = new Set([]);

/**
 * Extra setup for components that need a provider or companion markup to
 * demo. `imports` are added to the hyperkit import line; `wrap` receives the
 * example JSX and returns the JSX to render.
 */
const PLAYGROUND_SETUP = {
  CommandPalette: {
    imports: ['KeyboardProvider'],
    wrap: (jsx) => `<KeyboardProvider>\n      ${indent(jsx, '      ')}\n    </KeyboardProvider>`,
  },
  ToolApproval: {
    imports: ['KeyboardProvider'],
    wrap: (jsx) => `<KeyboardProvider>\n      ${indent(jsx, '      ')}\n    </KeyboardProvider>`,
  },
};

/**
 * Hand-authored playground snippets for components whose stories are not
 * self-contained (story-local helpers) or render nothing until interaction.
 * Keep these minimal and runnable as-is.
 */
/** Shared demo item markup for layout-primitive overrides. */
const DEMO_BOX = (label) => `<Box p="md" bg="secondary" borderRadius="md">${label}</Box>`;

function layoutOverride(imports, bodyJsxLines) {
  return [
    `import { ${imports.join(', ')} } from '@ybouhjira/hyperkit';`,
    '',
    'export default function Demo() {',
    '  return (',
    ...bodyJsxLines.map((l) => `    ${l}`),
    '  );',
    '}',
    '',
  ].join('\n');
}

const PLAYGROUND_OVERRIDES = {
  Flex: layoutOverride(
    ['Flex', 'Box'],
    [
      '<Flex gap="md">',
      `  ${DEMO_BOX('Item 1')}`,
      `  ${DEMO_BOX('Item 2')}`,
      `  ${DEMO_BOX('Item 3')}`,
      '</Flex>',
    ]
  ),
  Grid: layoutOverride(
    ['Grid', 'Box'],
    [
      '<Grid columns={3} gap="md">',
      `  ${DEMO_BOX('One')}`,
      `  ${DEMO_BOX('Two')}`,
      `  ${DEMO_BOX('Three')}`,
      `  ${DEMO_BOX('Four')}`,
      `  ${DEMO_BOX('Five')}`,
      `  ${DEMO_BOX('Six')}`,
      '</Grid>',
    ]
  ),
  Center: layoutOverride(
    ['Center', 'Box'],
    [
      '<Box h="160px" bg="tertiary" borderRadius="md">',
      "  <Center style={{ height: '100%' }}>",
      `    ${DEMO_BOX('Centered content')}`,
      '  </Center>',
      '</Box>',
    ]
  ),
  Wrap: layoutOverride(
    ['Wrap', 'Badge'],
    [
      '<Wrap spacing="sm">',
      '  <Badge>SolidJS</Badge>',
      '  <Badge variant="success">Effect</Badge>',
      '  <Badge variant="info">Kobalte</Badge>',
      '  <Badge variant="warning">Vite</Badge>',
      '  <Badge variant="danger">TypeScript</Badge>',
      '</Wrap>',
    ]
  ),
  Spacer: layoutOverride(
    ['Flex', 'Box', 'Spacer'],
    ['<Flex gap="md">', `  ${DEMO_BOX('Start')}`, '  <Spacer />', `  ${DEMO_BOX('End')}`, '</Flex>']
  ),
  ToolApproval: [
    "import { ToolApproval, KeyboardProvider } from '@ybouhjira/hyperkit';",
    '',
    'export default function Demo() {',
    '  return (',
    '    <KeyboardProvider>',
    '      <ToolApproval',
    '        tool="Read"',
    "        input={{ file_path: '/src/index.ts' }}",
    "        onApprove={(alwaysAllow) => console.log('Approved', { alwaysAllow })}",
    "        onDeny={() => console.log('Denied')}",
    '      />',
    '    </KeyboardProvider>',
    '  );',
    '}',
    '',
  ].join('\n'),
  Table: [
    "import { Table } from '@ybouhjira/hyperkit';",
    '',
    'const columns = [',
    "  { key: 'name', header: 'Name' },",
    "  { key: 'role', header: 'Role' },",
    "  { key: 'status', header: 'Status' },",
    '];',
    '',
    'const data = [',
    "  { id: '1', name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },",
    "  { id: '2', name: 'Grace Hopper', role: 'Admiral', status: 'Active' },",
    "  { id: '3', name: 'Alan Turing', role: 'Scientist', status: 'Away' },",
    '];',
    '',
    'export default function Demo() {',
    '  return <Table columns={columns} data={data} getRowKey={(row) => row.id} />;',
    '}',
    '',
  ].join('\n'),
  Drawer: [
    "import { Drawer, Button, Stack, Text } from '@ybouhjira/hyperkit';",
    "import { createSignal } from 'solid-js';",
    '',
    'export default function Demo() {',
    '  const [open, setOpen] = createSignal(false);',
    '  return (',
    '    <>',
    '      <Button onClick={() => setOpen(true)}>Open drawer</Button>',
    '      <Drawer open={open()} onOpenChange={setOpen} side="left" size="280px">',
    '        <Stack gap="sm" style={{ padding: \'var(--sk-space-md)\' }}>',
    '          <Text>Primary navigation drawer — slides in from the left edge.</Text>',
    '          <Button variant="secondary" onClick={() => setOpen(false)}>',
    '            Close',
    '          </Button>',
    '        </Stack>',
    '      </Drawer>',
    '    </>',
    '  );',
    '}',
    '',
  ].join('\n'),
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

/**
 * Escapes `{` and `<` for MDX in prose, leaving inline-code spans untouched
 * (MDX treats them as literal text already).
 */
function escapeMdx(text) {
  return String(text)
    .split(/(`[^`]*`)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/([{<])/g, '\\$1')))
    .join('');
}

function escapeCell(text) {
  return escapeMdx(
    String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  );
}

// --- playground snippet derivation ------------------------------------------

/** Solid APIs a story may reference, mapped to their import specifier. */
const SOLID_JS_API = new Set([
  'createSignal',
  'createMemo',
  'createEffect',
  'createResource',
  'createUniqueId',
  'onMount',
  'onCleanup',
  'For',
  'Show',
  'Index',
  'Match',
  'batch',
  'untrack',
  'on',
]);
const SOLID_STORE_API = new Set(['createStore', 'produce', 'reconcile', 'unwrap']);

/** Ambient browser/JS globals allowed in a self-contained snippet. */
const JS_GLOBALS = new Set([
  'console',
  'window',
  'document',
  'navigator',
  'localStorage',
  'alert',
  'fetch',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'queueMicrotask',
  'structuredClone',
  'performance',
  'crypto',
  'Math',
  'JSON',
  'Date',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Promise',
  'Map',
  'Set',
  'RegExp',
  'Error',
  'Symbol',
  'URL',
  'Blob',
  'File',
  'FileReader',
  'AbortController',
  'Infinity',
  'NaN',
  'undefined',
  'parseInt',
  'parseFloat',
  'isNaN',
  'encodeURIComponent',
  'decodeURIComponent',
]);

/** Names importable from '@ybouhjira/hyperkit' in snippets. */
const HYPERKIT_EXPORTS = new Set(Object.keys(COMPONENTS));
for (const extra of ['ThemeProvider', 'ThemePicker', 'FontSelect', 'KeyboardProvider']) {
  HYPERKIT_EXPORTS.add(extra);
}

function parseModule(code) {
  return parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
}

/** Returns the free (unbound) identifiers of a source string, or null on parse error. */
function freeIdentifiers(code) {
  let ast;
  try {
    ast = parseModule(code);
  } catch {
    return null;
  }
  let globals = [];
  babelTraverse(ast, {
    Program(path) {
      globals = Object.keys(path.scope.globals);
      path.stop();
    },
  });
  return globals;
}

/**
 * Buckets a snippet's free identifiers into import groups. Returns null when
 * the snippet references anything that is not importable — i.e. it is not
 * self-contained (story-local fixtures, helper components, …).
 */
function classifyImports(globals) {
  const hyperkit = [];
  const solid = [];
  const store = [];
  for (const g of globals) {
    if (HYPERKIT_EXPORTS.has(g)) hyperkit.push(g);
    else if (SOLID_JS_API.has(g)) solid.push(g);
    else if (SOLID_STORE_API.has(g)) store.push(g);
    else if (!JS_GLOBALS.has(g)) return null;
  }
  return { hyperkit, solid, store };
}

/** Assembles the final playground module from a Demo body and import groups. */
function assembleSnippet(bodyLines, imports) {
  const lines = [];
  if (imports.hyperkit.length > 0) {
    lines.push(
      `import { ${[...new Set(imports.hyperkit)].join(', ')} } from '@ybouhjira/hyperkit';`
    );
  }
  if (imports.solid.length > 0) {
    lines.push(`import { ${[...new Set(imports.solid)].join(', ')} } from 'solid-js';`);
  }
  if (imports.store.length > 0) {
    lines.push(`import { ${[...new Set(imports.store)].join(', ')} } from 'solid-js/store';`);
  }
  lines.push('', 'export default function Demo() {', ...bodyLines, '}', '');
  return lines.join('\n');
}

/** Builds a playground module from a plain JSX expression. */
function snippetFromJsx(name, jsx) {
  const setup = PLAYGROUND_SETUP[name];
  const body = setup ? setup.wrap(jsx) : jsx;
  const bodyLines = ['  return (', `    ${indent(body, '    ')}`, '  );'];
  const globals = freeIdentifiers(`export default function Demo() {\n${bodyLines.join('\n')}\n}`);
  if (!globals) return null;
  const imports = classifyImports(globals);
  if (!imports) return null;
  if (!imports.hyperkit.includes(name)) imports.hyperkit.unshift(name);
  return assembleSnippet(bodyLines, imports);
}

/**
 * Fallback JSX construction straight from the `args: {...}` source text —
 * handles args whose values are JSX or functions (which the vm path rejects).
 */
function argsSourceToJsx(name, argsText) {
  let ast;
  try {
    ast = parser.parseExpression(argsText, { plugins: ['jsx', 'typescript'] });
  } catch {
    return null;
  }
  if (ast.type !== 'ObjectExpression') return null;
  const attrs = [];
  let childrenSrc = null;
  for (const prop of ast.properties) {
    if (prop.type !== 'ObjectProperty' || prop.computed) return null;
    const key =
      prop.key.type === 'Identifier'
        ? prop.key.name
        : prop.key.type === 'StringLiteral'
          ? prop.key.value
          : null;
    if (!key || !/^[A-Za-z_$][\w$]*$/.test(key)) return null;
    const valueSrc = argsText.slice(prop.value.start, prop.value.end);
    if (key === 'children') {
      childrenSrc = { node: prop.value, src: valueSrc };
      continue;
    }
    if (prop.value.type === 'StringLiteral' && !prop.value.value.includes('"')) {
      attrs.push(`${key}="${prop.value.value}"`);
    } else if (prop.value.type === 'BooleanLiteral' && prop.value.value === true) {
      attrs.push(key);
    } else {
      attrs.push(`${key}={${indent(valueSrc, '  ')}}`);
    }
  }
  const oneLine = attrs.every((a) => !a.includes('\n'));
  const openInline = `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  const open =
    oneLine && openInline.length <= 78
      ? openInline
      : `<${name}\n${attrs.map((a) => '  ' + indent(a, '  ')).join('\n')}\n`;
  if (childrenSrc) {
    const inner =
      childrenSrc.node.type.startsWith('JSX') || childrenSrc.node.type.endsWith('Literal')
        ? childrenSrc.node.type === 'StringLiteral'
          ? childrenSrc.node.value
          : childrenSrc.src
        : `{${childrenSrc.src}}`;
    return `${open}>${inner}</${name}>`;
  }
  return `${open.endsWith('\n') ? open : open + ' '}/>`;
}

/** Extracts a zero-arg `render:` function from a story and builds a snippet. */
function snippetFromRender(exampleSource) {
  let ast;
  try {
    ast = parseModule(exampleSource);
  } catch {
    return null;
  }
  let fn = null;
  babelTraverse(ast, {
    ObjectProperty(path) {
      if (fn) return;
      const key = path.node.key;
      if (key.type === 'Identifier' && key.name === 'render') {
        const value = path.node.value;
        if (
          (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') &&
          value.params.length === 0
        ) {
          fn = value;
        }
        path.stop();
      }
    },
  });
  if (!fn) return null;

  let bodyLines;
  if (fn.body.type === 'BlockStatement') {
    // Re-anchor the block's inner statements at two-space indentation.
    const inner = exampleSource.slice(fn.body.start + 1, fn.body.end - 1);
    const lines = inner.split('\n').filter((l, i) => !(i === 0 && l.trim() === ''));
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
    const margin = Math.min(
      ...lines.filter((l) => l.trim() !== '').map((l) => l.match(/^\s*/)[0].length)
    );
    bodyLines = lines.map((l) => (l.trim() === '' ? '' : '  ' + l.slice(margin)));
  } else {
    const expr = exampleSource.slice(fn.body.start, fn.body.end);
    const lines = expr.split('\n');
    const margin = Math.min(
      ...lines
        .slice(1)
        .filter((l) => l.trim() !== '')
        .map((l) => l.match(/^\s*/)[0].length),
      Infinity
    );
    const normalized = [
      lines[0],
      ...lines.slice(1).map((l) => (l.trim() === '' ? '' : l.slice(Math.min(margin, Infinity)))),
    ];
    bodyLines = [`  return ${indent(normalized.join('\n'), '  ')};`];
  }

  const globals = freeIdentifiers(`export default function Demo() {\n${bodyLines.join('\n')}\n}`);
  if (!globals) return null;
  const imports = classifyImports(globals);
  if (!imports) return null;
  if (imports.hyperkit.length === 0) return null;
  return assembleSnippet(bodyLines, imports);
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
let liveCount = 0;
let staticCount = 0;

for (const entry of entries) {
  const [slug, description] = COMPONENTS[entry.name];
  byCategory.get(slug).push({ entry, description });

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

  // Live playground snippet — try, per story example: (A) the vm-evaluated
  // args JSX, (B) JSX built from the raw args source (handles JSX/function
  // prop values), (C) an extracted zero-arg `render()` function. Every
  // candidate is verified self-contained via free-identifier analysis.
  let playground = PLAYGROUND_OVERRIDES[entry.name] ?? null;
  let playgroundExample = null;
  if (!playground && !STATIC_ONLY.has(entry.name)) {
    for (const example of entry.examples ?? []) {
      const fromArgs = examples.find((e) => e.name === example.name);
      if (fromArgs) playground = snippetFromJsx(entry.name, fromArgs.jsx);
      if (!playground) {
        const argsText = extractArgs(example.source ?? '');
        if (argsText) {
          const jsx = argsSourceToJsx(entry.name, argsText);
          if (jsx) playground = snippetFromJsx(entry.name, jsx);
        }
      }
      if (!playground) playground = snippetFromRender(example.source ?? '');
      if (playground) {
        playgroundExample = example.name;
        break;
      }
    }
  }
  if (playground) liveCount++;
  else staticCount++;

  const lines = [
    '---',
    `title: ${entry.name}`,
    `description: ${description}`,
    // Explicit slug so files whose name matches the directory (e.g. input/Input.mdx)
    // are not treated as category index pages, which would collide with index.md.
    `slug: /components/${slug}/${entry.name}`,
    '---',
    '',
  ];

  if (playground) {
    lines.push("import LivePlayground from '@site/src/components/LivePlayground';", '');
  }

  lines.push(`# ${entry.name}`, '', description, '');

  // Keep the static thumbnail only when there is no live playground.
  if (!playground && existsSync(join(thumbsDir, `${entry.name}.webp`))) {
    lines.push(`![${entry.name} preview](/img/components/${entry.name}.webp)`, '');
  }
  if (!playground) {
    lines.push(
      ':::note[Static examples]',
      'This component depends on app-level context (providers, services, or interactive setup) that does not fit the inline playground yet, so its examples are shown as static code.',
      ':::',
      ''
    );
  }

  lines.push('```tsx', `import { ${entry.name} } from '@ybouhjira/hyperkit';`, '```', '');

  if (playground) {
    lines.push('## Playground', '');
    lines.push('Edit the code — the preview recompiles and re-renders as you type.', '');
    lines.push(`<LivePlayground code={${JSON.stringify(playground)}} />`, '');
  }

  // The playground consumes one example; list the rest (or all, when there
  // is no playground) as static snippets.
  const staticExamples = playground
    ? examples.filter((e) => e.name !== playgroundExample)
    : examples;
  if (staticExamples.length > 0) {
    lines.push(playground ? '## More Examples' : '## Examples', '');
    for (const ex of staticExamples) {
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
    lines.push('## Accessibility', '', escapeMdx(entry.a11y), '');
  }

  if (entry.dosAndDonts) {
    const { do: dos = [], dont = [] } = entry.dosAndDonts;
    if (dos.length > 0 || dont.length > 0) {
      lines.push('## Usage Notes', '');
      for (const d of dos) lines.push(`- **Do:** ${escapeMdx(d)}`);
      for (const d of dont) lines.push(`- **Don't:** ${escapeMdx(d)}`);
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
  writeFileSync(join(dir, `${entry.name}.mdx`), lines.join('\n'));
}

// Category index + metadata
for (const [slug, meta] of Object.entries(CATEGORIES)) {
  const items = byCategory.get(slug).sort((a, b) => a.entry.name.localeCompare(b.entry.name));
  const dir = join(outDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '_category_.json'),
    JSON.stringify(
      {
        label: meta.label,
        position: meta.position,
        link: { type: 'doc', id: `components/${slug}/index` },
      },
      null,
      2
    ) + '\n'
  );
  const rows = items.map(
    ({ entry, description }) => `| [${entry.name}](./${entry.name}.mdx) | ${description} |`
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
  const links = items
    .map(({ entry }) => `[${entry.name}](./${slug}/${entry.name}.mdx)`)
    .join(' · ');
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
  `Generated ${entries.length} component pages in ${Object.keys(CATEGORIES).length} categories (${liveCount} live playgrounds, ${staticCount} static, ${exampleCount} extra examples).`
);
