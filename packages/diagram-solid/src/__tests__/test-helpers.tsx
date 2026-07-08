import { render } from '@solidjs/testing-library';
import { Effect } from 'effect';
import type { Node, Edge, Graph, NodeId, EdgeId } from '@ybouhjira/diagram-core';
import { emptyGraph, createNode, createEdge, addNode, addEdge } from '@ybouhjira/diagram-core';
import { DiagramProvider, useDiagramContext, type DiagramProviderProps, type DiagramState, type DiagramActions } from '../DiagramProvider';

export const makeNode = (id: string, x = 0, y = 0, opts: Partial<Node> = {}): Node => ({
  id: id as NodeId,
  data: undefined,
  position: { x, y },
  size: { width: 100, height: 60 },
  ports: [],
  shape: 'rectangle',
  label: `Node ${id}`,
  style: {},
  ...opts,
});

export const makeEdge = (id: string, source: string, target: string, opts: Partial<Edge> = {}): Edge => ({
  id: id as EdgeId,
  source: source as NodeId,
  target: target as NodeId,
  data: undefined,
  sourceArrow: { type: 'none' },
  targetArrow: { type: 'triangle' },
  style: {},
  ...opts,
});

export const buildGraph = (nodes: Node[], edges: Edge[] = []): Graph => {
  let g = emptyGraph('test');
  for (const n of nodes) {
    g = Effect.runSync(addNode(g, n));
  }
  for (const e of edges) {
    g = Effect.runSync(addEdge(g, e));
  }
  return g;
};

export interface ProviderHandle {
  state: DiagramState;
  actions: DiagramActions;
  unmount: () => void;
}

export const renderWithProvider = (
  providerProps: Partial<DiagramProviderProps> = {}
): ProviderHandle => {
  let captured!: { state: DiagramState; actions: DiagramActions };

  const TestHarness = () => {
    const ctx = useDiagramContext();
    captured = { state: ctx.state, actions: ctx.actions };
    return <div data-testid="harness" />;
  };

  const { unmount } = render(() => (
    <DiagramProvider {...providerProps}>
      <TestHarness />
    </DiagramProvider>
  ));

  return { state: captured.state, actions: captured.actions, unmount };
};
