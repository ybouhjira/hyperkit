/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { ThemePicker } from './ThemePicker';
import { ThemeProvider } from './ThemeProvider';

describe('theme/ThemePicker', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('renders theme buttons', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>
    ));

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays theme names', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>
    ));

    const buttons = container.querySelectorAll('button');
    const hasThemeNames = Array.from(buttons).some(
      (btn) => btn.textContent && btn.textContent.trim().length > 0
    );

    expect(hasThemeNames).toBe(true);
  });

  it('shows selected indicator for current theme', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>
    ));

    const hasSelectedIndicator = container.textContent?.includes('✓ Selected');
    expect(hasSelectedIndicator).toBe(true);
  });

  it('calls onThemeChange when a theme is clicked', () => {
    const onThemeChange = vi.fn();

    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker onThemeChange={onThemeChange} />
      </ThemeProvider>
    ));

    const buttons = container.querySelectorAll('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(onThemeChange).toHaveBeenCalled();
    }
  });

  it('renders theme color swatches', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>
    ));

    const colorSwatches = container.querySelectorAll('.sk-theme-picker__swatch');
    expect(colorSwatches.length).toBeGreaterThan(0);
  });

  it('renders in a grid layout', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>
    ));

    const gridContainer = container.firstElementChild as HTMLElement;
    expect(gridContainer?.classList.contains('sk-theme-picker')).toBe(true);
  });
});
