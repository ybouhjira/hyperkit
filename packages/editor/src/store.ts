/**
 * Editor store — all mutations go through typed actions.
 * Uses SolidJS createStore for fine-grained reactivity.
 */

import { createStore } from 'solid-js/store';
import type { TreeNode, EditorState, EditorSnapshot, NodeProps, NodePropValue, SupportedComponent } from './types';
import { COMPONENT_SCHEMAS, CONTAINER_COMPONENTS } from './schemas';

// ── ID generation ─────────────────────────────────────────────────────────────

let _idCounter = 0;
export const generateId = (): string => `node-${++_idCounter}`;

/** Reset counter (for tests) */
export const resetIdCounter = (): void => {
  _idCounter = 0;
};

// ── Default props for a new node ───────────────────────────────────────────────

export const defaultPropsFor = (component: SupportedComponent): NodeProps => {
  const schema = COMPONENT_SCHEMAS[component];
  const props: Record<string, NodePropValue> = {};
  for (const [key, def] of Object.entries(schema)) {
    if (def.default !== undefined) {
      props[key] = def.default;
    }
  }
  return props;
};

/** Create a new TreeNode with default props */
export const createNode = (component: SupportedComponent): TreeNode => ({
  id: generateId(),
  component,
  props: defaultPropsFor(component),
  children: [],
});

// ── Tree mutation helpers (pure) ──────────────────────────────────────────────

/** Find a node by id, returning it or null */
export const findNode = (tree: TreeNode, id: string): TreeNode | null => {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

/** Find parent of a node id, returning parent or null */
export const findParent = (tree: TreeNode, id: string): TreeNode | null => {
  for (const child of tree.children) {
    if (child.id === id) return tree;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
};

/** Append a child to a specific container node */
export const appendChild = (tree: TreeNode, parentId: string, child: TreeNode): TreeNode => {
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, child] };
  }
  return {
    ...tree,
    children: tree.children.map((c) => appendChild(c, parentId, child)),
  };
};

/** Remove a node by id (cannot remove root) */
export const removeNode = (tree: TreeNode, id: string): TreeNode => {
  return {
    ...tree,
    children: tree.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)),
  };
};

/** Update props of a specific node */
export const updateNodeProps = (tree: TreeNode, id: string, props: NodeProps): TreeNode => {
  if (tree.id === id) {
    return { ...tree, props };
  }
  return {
    ...tree,
    children: tree.children.map((c) => updateNodeProps(c, id, props)),
  };
};

// ── Mutable internal state type for createStore ──────────────────────────────

interface MutableEditorState {
  tree: TreeNode;
  selectedId: string | null;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  dropTargetId: string | null;
}

// ── Store creation ────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

/** Deep clone a value by serialising through JSON (strips Solid reactive proxies) */
const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const makeSnapshot = (state: MutableEditorState): EditorSnapshot => ({
  // JSON round-trip unwraps SolidJS reactive proxies
  tree: deepClone(state.tree),
  selectedId: state.selectedId,
});

export const initialTree: TreeNode = {
  id: 'root',
  component: 'Stack',
  props: { gap: 'md' },
  children: [],
};

const makeInitialState = (): MutableEditorState => ({
  tree: { ...initialTree },
  selectedId: null,
  past: [],
  future: [],
  dropTargetId: null,
});

export interface EditorStore {
  /** Reactive state (read-only externally) */
  state: EditorState;
  /** Select a node by id (null to deselect) */
  selectNode: (id: string | null) => void;
  /** Drop a component from palette onto a container node */
  dropFromPalette: (component: SupportedComponent, targetId: string) => void;
  /** Move an existing node to a new parent */
  moveNode: (nodeId: string, targetId: string) => void;
  /** Delete the currently selected node */
  deleteSelected: () => void;
  /** Update a prop on a specific node */
  updateProp: (nodeId: string, key: string, value: NodePropValue) => void;
  /** Undo last action */
  undo: () => void;
  /** Redo last undone action */
  redo: () => void;
  /** Set the drop target highlight */
  setDropTarget: (id: string | null) => void;
  /** Clear canvas to initial state */
  clear: () => void;
}

export const createEditorStore = (): EditorStore => {
  const [state, setState] = createStore<MutableEditorState>(makeInitialState());

  const pushHistory = (): void => {
    const snap = makeSnapshot(state);
    setState('past', (prev) => [...prev, snap].slice(-MAX_HISTORY));
    setState('future', []);
  };

  const selectNode = (id: string | null): void => {
    setState('selectedId', id);
  };

  const dropFromPalette = (component: SupportedComponent, targetId: string): void => {
    const targetNode = findNode(state.tree, targetId);
    if (!targetNode || !CONTAINER_COMPONENTS.has(targetNode.component)) return;

    pushHistory();
    const newNode = createNode(component);
    setState('tree', (tree) => appendChild(tree, targetId, newNode));
    setState('selectedId', newNode.id);
  };

  const moveNode = (nodeId: string, targetId: string): void => {
    if (nodeId === targetId || nodeId === 'root') return;
    const targetNode = findNode(state.tree, targetId);
    if (!targetNode || !CONTAINER_COMPONENTS.has(targetNode.component)) return;
    const nodeToMove = findNode(state.tree, nodeId);
    if (!nodeToMove) return;
    // Prevent moving a node into its own subtree
    if (findNode(nodeToMove, targetId)) return;

    pushHistory();
    const withoutNode = removeNode(state.tree, nodeId);
    const updatedTree = appendChild(withoutNode, targetId, nodeToMove);
    setState('tree', updatedTree);
  };

  const deleteSelected = (): void => {
    const id = state.selectedId;
    if (!id || id === 'root') return;

    pushHistory();
    setState('tree', (tree) => removeNode(tree, id));
    setState('selectedId', null);
  };

  const updateProp = (nodeId: string, key: string, value: NodePropValue): void => {
    const node = findNode(state.tree, nodeId);
    if (!node) return;

    const newProps: NodeProps = { ...node.props, [key]: value };
    setState('tree', (tree) => updateNodeProps(tree, nodeId, newProps));
  };

  const undo = (): void => {
    if (state.past.length === 0) return;

    const lastSnap = state.past[state.past.length - 1];
    if (!lastSnap) return;

    const currentSnap = makeSnapshot(state);

    setState('future', (prev) => [currentSnap, ...prev].slice(0, MAX_HISTORY));
    setState('past', (prev) => prev.slice(0, -1));
    setState('tree', lastSnap.tree);
    setState('selectedId', lastSnap.selectedId);
  };

  const redo = (): void => {
    if (state.future.length === 0) return;

    const nextSnap = state.future[0];
    if (!nextSnap) return;

    const currentSnap = makeSnapshot(state);

    setState('past', (prev) => [...prev, currentSnap].slice(-MAX_HISTORY));
    setState('future', (prev) => prev.slice(1));
    setState('tree', nextSnap.tree);
    setState('selectedId', nextSnap.selectedId);
  };

  const setDropTarget = (id: string | null): void => {
    setState('dropTargetId', id);
  };

  const clear = (): void => {
    pushHistory();
    setState('tree', { ...initialTree, children: [] });
    setState('selectedId', null);
  };

  // Cast the internal mutable state to the public readonly type
  return {
    state: state as unknown as EditorState,
    selectNode,
    dropFromPalette,
    moveNode,
    deleteSelected,
    updateProp,
    undo,
    redo,
    setDropTarget,
    clear,
  };
};
