export type IssueStatus = 'active' | 'ready' | 'blocked' | 'pending' | 'closed';

export interface IssueData {
  readonly id: string; // Unique node identifier (e.g., 'hyperkit-1', 'phoenix-erp-3')
  readonly number: number; // Display number (#1, #2, etc.)
  readonly title: string;
  readonly status: IssueStatus;
  readonly progress: { readonly done: number; readonly total: number };
  readonly dependsOn: readonly string[]; // References to other IssueData.id values
  readonly layer: string;
  readonly project: string; // Short project name like 'hyperkit' or 'phoenix-erp'
}

export type IssueMapSwitcherVariant = 'tabs' | 'dropdown' | 'pill';
export type IssueMapTransition = 'crossfade' | 'slide' | 'morph' | 'none';
export type IssueMapGroupBy = 'project' | 'layer' | 'status' | 'none';

// ─── IssueMap Configuration ─────────────────────────────────────────────────

/** Behavioral configuration — things that aren't about parts visibility */
export interface IssueMapBehavior {
  /** How to group/separate issues */
  readonly groupBy: IssueMapGroupBy;
  /** UI variant for the group switcher (only when switcher part is enabled) */
  readonly switcherVariant: IssueMapSwitcherVariant;
  /** Transition animation when switching groups */
  readonly transition: IssueMapTransition;
  /** Transition duration in ms */
  readonly transitionDuration: number;
  /** Node width in px */
  readonly nodeWidth: number;
  /** Node height in px */
  readonly nodeHeight: number;
  /** Horizontal spacing between nodes in px */
  readonly nodeSpacing: number;
  /** Vertical spacing between ranks in px */
  readonly rankSpacing: number;
  /** Auto-fit diagram on load */
  readonly autoFit: boolean;
  /** Show grid background */
  readonly showGrid: boolean;
}

export const DEFAULT_BEHAVIOR: IssueMapBehavior = {
  groupBy: 'project',
  switcherVariant: 'pill',
  transition: 'morph',
  transitionDuration: 300,
  nodeWidth: 280,
  nodeHeight: 120,
  nodeSpacing: 40,
  rankSpacing: 60,
  autoFit: true,
  showGrid: false,
};

// Keep backward compat — IssueMapConfig is now just the behavior
export type IssueMapConfig = IssueMapBehavior;
export const DEFAULT_ISSUE_MAP_CONFIG = DEFAULT_BEHAVIOR;
