/**
 * TreeRenderer — recursively renders a TreeNode using real HyperKit components.
 * Each rendered node is wrapped in a selectable/drop-target container.
 */

import { type Component, For, Show } from 'solid-js';
import {
  Box,
  Flex,
  Stack,
  Grid,
  Text,
  Button,
  Input,
  Card,
  Badge,
  Separator,
  Spacer,
  EmptyState,
  Center,
} from '@ybouhjira/hyperkit';
import type { TreeNode, SupportedComponent } from './types';

// ── Component lookup ──────────────────────────────────────────────────────────

// We use a plain object as a registry to avoid dynamic JSX factories.
// Each entry renders the HyperKit component with the given props + children.
import type { JSX } from 'solid-js';

type NodeRenderer = Component<{
  node: TreeNode;
  renderChildren: () => JSX.Element;
}>;

const RENDERERS: Record<SupportedComponent, NodeRenderer> = {
  Box: (p) => (
    <Box {...(p.node.props as Record<string, unknown>)}>
      {p.renderChildren()}
    </Box>
  ),
  Flex: (p) => {
    const { children: _c, ...rest } = p.node.props as Record<string, unknown>;
    return (
      <Flex {...rest}>
        {p.renderChildren()}
      </Flex>
    );
  },
  Stack: (p) => {
    const { children: _c, ...rest } = p.node.props as Record<string, unknown>;
    return (
      <Stack {...rest}>
        {p.renderChildren()}
      </Stack>
    );
  },
  Grid: (p) => {
    const { children: _c, ...rest } = p.node.props as Record<string, unknown>;
    return (
      <Grid {...rest}>
        {p.renderChildren()}
      </Grid>
    );
  },
  Center: (p) => {
    const { children: _c, ...rest } = p.node.props as Record<string, unknown>;
    return (
      <Center {...rest}>
        {p.renderChildren()}
      </Center>
    );
  },
  Card: (p) => {
    const { children: _c, ...rest } = p.node.props as Record<string, unknown>;
    return (
      <Card {...rest}>
        {p.renderChildren()}
      </Card>
    );
  },
  Text: (p) => (
    <Text {...(p.node.props as Record<string, unknown>)}>
      {String(p.node.props['children'] ?? 'Text')}
    </Text>
  ),
  Button: (p) => (
    <Button {...(p.node.props as Record<string, unknown>)}>
      {String(p.node.props['children'] ?? 'Button')}
    </Button>
  ),
  Badge: (p) => (
    <Badge {...(p.node.props as Record<string, unknown>)}>
      {String(p.node.props['children'] ?? 'Badge')}
    </Badge>
  ),
  Input: (p) => <Input {...(p.node.props as Record<string, unknown>)} />,
  Select: (p) => {
    const { placeholder } = p.node.props as { placeholder?: string };
    // Simplified select placeholder (real Select requires options)
    return (
      <Text color="muted" size="sm">
        [{placeholder ?? 'Select'}]
      </Text>
    );
  },
  Checkbox: (p) => (
    <Flex align="center" gap="xs">
      <input
        type="checkbox"
        checked={Boolean(p.node.props['checked'])}
        disabled={Boolean(p.node.props['disabled'])}
        readOnly
      />
      <Text size="sm">{String(p.node.props['children'] ?? 'Checkbox')}</Text>
    </Flex>
  ),
  Separator: (p) => (
    <Separator
      orientation={
        (p.node.props['orientation'] as 'horizontal' | 'vertical' | undefined) ?? 'horizontal'
      }
    />
  ),
  Spacer: (p) => <Spacer />,
  EmptyState: (p) => (
    <EmptyState
      title={String(p.node.props['title'] ?? 'Nothing here yet')}
      description={String(p.node.props['description'] ?? '')}
    />
  ),
};

// ── TreeRenderer component ────────────────────────────────────────────────────

export interface TreeRendererProps {
  node: TreeNode;
  selectedId: string | null;
  dropTargetId: string | null;
  onSelect: (id: string) => void;
  onDrop: (component: string, targetId: string) => void;
  onMoveNode: (nodeId: string, targetId: string) => void;
  onDragOver: (id: string) => void;
  onDragLeave: () => void;
  isRoot?: boolean;
}

export const TreeRenderer: Component<TreeRendererProps> = (props) => {
  const isSelected = () => props.selectedId === props.node.id;
  const isDropTarget = () => props.dropTargetId === props.node.id;

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation();
    props.onSelect(props.node.id);
  };

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    props.onDragOver(props.node.id);
  };

  const handleDragLeave = (e: DragEvent): void => {
    e.stopPropagation();
    props.onDragLeave();
  };

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const component = e.dataTransfer?.getData('application/x-palette-component');
    const nodeId = e.dataTransfer?.getData('application/x-node-id');
    if (component) {
      props.onDrop(component, props.node.id);
    } else if (nodeId) {
      props.onMoveNode(nodeId, props.node.id);
    }
    props.onDragLeave();
  };

  const handleDragStart = (e: DragEvent): void => {
    e.stopPropagation();
    e.dataTransfer?.setData('application/x-node-id', props.node.id);
  };

  const Renderer = RENDERERS[props.node.component];

  const renderChildren = (): JSX.Element => (
    <For each={props.node.children}>
      {(child) => (
        <TreeRenderer
          node={child}
          selectedId={props.selectedId}
          dropTargetId={props.dropTargetId}
          onSelect={props.onSelect}
          onDrop={props.onDrop}
          onMoveNode={props.onMoveNode}
          onDragOver={props.onDragOver}
          onDragLeave={props.onDragLeave}
        />
      )}
    </For>
  );

  return (
    <div
      class={[
        'sk-editor-node',
        isSelected() ? 'sk-editor-node--selected' : '',
        isDropTarget() ? 'sk-editor-node--drop-target' : '',
        props.isRoot ? 'sk-editor-node--root' : '',
      ].filter(Boolean).join(' ')}
      data-node-id={props.node.id}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!props.isRoot}
      onDragStart={handleDragStart}
      style={{
        outline: isSelected()
          ? '2px solid var(--sk-accent)'
          : isDropTarget()
          ? '2px dashed var(--sk-accent)'
          : '1px dashed var(--sk-border-subtle)',
        'outline-offset': '2px',
        'border-radius': 'var(--sk-radius-sm)',
        'min-height': props.isRoot ? 'var(--sk-space-3xl)' : undefined,
        'padding': 'var(--sk-space-xs)',
        'position': 'relative',
        'cursor': props.isRoot ? 'default' : 'grab',
      }}
    >
      <Show when={!props.isRoot}>
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: 'var(--sk-space-xs)',
            'font-size': 'var(--sk-font-size-xs)',
            'font-family': 'var(--sk-font-code, monospace)',
            color: isSelected() ? 'var(--sk-accent)' : 'var(--sk-text-muted)',
            'background': 'var(--sk-bg-primary)',
            'padding': '0 var(--sk-space-2xs)',
            'border-radius': 'var(--sk-radius-sm)',
            'pointer-events': 'none',
            'z-index': '1',
            'line-height': '1.4',
          }}
        >
          {props.node.component}
        </div>
      </Show>
      <Renderer node={props.node} renderChildren={renderChildren} />
    </div>
  );
};
