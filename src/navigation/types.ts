import type { JSX } from 'solid-js';
import type { PanelPosition } from '../panels/types';

/** Reference to a piece of content that can be displayed in a panel */
export interface ContentRef {
  /** Content type identifier (e.g., 'cli-session', 'file', 'studio-document') */
  type: string;
  /** Unique content identifier (session ID, file path, document ID) */
  id: string;
  /** Display name for tabs and menus */
  label?: string;
  /** Icon component */
  icon?: () => JSX.Element;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
}

/** Definition of a content type that can be displayed in panels */
export interface ContentTypeDefinition {
  /** Content type identifier */
  type: string;
  /** Human-readable label */
  label: string;
  /** Icon component */
  icon?: () => JSX.Element;
  /** Panel ID that opens this content type by default */
  defaultPanel: string;
  /** Other panels capable of displaying this content type */
  alternativePanels?: string[];
}

/** Where to open content */
export type NavigationTarget =
  | { where: 'same' }
  | { where: 'new-tab'; panelId?: string }
  | { where: 'new-panel'; position?: PanelPosition }
  | { where: 'new-mode'; modeId: string };

/** A capability that a panel declares — used for auto-generating commands/routes */
export interface PanelCapability {
  /** Capability name (e.g., 'openSession', 'sendMessage') */
  name: string;
  /** Human-readable label */
  label: string;
  /** Parameter definitions */
  params: Record<string, ParamDef>;
  /** Handler function */
  handler: (params: Record<string, unknown>) => void | Promise<void>;
}

/** Parameter definition for a capability */
export interface ParamDef {
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  description?: string;
  enum?: string[];
}

/** Extended panel registration config with content and capabilities */
export interface PanelContentConfig {
  /** Content types this panel can display */
  accepts?: string[];
  /** Capabilities this panel declares */
  capabilities?: PanelCapability[];
}

/** Navigation context value provided to the component tree */
export interface NavigationContextValue {
  /** Open content in a panel, optionally specifying where */
  openContent: (ref: ContentRef, target?: NavigationTarget) => void;
  /** Get current content displayed in a panel */
  getPanelContent: (panelId: string) => ContentRef | null;
  /** Set content for a panel directly */
  setPanelContent: (panelId: string, ref: ContentRef | null) => void;
  /** Get all content tabs for a panel */
  getPanelTabs: (panelId: string) => ContentRef[];
  /** Add a content tab to a panel */
  addTab: (panelId: string, ref: ContentRef) => void;
  /** Remove a content tab from a panel */
  removeTab: (panelId: string, contentId: string) => void;
  /** Get active tab in a panel */
  getActiveTab: (panelId: string) => ContentRef | null;
  /** Set active tab by content ID */
  setActiveTab: (panelId: string, contentId: string) => void;
}

/** Props for useNavigable hook result */
export interface NavigableResult {
  onClick: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  props: {
    'data-navigable': 'true';
    'data-content-type': string;
    'data-content-id': string;
  };
}

/** Props for PanelContentSlot */
export interface PanelContentSlotProps {
  panelId: string;
  renderers: Record<string, (ref: ContentRef) => JSX.Element>;
  fallback?: JSX.Element;
}

/** Props for NavigationMenu */
export interface NavigationMenuProps {
  contentRef: ContentRef;
  position: { x: number; y: number };
  onClose: () => void;
}
