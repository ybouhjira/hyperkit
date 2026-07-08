/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { useTheme } from './useTheme';
import { ThemeProvider } from './ThemeProvider';

describe('theme/useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  function TestComponent(props: { onMount: (result: ReturnType<typeof useTheme>) => void }) {
    const theme = useTheme();
    props.onMount(theme);
    return <div>Test</div>;
  }

  it('should return theme context values', () => {
    let result: ReturnType<typeof useTheme> | undefined;

    render(() => (
      <ThemeProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </ThemeProvider>
    ));

    expect(result).toBeDefined();
    expect(result?.theme).toBeDefined();
    expect(result?.setTheme).toBeDefined();
    expect(result?.themes).toBeDefined();
    expect(result?.customizeTheme).toBeDefined();
  });

  it('should return current theme', () => {
    let result: ReturnType<typeof useTheme> | undefined;

    render(() => (
      <ThemeProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </ThemeProvider>
    ));

    const currentTheme = result?.theme();
    expect(currentTheme).toBeDefined();
    expect(currentTheme?.id).toBeTruthy();
    expect(currentTheme?.name).toBeTruthy();
    expect(currentTheme?.colors).toBeDefined();
  });

  it('should return array of available themes', () => {
    let result: ReturnType<typeof useTheme> | undefined;

    render(() => (
      <ThemeProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </ThemeProvider>
    ));

    expect(result?.themes).toBeInstanceOf(Array);
    expect(result?.themes.length).toBeGreaterThan(0);
    expect(result?.themes[0]).toHaveProperty('id');
    expect(result?.themes[0]).toHaveProperty('name');
  });

  it('should change theme', () => {
    let result: ReturnType<typeof useTheme> | undefined;

    render(() => (
      <ThemeProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </ThemeProvider>
    ));

    const initialThemeId = result?.theme().id;
    const availableThemes = result?.themes || [];
    const differentTheme = availableThemes.find((t) => t.id !== initialThemeId);

    if (differentTheme) {
      result?.setTheme(differentTheme.id);
      expect(result?.theme().id).toBe(differentTheme.id);
    }
  });

  it('should customize theme', () => {
    let result: ReturnType<typeof useTheme> | undefined;

    render(() => (
      <ThemeProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </ThemeProvider>
    ));

    const newFonts = {
      code: '"Custom Font", monospace',
      ui: 'sans-serif',
      mono: 'monospace',
    };

    result?.customizeTheme({ fonts: newFonts });
    expect(result?.theme().fonts.code).toBe('"Custom Font", monospace');
  });
});
