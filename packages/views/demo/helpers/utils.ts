import type { Kind } from '../../src/types';

// Color mapping for each kind
export const KIND_COLORS: Record<Kind, string> = {
  title: '#3b82f6',
  subtitle: '#a855f7',
  media: '#10b981',
  status: '#f59e0b',
  metric: '#f97316',
  rating: '#ef4444',
  tag: '#ec4899',
  person: '#06b6d4',
  timestamp: '#6366f1',
  content: '#64748b',
  identifier: '#475569',
  geo: '#14b8a6',
  preview: '#8b5cf6',
  attachment: '#737373',
  specs: '#78716c',
};

export const formatTime = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
};

export const statusVariant = (status: string) => {
  switch (status) {
    case 'open': return 'success' as const;
    case 'in_progress': return 'warning' as const;
    case 'closed': return 'info' as const;
    default: return 'default' as const;
  }
};
