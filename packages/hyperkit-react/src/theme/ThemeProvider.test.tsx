import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { fjordTheme } from '@ybouhjira/hyperkit-styles';

function Probe() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div>
      <span data-testid="theme-id">{theme.id}</span>
      <span data-testid="theme-count">{themes.length}</span>
      <button onClick={() => setTheme('github-light')}>switch</button>
    </div>
  );
}

describe('ThemeProvider (React)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
  });

  it('applies --sk-* variables to the document root', () => {
    render(
      <ThemeProvider theme={fjordTheme}>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-id').textContent).toBe('fjord');
    const bg = document.documentElement.style.getPropertyValue('--sk-bg-primary');
    expect(bg).toBe(fjordTheme.colors.bgPrimary);
  });

  it('exposes the full preset list', () => {
    render(
      <ThemeProvider theme={fjordTheme}>
        <Probe />
      </ThemeProvider>
    );
    expect(Number(screen.getByTestId('theme-count').textContent)).toBeGreaterThanOrEqual(40);
  });

  it('setTheme repaints the root and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'switch' }).click();
    });
    expect(screen.getByTestId('theme-id').textContent).toBe('github-light');
    expect(localStorage.getItem('hyperkit-theme')).toBe('github-light');
    expect(document.documentElement.style.getPropertyValue('--sk-bg-primary')).not.toBe(
      fjordTheme.colors.bgPrimary
    );
  });

  it('restores the saved theme on mount when no theme prop is pinned', () => {
    localStorage.setItem('hyperkit-theme', 'fjord');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-id').textContent).toBe('fjord');
  });

  it('useTheme outside a provider throws', () => {
    expect(() => render(<Probe />)).toThrow(/within a ThemeProvider/);
  });
});
