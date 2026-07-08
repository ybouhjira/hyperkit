import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import {
  DevToolsProvider,
  useDevTools,
  type LogEntry,
} from '../src/context/DevToolsProvider';
import type { DevToolsProviderProps } from '../src/context/DevToolsProvider';
import { DOCK_STORAGE_KEY } from '../src/dock/dockState';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

type Ctx = ReturnType<typeof useDevTools>;

function setup(props: Omit<DevToolsProviderProps, 'children'> = {}): Ctx {
  let ctx!: Ctx;
  function Grab() {
    ctx = useDevTools();
    return null;
  }
  render(() => (
    <DevToolsProvider {...props}>
      <Grab />
    </DevToolsProvider>
  ));
  return ctx;
}

describe('DevToolsProvider state', () => {
  it('initializes the dock position from localStorage', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'left');
    const { state } = setup();
    expect(state.dockPosition).toBe('left');
    expect(state.detached).toBe(false);
  });

  it('persists SET_DOCK_POSITION and re-attaches a detached panel', () => {
    const { state, dispatch } = setup();
    dispatch({ type: 'SET_DETACHED', payload: true });
    expect(state.detached).toBe(true);

    dispatch({ type: 'SET_DOCK_POSITION', payload: 'right' });
    expect(state.dockPosition).toBe('right');
    expect(state.detached).toBe(false);
    expect(localStorage.getItem(DOCK_STORAGE_KEY)).toBe('right');
  });

  it('does not persist on unrelated actions', () => {
    const { dispatch } = setup();
    dispatch({ type: 'SET_DETACHED', payload: true });
    dispatch({ type: 'SET_PANEL_VISIBLE', payload: true });
    expect(localStorage.getItem(DOCK_STORAGE_KEY)).toBeNull();
  });

  it('TOGGLE_ENABLED flips enabled+panelVisible and resets inspection', () => {
    const { state, dispatch } = setup();
    const el = document.createElement('div');
    dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: el });
    dispatch({ type: 'TOGGLE_ENABLED' });
    expect(state.enabled).toBe(true);
    expect(state.panelVisible).toBe(true);
    expect(state.inspectedElement).toBeNull();
    dispatch({ type: 'TOGGLE_ENABLED' });
    expect(state.enabled).toBe(false);
  });

  it('SET_INSPECT_MODE clears the hovered element when turning off', () => {
    const { state, dispatch } = setup();
    const el = document.createElement('div');
    dispatch({ type: 'SET_INSPECT_MODE', payload: true });
    dispatch({ type: 'SET_HOVERED_ELEMENT', payload: el });
    expect(state.hoveredElement).toBe(el);
    dispatch({ type: 'SET_INSPECT_MODE', payload: false });
    expect(state.hoveredElement).toBeNull();
  });

  it('SET_INSPECTED_ELEMENT exits inspect mode when an element is locked', () => {
    const { state, dispatch } = setup();
    dispatch({ type: 'SET_INSPECT_MODE', payload: true });
    const el = document.createElement('div');
    dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: el });
    expect(state.inspectedElement).toBe(el);
    expect(state.inspectMode).toBe(false);

    dispatch({ type: 'SET_INSPECT_MODE', payload: true });
    dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: null });
    expect(state.inspectMode).toBe(true);
  });

  it('handles every plain setter action', () => {
    const { state, dispatch } = setup();
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'logs' });
    expect(state.activeTab).toBe('logs');
    dispatch({ type: 'SET_SEARCH_QUERY', payload: 'btn' });
    expect(state.searchQuery).toBe('btn');
    dispatch({ type: 'SET_BUG_FILTER', payload: 'open' });
    expect(state.bugFilter).toBe('open');
    dispatch({ type: 'SET_LOG_LEVEL', payload: 'error' });
    expect(state.logLevel).toBe('error');
    dispatch({ type: 'SET_LOG_SEARCH', payload: 'oops' });
    expect(state.logSearch).toBe('oops');
    dispatch({ type: 'SET_UX_AUDIT_FILTER', payload: 'violations' });
    expect(state.uxAuditFilter).toBe('violations');
    dispatch({ type: 'SET_UX_AUDIT_RESULT', payload: null });
    expect(state.uxAuditResult).toBeNull();
    dispatch({ type: 'SET_UX_AUDIT_LLM_ANALYSIS', payload: 'fine' });
    expect(state.uxAuditLlmAnalysis).toBe('fine');
    dispatch({ type: 'SET_UX_AUDIT_LLM_RUNNING', payload: true });
    expect(state.uxAuditLlmRunning).toBe(true);
  });
});

describe('DevToolsProvider context accessors', () => {
  it('exposes defaults when no props are given', () => {
    const ctx = setup();
    expect(ctx.themeName()).toBe('Unknown');
    expect(ctx.product()).toBe('App');
    expect(ctx.version()).toBe('0.0.0');
    expect(ctx.bugStorage()).toBeUndefined();
    expect(ctx.logEntries()).toEqual([]);
    expect(ctx.onLogClear()).toBeUndefined();
    expect(ctx.onInspect()).toBeUndefined();
    expect(ctx.onBugReport()).toBeUndefined();
    expect(ctx.onThemeToggle()).toBeUndefined();
  });

  it('exposes provided props through the accessors', () => {
    const entries: LogEntry[] = [
      { id: '1', timestamp: new Date(), level: 'info', message: 'hi' },
    ];
    const onLogClear = vi.fn();
    const onInspect = vi.fn();
    const onBugReport = vi.fn();
    const onThemeToggle = vi.fn();
    const ctx = setup({
      themeName: 'Hyperlabs',
      product: 'HyperBuild',
      version: '1.2.3',
      logEntries: () => entries,
      onLogClear,
      onInspect,
      onBugReport,
      onThemeToggle,
    });
    expect(ctx.themeName()).toBe('Hyperlabs');
    expect(ctx.product()).toBe('HyperBuild');
    expect(ctx.version()).toBe('1.2.3');
    expect(ctx.logEntries()).toBe(entries);
    expect(ctx.onLogClear()).toBe(onLogClear);
    expect(ctx.onInspect()).toBe(onInspect);
    expect(ctx.onBugReport()).toBe(onBugReport);
    expect(ctx.onThemeToggle()).toBe(onThemeToggle);
  });

  it('useDevTools throws outside the provider', () => {
    function Naked() {
      useDevTools();
      return null;
    }
    expect(() => render(() => <Naked />)).toThrow(
      'useDevTools must be used within DevToolsProvider',
    );
  });
});
