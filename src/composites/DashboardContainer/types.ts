import type { Component, JSX } from 'solid-js';

export interface DashboardCardConfig {
  id: string;
  title: string;
  icon?: JSX.Element;
  component: Component<DashboardCardProps>;
  defaultSize?: { cols: number; rows: number };
  minSize?: { cols: number; rows: number };
  maxSize?: { cols: number; rows: number };
  resizable?: boolean;
  removable?: boolean;
  category?: string;
}

export interface DashboardCardProps {
  config: DashboardCardConfig;
  isEditing: boolean;
}

export interface CardLayout {
  id: string;
  col: number; // 0-based grid column start
  row: number; // 0-based grid row start
  cols: number; // column span
  rows: number; // row span
}

export interface DashboardContainerProps {
  cards: DashboardCardConfig[];
  columns?: number; // default 12
  rowHeight?: 'sm' | 'md' | 'lg' | 'xl'; // grid row height preset, default 'md'
  gap?: 'sm' | 'md' | 'lg'; // maps to --sk-space-* tokens
  storageKey?: string; // localStorage persistence key
  onLayoutChange?: (layout: CardLayout[]) => void;
  editable?: boolean; // show edit controls, default false
  class?: string;
  style?: JSX.CSSProperties;
}

export interface DashboardDragState {
  isDragging: boolean;
  draggedCardId: string | null;
  startCol: number;
  startRow: number;
  currentCol: number;
  currentRow: number;
  offset: { x: number; y: number };
}
