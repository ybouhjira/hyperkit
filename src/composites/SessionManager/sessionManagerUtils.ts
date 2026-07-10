import type { SessionSubagentInfo } from './SessionManager';

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
