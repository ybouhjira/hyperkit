/**
 * Tree → TSX code generator.
 * Uses Effect for error handling.
 */

import { Effect } from 'effect';
import type { TreeNode, NodeProps, NodePropValue } from './types';

export class CodegenError {
  readonly _tag = 'CodegenError';
  constructor(readonly message: string) {}
}

/** Render a single prop value as a TSX attribute string */
const renderPropValue = (value: NodePropValue): string => {
  if (value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
};

/** Render prop attributes as a string (e.g. ` variant="primary" size="md"`) */
const renderProps = (props: NodeProps, component: string): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    // Skip the `children` prop — it goes as JSX children instead
    if (key === 'children' && typeof value === 'string') continue;
    const rendered = renderPropValue(value);
    if (typeof value === 'boolean') {
      if (value) parts.push(key);
    } else {
      parts.push(`${key}=${rendered}`);
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
};

/** Get string children content (from `children` prop if present) */
const getTextChildren = (props: NodeProps): string | null => {
  const val = props['children'];
  return typeof val === 'string' ? val : null;
};

/** Render a single node recursively */
const renderNode = (node: TreeNode, indent: number): string => {
  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);
  const attrs = renderProps(node.props, node.component);
  const textChildren = getTextChildren(node.props);

  if (node.children.length === 0 && !textChildren) {
    return `${pad}<${node.component}${attrs} />`;
  }

  const childLines: string[] = [];
  if (textChildren) {
    childLines.push(`${childPad}{${JSON.stringify(textChildren)}}`);
  }
  for (const child of node.children) {
    childLines.push(renderNode(child, indent + 1));
  }

  return [
    `${pad}<${node.component}${attrs}>`,
    ...childLines,
    `${pad}</${node.component}>`,
  ].join('\n');
};

/** Collect all unique component names used in the tree */
const collectComponents = (node: TreeNode, acc: Set<string> = new Set()): Set<string> => {
  acc.add(node.component);
  for (const child of node.children) {
    collectComponents(child, acc);
  }
  return acc;
};

/**
 * Convert a tree to TSX source code.
 * Returns an Effect<string, CodegenError>.
 */
export const treeToTsx = (root: TreeNode): Effect.Effect<string, CodegenError> =>
  Effect.try({
    try: () => {
      const components = [...collectComponents(root)].sort();
      const importLine = `import { ${components.join(', ')} } from '@ybouhjira/hyperkit';`;

      const body = renderNode(root, 1);

      return [
        importLine,
        '',
        'export default function MyLayout() {',
        '  return (',
        body,
        '  );',
        '}',
      ].join('\n');
    },
    catch: (e) =>
      new CodegenError(
        `Failed to generate code: ${e instanceof Error ? e.message : String(e)}`
      ),
  });
