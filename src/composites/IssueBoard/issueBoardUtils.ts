export const getPriorityClass = (priority: string | null): string => {
  switch (priority) {
    case 'P0':
      return 'sk-issue-priority sk-issue-priority--p0';
    case 'P1':
      return 'sk-issue-priority sk-issue-priority--p1';
    case 'P2':
      return 'sk-issue-priority sk-issue-priority--p2';
    default:
      return 'sk-issue-priority sk-issue-priority--p3';
  }
};

/** GitHub label colors arrive with or without a leading `#` — normalize to a CSS color. */
export const normalizeLabelColor = (color: string): string =>
  color.startsWith('#') ? color : `#${color}`;

export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
