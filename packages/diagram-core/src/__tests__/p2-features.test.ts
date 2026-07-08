import { describe, it, expect } from 'vitest';
import {
  NodeId,
  EdgeId,
  PortId,
  GraphId,
  GroupId,
  emptyGraph,
  addNode,
  addEdge,
  serializeWorkflow,
  deserializeWorkflow,
  exportWorkflowJSON,
  importWorkflowJSON,
  computeAlignmentSnap,
  rerouteNodeType,
} from '../index';
import { Effect } from 'effect';

describe('P2 Features', () => {
  describe('Feature 7: Bypass/Mute/Reroute', () => {
    it('should support bypassed node state', () => {
      const graph = emptyGraph();
      const node = {
        id: NodeId('node1'),
        data: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        ports: [],
        shape: 'rectangle',
        style: {},
        bypassed: true,
      };

      const result = Effect.runSync(addNode(graph, node));
      const addedNode = result.nodes.get(NodeId('node1'));
      expect(addedNode?.bypassed).toBe(true);
    });

    it('should support muted node state', () => {
      const graph = emptyGraph();
      const node = {
        id: NodeId('node1'),
        data: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        ports: [],
        shape: 'rectangle',
        style: {},
        muted: true,
      };

      const result = Effect.runSync(addNode(graph, node));
      const addedNode = result.nodes.get(NodeId('node1'));
      expect(addedNode?.muted).toBe(true);
    });

    it('should have reroute node type definition', () => {
      expect(rerouteNodeType.type).toBe('reroute');
      expect(rerouteNodeType.category).toBe('Utility');
      expect(rerouteNodeType.defaultSize).toEqual({ width: 12, height: 12 });
      expect(rerouteNodeType.defaultPorts).toHaveLength(2);
      expect(rerouteNodeType.defaultPorts[0]?.direction).toBe('west');
      expect(rerouteNodeType.defaultPorts[1]?.direction).toBe('east');
    });
  });

  describe('Feature 8: Workflow Serialization', () => {
    it('should serialize and deserialize a simple workflow', () => {
      let graph = emptyGraph();
      const node1 = {
        id: NodeId('node1'),
        data: { value: 42 },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        ports: [
          { id: PortId('out'), direction: 'east' as const, offset: 0.5 },
        ],
        shape: 'rectangle',
        label: 'Node 1',
        style: {},
        bypassed: true,
      };

      const node2 = {
        id: NodeId('node2'),
        data: { value: 24 },
        position: { x: 200, y: 0 },
        size: { width: 100, height: 50 },
        ports: [
          { id: PortId('in'), direction: 'west' as const, offset: 0.5 },
        ],
        shape: 'rectangle',
        label: 'Node 2',
        style: {},
        muted: true,
      };

      graph = Effect.runSync(addNode(graph, node1));
      graph = Effect.runSync(addNode(graph, node2));

      const edge = {
        id: EdgeId('edge1'),
        source: NodeId('node1'),
        target: NodeId('node2'),
        sourcePort: PortId('out'),
        targetPort: PortId('in'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      };

      graph = Effect.runSync(addEdge(graph, edge));

      const layout = {
        nodePositions: new Map([
          [NodeId('node1'), { x: 0, y: 0 }],
          [NodeId('node2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const metadata = {
        title: 'Test Workflow',
        author: 'Test',
      };

      const serialized = serializeWorkflow(graph, layout, [], metadata);

      expect(serialized.version).toBe(1);
      expect(serialized.metadata.title).toBe('Test Workflow');
      expect(serialized.graph.nodes).toHaveLength(2);
      expect(serialized.graph.edges).toHaveLength(1);
      expect(serialized.layout?.nodePositions).toBeDefined();

      const deserialized = deserializeWorkflow(serialized);

      expect(deserialized.graph.nodes.size).toBe(2);
      expect(deserialized.graph.edges.size).toBe(1);
      expect(deserialized.metadata.title).toBe('Test Workflow');

      const deserializedNode1 = deserialized.graph.nodes.get(NodeId('node1'));
      expect(deserializedNode1?.bypassed).toBe(true);
      expect(deserializedNode1?.label).toBe('Node 1');

      const deserializedNode2 = deserialized.graph.nodes.get(NodeId('node2'));
      expect(deserializedNode2?.muted).toBe(true);
      expect(deserializedNode2?.label).toBe('Node 2');
    });

    it('should export and import workflow as JSON string', () => {
      let graph = emptyGraph();
      const node = {
        id: NodeId('node1'),
        data: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        ports: [],
        shape: 'rectangle',
        style: {},
      };

      graph = Effect.runSync(addNode(graph, node));

      const jsonString = exportWorkflowJSON(graph, null, [], { title: 'Test' });
      const parsed = JSON.parse(jsonString);
      expect(parsed.metadata.title).toBe('Test');
      expect(jsonString).toContain('node1');

      const imported = importWorkflowJSON(jsonString);
      expect(imported.graph.nodes.size).toBe(1);
      expect(imported.metadata.title).toBe('Test');
    });

    it('should preserve groups in serialization', () => {
      let graph = emptyGraph();
      const node1 = {
        id: NodeId('node1'),
        data: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        ports: [],
        shape: 'rectangle',
        style: {},
      };

      graph = Effect.runSync(addNode(graph, node1));

      const groups = [
        {
          id: GroupId('group1'),
          label: 'Group 1',
          nodeIds: [NodeId('node1')],
          collapsed: false,
          color: '#ff0000',
        },
      ];

      const serialized = serializeWorkflow(graph, null, groups);
      expect(serialized.groups).toHaveLength(1);
      expect(serialized.groups![0]?.label).toBe('Group 1');
      expect(serialized.groups![0]?.color).toBe('#ff0000');

      const deserialized = deserializeWorkflow(serialized);
      expect(deserialized.groups).toHaveLength(1);
      expect(deserialized.groups[0]?.label).toBe('Group 1');
      expect(deserialized.groups[0]?.color).toBe('#ff0000');
    });
  });

  describe('Feature 10: Snap-to-Align', () => {
    it('should detect left-left alignment', () => {
      const draggedId = NodeId('dragged');
      const otherNodes = [
        { id: NodeId('other1'), x: 100, y: 50, width: 80, height: 60 },
      ];

      const result = computeAlignmentSnap(
        draggedId,
        98, // Dragged node x (close to 100)
        150,
        80,
        60,
        otherNodes,
        5 // threshold
      );

      expect(result.snappedX).toBe(100);
      expect(result.guides).toHaveLength(1);
      expect(result.guides[0]?.type).toBe('vertical');
      expect(result.guides[0]?.position).toBe(100);
    });

    it('should detect center-center alignment', () => {
      const draggedId = NodeId('dragged');
      const otherNodes = [
        { id: NodeId('other1'), x: 100, y: 50, width: 80, height: 60 },
      ];

      // Other center: 100 + 40 = 140
      // Dragged center should be at 140, so x = 140 - 40 = 100
      const result = computeAlignmentSnap(
        draggedId,
        102, // x (dragged center = 102 + 40 = 142, close to 140)
        150,
        80, // width (center offset = 40)
        60,
        otherNodes,
        5
      );

      expect(result.snappedX).toBe(100); // Snapped to align centers
      expect(result.guides.some(g => g.type === 'vertical')).toBe(true);
    });

    it('should detect horizontal top-top alignment', () => {
      const draggedId = NodeId('dragged');
      const otherNodes = [
        { id: NodeId('other1'), x: 50, y: 100, width: 80, height: 60 },
      ];

      const result = computeAlignmentSnap(
        draggedId,
        150,
        98, // Close to 100
        80,
        60,
        otherNodes,
        5
      );

      expect(result.snappedY).toBe(100);
      expect(result.guides).toHaveLength(1);
      expect(result.guides[0]?.type).toBe('horizontal');
      expect(result.guides[0]?.position).toBe(100);
    });

    it('should not snap if distance exceeds threshold', () => {
      const draggedId = NodeId('dragged');
      const otherNodes = [
        { id: NodeId('other1'), x: 100, y: 50, width: 80, height: 60 },
      ];

      const result = computeAlignmentSnap(
        draggedId,
        90, // 10 pixels away, exceeds threshold of 5
        150,
        80,
        60,
        otherNodes,
        5
      );

      expect(result.snappedX).toBe(90); // Not snapped
      expect(result.guides).toHaveLength(0);
    });

    it('should snap to closest alignment when multiple are near', () => {
      const draggedId = NodeId('dragged');
      const otherNodes = [
        { id: NodeId('other1'), x: 100, y: 50, width: 80, height: 60 },
        { id: NodeId('other2'), x: 103, y: 150, width: 80, height: 60 },
      ];

      const result = computeAlignmentSnap(
        draggedId,
        101, // 1px from other1, 2px from other2
        250,
        80,
        60,
        otherNodes,
        5
      );

      expect(result.snappedX).toBe(100); // Snapped to closer node
      expect(result.guides).toHaveLength(1);
    });
  });
});
