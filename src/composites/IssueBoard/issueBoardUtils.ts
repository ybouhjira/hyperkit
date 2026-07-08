export const getPriorityColor = (priority: string | null): string => {
  switch (priority) {
    case 'P0':
      return '#ef4444';
    case 'P1':
      return '#f97316';
    case 'P2':
      return '#eab308';
    case 'P3':
      return '#3b82f6';
    default:
      return 'var(--sk-text-secondary)';
  }
};

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
