/**
 * Canvas — center panel that hosts the tree renderer.
 * Handles drop events at the root level.
 */

import { type Component, Show } from 'solid-js';
import { Stack, Text, EmptyState } from '@ybouhjira/hyperkit';
import { TreeRenderer } from '../renderer';
import type { EditorStore } from '../store';
import type { SupportedComponent } from '../types';

export interface CanvasProps {
  store: EditorStore;
}

export const Canvas: Component<CanvasProps> = (props) => {
  const handleDrop = (component: string, targetId: string): void => {
    props.store.dropFromPalette(component as SupportedComponent, targetId);
  };

  const handleMoveNode = (nodeId: string, targetId: string): void => {
    props.store.moveNode(nodeId, targetId);
  };

  const handleDragOver = (id: string): void => {
    props.store.setDropTarget(id);
  };

  const handleDragLeave = (): void => {
    props.store.setDropTarget(null);
  };

  return (
    <div
      style={{
        'flex': '1',
        'overflow': 'auto',
        'padding': 'var(--sk-space-md)',
        'background': 'var(--sk-bg-primary)',
        'position': 'relative',
      }}
    >
      <Stack gap="xs" style={{ height: '100%' }}>
        <Text size="xs" color="muted" weight="semibold">
          CANVAS
        </Text>
        <div style={{ flex: '1', 'min-height': '0' }}>
          <TreeRenderer
            node={props.store.state.tree}
            selectedId={props.store.state.selectedId}
            dropTargetId={props.store.state.dropTargetId}
            onSelect={props.store.selectNode}
            onDrop={handleDrop}
            onMoveNode={handleMoveNode}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            isRoot
          />
          <Show when={props.store.state.tree.children.length === 0}>
            <div
              style={{
                'margin-top': 'var(--sk-space-lg)',
                'text-align': 'center',
                'pointer-events': 'none',
              }}
            >
              <Text size="sm" color="muted">
                Drag components from the palette to get started
              </Text>
            </div>
          </Show>
        </div>
      </Stack>
    </div>
  );
};
