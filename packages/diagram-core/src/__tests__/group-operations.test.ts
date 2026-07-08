import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import {
  NodeId, EdgeId, GroupId,
  emptyGraph, addNode,
  createGroup, removeGroup, addNodesToGroup, removeNodesFromGroup,
  updateGroupBounds, moveGroup, findNodeGroup, toggleGroupCollapsed, updateGroupLabel,
} from '../index';
import type { Graph, Node, NodeGroup } from '../index';

const makeNode = (id: string, x: number, y: number): Node => ({
  id: NodeId(id),
  data: {},
  position: { x, y },
  size: { width: 100, height: 50 },
  ports: [],
  shape: 'rectangle',
  style: {},
});

describe('Group Operations', () => {
  let graph: Graph;

  beforeEach(() => {
    graph = emptyGraph();
    graph = Effect.runSync(addNode(graph, makeNode('n1', 0, 0)));
    graph = Effect.runSync(addNode(graph, makeNode('n2', 200, 0)));
    graph = Effect.runSync(addNode(graph, makeNode('n3', 400, 0)));
  });

  describe('createGroup', () => {
    it('should create a group from nodes', () => {
      const result = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group A');
      expect(result.group.label).toBe('Group A');
      expect(result.group.nodeIds).toHaveLength(2);
      expect(result.groups).toHaveLength(1);
    });

    it('should assign color to group', () => {
      const result = createGroup(graph, [], [NodeId('n1')], 'Group', '#ff0000');
      expect(result.group.color).toBe('#ff0000');
    });

    it('should compute bounds from node positions', () => {
      const result = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group');
      expect(result.group.position).toBeDefined();
      expect(result.group.size).toBeDefined();
      expect(result.group.size!.width).toBeGreaterThan(0);
    });

    it('should throw for non-existent nodes', () => {
      expect(() => createGroup(graph, [], [NodeId('nonexistent')], 'Group')).toThrow();
    });

    it('should remove nodes from existing groups', () => {
      const firstResult = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group A');
      const secondResult = createGroup(graph, firstResult.groups, [NodeId('n1')], 'Group B');
      // n1 should only be in Group B, not Group A
      const groupA = secondResult.groups.find(g => g.label === 'Group A');
      expect(groupA?.nodeIds).not.toContain(NodeId('n1'));
    });

    it('should start uncollapsed', () => {
      const result = createGroup(graph, [], [NodeId('n1')], 'Group');
      expect(result.group.collapsed).toBe(false);
    });
  });

  describe('removeGroup', () => {
    it('should remove a group', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const result = removeGroup(groups, group.id);
      expect(result).toHaveLength(0);
    });

    it('should not affect other groups', () => {
      const first = createGroup(graph, [], [NodeId('n1')], 'Group A');
      const second = createGroup(graph, first.groups, [NodeId('n2')], 'Group B');
      const result = removeGroup(second.groups, first.group.id);
      expect(result).toHaveLength(1);
      expect(result[0]?.label).toBe('Group B');
    });
  });

  describe('addNodesToGroup', () => {
    it('should add nodes to existing group', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const result = addNodesToGroup(groups, group.id, [NodeId('n2')]);
      const updated = result.find(g => g.id === group.id);
      expect(updated?.nodeIds).toHaveLength(2);
    });

    it('should not add duplicate nodes', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const result = addNodesToGroup(groups, group.id, [NodeId('n1')]);
      const updated = result.find(g => g.id === group.id);
      expect(updated?.nodeIds).toHaveLength(1);
    });
  });

  describe('removeNodesFromGroup', () => {
    it('should remove nodes from group', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group');
      const result = removeNodesFromGroup(groups, group.id, [NodeId('n1')]);
      const updated = result.find(g => g.id === group.id);
      expect(updated?.nodeIds).toHaveLength(1);
    });

    it('should remove empty groups automatically', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const result = removeNodesFromGroup(groups, group.id, [NodeId('n1')]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toggleGroupCollapsed', () => {
    it('should toggle collapsed state', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      expect(groups[0]?.collapsed).toBe(false);
      const toggled = toggleGroupCollapsed(groups, group.id);
      expect(toggled.find(g => g.id === group.id)?.collapsed).toBe(true);
      const toggledBack = toggleGroupCollapsed(toggled, group.id);
      expect(toggledBack.find(g => g.id === group.id)?.collapsed).toBe(false);
    });
  });

  describe('updateGroupLabel', () => {
    it('should update label', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Old Label');
      const result = updateGroupLabel(groups, group.id, 'New Label');
      expect(result.find(g => g.id === group.id)?.label).toBe('New Label');
    });
  });

  describe('updateGroupBounds', () => {
    it('should recompute bounds from node positions', () => {
      const { groups } = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group');
      const positions = new Map([
        [NodeId('n1'), { x: 50, y: 50 }],
        [NodeId('n2'), { x: 300, y: 100 }],
      ]);
      const result = updateGroupBounds(graph, groups, positions);
      expect(result[0]?.position?.x).toBeLessThan(50);
      expect(result[0]?.size?.width).toBeGreaterThan(250);
    });
  });

  describe('moveGroup', () => {
    it('should move all nodes in the group', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1'), NodeId('n2')], 'Group');
      const result = moveGroup(graph, groups, group.id, { dx: 50, dy: 30 });
      const movedN1 = result.graph.nodes.get(NodeId('n1'));
      expect(movedN1?.position.x).toBe(50);
      expect(movedN1?.position.y).toBe(30);
    });

    it('should update group position', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const originalPos = groups.find(g => g.id === group.id)?.position;
      const result = moveGroup(graph, groups, group.id, { dx: 50, dy: 30 });
      const newPos = result.groups.find(g => g.id === group.id)?.position;
      expect(newPos?.x).toBe((originalPos?.x ?? 0) + 50);
    });

    it('should handle non-existent group gracefully', () => {
      const result = moveGroup(graph, [], GroupId('nonexistent'), { dx: 10, dy: 10 });
      expect(result.graph).toBe(graph);
    });
  });

  describe('findNodeGroup', () => {
    it('should find the group containing a node', () => {
      const { groups, group } = createGroup(graph, [], [NodeId('n1')], 'Group');
      const found = findNodeGroup(groups, NodeId('n1'));
      expect(found?.id).toBe(group.id);
    });

    it('should return undefined for ungrouped node', () => {
      const { groups } = createGroup(graph, [], [NodeId('n1')], 'Group');
      expect(findNodeGroup(groups, NodeId('n3'))).toBeUndefined();
    });
  });
});
