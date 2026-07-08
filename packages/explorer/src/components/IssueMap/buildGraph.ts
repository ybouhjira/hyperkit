import { Effect } from 'effect';
import type { Graph, Node, Edge, NodeId, EdgeId } from '@ybouhjira/diagram-core';
import { emptyGraph, addNode, addEdge } from '@ybouhjira/diagram-core';
import type { IssueData } from './types';

export function buildIssueGraph(
  issues: readonly IssueData[],
  config?: { nodeWidth?: number; nodeHeight?: number }
): Graph {
  let graph = emptyGraph();

  const nodeWidth = config?.nodeWidth ?? 280;
  const nodeHeight = config?.nodeHeight ?? 120;

  // Sort issues by layer so dagre clusters same-layer nodes together
  const sortedIssues = [...issues].sort((a, b) => a.layer.localeCompare(b.layer));

  // Create a set of issue IDs for quick lookup
  const issueSet = new Set<string>();
  sortedIssues.forEach((issue) => issueSet.add(issue.id));

  // Add all issue nodes
  for (const issue of sortedIssues) {
    const node: Node<IssueData> = {
      id: issue.id as NodeId,
      data: issue,
      position: { x: 0, y: 0 }, // dagre will position these
      size: { width: nodeWidth, height: nodeHeight },
      ports: [], // no ports needed for this visualization
      shape: 'rectangle',
      label: `#${issue.number}`,
      style: {},
      renderMode: 'html',
    };

    graph = Effect.runSync(addNode(graph, node));
  }

  // Add dependency edges
  for (const issue of sortedIssues) {
    for (const dep of issue.dependsOn) {
      // Only create edge if both source and target nodes exist
      if (issueSet.has(dep)) {
        const edge: Edge = {
          id: `dep-${issue.id}-${dep}` as EdgeId,
          source: dep as NodeId, // dependency points TO the dependent
          target: issue.id as NodeId,
          data: undefined,
          sourceArrow: { type: 'none' },
          targetArrow: { type: 'triangle' },
          style: {
            stroke: 'var(--sk-accent, #4fc3f7)',
            strokeWidth: 2,
          },
        };

        graph = Effect.runSync(addEdge(graph, edge));
      }
    }
  }

  return graph;
}
