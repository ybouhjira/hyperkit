import { JSX } from 'solid-js';

/** Identifier for a view mode */
export type ViewMode = string;

/** Configuration for a single view mode */
export interface ViewModeConfig {
  /** Unique identifier (e.g., 'card-grid', 'table', 'timeline', 'kanban') */
  id: ViewMode;
  /** Display label */
  label: string;
  /** Icon - either SVG path data or render function */
  icon: string | (() => JSX.Element);
  /** Tooltip text */
  tooltip?: string;
}

/** Generic props passed to each view renderer */
export interface ViewRendererProps<TItem, TConfig = Record<string, never>> {
  /** Items to display */
  items: TItem[];
  /** View-specific configuration */
  config?: TConfig;
  /** Callback when an item is clicked/selected */
  onItemClick?: (item: TItem) => void;
  /** Callback when an item is double-clicked */
  onItemDoubleClick?: (item: TItem) => void;
  /** Currently selected item ID */
  selectedId?: string | null;
  /** Loading state */
  loading?: boolean;
  /** Empty state message or component */
  emptyState?: JSX.Element | string;
}

/** Props for the ViewSwitcher component */
export interface ViewSwitcherProps {
  /** Available view modes */
  modes: ViewModeConfig[];
  /** Currently active view mode ID */
  activeMode: ViewMode;
  /** Callback when user switches view */
  onModeChange: (mode: ViewMode) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/** Map of view mode ID to its renderer component */
export type ViewRendererMap<TItem, TConfig = Record<string, never>> = Record<
  ViewMode,
  (props: ViewRendererProps<TItem, TConfig>) => JSX.Element
>;
