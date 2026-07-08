import type { UxAuditResult } from '../engine/UxAuditEngine';
import type { DockPosition } from '../dock/dockState';

/** State for the DevTools panel */
export interface DevToolsState {
  enabled: boolean;
  inspectMode: boolean;
  panelVisible: boolean;
  /** Edge the panel is docked to. Persisted to localStorage. */
  dockPosition: DockPosition;
  /** True while the panel lives in a separate popup window. */
  detached: boolean;
  activeTab: 'inspect' | 'styles' | 'theme-audit' | 'tokens' | 'tree' | 'overview' | 'framework' | 'logs' | 'bugs' | 'ux-audit' | 'timeline' | 'perf';
  inspectedElement: HTMLElement | null;
  hoveredElement: HTMLElement | null;
  searchQuery: string;
  bugFilter: 'all' | 'open' | 'resolved';
  logLevel: 'all' | 'debug' | 'info' | 'warning' | 'error';
  logSearch: string;
  uxAuditFilter: 'all' | 'violations' | 'warnings' | 'passes';
  uxAuditResult: UxAuditResult | null;
  uxAuditLlmAnalysis: string | null;
  uxAuditLlmRunning: boolean;
}

export type { UxAuditResult };

/** Information about a SolidKit component identified from DOM classes */
export interface InspectedComponent {
  name: string;
  element: HTMLElement;
  classes: string[];
  variant: string | null;
  size: string | null;
  subPart: string | null;
  parentComponent: string | null;
}

/** A single CSS variable resolution trace */
export interface CssVarTrace {
  variable: string;
  value: string | null;
  isSet: boolean;
  source: VarSource;
  fallbackTrace?: CssVarTrace;
}

/** Where a CSS variable value originates */
export type VarSource =
  | { type: 'theme'; group: string; key: string; themeName: string }
  | { type: 'component-override'; variable: string }
  | { type: 'custom-property'; key: string }
  | { type: 'inline' }
  | { type: 'unset' };

/** A CSS property with its full resolution chain */
export interface InspectedProperty {
  name: string;
  computedValue: string;
  rawValue: string;
  traces: CssVarTrace[];
  source: 'stylesheet' | 'inline' | 'inherited';
}

/** A matched CSS rule from stylesheets */
export interface MatchedRule {
  selector: string;
  specificity: [number, number, number];
  properties: Record<string, string>;
  source: string;
}

/** Parsed var() expression */
export interface VarExpression {
  type: 'var';
  name: string;
  fallback: CssValue | null;
}

/** A CSS value that may contain var() expressions */
export type CssValue =
  | { type: 'literal'; value: string }
  | VarExpression
  | { type: 'composite'; parts: CssValue[] };

/** Token info for the token browser */
export interface TokenInfo {
  variable: string;
  value: string;
  group: string;
  themeKey: string | null;
}

/** Actions for DevTools state management */
export type DevToolsAction =
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'SET_INSPECT_MODE'; payload: boolean }
  | { type: 'SET_PANEL_VISIBLE'; payload: boolean }
  | { type: 'SET_DOCK_POSITION'; payload: DockPosition }
  | { type: 'SET_DETACHED'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: DevToolsState['activeTab'] }
  | { type: 'SET_INSPECTED_ELEMENT'; payload: HTMLElement | null }
  | { type: 'SET_HOVERED_ELEMENT'; payload: HTMLElement | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_BUG_FILTER'; payload: 'all' | 'open' | 'resolved' }
  | { type: 'SET_LOG_LEVEL'; payload: 'all' | 'debug' | 'info' | 'warning' | 'error' }
  | { type: 'SET_LOG_SEARCH'; payload: string }
  | { type: 'SET_UX_AUDIT_FILTER'; payload: 'all' | 'violations' | 'warnings' | 'passes' }
  | { type: 'SET_UX_AUDIT_RESULT'; payload: UxAuditResult | null }
  | { type: 'SET_UX_AUDIT_LLM_ANALYSIS'; payload: string | null }
  | { type: 'SET_UX_AUDIT_LLM_RUNNING'; payload: boolean };
