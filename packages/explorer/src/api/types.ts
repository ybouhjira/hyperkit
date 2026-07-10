import type { JSX } from 'solid-js';

// ─── Controls ───────────────────────────────────────

export interface TextControlDef {
  readonly type: 'text';
  /** Omitted = prop not set; the component's own default applies. */
  readonly defaultValue?: string;
  readonly label?: string;
}

export interface NumberControlDef {
  readonly type: 'number';
  /** Omitted = prop not set; the component's own default applies. */
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly label?: string;
}

export interface BooleanControlDef {
  readonly type: 'boolean';
  /** Omitted = prop not set; the component's own default applies. */
  readonly defaultValue?: boolean;
  readonly label?: string;
}

export interface SelectControlDef {
  readonly type: 'select';
  readonly options: readonly string[];
  /** Omitted = prop not set; the component's own default applies. */
  readonly defaultValue?: string;
  readonly label?: string;
}

export interface JsonControlDef {
  readonly type: 'json';
  readonly defaultValue: unknown;
  readonly label?: string;
}

export type ControlDef =
  TextControlDef | NumberControlDef | BooleanControlDef | SelectControlDef | JsonControlDef;

// ─── Stories ────────────────────────────────────────

export interface ComponentStoryDef {
  readonly kind: 'component';
  readonly title: string;
  readonly category: string;
  readonly component?: (props: Record<string, unknown>) => JSX.Element;
  readonly render?: (props: Record<string, unknown>) => JSX.Element;
  readonly controls: Record<string, ControlDef>;
  /** 'padded' (default) adds 32px padding; 'fullscreen' fills edge-to-edge */
  readonly layout?: 'padded' | 'fullscreen';
}

export interface ServiceStoryDef {
  readonly kind: 'service';
  readonly title: string;
  readonly category: string;
  readonly description?: string;
  readonly actions: Record<string, () => Promise<unknown> | unknown>;
  readonly output?: {
    readonly showLogs?: boolean;
    readonly showTiming?: boolean;
  };
}

export interface AlgorithmStoryDef {
  readonly kind: 'algorithm';
  readonly title: string;
  readonly category: string;
  readonly description?: string;
  readonly controls: Record<string, ControlDef>;
  readonly run: (inputs: Record<string, unknown>) => unknown;
  readonly visualize?: 'json' | 'table' | 'dag';
}

export type StoryDef = ComponentStoryDef | ServiceStoryDef | AlgorithmStoryDef;

// ─── Registry ───────────────────────────────────────

export interface StoryEntry {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly def: StoryDef;
}

export interface StoryGroup {
  readonly name: string;
  readonly children: ReadonlyArray<StoryGroup | StoryEntry>;
}

// ─── Store ──────────────────────────────────────────

export interface ExplorerState {
  stories: readonly StoryEntry[];
  selectedId: string | null;
  searchQuery: string;
  controlValues: Record<string, unknown>;
  outputLogs: readonly LogEntry[];
  activeOutputTab: 'console' | 'actions' | 'inspector';
  sidebarWidth: number;
  bottomPanelHeight: number;
}

export interface LogEntry {
  readonly timestamp: number;
  readonly level: 'info' | 'warn' | 'error';
  readonly message: string;
  readonly data?: unknown;
}
