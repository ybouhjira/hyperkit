import type { SessionInfo, SessionSubagentInfo } from './SessionManager';

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(2)}`;
};

export const getStatusColor = (status: SessionInfo['status']): string => {
  switch (status) {
    case 'active':
      return '#22c55e';
    case 'paused':
      return '#eab308';
    case 'completed':
      return '#94a3b8';
    case 'failed':
      return '#ef4444';
  }
};

export const getSubagentStatusColor = (status: SessionSubagentInfo['status']): string => {
  switch (status) {
    case 'running':
      return '#22c55e';
    case 'waiting':
      return '#eab308';
    case 'completed':
      return '#94a3b8';
  }
};

export const getModelIcon = (model: string): string => {
  if (model.includes('opus')) return '🧠';
  if (model.includes('sonnet')) return '💻';
  if (model.includes('haiku')) return '⚡';
  return '🤖';
};

export const buildSubagentTree = (
  subagents: readonly SessionSubagentInfo[]
): Map<string, readonly SessionSubagentInfo[]> => {
  const tree = new Map<string, SessionSubagentInfo[]>();

  subagents.forEach((agent) => {
    const parentId = agent.parentId || 'root';
    if (!tree.has(parentId)) {
      tree.set(parentId, []);
    }
    const arr = tree.get(parentId);
    if (arr) {
      arr.push(agent);
    }
  });

  return tree as Map<string, readonly SessionSubagentInfo[]>;
};
