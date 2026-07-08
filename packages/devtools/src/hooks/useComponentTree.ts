import { createMemo } from 'solid-js';
import { identifyComponent, isSolidKitElement } from '../engine/ComponentIdentifier';
import type { InspectedComponent } from '../context/types';

export interface TreeNode {
  component: InspectedComponent;
  children: TreeNode[];
  depth: number;
}

/**
 * Build a tree of all SolidKit components in the given root.
 */
export function useComponentTree(root: () => HTMLElement | null): () => TreeNode[] {
  return createMemo(() => {
    const el = root();
    if (!el) return [];
    return buildTree(el, 0);
  });
}

function buildTree(element: HTMLElement, depth: number): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const child of Array.from(element.children)) {
    if (!(child instanceof HTMLElement)) continue;

    if (isSolidKitElement(child)) {
      const component = identifyComponent(child);
      if (component) {
        nodes.push({
          component,
          children: buildTree(child, depth + 1),
          depth,
        });
        continue;
      }
    }
    // Not an sk-* element — recurse into its children
    nodes.push(...buildTree(child, depth));
  }

  return nodes;
}

/**
 * Flatten a tree into a depth-first list for rendering.
 */
export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const flat: TreeNode[] = [];
  for (const node of nodes) {
    flat.push(node);
    flat.push(...flattenTree(node.children));
  }
  return flat;
}
