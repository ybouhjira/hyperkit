import { Accessor } from 'solid-js';
import { useThemeContext } from './ThemeProvider';
import { ThemeConfig } from './types';

export interface UseThemeReturn {
  theme: Accessor<ThemeConfig>;
  setTheme: (id: string) => void;
  themes: ThemeConfig[];
  customizeTheme: (overrides: Partial<ThemeConfig>) => void;
}

export function useTheme(): UseThemeReturn {
  return useThemeContext();
}
