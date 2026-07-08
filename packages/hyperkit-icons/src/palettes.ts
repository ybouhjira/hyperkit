import type { CategoryPalette, IconCategory } from './types';

export const CATEGORY_PALETTES: Record<IconCategory, CategoryPalette> = {
  transform: { primary: '#E5322D', primaryDark: '#B71C1C', light: '#FFEBEE' },
  annotate:  { primary: '#FF8F00', primaryDark: '#E65100', light: '#FFF3E0' },
  convert:   { primary: '#0055FF', primaryDark: '#0D47A1', light: '#E3F2FD' },
  security:  { primary: '#22C55E', primaryDark: '#15803D', light: '#E8F5E9' },
  optimize:  { primary: '#F59E0B', primaryDark: '#D97706', light: '#FFF8E1' },
  ai:        { primary: '#6366F1', primaryDark: '#4338CA', light: '#EDE7F6' },
};
