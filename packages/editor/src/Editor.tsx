/**
 * HyperkitEditor — top-level WYSIWYG editor component.
 *
 * Layout: toolbar (top) | palette (left) | canvas (center) | inspector (right)
 *
 * Registers itself in the navigable registry so AI agents can dispatch
 * editor actions programmatically.
 */

import { type Component, onMount } from 'solid-js';
import { Flex } from '@ybouhjira/hyperkit';
import { createNavigable } from '@ybouhjira/hyperkit';
import { useShortcuts } from '@ybouhjira/hyperkit';
import { createEditorStore } from './store';
import { Toolbar } from './toolbar/Toolbar';
import { Palette } from './palette/Palette';
import { Canvas } from './canvas/Canvas';
import { Inspector } from './inspector/Inspector';
import type { SupportedComponent } from './types';

export interface HyperkitEditorProps {
  /** Height of the editor container. Defaults to '100vh'. */
  height?: string;
}

export const HyperkitEditor: Component<HyperkitEditorProps> = (props) => {
  const store = createEditorStore();

  // Register navigable so AI can control the editor
  createNavigable({
    id: 'hyperkit-editor',
    label: 'HyperKit WYSIWYG Editor',
    category: 'editor',
    actions: [
      {
        name: 'select',
        description: 'Select a node by its ID',
        params: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'Node ID to select (use "root" for the canvas root)' },
          },
          required: ['nodeId'],
        },
        handler: (params: unknown) => {
          const p = params as { nodeId: string };
          store.selectNode(p.nodeId);
          return { ok: true, selectedId: p.nodeId };
        },
      },
      {
        name: 'drop',
        description: 'Add a component to a container node',
        params: {
          type: 'object',
          properties: {
            component: { type: 'string', description: 'Component name (e.g. "Button", "Text")' },
            targetId: { type: 'string', description: 'ID of the container to drop into' },
          },
          required: ['component', 'targetId'],
        },
        handler: (params: unknown) => {
          const p = params as { component: string; targetId: string };
          store.dropFromPalette(p.component as SupportedComponent, p.targetId);
          return { ok: true };
        },
      },
      {
        name: 'delete',
        description: 'Delete the currently selected node',
        params: { type: 'object', properties: {} },
        handler: () => {
          store.deleteSelected();
          return { ok: true };
        },
      },
      {
        name: 'update-prop',
        description: 'Update a prop on a specific node',
        params: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'Node ID' },
            key: { type: 'string', description: 'Prop key' },
            value: { type: 'string', description: 'New value (will be coerced to the prop type)' },
          },
          required: ['nodeId', 'key', 'value'],
        },
        handler: (params: unknown) => {
          const p = params as { nodeId: string; key: string; value: string };
          store.updateProp(p.nodeId, p.key, p.value);
          return { ok: true };
        },
      },
      {
        name: 'undo',
        description: 'Undo the last action',
        params: { type: 'object', properties: {} },
        handler: () => {
          store.undo();
          return { ok: true };
        },
      },
      {
        name: 'redo',
        description: 'Redo the last undone action',
        params: { type: 'object', properties: {} },
        handler: () => {
          store.redo();
          return { ok: true };
        },
      },
      {
        name: 'clear',
        description: 'Clear the canvas',
        params: { type: 'object', properties: {} },
        handler: () => {
          store.clear();
          return { ok: true };
        },
      },
    ],
    getState: () => ({
      selectedId: store.state.selectedId,
      nodeCount: countNodes(store.state.tree),
      canUndo: store.state.past.length > 0,
      canRedo: store.state.future.length > 0,
    }),
  });

  // Keyboard shortcuts
  useShortcuts([
    {
      key: 'Delete',
      handler: () => store.deleteSelected(),
      description: 'Delete selected node',
      category: 'Editor',
    },
    {
      key: 'Backspace',
      handler: () => store.deleteSelected(),
      description: 'Delete selected node',
      category: 'Editor',
    },
    {
      key: 'z',
      meta: true,
      handler: () => store.undo(),
      description: 'Undo',
      category: 'Editor',
    },
    {
      key: 'z',
      meta: true,
      shift: true,
      handler: () => store.redo(),
      description: 'Redo',
      category: 'Editor',
    },
    {
      key: 'Escape',
      handler: () => store.selectNode(null),
      description: 'Deselect',
      category: 'Editor',
    },
  ]);

  return (
    <Flex
      direction="column"
      style={{
        height: props.height ?? '100vh',
        overflow: 'hidden',
        background: 'var(--sk-bg-primary)',
      }}
    >
      <Toolbar store={store} />

      <Flex style={{ flex: '1', 'min-height': '0', overflow: 'hidden' }}>
        {/* Left: Palette */}
        <div style={{ width: '180px', 'flex-shrink': '0', overflow: 'auto' }}>
          <Palette />
        </div>

        {/* Center: Canvas */}
        <div style={{ flex: '1', 'min-width': '0', overflow: 'auto' }}>
          <Canvas store={store} />
        </div>

        {/* Right: Inspector */}
        <div style={{ width: '220px', 'flex-shrink': '0', overflow: 'auto' }}>
          <Inspector store={store} />
        </div>
      </Flex>
    </Flex>
  );
};

function countNodes(tree: import('./types').TreeNode): number {
  return 1 + tree.children.reduce((sum, child) => sum + countNodes(child), 0);
}
