/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

export function init(options: { dir: string }) {
  const dir = path.resolve(options.dir);
  const themeFile = path.join(dir, 'theme.ts');

  if (fs.existsSync(themeFile)) {
    console.log('⚠️  theme.ts already exists. Skipping.');
    return;
  }

  const template = `import type { ThemeConfig } from '@ybouhjira/hyperkit';

export const theme: ThemeConfig = {
  id: 'my-theme',
  name: 'My Theme',
  colors: {
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentMuted: 'rgba(99, 102, 241, 0.12)',
    bgPrimary: '#ffffff',
    bgSecondary: '#f9fafb',
    bgTertiary: '#f3f4f6',
    bgElevated: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textOnAccent: '#ffffff',
    border: '#e5e7eb',
    borderSubtle: '#f3f4f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  fonts: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'JetBrains Mono', 'Fira Code', monospace",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  fontSizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
    '2xl': '0 16px 32px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};
`;

  fs.writeFileSync(themeFile, template, 'utf-8');
  console.log('✅ Created theme.ts');
  console.log('');
  console.log('Usage:');
  console.log('  import { ThemeProvider } from "@ybouhjira/hyperkit";');
  console.log('  import { theme } from "./theme";');
  console.log('');
  console.log('  <ThemeProvider theme={theme}>');
  console.log('    <App />');
  console.log('  </ThemeProvider>');
}
