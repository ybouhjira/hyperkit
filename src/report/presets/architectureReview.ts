import type { ReportSchema } from '../types';

export const architectureReviewSchema: ReportSchema = {
  title: 'SolidKit Diagram Engine',
  subtitle:
    'Comprehensive analysis of research findings, architecture decisions, and identified gaps for a framework-agnostic diagramming library.',
  badge: 'Architecture Review',
  brand: 'SolidKit Diagrams',
  meta: [
    { label: 'February 28, 2026' },
    { label: '9 Libraries Analyzed' },
    { label: '15 Gaps Identified' },
  ],
  score: {
    value: 62,
    label: 'Architecture Completeness',
    description:
      'The current design covers the fundamental structure well — state management, event system, renderer abstraction, and framework adapters — but is missing critical interactive features required for any production diagram editor.',
    color: 'var(--sk-custom-severity-important, var(--sk-warning))',
    chips: [
      { text: '5 Areas Designed', variant: 'done' },
      { text: '2 Partially Defined', variant: 'partial' },
      { text: '6 Critical Gaps', variant: 'missing' },
    ],
  },
  sections: [
    // Section 1: Executive Summary
    {
      id: 'summary',
      label: 'Summary',
      title: 'Executive Summary',
      description:
        'The team is building a framework-agnostic diagramming library — an open-source alternative to GoJS — for the SolidKit ecosystem. After analyzing 9 production libraries, the chosen architecture is a <strong>TanStack + Rete.js Hybrid</strong> pattern.',
      descriptionHtml: true,
      content: [
        {
          type: 'summary-grid',
          items: [
            {
              icon: 'TS',
              iconColor: 'teal',
              title: 'Pure TypeScript Core',
              description:
                '@diagram/core package targeting ~10-15 KB. Zero framework dependencies. Observable Store combined with Pub/Sub events for reactivity.',
            },
            {
              icon: '⇄',
              iconColor: 'blue',
              title: 'Swappable Renderers',
              description:
                'Interface-based renderer architecture supporting SVG, Canvas, and WebGL backends. Switch at runtime or mix within a single diagram.',
            },
            {
              icon: '⬡',
              iconColor: 'purple',
              title: 'Thin Framework Adapters',
              description:
                'SolidJS ~30 lines, React ~50 lines, Vue ~40 lines, Svelte ~35 lines. Each adapter bridges core reactivity to framework primitives.',
            },
            {
              icon: '⧉',
              iconColor: 'teal',
              title: 'Lexical-Style Plugins',
              description:
                'Plugin system inspired by Lexical editor. Minimal core with all features implemented as composable plugins.',
            },
          ],
        },
      ],
    },
    // Section 2: Libraries Analyzed
    {
      id: 'libraries',
      label: 'Libraries',
      title: 'Libraries Analyzed',
      description:
        'Nine production libraries were studied to extract patterns, measure adapter sizes, and identify the strongest architectural ideas.',
      content: [
        {
          type: 'table',
          columns: [
            { key: 'library', label: 'Library' },
            { key: 'pattern', label: 'Pattern' },
            { key: 'adapterSize', label: 'Adapter Size' },
            { key: 'rendererSwap', label: 'Renderer Swap' },
            { key: 'layoutSwap', label: 'Layout Swap' },
            { key: 'insight', label: 'Best Insight' },
          ],
          rows: [
            {
              library: 'TanStack',
              pattern: 'Factory + Store',
              adapterSize: '~50 lines',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'Perfect API parity across frameworks via thin adapters',
            },
            {
              library: 'Rete.js',
              pattern: 'Engine + Plugins',
              adapterSize: '~100 lines',
              rendererSwap: 'Easy',
              layoutSwap: 'N/A',
              insight: 'True renderer swapping; mix renderers within one diagram',
            },
            {
              library: 'Lexical',
              pattern: 'Core + Plugins',
              adapterSize: '~200 lines',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'Minimal core where plugins extend everything',
            },
            {
              library: 'Zag.js',
              pattern: 'State Machines',
              adapterSize: '~30 lines',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'Thinnest adapters; predictable state machine behavior',
            },
            {
              library: 'Floating UI',
              pattern: 'Pure Math',
              adapterSize: '~20 lines',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'Platform-agnostic core at only ~3 KB',
            },
            {
              library: 'ProseMirror',
              pattern: 'Modular Packages',
              adapterSize: 'varies',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'State is pure data; view layer is fully replaceable',
            },
            {
              library: 'Ark UI',
              pattern: 'Zag + Components',
              adapterSize: 'varies',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'State machines cleanly wrapped in component wrappers',
            },
            {
              library: 'Kobalte',
              pattern: 'SolidJS-specific',
              adapterSize: 'N/A',
              rendererSwap: 'N/A',
              layoutSwap: 'N/A',
              insight: 'Optimize deeply for one framework when appropriate',
            },
            {
              library: 'Two.js',
              pattern: 'Renderer API',
              adapterSize: 'N/A',
              rendererSwap: 'Easy',
              layoutSwap: 'N/A',
              insight: 'Single API surface with multiple rendering backends',
            },
          ],
        },
      ],
    },
    // Section 3: Chosen Architecture
    {
      id: 'architecture',
      label: 'Architecture',
      title: 'Chosen Architecture',
      description:
        "A TanStack + Rete.js hybrid: TanStack's factory/adapter pattern for framework parity, combined with Rete.js's plugin engine and renderer swapping.",
      content: [
        {
          type: 'flow-diagram',
          title: 'Dependency Flow',
          layers: [
            {
              id: 'app',
              title: 'User Application',
              packages: 'SolidJS / React / Vue / Svelte',
              color: 'app',
            },
            {
              id: 'adapter',
              title: 'Framework Adapter',
              packages: '@diagram/solid · @diagram/react · @diagram/vue · @diagram/svelte',
              subtitle: 'Reactivity bridging · Component wrappers',
              color: 'adapter',
            },
            {
              id: 'core',
              title: 'Core Library',
              packages: '@diagram/core  ~10-15 KB',
              subtitle:
                'State (Observable Store) · Events (Pub/Sub) · Diagram Engine · Renderer Interface · Layout Interface · Plugin System',
              color: 'core',
            },
          ],
        },
        {
          type: 'package-tree',
          boxes: [
            {
              name: '@diagram/core',
              note: 'Pure TypeScript · Zero dependencies',
              items: [
                'state/ — Observable store (TanStack pattern)',
                'events/ — Pub/Sub emitter',
                'renderers/ — SVG, Canvas, WebGL',
                'layouts/ — Force, Hierarchical, etc.',
                'plugins/ — Plugin system',
              ],
            },
            {
              name: 'Framework Adapters',
              note: 'Thin wrappers · Framework-specific reactivity',
              chips: [
                { label: 'SolidJS', detail: '~30 lines' },
                { label: 'React', detail: '~50 lines' },
                { label: 'Vue', detail: '~40 lines' },
                { label: 'Svelte', detail: '~35 lines' },
              ],
            },
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          label: 'TypeScript',
          code: 'interface DiagramRenderer {\n  init(container: HTMLElement): void;\n  renderNode(node: DiagramNode): void;\n  renderEdge(edge: DiagramEdge): void;\n  clear(): void;\n  getElementAt(x: number, y: number): DiagramElement | null;\n  destroy(): void;\n}',
        },
        {
          type: 'code',
          language: 'typescript',
          label: 'TypeScript',
          code: 'interface LayoutAlgorithm {\n  layout(nodes: DiagramNode[], edges: DiagramEdge[]): LayoutResult;\n  stop(): void;\n}',
        },
      ],
    },
    // Section 4: Theming Architecture
    {
      id: 'theming',
      label: 'Theming',
      title: 'Theming Architecture',
      description:
        "A four-layer theme system that integrates with SolidKit's existing CSS variable infrastructure while supporting all three renderer backends.",
      content: [
        {
          type: 'layer-stack',
          layers: [
            {
              label: 'Layer 1',
              name: 'App Theme (SolidKit)',
              info: 'Inherits --sk-color-primary, --sk-color-surface, --sk-font-* from ThemeProvider at app root.',
              color: 'purple',
            },
            {
              label: 'Layer 2',
              name: 'Diagram Theme (DiagramThemeProvider)',
              info: 'Canvas: --sk-diagram-canvas-bg, --sk-diagram-canvas-grid | Shapes: --sk-diagram-node-fill, --sk-diagram-edge-stroke | Semantic: --sk-diagram-error-fill, --sk-diagram-success-fill',
              color: 'blue',
            },
            {
              label: 'Layer 3',
              name: 'Renderer Abstraction',
              info: 'SVG: CSS variables applied directly | Canvas: resolved via getComputedStyle() | WebGL: converted to shader uniforms',
              color: 'teal',
            },
            {
              label: 'Layer 4',
              name: 'Data-Driven Styling',
              info: 'Conditional style functions per node/edge | Semantic CSS classes for state (selected, hovered, error, disabled)',
              color: 'green',
            },
          ],
        },
        {
          type: 'code',
          language: 'css',
          label: 'CSS Variable Hierarchy',
          code: '/* App level (SolidKit ThemeProvider) */\n--sk-color-primary: #2dd4bf;\n\n/* Diagram level (DiagramThemeProvider) */\n--sk-diagram-canvas-bg: #0d1117;\n\n/* Shape level */\n--sk-diagram-node-fill: #1a1f27;\n--sk-diagram-edge-stroke: #30363d;\n\n/* Semantic level */\n--sk-diagram-error-fill: #f85149;\n--sk-diagram-success-fill: #3fb950;',
        },
        {
          type: 'preset-grid',
          presets: [
            {
              name: 'UML Blue',
              description: 'Classic UML diagram styling',
              gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            },
            {
              name: 'BPMN Standard',
              description: 'Business process notation',
              gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            },
            {
              name: 'Flowchart Classic',
              description: 'Traditional flowchart colors',
              gradient: 'linear-gradient(135deg, #10b981, #059669)',
            },
            {
              name: 'Dark Mode',
              description: 'High-contrast dark theme',
              gradient: 'linear-gradient(135deg, #374151, #111827)',
            },
          ],
        },
      ],
    },
    // Section 5: Gap Analysis
    {
      id: 'gaps',
      label: 'Gap Analysis',
      title: 'Gap Analysis',
      description:
        'The most critical part of this review. These gaps must be addressed before implementation begins. Six critical gaps would make the library unusable for real-world diagram editors.',
      content: [
        {
          type: 'gap-analysis',
          title: 'Identified Gaps',
          gaps: [
            {
              id: 'GAP-001',
              title: 'No Batch/Transaction System',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'Store.setState notifies per call. Adding 100 nodes triggers 100 re-renders. No way to defer notifications until a batch completes.',
                },
                {
                  tag: 'solution',
                  text: 'Add diagram.batch(() => { addNode(...); addNode(...); }) that defers notifications until the callback completes.',
                },
                {
                  tag: 'precedent',
                  text: 'React batches setState; SolidJS batches in transactions via batch().',
                },
              ],
            },
            {
              id: 'GAP-002',
              title: 'No Undo/Redo System',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'Any interactive diagram editor requires undo/redo. This is not even mentioned in the architecture documents.',
                },
                {
                  tag: 'solution',
                  text: 'Command pattern with undo stack. Each mutation is a Command object with execute() and undo(). GoJS uses CommandHandler + UndoManager.',
                },
                {
                  tag: 'precedent',
                  text: 'GoJS CommandHandler/UndoManager, Excalidraw history, draw.io undo stack.',
                },
              ],
            },
            {
              id: 'GAP-003',
              title: 'No Selection Model',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'How do users select nodes and edges? No model for single select, multi-select, shift-click, or lasso selection.',
                },
                {
                  tag: 'solution',
                  text: 'Selection state in core: selectedNodes: Set<string>, selectedEdges: Set<string>. Selection tools: click, shift-click, lasso.',
                },
                {
                  tag: 'precedent',
                  text: 'GoJS Selection model, Excalidraw multi-select, React Flow node selection.',
                },
              ],
            },
            {
              id: 'GAP-004',
              title: 'No Viewport (Pan/Zoom)',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'No transform matrix, no coordinate conversion between screen and diagram space, no fit-to-content, no zoom controls.',
                },
                {
                  tag: 'solution',
                  text: 'Viewport class with transform matrix. Methods: pan(), zoom(), fitToContent(), screenToWorld(), worldToScreen().',
                },
                {
                  tag: 'precedent',
                  text: 'Every diagram tool implements this. GoJS Diagram.viewportBounds, React Flow viewport transform.',
                },
              ],
            },
            {
              id: 'GAP-005',
              title: 'No Interaction System',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'GoJS has Tools (DragMoveTool, LinkingTool, ResizingTool). There is zero mention of how user interactions are handled.',
                },
                {
                  tag: 'solution',
                  text: 'Tool system where the active tool handles mouse/touch/keyboard events. Tools: Select, DragMove, Connect, Resize, Pan. Tool manager dispatches events to active tool.',
                },
                {
                  tag: 'precedent',
                  text: 'GoJS ToolManager + Tool classes, Excalidraw tools, Figma tool system.',
                },
              ],
            },
            {
              id: 'GAP-006',
              title: 'No Serialization/Deserialization',
              severity: 'critical',
              rows: [
                {
                  tag: 'problem',
                  text: 'Cannot save or load diagrams. Critical for any persistence use case (databases, file export, clipboard).',
                },
                {
                  tag: 'solution',
                  text: 'diagram.toJSON() / Diagram.fromJSON() with versioned schema. Support partial serialization for clipboard operations.',
                },
                {
                  tag: 'precedent',
                  text: 'GoJS model.toJson(), draw.io XML serialization, Excalidraw JSON format.',
                },
              ],
            },
            {
              id: 'GAP-007',
              title: 'Edge Routing Undefined',
              severity: 'important',
              rows: [
                {
                  tag: 'problem',
                  text: 'No specification for orthogonal routes, bezier curves, obstacle avoidance, or port/connection point definitions.',
                },
              ],
            },
            {
              id: 'GAP-008',
              title: 'Plugin System Has No Interface',
              severity: 'important',
              rows: [
                {
                  tag: 'problem',
                  text: 'Just says "Lexical-style" without defining lifecycle hooks, dependency resolution, registration API, or plugin communication.',
                },
              ],
            },
            {
              id: 'GAP-009',
              title: 'Hit Testing is Naive',
              severity: 'important',
              rows: [
                {
                  tag: 'problem',
                  text: 'SVG uses elementFromPoint (returns only topmost element). Canvas does O(n) scan. Neither scales to 1000+ elements. Needs R-tree or quadtree spatial index.',
                },
              ],
            },
            {
              id: 'GAP-010',
              title: 'Adapter Design Oversimplified',
              severity: 'important',
              rows: [
                {
                  tag: 'problem',
                  text: 'Adapters need more than signal bridging. Must support component trees, custom node templates/renderers, and framework-idiomatic composition patterns.',
                },
              ],
            },
            {
              id: 'GAP-011',
              title: 'Theming Not Connected to Core',
              severity: 'important',
              rows: [
                {
                  tag: 'problem',
                  text: 'Theming and core architecture exist in separate documents with no defined integration point. DiagramThemeProvider has no link to the Diagram class.',
                },
              ],
            },
            {
              id: 'GAP-012',
              title: 'Accessibility (ARIA, Keyboard Navigation)',
              severity: 'nice',
              rows: [
                {
                  tag: 'problem',
                  text: 'Screen reader support, keyboard-only navigation, focus management for diagram elements, ARIA roles for nodes and edges.',
                },
              ],
            },
            {
              id: 'GAP-013',
              title: 'Minimap / Overview Panel',
              severity: 'nice',
              rows: [
                {
                  tag: 'problem',
                  text: 'Thumbnail overview of the full diagram with viewport indicator. Common in large diagram tools for navigation.',
                },
              ],
            },
            {
              id: 'GAP-014',
              title: 'Grouping / Containment (Swimlanes)',
              severity: 'nice',
              rows: [
                {
                  tag: 'problem',
                  text: 'Parent-child node relationships, expandable groups, swimlane containers, collapse/expand behavior.',
                },
              ],
            },
            {
              id: 'GAP-015',
              title: 'Monorepo Tooling Choice',
              severity: 'nice',
              rows: [
                {
                  tag: 'problem',
                  text: 'No decision on Turborepo vs Nx vs plain pnpm workspaces for managing @diagram/core + adapter packages.',
                },
              ],
            },
          ],
        },
      ],
    },
    // Section 6: Structural Issues
    {
      id: 'issues',
      label: 'Issues',
      title: 'Structural Issues',
      description:
        'Beyond missing features, there are organizational and design issues in the current documentation and architecture.',
      content: [
        {
          type: 'issue-list',
          issues: [
            {
              icon: '📄',
              title: 'Document Overlap',
              description:
                'The 146-line research document is a subset of the larger 705-line architecture document. Maintaining both causes drift and confusion about which is authoritative.',
            },
            {
              icon: '⚙',
              title: 'Diagram Class is Overloaded',
              description:
                'The Diagram class owns state, events, renderer, and layout all in one object. GoJS separates these into Diagram, Model, ToolManager, and CommandHandler. The current design will become unwieldy as features are added.',
            },
            {
              icon: '📦',
              title: 'No Monorepo or Build Tooling Decisions',
              description:
                'With multiple packages (@diagram/core, @diagram/solid, @diagram/react, etc.), there is no decision on build tooling, publishing strategy, or version synchronization.',
            },
          ],
        },
      ],
    },
    // Section 7: Recommended Next Steps
    {
      id: 'roadmap',
      label: 'Roadmap',
      title: 'Recommended Next Steps',
      description:
        'A phased roadmap to go from current research state to a working prototype. Priority order based on dependency chain and gap severity.',
      content: [
        {
          type: 'timeline',
          steps: [
            {
              title: 'Consolidate Documentation',
              description:
                'Merge the 3 text documents (146-line research, 705-line architecture, theming doc) into a single authoritative architecture specification. Eliminate redundancy.',
              status: 'active',
              meta: 'Immediate',
            },
            {
              title: 'Fill 6 Critical Gaps',
              description:
                'Design and specify: Batch/Transaction system, Undo/Redo (Command pattern), Selection model, Viewport (transform matrix + coordinate conversion), Interaction/Tool system, Serialization format.',
              status: 'active',
              meta: 'Immediate',
            },
            {
              title: 'Define Plugin Interface',
              description:
                'Specify plugin lifecycle (register, init, destroy), hook points (beforeNodeAdd, afterLayout, etc.), dependency declaration, and inter-plugin communication.',
              status: 'pending',
              meta: 'Next Sprint',
            },
            {
              title: 'Connect Theming to Core',
              description:
                'Define how DiagramThemeProvider integrates with the Diagram class. Specify CSS variable resolution for Canvas and WebGL renderers. Document theme override cascade.',
              status: 'pending',
              meta: 'Next Sprint',
            },
            {
              title: 'Choose Monorepo Tooling',
              description:
                'Evaluate Turborepo, Nx, and pnpm workspaces. Select build tool (tsup, unbuild, or Vite library mode). Define publishing and versioning strategy.',
              status: 'pending',
              meta: 'Before Implementation',
            },
            {
              title: 'Minimal Core Prototype',
              description:
                'Implement @diagram/core with: Store, EventEmitter, SVG renderer, basic force layout. Build one adapter (@diagram/solid). Create 3 demo diagrams proving the architecture works end-to-end.',
              status: 'pending',
              meta: 'Implementation Phase',
            },
          ],
        },
      ],
    },
    // Section 8: Sources
    {
      id: 'sources',
      label: 'Sources',
      title: 'Sources',
      description:
        'All libraries and documentation referenced during the research phase, grouped by library.',
      content: [
        {
          type: 'source-list',
          groups: [
            {
              title: 'TanStack',
              sources: [
                {
                  url: 'https://github.com/TanStack/table',
                  label: 'github.com/TanStack/table',
                  description: 'Core + adapter architecture reference',
                },
                {
                  url: 'https://github.com/TanStack/query',
                  label: 'github.com/TanStack/query',
                  description: 'Framework adapter pattern',
                },
              ],
            },
            {
              title: 'Rete.js',
              sources: [
                {
                  url: 'https://github.com/retejs/rete',
                  label: 'github.com/retejs/rete',
                  description: 'Plugin engine and renderer swapping',
                },
                {
                  url: 'https://rete.js.org',
                  label: 'rete.js.org',
                  description: 'Official documentation',
                },
              ],
            },
            {
              title: 'Lexical',
              sources: [
                {
                  url: 'https://github.com/facebook/lexical',
                  label: 'github.com/facebook/lexical',
                  description: 'Plugin architecture reference',
                },
              ],
            },
            {
              title: 'Zag.js',
              sources: [
                {
                  url: 'https://github.com/chakra-ui/zag',
                  label: 'github.com/chakra-ui/zag',
                  description: 'State machine pattern for UI components',
                },
              ],
            },
            {
              title: 'Floating UI',
              sources: [
                {
                  url: 'https://github.com/floating-ui/floating-ui',
                  label: 'github.com/floating-ui/floating-ui',
                  description: 'Platform-agnostic core (~3KB)',
                },
              ],
            },
            {
              title: 'Diagram Tools',
              sources: [
                {
                  url: 'https://gojs.net',
                  label: 'gojs.net',
                  description: 'GoJS: the gold standard for diagram editors (proprietary)',
                },
                {
                  url: 'https://github.com/excalidraw/excalidraw',
                  label: 'github.com/excalidraw/excalidraw',
                  description: 'Canvas-based whiteboard tool',
                },
                {
                  url: 'https://reactflow.dev',
                  label: 'reactflow.dev',
                  description: 'React Flow: React-specific diagram library',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  footer: 'SolidKit Diagram Engine — Architecture Review — February 28, 2026',
};
