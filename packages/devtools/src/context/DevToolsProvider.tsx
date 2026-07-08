import { createContext, useContext, ParentProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { DevToolsState, DevToolsAction } from './types';
import type { BugReportStorage } from '@ybouhjira/hyperkit';
import { loadDockPosition, saveDockPosition } from '../dock/dockState';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  annotations?: Record<string, unknown>;
}

interface DevToolsContextValue {
  state: DevToolsState;
  dispatch: (action: DevToolsAction) => void;
  themeName: () => string;
  product: () => string;
  version: () => string;
  bugStorage: () => BugReportStorage | undefined;
  logEntries: () => LogEntry[];
  onLogClear: () => (() => void) | undefined;
  onInspect: () => (() => void) | undefined;
  onBugReport: () => (() => void) | undefined;
  onThemeToggle: () => (() => void) | undefined;
}

const DevToolsContext = createContext<DevToolsContextValue>();

const initialState: DevToolsState = {
  enabled: false,
  inspectMode: false,
  panelVisible: false,
  dockPosition: 'bottom',
  detached: false,
  activeTab: 'inspect',
  inspectedElement: null,
  hoveredElement: null,
  searchQuery: '',
  bugFilter: 'all',
  logLevel: 'all',
  logSearch: '',
  uxAuditFilter: 'all',
  uxAuditResult: null,
  uxAuditLlmAnalysis: null,
  uxAuditLlmRunning: false,
};

function reducer(state: DevToolsState, action: DevToolsAction): Partial<DevToolsState> {
  switch (action.type) {
    case 'TOGGLE_ENABLED':
      return {
        enabled: !state.enabled,
        panelVisible: !state.enabled,
        inspectMode: false,
        inspectedElement: null,
        hoveredElement: null,
      };
    case 'SET_INSPECT_MODE':
      return {
        inspectMode: action.payload,
        hoveredElement: action.payload ? state.hoveredElement : null,
      };
    case 'SET_PANEL_VISIBLE':
      return { panelVisible: action.payload };
    case 'SET_DOCK_POSITION':
      // Picking a dock edge always brings the panel back into the page.
      return { dockPosition: action.payload, detached: false };
    case 'SET_DETACHED':
      return { detached: action.payload };
    case 'SET_ACTIVE_TAB':
      return { activeTab: action.payload };
    case 'SET_INSPECTED_ELEMENT':
      return {
        inspectedElement: action.payload,
        inspectMode: action.payload ? false : state.inspectMode,
      };
    case 'SET_HOVERED_ELEMENT':
      return { hoveredElement: action.payload };
    case 'SET_SEARCH_QUERY':
      return { searchQuery: action.payload };
    case 'SET_BUG_FILTER':
      return { bugFilter: action.payload };
    case 'SET_LOG_LEVEL':
      return { logLevel: action.payload };
    case 'SET_LOG_SEARCH':
      return { logSearch: action.payload };
    case 'SET_UX_AUDIT_FILTER':
      return { uxAuditFilter: action.payload };
    case 'SET_UX_AUDIT_RESULT':
      return { uxAuditResult: action.payload };
    case 'SET_UX_AUDIT_LLM_ANALYSIS':
      return { uxAuditLlmAnalysis: action.payload };
    case 'SET_UX_AUDIT_LLM_RUNNING':
      return { uxAuditLlmRunning: action.payload };
  }
}

export interface DevToolsProviderProps extends ParentProps {
  themeName?: string;
  product?: string;
  version?: string;
  bugStorage?: BugReportStorage;
  logEntries?: () => LogEntry[];
  onLogClear?: () => void;
  onInspect?: () => void;
  onBugReport?: () => void;
  onThemeToggle?: () => void;
}

export function DevToolsProvider(props: DevToolsProviderProps) {
  const [state, setState] = createStore<DevToolsState>({
    ...initialState,
    dockPosition: loadDockPosition(),
  });

  const dispatch = (action: DevToolsAction) => {
    const updates = reducer(state, action);
    setState(produce((s) => Object.assign(s, updates)));
    if (action.type === 'SET_DOCK_POSITION') {
      saveDockPosition(action.payload);
    }
  };

  const value: DevToolsContextValue = {
    state,
    dispatch,
    themeName: () => props.themeName ?? 'Unknown',
    product: () => props.product ?? 'App',
    version: () => props.version ?? '0.0.0',
    bugStorage: () => props.bugStorage,
    logEntries: () => props.logEntries?.() ?? [],
    onLogClear: () => props.onLogClear,
    onInspect: () => props.onInspect,
    onBugReport: () => props.onBugReport,
    onThemeToggle: () => props.onThemeToggle,
  };

  return (
    <DevToolsContext.Provider value={value}>
      {props.children}
    </DevToolsContext.Provider>
  );
}

export function useDevTools(): DevToolsContextValue {
  const ctx = useContext(DevToolsContext);
  if (!ctx) throw new Error('useDevTools must be used within DevToolsProvider');
  return ctx;
}
