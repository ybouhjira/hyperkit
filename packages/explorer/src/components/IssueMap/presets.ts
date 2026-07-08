import { defineAnatomy, definePreset } from './parts';

// ─── IssueMap Anatomy ───────────────────────────────────────────────────────

/** All customizable parts of the IssueMap component */
export const ISSUE_MAP_PARTS = [
  'root',            // Outer container
  'switcher',        // Project/group switcher bar
  'graph',           // The diagram container
  'nodeNumber',      // #N issue number in nodes
  'nodeBadge',       // Status badge in nodes
  'nodeTitle',       // Issue title text in nodes
  'nodeProjectLabel',// Project name label in nodes
  'nodeProgressBar', // Progress bar in nodes
  'zoomControls',    // +/-/Fit zoom buttons
  'layerGroups',     // Layer group frames around nodes
] as const;

export type IssueMapPartName = (typeof ISSUE_MAP_PARTS)[number];

export const issueMapAnatomy = defineAnatomy('issueMap', ISSUE_MAP_PARTS);

// ─── Built-in Presets ───────────────────────────────────────────────────────

/** Full preset — everything enabled (default) */
export const fullPreset = definePreset<IssueMapPartName>(
  'full',
  {},  // empty = all defaults = all enabled
  'All features enabled — switcher, zoom, groups, labels, progress'
);

/** Minimal preset — just the graph with clean nodes */
export const minimalPreset = definePreset<IssueMapPartName>(
  'minimal',
  {
    switcher: false,
    nodeBadge: false,
    nodeProjectLabel: false,
    nodeProgressBar: false,
    zoomControls: false,
    layerGroups: false,
  },
  'Clean graph with just issue numbers and titles'
);

/** Compact preset — smaller nodes, essential info only */
export const compactPreset = definePreset<IssueMapPartName>(
  'compact',
  {
    nodeProgressBar: false,
    nodeProjectLabel: false,
    layerGroups: false,
  },
  'Compact view with number, title, and badge only'
);

/** Enterprise preset — everything enabled with extra styling */
export const enterprisePreset = definePreset<IssueMapPartName>(
  'enterprise',
  {
    root: { style: { 'font-family': 'var(--sk-font-ui)' } },
    switcher: { style: { 'border-bottom': '2px solid var(--sk-border)' } },
  },
  'Full features with refined enterprise styling'
);

/** Dashboard preset — optimized for embedding in dashboards */
export const dashboardPreset = definePreset<IssueMapPartName>(
  'dashboard',
  {
    switcher: false,
    zoomControls: false,
    nodeProjectLabel: false,
  },
  'Embedded view without navigation chrome — ideal for dashboard panels'
);

/** Map of preset names for easy lookup */
export const issueMapPresets = {
  full: fullPreset,
  minimal: minimalPreset,
  compact: compactPreset,
  enterprise: enterprisePreset,
  dashboard: dashboardPreset,
} as const;

export type IssueMapPresetName = keyof typeof issueMapPresets;
