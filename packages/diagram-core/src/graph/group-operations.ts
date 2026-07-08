import type { Graph, Node, NodeId, NodeGroup, GroupId } from './types';
import { GroupId as GroupIdBrand } from './types';
import { NodeNotFoundError, GroupNotFoundError } from '../errors';

/** Create a new group from selected nodes */
export const createGroup = <ND, ED>(
  graph: Graph<ND, ED>,
  groups: ReadonlyArray<NodeGroup>,
  nodeIds: ReadonlyArray<NodeId>,
  label: string,
  color?: string
): { groups: ReadonlyArray<NodeGroup>; group: NodeGroup } => {
  // Validate all nodes exist
  for (const nodeId of nodeIds) {
    if (!graph.nodes.has(nodeId)) {
      throw new NodeNotFoundError({ nodeId });
    }
  }

  // Remove these nodes from any existing group
  const updatedGroups = groups.map(g => ({
    ...g,
    nodeIds: g.nodeIds.filter(id => !nodeIds.includes(id)),
  })).filter(g => g.nodeIds.length > 0);

  // Compute bounds from node positions and sizes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const nodeId of nodeIds) {
    const node = graph.nodes.get(nodeId);
    if (node) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    }
  }

  const padding = 30;
  const headerHeight = 40;

  const newGroup: NodeGroup = {
    id: GroupIdBrand(`group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    label,
    nodeIds: [...nodeIds],
    collapsed: false,
    color,
    position: { x: minX - padding, y: minY - padding - headerHeight },
    size: {
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2 + headerHeight
    },
  };

  return {
    groups: [...updatedGroups, newGroup],
    group: newGroup
  };
};

/** Remove a group (nodes remain, just ungrouped) */
export const removeGroup = (
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId
): ReadonlyArray<NodeGroup> => {
  return groups.filter(g => g.id !== groupId);
};

/** Add nodes to an existing group */
export const addNodesToGroup = (
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId,
  nodeIds: ReadonlyArray<NodeId>
): ReadonlyArray<NodeGroup> => {
  return groups.map(g => {
    if (g.id !== groupId) return g;
    const existingIds = new Set(g.nodeIds);
    const newNodeIds = nodeIds.filter(id => !existingIds.has(id));
    return { ...g, nodeIds: [...g.nodeIds, ...newNodeIds] };
  });
};

/** Remove nodes from a group */
export const removeNodesFromGroup = (
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId,
  nodeIds: ReadonlyArray<NodeId>
): ReadonlyArray<NodeGroup> => {
  const removeSet = new Set(nodeIds);
  return groups.map(g => {
    if (g.id !== groupId) return g;
    return { ...g, nodeIds: g.nodeIds.filter(id => !removeSet.has(id)) };
  }).filter(g => g.nodeIds.length > 0); // Remove empty groups
};

/** Update group label */
export const updateGroupLabel = (
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId,
  label: string
): ReadonlyArray<NodeGroup> => {
  return groups.map(g => g.id === groupId ? { ...g, label } : g);
};

/** Toggle group collapsed state */
export const toggleGroupCollapsed = (
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId
): ReadonlyArray<NodeGroup> => {
  return groups.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g);
};

/** Update group bounds based on contained node positions */
export const updateGroupBounds = <ND, ED>(
  graph: Graph<ND, ED>,
  groups: ReadonlyArray<NodeGroup>,
  nodePositions?: ReadonlyMap<NodeId, { x: number; y: number }>
): ReadonlyArray<NodeGroup> => {
  const padding = 30;
  const headerHeight = 40;

  return groups.map(group => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const nodeId of group.nodeIds) {
      const node = graph.nodes.get(nodeId);
      if (!node) continue;
      const pos = nodePositions?.get(nodeId) ?? node.position;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + node.size.width);
      maxY = Math.max(maxY, pos.y + node.size.height);
    }

    if (minX === Infinity) return group;

    return {
      ...group,
      position: { x: minX - padding, y: minY - padding - headerHeight },
      size: {
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2 + headerHeight
      },
    };
  });
};

/** Move all nodes in a group by delta */
export const moveGroup = <ND, ED>(
  graph: Graph<ND, ED>,
  groups: ReadonlyArray<NodeGroup>,
  groupId: GroupId,
  delta: { dx: number; dy: number }
): { graph: Graph<ND, ED>; groups: ReadonlyArray<NodeGroup> } => {
  const group = groups.find(g => g.id === groupId);
  if (!group) return { graph, groups };

  const newNodes = new Map(graph.nodes);
  for (const nodeId of group.nodeIds) {
    const node = newNodes.get(nodeId);
    if (node) {
      newNodes.set(nodeId, {
        ...node,
        position: {
          x: node.position.x + delta.dx,
          y: node.position.y + delta.dy,
        },
      });
    }
  }

  const newGraph = { ...graph, nodes: newNodes };
  const updatedGroups = groups.map(g => {
    if (g.id !== groupId || !g.position) return g;
    return {
      ...g,
      position: {
        x: g.position.x + delta.dx,
        y: g.position.y + delta.dy,
      },
    };
  });

  return { graph: newGraph, groups: updatedGroups };
};

/** Find which group a node belongs to */
export const findNodeGroup = (
  groups: ReadonlyArray<NodeGroup>,
  nodeId: NodeId
): NodeGroup | undefined => {
  return groups.find(g => g.nodeIds.includes(nodeId));
};

/** Push apart overlapping groups to prevent title/frame collisions */
export const separateGroupBounds = (
  groups: ReadonlyArray<NodeGroup>,
  minGap: number = 20
): ReadonlyArray<NodeGroup> => {
  if (groups.length <= 1) return groups;
  
  const mutableGroups = groups.map(g => ({ ...g }));
  
  // Simple iterative separation - run a few passes
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < mutableGroups.length; i++) {
      for (let j = i + 1; j < mutableGroups.length; j++) {
        const a = mutableGroups[i];
        const b = mutableGroups[j];
        if (!a?.position || !a?.size || !b?.position || !b?.size) continue;
        
        // Type-narrowed references
        const aPos = a.position;
        const aSize = a.size;
        const bPos = b.position;
        const bSize = b.size;
        
        // Check for overlap
        const aRight = aPos.x + aSize.width;
        const aBottom = aPos.y + aSize.height;
        const bRight = bPos.x + bSize.width;
        const bBottom = bPos.y + bSize.height;
        
        const overlapX = Math.min(aRight, bRight) - Math.max(aPos.x, bPos.x);
        const overlapY = Math.min(aBottom, bBottom) - Math.max(aPos.y, bPos.y);
        
        if (overlapX > -minGap && overlapY > -minGap) {
          // Groups overlap or are too close - push apart along the axis with less overlap
          const pushX = overlapX + minGap;
          const pushY = overlapY + minGap;
          
          if (pushX < pushY) {
            // Push horizontally
            const halfPush = pushX / 2;
            if (aPos.x < bPos.x) {
              a.position = { ...aPos, x: aPos.x - halfPush };
              b.position = { ...bPos, x: bPos.x + halfPush };
            } else {
              b.position = { ...bPos, x: bPos.x - halfPush };
              a.position = { ...aPos, x: aPos.x + halfPush };
            }
          } else {
            // Push vertically
            const halfPush = pushY / 2;
            if (aPos.y < bPos.y) {
              a.position = { ...aPos, y: aPos.y - halfPush };
              b.position = { ...bPos, y: bPos.y + halfPush };
            } else {
              b.position = { ...bPos, y: bPos.y - halfPush };
              a.position = { ...aPos, y: aPos.y + halfPush };
            }
          }
        }
      }
    }
  }
  
  return mutableGroups;
};
