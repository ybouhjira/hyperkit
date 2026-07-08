/**
 * Core types for the HyperKit WYSIWYG editor.
 */

/** A node in the component tree being edited */
export interface TreeNode {
  /** Unique identifier */
  readonly id: string;
  /** HyperKit component name (e.g. "Button", "Stack") */
  readonly component: SupportedComponent;
  /** Props to pass to the component */
  readonly props: NodeProps;
  /** Child nodes (only valid for container components) */
  readonly children: readonly TreeNode[];
}

/** Props map — string keys, any serialisable value */
export type NodeProps = Readonly<Record<string, NodePropValue>>;

/** Primitive types allowed as prop values */
export type NodePropValue = string | number | boolean | undefined;

/** HyperKit components supported by the editor */
export type SupportedComponent =
  | 'Box'
  | 'Flex'
  | 'Stack'
  | 'Grid'
  | 'Text'
  | 'Button'
  | 'Input'
  | 'Card'
  | 'Badge'
  | 'Select'
  | 'Checkbox'
  | 'Separator'
  | 'Spacer'
  | 'EmptyState'
  | 'Center';

/** Whether a component can contain children */
export type ComponentCategory = 'layout' | 'input' | 'display';

/** Palette group */
export interface PaletteGroup {
  readonly label: string;
  readonly components: readonly SupportedComponent[];
}

/** State for a drag operation initiated from the palette */
export interface PaletteDragData {
  readonly type: 'palette';
  readonly component: SupportedComponent;
}

/** State for a drag operation moving an existing tree node */
export interface NodeDragData {
  readonly type: 'node';
  readonly nodeId: string;
}

export type DragData = PaletteDragData | NodeDragData;

/** Editor undo/redo state snapshot */
export interface EditorSnapshot {
  readonly tree: TreeNode;
  readonly selectedId: string | null;
}

/** Full editor state */
export interface EditorState {
  /** Root of the component tree */
  readonly tree: TreeNode;
  /** ID of the currently selected node */
  readonly selectedId: string | null;
  /** Undo history stack (snapshots before each mutation) */
  readonly past: readonly EditorSnapshot[];
  /** Redo stack */
  readonly future: readonly EditorSnapshot[];
  /** ID of the node currently being hovered as a drop target */
  readonly dropTargetId: string | null;
}
