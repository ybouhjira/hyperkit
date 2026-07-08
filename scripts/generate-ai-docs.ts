#!/usr/bin/env tsx
/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  defaultValue?: string;
}

interface MethodInfo {
  name: string;
  signature: string;
  description: string;
}

type ExportKind =
  | 'component'
  | 'service'
  | 'hook'
  | 'factory'
  | 'provider'
  | 'utility'
  | 'type'
  | 'constant';

interface ExportInfo {
  name: string;
  kind: ExportKind;
  description: string;
  category: string;
  sourcePath: string;
  // For components
  propsInterface?: string;
  props?: PropInfo[];
  // For services
  methods?: MethodInfo[];
  // For hooks/factories/utilities
  signature?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_INDEX = path.join(PROJECT_ROOT, 'src', 'index.ts');
const DOCS_AI_DIR = path.join(PROJECT_ROOT, 'docs', 'ai');
const LLMS_TXT = path.join(PROJECT_ROOT, 'llms.txt');
const LLMS_FULL_TXT = path.join(PROJECT_ROOT, 'llms-full.txt');

// Only skip true internals that must never appear in public docs
const SKIP_EXPORTS = new Set([
  'formatTime', // internal helper, not user-facing
  'createMockLLMAdapter', // test fixture, not production API
]);

// Export kind classification
const HOOK_NAMES = new Set([
  'useBreakpoint',
  'useMode',
  'useTheme',
  'useAnimation',
  'useKeyboard',
  'useShortcut',
  'useShortcuts',
  'useHaptic',
  'useNotificationSound',
  'useVideoPreview',
  'useLogger',
  'createEffectResource',
  'createEffectStream',
  'createEventBus',
  'useEventBus',
  'createLLMUIController',
  'usePanelLayout',
  'usePanelDrag',
  'useDesktop',
  'useNavigation',
  'useNavigable',
  'useDevTools',
  'useKnuthPlass',
  'createHaptic',
  'createNotificationSound',
]);

const FACTORY_NAMES = new Set([
  'makeLoggingLayer',
  'createNavigable',
  'connectTransport',
  'enableStatePersistence',
  'dispatchTransaction',
  'registerCompositeAction',
  'startActionRecording',
  'replaySession',
  'createNavigableDevTools',
  'createNavigableRouter',
  'generateMCPTools',
  'routeMCPToolCall',
  'buildToolName',
  'createPermissionMiddleware',
  'createUndoRedoMiddleware',
  'createLoggingMiddleware',
  'createAnalyticsMiddleware',
  'createRateLimitMiddleware',
]);

const SERVICE_NAMES = new Set([
  'LoggingService',
  'WebSocketService',
  'SessionService',
  'FileSystemService',
  'ClipboardService',
]);

const PROVIDER_NAMES = new Set([
  'ThemeProvider',
  'KeyboardProvider',
  'KeyboardScope',
  'AnimationProvider',
  'ToastProvider',
  'ShortcutsHelp',
  'DesktopProvider',
  'NavigationProvider',
]);

const TOKEN_HELPER_NAMES = new Set([
  'mapSpace',
  'mapBg',
  'mapTextColor',
  'mapRadius',
  'mapShadow',
  'mapZ',
  'mapFontSize',
  'mapFontWeight',
  'resolveSize',
]);

const CONSTANT_NAMES = new Set([
  'themePresets',
  'modeDefinitions',
  'architectureReviewSchema',
  'SimpleTransport',
  'ScopedTransport',
  'ConsoleTransport',
  'HttpTransport',
  'BeaconTransport',
  'SentryTransport',
]);

// Animation utilities
const ANIMATION_UTIL_NAMES = new Set([
  'enterAnimation',
  'animationClass',
  'fadeIn',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scaleIn',
  'scaleFade',
]);

// Component categorization
const COMPONENT_CATEGORIES: Record<string, string[]> = {
  Layout: [
    'Box',
    'Flex',
    'Stack',
    'Grid',
    'Container',
    'Text',
    'Center',
    'Section',
    'Spacer',
    'Wrap',
    'AspectRatio',
    'ScrollArea',
    'MasonryGrid',
    'MediaGrid',
    'DocumentPage',
  ],
  Input: [
    'Button',
    'Input',
    'Textarea',
    'Select',
    'NumberInput',
    'Slider',
    'RangeSlider',
    'Switch',
    'Checkbox',
    'Radio',
    'SearchInput',
    'TagInput',
    'Kbd',
    'DateInput',
    'ColorInput',
    'FileInput',
    'AudioInput',
    'VideoInput',
    'ImageInput',
    'DropZone',
    'RecordButton',
    'FilterChip',
    'SegmentedBar',
  ],
  Display: [
    'Card',
    'CardHeader',
    'CardTitle',
    'CardDescription',
    'CardContent',
    'CardFooter',
    'Badge',
    'Tooltip',
    'Dialog',
    'Dropdown',
    'Collapsible',
    'Accordion',
    'Tabs',
    'Table',
    'CodeBlock',
    'Timeline',
    'Separator',
    'MetricCard',
    'ProjectCard',
    'Markdown',
    'ImagePreview',
    'Skeleton',
    'StatusDot',
    'ColorDot',
    'StreamingText',
    'TerminalOutput',
    'Sparkline',
    'WaterfallChart',
    'SignalGrid',
    'Popover',
    'SuggestionChips',
  ],
  Feedback: [
    'Spinner',
    'ProgressBar',
    'ProgressRing',
    'EmptyState',
    'ErrorBanner',
    'StreamingIndicator',
  ],
  Navigation: [
    'Breadcrumb',
    'MenuBar',
    'StatusBar',
    'TabBar',
    'Sidebar',
    'MobileNav',
    'ModeSwitcher',
    'MobilePanelView',
  ],
  'Panel System': ['PanelContainer', 'PanelGroup', 'PanelResizeHandle', 'PanelDropZone'],
  'Chat & AI': [
    'ChatWindow',
    'LLMChatBox',
    'MessageBubble',
    'MessageList',
    'MessageInput',
    'SessionTabs',
    'SessionManager',
    'SessionSearch',
    'SessionIndicator',
    'ToolApproval',
    'ToolExecution',
    'SubagentTracker',
    'CostTracker',
    'ModelSelector',
    'PromptQueue',
  ],
  'Data & Content': [
    'FileExplorer',
    'KanbanBoard',
    'IssueBoard',
    'DashboardContainer',
    'DashboardGrid',
    'ProjectDashboard',
    'ExamBuilder',
    'ActionForm',
    'DirectoryPicker',
    'RepoCard',
    'StatBar',
    'MediaTrimmer',
  ],
  'UI Utilities': [
    'CommandPalette',
    'ContextMenu',
    'ConfirmDialog',
    'Toast',
    'SettingsPanel',
    'ThemeBuilder',
    'ThemePickerModal',
    'GuidedTour',
    'SplitButton',
    'ConnectionStatus',
  ],
  Report: [
    'Report',
    'ReportShell',
    'ReportNav',
    'ReportHero',
    'ReportSection',
    'ReportScoreCard',
    'SummaryGrid',
    'FlowDiagram',
    'LayerStack',
    'GapAnalysis',
    'GapCard',
    'PackageTree',
    'PresetGrid',
    'SourceList',
    'ReportFooter',
  ],
  'Theme & Icons': ['ThemePicker', 'FontSelect', 'Icon', 'ViewSwitcher'],
  Animation: ['Transition', 'ScrollReveal', 'AnimateOnScroll'],
  Navigation_Framework: [
    'NavigationProvider',
    'NavigationMenu',
    'PanelContentSlot',
    'WebSocketTransportAdapter',
    'MessagePortTransportAdapter',
    'TauriIPCAdapter',
    'LocalStorageAdapter',
    'MemoryStorageAdapter',
    'BroadcastChannelAdapter',
  ],
  Layouts: ['OnboardingLayout', 'ChatLayout'],
  Desktop: ['DesktopProvider', 'WebAdapter', 'ElectronAdapter'],
};

// Non-component categories (for grouping non-component exports)
const NON_COMPONENT_CATEGORIES: Record<string, string[]> = {
  'Effect Services': [
    'LoggingService',
    'WebSocketService',
    'SessionService',
    'FileSystemService',
    'ClipboardService',
  ],
  Logging: [
    'makeLoggingLayer',
    'ConsoleTransport',
    'HttpTransport',
    'BeaconTransport',
    'SentryTransport',
    'SimpleTransport',
    'ScopedTransport',
  ],
  Hooks: [
    'useLogger',
    'useBreakpoint',
    'useMode',
    'useTheme',
    'useAnimation',
    'useKeyboard',
    'useShortcut',
    'useShortcuts',
    'useHaptic',
    'createHaptic',
    'useNotificationSound',
    'createNotificationSound',
    'useVideoPreview',
    'createEffectResource',
    'createEffectStream',
    'createEventBus',
    'useEventBus',
    'createLLMUIController',
    'usePanelLayout',
    'usePanelDrag',
    'useDesktop',
    'useNavigation',
    'useNavigable',
    'useDevTools',
    'useKnuthPlass',
  ],
  Providers: ['ThemeProvider', 'KeyboardProvider', 'KeyboardScope', 'AnimationProvider', 'ToastProvider', 'ShortcutsHelp'],
  'Animation Utilities': [
    'enterAnimation',
    'animationClass',
    'fadeIn',
    'slideUp',
    'slideDown',
    'slideLeft',
    'slideRight',
    'scaleIn',
    'scaleFade',
  ],
  'Theme Constants': ['themePresets', 'modeDefinitions'],
  'Token Helpers': [
    'mapSpace',
    'mapBg',
    'mapTextColor',
    'mapRadius',
    'mapShadow',
    'mapZ',
    'mapFontSize',
    'mapFontWeight',
    'resolveSize',
    'formatShortcut',
  ],
  Utilities: ['validateProps', 'architectureReviewSchema', 'createSettingsStore'],
  'Server Utilities': ['createNavigableRouter', 'generateMCPTools', 'routeMCPToolCall', 'buildToolName'],
};

// ============================================================================
// Utilities
// ============================================================================

function extractJSDoc(node: ts.Node): string {
  try {
    const sourceFile = node.getSourceFile();
    if (sourceFile === undefined) return '';

    const fullText = sourceFile.getFullText();
    const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());

    if (!commentRanges || commentRanges.length === 0) return '';

    const lastComment = commentRanges[commentRanges.length - 1];
    const commentText = fullText.substring(lastComment.pos, lastComment.end);

    const lines = commentText
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter((line) => !line.startsWith('/**') && !line.startsWith('*/') && !line.startsWith('@'));

    return lines.join(' ').trim();
  } catch {
    return '';
  }
}

function extractDefaultFromJSDoc(jsdoc: string): string | undefined {
  const defaultMatch = jsdoc.match(/@default\s+(.+)/);
  return defaultMatch ? defaultMatch[1].trim() : undefined;
}

function categorizeComponent(name: string): string {
  for (const [category, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if (components.includes(name)) return category;
  }
  return 'Other';
}

function categorizeNonComponent(name: string): string {
  for (const [category, exports] of Object.entries(NON_COMPONENT_CATEGORIES)) {
    if (exports.includes(name)) return category;
  }
  return 'Other';
}

function classifyExportKind(name: string): ExportKind {
  if (SERVICE_NAMES.has(name)) return 'service';
  if (HOOK_NAMES.has(name)) return 'hook';
  if (FACTORY_NAMES.has(name)) return 'factory';
  if (PROVIDER_NAMES.has(name)) return 'provider';
  if (TOKEN_HELPER_NAMES.has(name)) return 'utility';
  if (ANIMATION_UTIL_NAMES.has(name)) return 'utility';
  if (CONSTANT_NAMES.has(name)) return 'constant';
  // Heuristics
  if (name.startsWith('use') || name.startsWith('create')) return 'hook';
  if (name.endsWith('Provider') || name.endsWith('Scope')) return 'provider';
  if (name.endsWith('Transport') || name.endsWith('Adapter')) return 'factory';
  return 'utility';
}

// ============================================================================
// TypeScript Parser — Components (Props extraction)
// ============================================================================

interface ComponentInfo {
  name: string;
  propsInterface: string;
  props: PropInfo[];
  description: string;
  sourcePath: string;
  category: string;
}

function extractPropsFromFile(filePath: string): ComponentInfo[] {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.Preserve,
    skipLibCheck: true,
  });

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) return [];

  const components: ComponentInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
      const componentName = node.name.text.replace('Props', '');

      const props: PropInfo[] = node.members.filter(ts.isPropertySignature).map((member) => {
        const name = (member.name as ts.Identifier).text;
        const type = member.type
          ? sourceFile!.getFullText().substring(member.type.pos, member.type.end).trim()
          : 'unknown';
        const optional = !!member.questionToken;
        const jsdoc = extractJSDoc(member);
        const defaultValue = extractDefaultFromJSDoc(jsdoc);
        const description = jsdoc.replace(/@default\s+.+/, '').trim();

        return { name, type, optional, description, defaultValue };
      });

      components.push({
        name: componentName,
        propsInterface: node.name.text,
        props,
        description: extractJSDoc(node),
        sourcePath: filePath,
        category: categorizeComponent(componentName),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return components;
}

// ============================================================================
// TypeScript Parser — Non-component exports (signature + JSDoc extraction)
// ============================================================================

function extractSignatureFromFile(filePath: string, exportName: string): string {
  try {
    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      skipLibCheck: true,
    });

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return '';

    const checker = program.getTypeChecker();
    let signature = '';

    function visit(node: ts.Node) {
      if (signature) return;

      // Function declaration: export function foo(...)
      if (
        ts.isFunctionDeclaration(node) &&
        node.name?.text === exportName &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const sym = checker.getSymbolAtLocation(node.name!);
        if (sym) {
          const type = checker.getTypeOfSymbolAtLocation(sym, node);
          signature = checker.typeToString(type);
        }
        return;
      }

      // Variable declaration: export const foo = ...
      if (ts.isVariableStatement(node)) {
        const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (isExported) {
          for (const decl of node.declarationList.declarations) {
            if (ts.isIdentifier(decl.name) && decl.name.text === exportName) {
              const sym = checker.getSymbolAtLocation(decl.name);
              if (sym) {
                const type = checker.getTypeOfSymbolAtLocation(sym, decl);
                signature = checker.typeToString(type);
              }
              return;
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return signature;
  } catch {
    return '';
  }
}

function extractServiceMethodsFromFile(filePath: string, interfaceName: string): MethodInfo[] {
  const methods: MethodInfo[] = [];

  try {
    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      skipLibCheck: true,
    });

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return methods;

    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
        for (const member of node.members) {
          if (ts.isPropertySignature(member) || ts.isMethodSignature(member)) {
            const name = ts.isIdentifier(member.name) ? member.name.text : '';
            const type = member.type
              ? sourceFile!.getFullText().substring(member.type.pos, member.type.end).trim()
              : '';
            const description = extractJSDoc(member);
            methods.push({ name, signature: type, description });
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch {
    // ignore parse errors
  }

  return methods;
}

function extractJSDocFromFile(filePath: string, exportName: string): string {
  try {
    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      skipLibCheck: true,
    });

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return '';

    let description = '';

    function visit(node: ts.Node) {
      if (description) return;

      const matchesName = (n: ts.Node): boolean => {
        if (ts.isFunctionDeclaration(n)) return n.name?.text === exportName;
        if (ts.isVariableStatement(n)) {
          return n.declarationList.declarations.some(
            (d) => ts.isIdentifier(d.name) && d.name.text === exportName
          );
        }
        if (ts.isInterfaceDeclaration(n)) return n.name.text === exportName;
        return false;
      };

      if (matchesName(node)) {
        description = extractJSDoc(node);
        return;
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return description;
  } catch {
    return '';
  }
}

// ============================================================================
// Index Parser
// ============================================================================

interface IndexExport {
  name: string;
  resolvedPath: string;
  isTypeOnly: boolean;
}

function parseFileExports(filePath: string, visited: Set<string>): IndexExport[] {
  // Resolve to actual file
  const resolved = resolveIndexFile(filePath);
  if (!resolved || visited.has(resolved)) return [];
  visited.add(resolved);

  const exports: IndexExport[] = [];
  const content = fs.readFileSync(resolved, 'utf-8');
  const dir = path.dirname(resolved);

  // Collapse multi-line exports into single lines for regex matching.
  // Turns `export {\n  A,\n  B,\n} from './path'` into `export { A, B } from './path'`
  const collapsed = content.replace(/export\s+(type\s+)?{([^}]*)}\s*from/gs, (match, typeKw, names) => {
    const flat = names.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `export ${typeKw || ''}{ ${flat} } from`;
  });

  const lines = collapsed.split('\n');

  for (const line of lines) {
    // Barrel re-export: export * from './path'
    const starMatch = line.match(/^export\s+\*\s+from\s+['"](.+)['"]/);
    if (starMatch) {
      const target = path.resolve(dir, starMatch[1]);
      exports.push(...parseFileExports(target, visited));
      continue;
    }

    // Named exports: export { Foo, Bar } from './path'
    const namedMatch = line.match(/export\s+(type\s+)?{\s*([^}]+)\s*}\s+from\s+['"](.+)['"]/);
    if (namedMatch) {
      const isTypeOnly = !!namedMatch[1];
      const names = namedMatch[2].split(',').map((n) => n.trim().replace(/\s+as\s+\w+/, ''));
      const importPath = namedMatch[3];
      const resolvedPath = path.resolve(dir, importPath);

      for (const name of names) {
        if (name && !SKIP_EXPORTS.has(name)) {
          exports.push({ name, resolvedPath, isTypeOnly });
        }
      }
    }
  }

  return exports;
}

function resolveIndexFile(filePath: string): string | null {
  for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = filePath + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  if (fs.existsSync(filePath)) return filePath;
  return null;
}

function parseIndexExports(): IndexExport[] {
  return parseFileExports(SRC_INDEX, new Set());
}

// ============================================================================
// Export Processor
// ============================================================================

function resolveFilePath(basePath: string, name: string): string | null {
  const extensions = ['.tsx', '.ts'];
  const candidates = [
    ...extensions.map((ext) => `${basePath}${ext}`),
    ...extensions.map((ext) => path.join(basePath, `${name}${ext}`)),
    ...extensions.map((ext) => path.join(basePath, `index${ext}`)),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function looksLikeComponent(name: string): boolean {
  // PascalCase + not in service/hook/factory/constant sets
  return (
    /^[A-Z]/.test(name) &&
    !SERVICE_NAMES.has(name) &&
    !PROVIDER_NAMES.has(name) &&
    !CONSTANT_NAMES.has(name)
  );
}

function processExports(indexExports: IndexExport[]): {
  components: ComponentInfo[];
  nonComponents: ExportInfo[];
} {
  const components: ComponentInfo[] = [];
  const nonComponents: ExportInfo[] = [];

  // Track already-processed file+name combos to avoid duplicates
  const seen = new Set<string>();

  for (const { name, resolvedPath, isTypeOnly } of indexExports) {
    if (isTypeOnly) continue;
    const key = `${resolvedPath}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const filePath = resolveFilePath(resolvedPath, name);
    if (!filePath) {
      console.log(`   ⚠️  Could not find source for ${name}`);
      continue;
    }

    if (looksLikeComponent(name)) {
      // Try to extract Props interface
      const extracted = extractPropsFromFile(filePath);
      const match = extracted.find((c) => c.name === name);
      if (match) {
        console.log(`   📄 Component: ${name}`);
        components.push(match);
        continue;
      }
    }

    // Non-component export (hook, service, factory, utility, provider, constant)
    const kind = classifyExportKind(name);
    const category = categorizeNonComponent(name);

    let description = extractJSDocFromFile(filePath, name);
    let methods: MethodInfo[] | undefined;
    let signature: string | undefined;

    if (kind === 'service') {
      methods = extractServiceMethodsFromFile(filePath, name);
    } else if (kind === 'hook' || kind === 'factory' || kind === 'utility') {
      signature = extractSignatureFromFile(filePath, name);
      if (!signature) {
        // Fallback: try to read the first line of the function declaration
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const fnMatch = content.match(new RegExp(`export(?:\\s+async)?\\s+function\\s+${name}[^{]+`));
          if (fnMatch) signature = fnMatch[0].replace(/\s+/g, ' ').trim();
        } catch {
          // ignore
        }
      }
    }

    console.log(`   📋 ${kind}: ${name} (${category})`);
    nonComponents.push({
      name,
      kind,
      description,
      category,
      sourcePath: filePath,
      methods,
      signature,
    });
  }

  return { components, nonComponents };
}

// ============================================================================
// Documentation Generators
// ============================================================================

function generateCompactIndex(components: ComponentInfo[], nonComponents: ExportInfo[]): string {
  // Group components by category
  const grouped = new Map<string, ComponentInfo[]>();
  for (const comp of components) {
    const cat = comp.category || 'Other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(comp);
  }

  // Group non-components by category
  const ncGrouped = new Map<string, ExportInfo[]>();
  for (const nc of nonComponents) {
    const cat = nc.category || 'Other';
    if (!ncGrouped.has(cat)) ncGrouped.set(cat, []);
    ncGrouped.get(cat)!.push(nc);
  }

  let output = `# SolidKit

> Modern SolidJS component library with accessible primitives, semantic layout system, Effect services, and theme-driven design tokens. Built on Kobalte headless components.

## Components

`;

  for (const [category, comps] of grouped) {
    output += `### ${category}\n`;
    for (const comp of comps) {
      const propsSummary = comp.props
        .slice(0, 5)
        .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
        .join(', ');
      const more = comp.props.length > 5 ? `, +${comp.props.length - 5} more` : '';
      output += `- **${comp.name}**: ${comp.description || 'Component'}. Props: \`{ ${propsSummary}${more} }\`\n`;
    }
    output += '\n';
  }

  output += `## Services & Hooks\n\n`;

  // Preserve category order
  const orderedCategories = Object.keys(NON_COMPONENT_CATEGORIES);
  const emittedCategories = new Set<string>();

  for (const category of orderedCategories) {
    const exports = ncGrouped.get(category);
    if (!exports || exports.length === 0) continue;
    emittedCategories.add(category);

    output += `### ${category}\n`;
    for (const nc of exports) {
      const desc = nc.description || nc.kind;
      if (nc.kind === 'service' && nc.methods) {
        const methodNames = nc.methods.map((m) => m.name).join(', ');
        output += `- **${nc.name}** (Effect Service): Methods: ${methodNames}\n`;
      } else if (nc.signature) {
        output += `- **${nc.name}** (${nc.kind}): \`${nc.signature.substring(0, 80)}${nc.signature.length > 80 ? '...' : ''}\`\n`;
      } else {
        output += `- **${nc.name}** (${nc.kind}): ${desc}\n`;
      }
    }
    output += '\n';
  }

  // Emit any categories not in the ordered list
  for (const [category, exports] of ncGrouped) {
    if (emittedCategories.has(category)) continue;
    output += `### ${category}\n`;
    for (const nc of exports) {
      output += `- **${nc.name}** (${nc.kind}): ${nc.description || nc.kind}\n`;
    }
    output += '\n';
  }

  output += `## Design Tokens

### SpaceToken
'0' | 'px' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

### FontSizeToken
'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

### FontWeightToken
'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'

### BgToken
'primary' | 'secondary' | 'tertiary' | 'elevated' | 'accent' | 'transparent'

### TextColorToken
'primary' | 'secondary' | 'muted' | 'on-accent'

### RadiusToken
'sm' | 'md' | 'lg' | 'xl' | 'full'

### ShadowToken
'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'

## Links
- [Full API Reference](./llms-full.txt)
- [Theme Guide](./docs/ai/theme.md)
- [Composition Patterns](./docs/ai/patterns.md)
`;

  return output;
}

function generateFullReference(components: ComponentInfo[], nonComponents: ExportInfo[]): string {
  const grouped = new Map<string, ComponentInfo[]>();
  for (const comp of components) {
    const cat = comp.category || 'Other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(comp);
  }

  const ncGrouped = new Map<string, ExportInfo[]>();
  for (const nc of nonComponents) {
    const cat = nc.category || 'Other';
    if (!ncGrouped.has(cat)) ncGrouped.set(cat, []);
    ncGrouped.get(cat)!.push(nc);
  }

  let output = `# SolidKit Complete API Reference

A comprehensive reference for building UIs with SolidKit's primitives, services, hooks, tokens, and theming system.

---

`;

  // ── Components ───────────────────────────────────────────────────────────
  output += `# Components\n\n`;
  for (const [category, comps] of grouped) {
    output += `## ${category}\n\n`;

    for (const comp of comps) {
      output += `### ${comp.name}\n\n`;
      output += `${comp.description || 'Component'}\n\n`;

      if (comp.props.length > 0) {
        output += `#### Props\n\n`;
        output += `| Prop | Type | Required | Default | Description |\n`;
        output += `|------|------|----------|---------|-------------|\n`;

        for (const prop of comp.props) {
          const required = prop.optional ? 'No' : 'Yes';
          const defaultVal = prop.defaultValue || '-';
          const desc = prop.description || '-';
          output += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${defaultVal} | ${desc} |\n`;
        }
        output += '\n';
      }

      output += `#### Example\n\n\`\`\`tsx\nimport { ${comp.name} } from '@ybouhjira/hyperkit';\n\n<${comp.name}>\n  Content\n</${comp.name}>\n\`\`\`\n\n---\n\n`;
    }
  }

  // ── Services & Hooks ────────────────────────────────────────────────────
  output += `# Services, Hooks & Utilities\n\n`;

  const orderedCategories = Object.keys(NON_COMPONENT_CATEGORIES);
  const emittedCategories = new Set<string>();

  for (const category of orderedCategories) {
    const exports = ncGrouped.get(category);
    if (!exports || exports.length === 0) continue;
    emittedCategories.add(category);

    output += `## ${category}\n\n`;

    for (const nc of exports) {
      output += `### ${nc.name}\n\n`;
      if (nc.description) output += `${nc.description}\n\n`;

      if (nc.kind === 'service' && nc.methods && nc.methods.length > 0) {
        output += `**Kind:** Effect Service\n\n`;
        output += `#### Methods\n\n`;
        output += `| Method | Type | Description |\n`;
        output += `|--------|------|-------------|\n`;
        for (const m of nc.methods) {
          const desc = m.description || '-';
          output += `| \`${m.name}\` | \`${m.signature}\` | ${desc} |\n`;
        }
        output += '\n';
      } else if (nc.signature) {
        output += `**Kind:** ${nc.kind}\n\n`;
        output += `\`\`\`ts\n${nc.signature}\n\`\`\`\n\n`;
      } else {
        output += `**Kind:** ${nc.kind}\n\n`;
      }

      output += `\`\`\`ts\nimport { ${nc.name} } from '@ybouhjira/hyperkit';\n\`\`\`\n\n---\n\n`;
    }
  }

  // Emit uncategorized
  for (const [category, exports] of ncGrouped) {
    if (emittedCategories.has(category)) continue;
    output += `## ${category}\n\n`;
    for (const nc of exports) {
      output += `### ${nc.name}\n\n`;
      if (nc.description) output += `${nc.description}\n\n`;
      output += `**Kind:** ${nc.kind}\n\n`;
      if (nc.signature) output += `\`\`\`ts\n${nc.signature}\n\`\`\`\n\n`;
      output += `\`\`\`ts\nimport { ${nc.name} } from '@ybouhjira/hyperkit';\n\`\`\`\n\n---\n\n`;
    }
  }

  return output;
}

function generatePerComponentDocs(comp: ComponentInfo): string {
  let output = `# ${comp.name}\n\n`;
  output += `> ${comp.description || 'Component'}\n\n`;
  output += `## Props\n\n`;
  output += `| Prop | Type | Required | Default | Description |\n`;
  output += `|------|------|----------|---------|-------------|\n`;

  for (const prop of comp.props) {
    const required = prop.optional ? 'No' : 'Yes';
    const defaultVal = prop.defaultValue || '-';
    const desc = prop.description || '-';
    output += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${defaultVal} | ${desc} |\n`;
  }

  output += `\n## Examples\n\n`;
  output += `### Basic Usage\n\n`;
  output += `\`\`\`tsx\nimport { ${comp.name} } from '@ybouhjira/hyperkit';\n\n`;
  output += `<${comp.name}>\n  Content\n</${comp.name}>\n\`\`\`\n\n`;
  output += `[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)\n`;

  return output;
}

function generatePerExportDocs(nc: ExportInfo): string {
  let output = `# ${nc.name}\n\n`;
  if (nc.description) output += `> ${nc.description}\n\n`;
  output += `**Kind:** ${nc.kind} | **Category:** ${nc.category}\n\n`;

  if (nc.kind === 'service' && nc.methods && nc.methods.length > 0) {
    output += `## Interface\n\n`;
    output += `| Method | Type | Description |\n`;
    output += `|--------|------|-------------|\n`;
    for (const m of nc.methods) {
      output += `| \`${m.name}\` | \`${m.signature}\` | ${m.description || '-'} |\n`;
    }
    output += '\n';
  } else if (nc.signature) {
    output += `## Signature\n\n\`\`\`ts\n${nc.signature}\n\`\`\`\n\n`;
  }

  output += `## Import\n\n\`\`\`ts\nimport { ${nc.name} } from '@ybouhjira/hyperkit';\n\`\`\`\n\n`;
  output += `[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)\n`;

  return output;
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  console.log('🔍 Parsing src/index.ts for all exports...');
  const indexExports = parseIndexExports();
  console.log(`   Found ${indexExports.length} named exports\n`);

  console.log('📦 Processing exports...');
  const { components, nonComponents } = processExports(indexExports);

  console.log(`\n✅ Extracted:`);
  console.log(`   - ${components.length} components`);
  console.log(`   - ${nonComponents.length} services/hooks/utilities\n`);

  // Generate outputs
  console.log('📝 Generating /llms.txt...');
  fs.writeFileSync(LLMS_TXT, generateCompactIndex(components, nonComponents), 'utf-8');
  console.log(`   ✅ Written\n`);

  console.log('📝 Generating /llms-full.txt...');
  fs.writeFileSync(LLMS_FULL_TXT, generateFullReference(components, nonComponents), 'utf-8');
  console.log(`   ✅ Written\n`);

  console.log('📝 Generating /docs/ai/...');
  if (!fs.existsSync(DOCS_AI_DIR)) {
    fs.mkdirSync(DOCS_AI_DIR, { recursive: true });
  }

  for (const comp of components) {
    const docPath = path.join(DOCS_AI_DIR, `${comp.name}.md`);
    fs.writeFileSync(docPath, generatePerComponentDocs(comp), 'utf-8');
  }

  for (const nc of nonComponents) {
    const docPath = path.join(DOCS_AI_DIR, `${nc.name}.md`);
    fs.writeFileSync(docPath, generatePerExportDocs(nc), 'utf-8');
  }

  console.log(`   ✅ ${components.length + nonComponents.length} files written\n`);

  console.log(`🎉 Documentation generation complete!`);
  console.log(`   - ${components.length} components documented`);
  console.log(`   - ${nonComponents.length} services/hooks/utilities documented`);
  console.log(`   - /llms.txt (compact index)`);
  console.log(`   - /llms-full.txt (detailed reference)`);
  console.log(`   - /docs/ai/*.md (per-export docs)`);
}

try {
  main();
} catch (err) {
  console.error('❌ Error:', err);
  process.exit(1);
}
