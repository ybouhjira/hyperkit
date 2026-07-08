import type { ThemeConfig, ThemeColors } from '../../theme/types';

export const normalizeColor = (color: string | undefined): string => {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) {
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match && match[1] && match[2] && match[3]) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return '#000000';
};

export const generateThemeCode = (theme: ThemeConfig): string => {
  return `import type { ThemeConfig } from '@ybouhjira/hyperkit';

export const customTheme: ThemeConfig = ${JSON.stringify(theme, null, 2)};`;
};

export interface ColorGroupItem {
  readonly key: keyof ThemeColors;
  readonly label: string;
}

export interface ColorGroup {
  readonly label: string;
  readonly colors: readonly ColorGroupItem[];
}

export const colorGroups: readonly ColorGroup[] = [
  {
    label: 'Background',
    colors: [
      { key: 'bgPrimary', label: 'Primary' },
      { key: 'bgSecondary', label: 'Secondary' },
      { key: 'bgTertiary', label: 'Tertiary' },
      { key: 'bgElevated', label: 'Elevated' },
    ],
  },
  {
    label: 'Text',
    colors: [
      { key: 'textPrimary', label: 'Primary' },
      { key: 'textSecondary', label: 'Secondary' },
      { key: 'textMuted', label: 'Muted' },
      { key: 'textOnAccent', label: 'On Accent' },
    ],
  },
  {
    label: 'Accent',
    colors: [
      { key: 'accent', label: 'Accent' },
      { key: 'accentHover', label: 'Hover' },
      { key: 'accentMuted', label: 'Muted' },
    ],
  },
  {
    label: 'Border',
    colors: [
      { key: 'border', label: 'Border' },
      { key: 'borderSubtle', label: 'Subtle' },
    ],
  },
  {
    label: 'Semantic',
    colors: [
      { key: 'success', label: 'Success' },
      { key: 'warning', label: 'Warning' },
      { key: 'error', label: 'Error' },
      { key: 'info', label: 'Info' },
    ],
  },
];
