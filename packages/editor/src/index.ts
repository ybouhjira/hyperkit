// Public API for @ybouhjira/hyperkit-editor

export { HyperkitEditor } from './Editor';
export type { HyperkitEditorProps } from './Editor';

export type {
  TreeNode,
  NodeProps,
  NodePropValue,
  SupportedComponent,
  ComponentCategory,
  EditorState,
  EditorSnapshot,
  DragData,
  PaletteDragData,
  NodeDragData,
} from './types';

export {
  createEditorStore,
  createNode,
  defaultPropsFor,
  findNode,
  findParent,
  appendChild,
  removeNode,
  updateNodeProps,
  generateId,
} from './store';
export type { EditorStore } from './store';

export { treeToTsx, CodegenError } from './codegen';

export {
  COMPONENT_SCHEMAS,
  COMPONENT_CATEGORIES,
  CONTAINER_COMPONENTS,
} from './schemas';
export type { ComponentSchema, PropSchema, PaletteEntry } from './schemas';

export { TreeRenderer } from './renderer';
export type { TreeRendererProps } from './renderer';

export { Palette } from './palette/Palette';
export { PaletteItem } from './palette/PaletteItem';
export { Canvas } from './canvas/Canvas';
export { Inspector } from './inspector/Inspector';
export { Toolbar } from './toolbar/Toolbar';
