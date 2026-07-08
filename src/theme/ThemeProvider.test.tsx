import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { Component } from 'solid-js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const ThemeDisplay: Component = () => {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div>
      <span data-testid="current-theme-id">{theme().id}</span>
      <span data-testid="current-theme-name">{theme().name}</span>
      <span data-testid="theme-count">{themes.length}</span>
      <button onClick={() => setTheme('github-dark')}>Switch to GitHub Dark</button>
      <button onClick={() => setTheme('linear')}>Switch to Linear</button>
    </div>
  );
};

const ThemeOutsideProvider: Component = () => {
  const { theme } = useTheme();
  return <div>{theme().id}</div>;
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('provides default theme (zed-dark)', () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    expect(screen.getByTestId('current-theme-id').textContent).toBe('zed-dark');
    expect(screen.getByTestId('current-theme-name').textContent).toBe('Zed Dark');
  });

  it('provides list of available themes', () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    const themeCount = parseInt(screen.getByTestId('theme-count').textContent || '0');
    expect(themeCount).toBeGreaterThan(0);
  });

  it('switches theme using setTheme', async () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    expect(screen.getByTestId('current-theme-id').textContent).toBe('zed-dark');

    await fireEvent.click(screen.getByText('Switch to GitHub Dark'));
    expect(screen.getByTestId('current-theme-id').textContent).toBe('github-dark');

    await fireEvent.click(screen.getByText('Switch to Linear'));
    expect(screen.getByTestId('current-theme-id').textContent).toBe('linear');
  });

  it('persists theme to localStorage', async () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    await fireEvent.click(screen.getByText('Switch to Linear'));
    expect(localStorageMock.getItem('hyperkit-theme')).toBe('linear');
  });

  it('applies CSS variables to DOM', () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    const root = document.documentElement;

    // Check that CSS variables are applied
    expect(root.style.getPropertyValue('--sk-bg-primary')).toBeTruthy();
    expect(root.style.getPropertyValue('--sk-text-primary')).toBeTruthy();
    expect(root.style.getPropertyValue('--sk-accent')).toBeTruthy();
    expect(root.style.getPropertyValue('--sk-font-code')).toBeTruthy();
    expect(root.style.getPropertyValue('--sk-radius-md')).toBeTruthy();
  });

  it('throws when useTheme used outside provider', () => {
    expect(() => {
      render(() => <ThemeOutsideProvider />);
    }).toThrow('useThemeContext must be used within a ThemeProvider');
  });

  it('customizeTheme overrides theme properties', () => {
    const ThemeCustomizer: Component = () => {
      const { theme, customizeTheme } = useTheme();
      return (
        <div>
          <span data-testid="accent-color">{theme().colors.accent}</span>
          <button
            onClick={() =>
              customizeTheme({
                colors: { ...theme().colors, accent: '#ff0000' },
              })
            }
          >
            Customize Accent
          </button>
        </div>
      );
    };

    render(() => (
      <ThemeProvider>
        <ThemeCustomizer />
      </ThemeProvider>
    ));

    const originalAccent = screen.getByTestId('accent-color').textContent;
    expect(originalAccent).not.toBe('#ff0000');

    fireEvent.click(screen.getByText('Customize Accent'));
    expect(screen.getByTestId('accent-color').textContent).toBe('#ff0000');
  });

  it('includes light themes in theme list', () => {
    render(() => (
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    ));

    const themeCount = parseInt(screen.getByTestId('theme-count').textContent || '0');
    expect(themeCount).toBeGreaterThanOrEqual(12); // 6 dark + 6 light
  });

  it('switches to a light theme', async () => {
    const LightThemeSwitcher: Component = () => {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="current-theme-id">{theme().id}</span>
          <button onClick={() => setTheme('zed-light')}>Switch to Zed Light</button>
        </div>
      );
    };

    render(() => (
      <ThemeProvider>
        <LightThemeSwitcher />
      </ThemeProvider>
    ));

    expect(screen.getByTestId('current-theme-id').textContent).toBe('zed-dark');

    await fireEvent.click(screen.getByText('Switch to Zed Light'));
    expect(screen.getByTestId('current-theme-id').textContent).toBe('zed-light');
  });

  it('light theme has light background colors', async () => {
    const LightThemeTester: Component = () => {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="bg-primary">{theme().colors.bgPrimary}</span>
          <button onClick={() => setTheme('github-light')}>Switch to GitHub Light</button>
        </div>
      );
    };

    render(() => (
      <ThemeProvider>
        <LightThemeTester />
      </ThemeProvider>
    ));

    await fireEvent.click(screen.getByText('Switch to GitHub Light'));
    const bgPrimary = screen.getByTestId('bg-primary').textContent;
    expect(bgPrimary).toBe('#ffffff');
  });
});
