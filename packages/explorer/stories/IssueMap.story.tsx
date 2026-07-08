import { defineStory } from '../src/api';
import { IssueMap } from '../src/components/IssueMap/IssueMap';
import type { IssueData, IssueMapGroupBy, IssueMapSwitcherVariant, IssueMapTransition } from '../src/components/IssueMap/types';
import type { PartsConfig } from '../src/components/IssueMap/parts';
import type { IssueMapPartName, IssueMapPresetName } from '../src/components/IssueMap/presets';

const SOLIDKIT_ISSUES: IssueData[] = [
  // Vision
  {
    id: 'hyperkit-196',
    number: 196,
    title: 'SolidKit Studio - Unified Platform',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Vision',
    project: 'hyperkit',
  },

  // Products
  {
    id: 'hyperkit-194',
    number: 194,
    title: 'ComfyUI Clone',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Products',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-195',
    number: 195,
    title: 'ERP Rebuild - Phoenix ERP',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Products',
    project: 'hyperkit',
  },

  // Dashboard
  {
    id: 'hyperkit-207',
    number: 207,
    title: 'ProjectDashboard - Multi-Project View',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199', 'hyperkit-206'],
    layer: 'Dashboard',
    project: 'hyperkit',
  },

  // Features
  {
    id: 'hyperkit-206',
    number: 206,
    title: 'WorkflowLauncher - Issue to Session',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-202', 'hyperkit-204'],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-205',
    number: 205,
    title: 'CodeEditor - Monaco',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-204',
    number: 204,
    title: 'SessionManager Component',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-203',
    number: 203,
    title: 'RepoCard Component',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-202',
    number: 202,
    title: 'IssueBoard Component',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Features',
    project: 'hyperkit',
  },

  // ─── Component System ────────────────────────────

  {
    id: 'hyperkit-209',
    number: 209,
    title: 'Component Customization System',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-210',
    number: 210,
    title: 'Fullscreen Toggle - Content Components',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Features',
    project: 'hyperkit',
  },

  // Explorer
  {
    id: 'hyperkit-201',
    number: 201,
    title: 'Explorer - Service Testing',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Explorer',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-200',
    number: 200,
    title: 'Explorer - Component Testing',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Explorer',
    project: 'hyperkit',
  },

  // ─── PM System ───────────────────────────────────

  {
    id: 'hyperkit-219',
    number: 219,
    title: 'Project Drill-down Navigation',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Features',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-220',
    number: 220,
    title: 'Fix IssueMap Layout Spacing',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Explorer',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-221',
    number: 221,
    title: 'PM Store + Mock Provider',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-199'],
    layer: 'Explorer',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-222',
    number: 222,
    title: 'PM View Components (5 views)',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-221'],
    layer: 'Explorer',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-223',
    number: 223,
    title: 'Real-time Progress Updates',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-221'],
    layer: 'Explorer',
    project: 'hyperkit',
  },

  // Core (active)
  {
    id: 'hyperkit-199',
    number: 199,
    title: 'Explorer - Core Runtime & Shell',
    status: 'active',
    progress: { done: 1, total: 4 },
    dependsOn: [],
    layer: 'Core',
    project: 'hyperkit',
  },

  // Infrastructure
  {
    id: 'hyperkit-192',
    number: 192,
    title: 'DAG Execution Engine',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Infrastructure',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-193',
    number: 193,
    title: 'Deno Embed Module System',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Infrastructure',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-191',
    number: 191,
    title: 'Rust + WASM Stack',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Infrastructure',
    project: 'hyperkit',
  },
  {
    id: 'hyperkit-190',
    number: 190,
    title: 'SolidKit Framework Architecture',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Infrastructure',
    project: 'hyperkit',
  },

  // ─── Document System ─────────────────────────────

  {
    id: 'hyperkit-211',
    number: 211,
    title: 'DocumentPage Primitive',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: [],
    layer: 'Document',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-212',
    number: 212,
    title: 'ExamBuilder Composite',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-211'],
    layer: 'Document',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-213',
    number: 213,
    title: 'TemplateGallery + PrintPreview',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-211', 'hyperkit-212'],
    layer: 'Document',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-214',
    number: 214,
    title: 'ExerciseBlock Primitives (5 types)',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-211'],
    layer: 'Document',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-215',
    number: 215,
    title: 'CorrectionSheet Generator',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-211', 'hyperkit-214'],
    layer: 'Document',
    project: 'exam-generator',
  },

  // ─── Exam Generator App ──────────────────────────

  {
    id: 'hyperkit-216',
    number: 216,
    title: 'Exam Generator Web App',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-212', 'hyperkit-213', 'hyperkit-214', 'hyperkit-215'],
    layer: 'Apps',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-217',
    number: 217,
    title: 'Exam Generator Android App',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-216'],
    layer: 'Apps',
    project: 'exam-generator',
  },
  {
    id: 'hyperkit-218',
    number: 218,
    title: 'LaTeX Export Support',
    status: 'blocked',
    progress: { done: 0, total: 0 },
    dependsOn: ['hyperkit-214'],
    layer: 'Document',
    project: 'exam-generator',
  },
];

export const IssueMapStory = defineStory({
  title: 'Issue Map',
  category: 'Tools',
  layout: 'fullscreen',
  render: (controlValues: Record<string, unknown>) => {
    const presetName = (controlValues.preset as string) ?? 'full';
    const behavior = {
      groupBy: (controlValues.groupBy as IssueMapGroupBy) ?? 'project',
      switcherVariant: (controlValues.switcherVariant as IssueMapSwitcherVariant) ?? 'tabs',
      transition: (controlValues.transition as IssueMapTransition) ?? 'crossfade',
      transitionDuration: (controlValues.transitionDuration as number) ?? 300,
      autoFit: (controlValues.autoFit as boolean) ?? true,
      showGrid: (controlValues.showGrid as boolean) ?? false,
    };

    // Part overrides from individual toggles
    const parts: PartsConfig<IssueMapPartName> = {};
    if (controlValues.showZoomControls === false) parts.zoomControls = false;
    if (controlValues.showProgress === false) parts.nodeProgressBar = false;
    if (controlValues.showProjectLabel === false) parts.nodeProjectLabel = false;
    if (controlValues.showLayerGroups === false) parts.layerGroups = false;
    if (controlValues.showBadge === false) parts.nodeBadge = false;
    if (controlValues.showNumber === false) parts.nodeNumber = false;
    if (controlValues.showSwitcher === false) parts.switcher = false;

    return (
      <IssueMap
        issues={SOLIDKIT_ISSUES}
        preset={presetName as IssueMapPresetName}
        behavior={behavior}
        parts={parts}
      />
    );
  },
  controls: {
    preset: {
      type: 'select' as const,
      options: ['full', 'minimal', 'compact', 'enterprise', 'dashboard'],
      defaultValue: 'full',
    },
    groupBy: {
      type: 'select' as const,
      options: ['project', 'layer', 'status', 'none'],
      defaultValue: 'project',
    },
    switcherVariant: {
      type: 'select' as const,
      options: ['tabs', 'dropdown', 'pill'],
      defaultValue: 'pill',
    },
    transition: {
      type: 'select' as const,
      options: ['morph', 'crossfade', 'slide', 'none'],
      defaultValue: 'morph',
    },
    transitionDuration: { type: 'number' as const, defaultValue: 300 },
    showZoomControls: { type: 'boolean' as const, defaultValue: true },
    showProgress: { type: 'boolean' as const, defaultValue: true },
    showProjectLabel: { type: 'boolean' as const, defaultValue: true },
    showLayerGroups: { type: 'boolean' as const, defaultValue: true },
    showBadge: { type: 'boolean' as const, defaultValue: true },
    showNumber: { type: 'boolean' as const, defaultValue: true },
    showSwitcher: { type: 'boolean' as const, defaultValue: true },
    autoFit: { type: 'boolean' as const, defaultValue: true },
    showGrid: { type: 'boolean' as const, defaultValue: false },
  },
});
