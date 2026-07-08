import { JSX } from 'solid-js';

/** Position where a panel can be docked */
export type PanelPosition = 'left' | 'right' | 'bottom' | 'center';

/** Direction for panel groups */
export type PanelDirection = 'horizontal' | 'vertical';

/** Custom action button in panel header */
export interface PanelHeaderAction {
  /** Icon — emoji string or JSX component */
  icon: string | (() => JSX.Element);
  /** Tooltip text */
  title?: string;
  /** Click handler */
  onClick: () => void;
}

/** Configuration for a single panel */
export interface PanelConfig {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Icon component or string identifier */
  icon?: string | (() => JSX.Element);
  /** Default dock position */
  defaultPosition: PanelPosition;
  /** Minimum size in pixels */
  minSize?: number;
  /** Maximum size in pixels */
  maxSize?: number;
  /** Default size in pixels */
  defaultSize?: number;
  /** Whether the panel can be collapsed */
  collapsible?: boolean;
  /** Whether the panel can be closed entirely */
  closable?: boolean;
  /** Whether the panel can be dragged to other positions */
  draggable?: boolean;
  /** Content render function */
  render: () => JSX.Element;
  /** Custom action buttons rendered in panel header before collapse/close buttons */
  headerActions?: PanelHeaderAction[];
  /** Whether to show the panel header (default: true) */
  showHeader?: boolean;
  /** Panel display mode (default: 'docked') */
  mode?: PanelMode;
  /** Accent color for drawer trigger strip */
  accentColor?: string;
}

/** State of a single panel at runtime */
export interface PanelState {
  /** Panel config reference ID */
  id: string;
  /** Current dock position */
  position: PanelPosition;
  /** Current size in pixels */
  size: number;
  /** Whether collapsed to a strip */
  collapsed: boolean;
  /** Whether visible at all */
  visible: boolean;
  /** Order within its position group */
  order: number;
  /** Whether the panel tab is pinned */
  pinned: boolean;
  /** Panel display mode */
  mode: PanelMode;
  /** Whether panel is in picture-in-picture mode */
  pip: boolean;
  /** Floating panel position */
  floatingPosition?: { x: number; y: number };
  /** Floating panel size */
  floatingSize?: { width: number; height: number };
  /** Whether the drawer panel is currently open */
  drawerOpen?: boolean;
}

/** Complete layout state */
export interface PanelLayoutState {
  /** Map of panel ID to panel state */
  panels: Record<string, PanelState>;
  /** Sizes of position areas (e.g., left sidebar width) */
  areaSizes: Record<PanelPosition, number>;
  /** Active tab ID for the center area (when center has 2+ panels) */
  activeTabId?: string;
  /** When set, this panel fills the entire container */
  maximizedPanelId?: string | null;
}

/** Actions for panel layout management */
export interface PanelLayoutActions {
  collapse: (panelId: string) => void;
  expand: (panelId: string) => void;
  toggleCollapse: (panelId: string) => void;
  resize: (panelId: string, size: number) => void;
  resizeArea: (position: PanelPosition, size: number) => void;
  move: (panelId: string, toPosition: PanelPosition) => void;
  show: (panelId: string) => void;
  hide: (panelId: string) => void;
  reset: () => void;
  setActiveTab: (panelId: string) => void;
  /** Maximize a panel to fill the entire container */
  maximize: (panelId: string) => void;
  /** Restore from maximized state back to grid layout */
  restore: () => void;
  /** Show a hidden panel and move it to the given position */
  addPanel: (panelId: string, position: PanelPosition) => void;
  /** Hide a panel */
  removePanel: (panelId: string) => void;
  /** Pin a panel tab (keeps it visible and at the start of its group) */
  pin: (panelId: string) => void;
  /** Unpin a panel tab */
  unpin: (panelId: string) => void;
  /** Set a panel to floating mode at given position */
  setMode: (panelId: string, mode: PanelMode) => void;
  /** Move a floating panel */
  moveFloating: (panelId: string, position: { x: number; y: number }) => void;
  /** Resize a floating panel */
  resizeFloating: (panelId: string, size: { width: number; height: number }) => void;
  /** Open a drawer panel */
  openDrawer: (panelId: string) => void;
  /** Close a drawer panel */
  closeDrawer: (panelId: string) => void;
  /** Toggle picture-in-picture mode for a panel */
  togglePip: (panelId: string) => void;
}

/** Props for the PanelContainer root component */
export interface PanelContainerProps {
  /** Panel configurations */
  panels: PanelConfig[];
  /** Optional initial layout state override */
  initialLayout?: Partial<PanelLayoutState>;
  /** localStorage key for persistence */
  storageKey?: string;
  /** Callback when layout changes */
  onLayoutChange?: (layout: PanelLayoutState) => void;
  /** Children (rendered in center if no center panel) */
  children?: JSX.Element;
  /** Chrome decoration level (default: 'full') */
  chrome?: ChromeLevel;
}

/** Props for individual Panel wrapper */
export interface PanelProps {
  config: PanelConfig;
  state: PanelState;
  direction?: PanelDirection;
  onCollapse?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  onMaximize?: () => void;
  onDragStart?: (panelId: string, event?: PointerEvent) => void;
  onDragEnd?: (panelId: string, position: PanelPosition) => void;
  /** Slot for action buttons in header */
  actions?: JSX.Element;
  /** When true, skip rendering the header bar */
  hideHeader?: boolean;
  /** Callback for PiP toggle */
  onPip?: () => void;
}

/** Props for resize handle */
export interface PanelResizeHandleProps {
  direction: PanelDirection;
  onResize: (delta: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

/** Drop zone information during drag */
export interface DropZoneInfo {
  position: PanelPosition;
  rect: DOMRect;
  active: boolean;
}

/** Drag state */
export interface PanelDragState {
  isDragging: boolean;
  draggedPanelId: string | null;
  activeDropZone: PanelPosition | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  /** Offset from the panel top-left to where the user clicked */
  dragOffset: { x: number; y: number } | null;
  /** Dimensions of the original panel element */
  panelRect: { width: number; height: number } | null;
}

/** Chrome decoration level for the panel container */
export type ChromeLevel = 'full' | 'minimal' | 'none' | 'auto-hide' | 'edge-peek' | 'fade-on-idle';

/** Panel display mode */
export type PanelMode = 'docked' | 'floating' | 'drawer';
