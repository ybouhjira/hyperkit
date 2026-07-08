import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEditorStore,
  findNode,
  findParent,
  appendChild,
  removeNode,
  updateNodeProps,
  createNode,
  resetIdCounter,
} from './store';

beforeEach(() => {
  resetIdCounter();
});

describe('tree helpers', () => {
  it('findNode: finds root', () => {
    const store = createEditorStore();
    const node = findNode(store.state.tree, 'root');
    expect(node).not.toBeNull();
    expect(node?.id).toBe('root');
  });

  it('findNode: returns null for missing id', () => {
    const store = createEditorStore();
    expect(findNode(store.state.tree, 'nonexistent')).toBeNull();
  });

  it('findParent: returns null when searching for root parent', () => {
    const store = createEditorStore();
    expect(findParent(store.state.tree, 'root')).toBeNull();
  });

  it('appendChild: adds child to matching node', () => {
    const store = createEditorStore();
    const child = createNode('Button');
    const updated = appendChild(store.state.tree, 'root', child);
    expect(updated.children).toHaveLength(1);
    expect(updated.children[0]?.id).toBe(child.id);
  });

  it('removeNode: removes existing child', () => {
    const child = createNode('Button');
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    const added = store.state.tree.children[0];
    expect(added).toBeDefined();
    const updated = removeNode(store.state.tree, added!.id);
    expect(updated.children).toHaveLength(0);
  });

  it('updateNodeProps: updates matching node props', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    const nodeId = store.state.tree.children[0]?.id ?? '';
    const updated = updateNodeProps(store.state.tree, nodeId, { children: 'hello' });
    const node = findNode(updated, nodeId);
    expect(node?.props['children']).toBe('hello');
  });
});

describe('createEditorStore', () => {
  it('initialises with a root Stack node', () => {
    const store = createEditorStore();
    expect(store.state.tree.id).toBe('root');
    expect(store.state.tree.component).toBe('Stack');
    expect(store.state.selectedId).toBeNull();
  });

  it('selectNode: sets selectedId', () => {
    const store = createEditorStore();
    store.selectNode('root');
    expect(store.state.selectedId).toBe('root');
  });

  it('selectNode: deselects with null', () => {
    const store = createEditorStore();
    store.selectNode('root');
    store.selectNode(null);
    expect(store.state.selectedId).toBeNull();
  });

  it('dropFromPalette: appends child to root', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    expect(store.state.tree.children).toHaveLength(1);
    expect(store.state.tree.children[0]?.component).toBe('Button');
  });

  it('dropFromPalette: selects new node', () => {
    const store = createEditorStore();
    store.dropFromPalette('Text', 'root');
    const newId = store.state.tree.children[0]?.id;
    expect(store.state.selectedId).toBe(newId);
  });

  it('dropFromPalette: rejects non-container targets', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    const buttonId = store.state.tree.children[0]?.id ?? '';
    store.dropFromPalette('Text', buttonId);
    // Button is not a container; Text should not be dropped
    const buttonNode = findNode(store.state.tree, buttonId);
    expect(buttonNode?.children).toHaveLength(0);
  });

  it('deleteSelected: removes selected node', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    const id = store.state.tree.children[0]?.id ?? '';
    store.selectNode(id);
    store.deleteSelected();
    expect(store.state.tree.children).toHaveLength(0);
    expect(store.state.selectedId).toBeNull();
  });

  it('deleteSelected: cannot delete root', () => {
    const store = createEditorStore();
    store.selectNode('root');
    store.deleteSelected();
    expect(store.state.tree.id).toBe('root');
  });

  it('updateProp: updates a prop value', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    const id = store.state.tree.children[0]?.id ?? '';
    store.updateProp(id, 'children', 'Save');
    const node = findNode(store.state.tree, id);
    expect(node?.props['children']).toBe('Save');
  });

  it('undo: restores previous tree state', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    expect(store.state.tree.children).toHaveLength(1);
    store.undo();
    expect(store.state.tree.children).toHaveLength(0);
  });

  it('redo: re-applies undone action', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    store.undo();
    store.redo();
    expect(store.state.tree.children).toHaveLength(1);
  });

  it('undo: noop when history empty', () => {
    const store = createEditorStore();
    expect(() => store.undo()).not.toThrow();
    expect(store.state.tree.children).toHaveLength(0);
  });

  it('redo: noop when future empty', () => {
    const store = createEditorStore();
    expect(() => store.redo()).not.toThrow();
  });

  it('clear: resets tree', () => {
    const store = createEditorStore();
    store.dropFromPalette('Button', 'root');
    store.clear();
    expect(store.state.tree.children).toHaveLength(0);
    expect(store.state.selectedId).toBeNull();
  });

  it('setDropTarget: sets drop highlight', () => {
    const store = createEditorStore();
    store.setDropTarget('root');
    expect(store.state.dropTargetId).toBe('root');
    store.setDropTarget(null);
    expect(store.state.dropTargetId).toBeNull();
  });

  it('moveNode: moves a node to a new parent', () => {
    const store = createEditorStore();
    store.dropFromPalette('Stack', 'root');
    const innerStackId = store.state.tree.children[0]?.id ?? '';
    store.dropFromPalette('Button', 'root');
    const buttonId = store.state.tree.children[1]?.id ?? '';
    // Move button into inner stack
    store.moveNode(buttonId, innerStackId);
    const innerStack = findNode(store.state.tree, innerStackId);
    expect(innerStack?.children).toHaveLength(1);
    expect(innerStack?.children[0]?.id).toBe(buttonId);
    expect(store.state.tree.children).toHaveLength(1);
  });
});
