import type { JSX } from 'solid-js';

export interface PortSpec {
  name: string;
  type: string; // For type-matching validation (e.g., 'FilePath', 'string', 'number')
  label?: string;
  description?: string;
  maxConnections?: number; // Default: 1 for inputs, Infinity for outputs
}

export interface ConnectableItem {
  id: string;
  label: string;
  icon?: string; // Emoji or icon name
  category?: string; // For palette grouping
  description?: string;
  inputs?: PortSpec[];
  outputs?: PortSpec[];
  color?: string; // Node header color
}

export interface Wire {
  from: { itemId: string; port: string };
  to: { itemId: string; port: string };
}

export interface TypeCompatibilityMap {
  // Key = target type, Value = array of compatible source types
  // e.g., { 'string': ['FilePath', 'URL'], 'any': ['*'] }
  [targetType: string]: string[];
}

export interface ConnectionEditorProps {
  // Data
  items: ConnectableItem[];
  wires?: Wire[];
  onWiresChange?: (wires: Wire[]) => void;

  // Optional: available items for the palette (items user can add to canvas)
  // If not provided, all items are on canvas and palette is hidden
  paletteItems?: ConnectableItem[];

  // Validation
  typeCompatibility?: TypeCompatibilityMap;

  // Layout
  layout?: 'dagre' | 'force' | 'manual'; // Default: 'dagre'
  direction?: 'LR' | 'TB' | 'RL' | 'BT'; // Default: 'LR'
  autoLayout?: boolean; // Auto-run layout on change. Default: true

  // Visual
  width?: number;
  height?: number;
  showMiniMap?: boolean; // Default: true
  showControls?: boolean; // Default: true
  showGrid?: boolean; // Default: true
  editable?: boolean; // Default: true

  // Events
  onItemClick?: (itemId: string) => void;
  onWireClick?: (wire: Wire) => void;

  // Style
  class?: string;
  style?: JSX.CSSProperties;
}
