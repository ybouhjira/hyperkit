import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { ViewSwitcher } from './ViewSwitcher';
import type { ViewModeConfig } from './types';

const mockModes: ViewModeConfig[] = [
  { id: 'card-grid', label: 'Card Grid', icon: 'card-grid', tooltip: 'View as cards' },
  { id: 'table', label: 'Table', icon: 'table', tooltip: 'View as table' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
];

describe('ViewSwitcher', () => {
  it('renders all view mode buttons', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('highlights the active mode', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="table" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    const tableButton = buttons[1]; // Second button is table

    expect(tableButton).toHaveAttribute('aria-pressed', 'true');
    expect(tableButton.style.color).toBe('var(--sk-accent)');
    expect(tableButton.style.background).toBe('var(--sk-bg-elevated)');
  });

  it('calls onModeChange when a button is clicked', () => {
    const handleModeChange = vi.fn();
    render(() => (
      <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={handleModeChange} />
    ));

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Click table button

    expect(handleModeChange).toHaveBeenCalledWith('table');
  });

  it('applies tooltip from mode config', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('title', 'View as cards');
    expect(buttons[1]).toHaveAttribute('title', 'View as table');
  });

  it('falls back to label when tooltip is not provided', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveAttribute('title', 'Timeline');
  });

  it('applies aria-label from mode config', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-label', 'Card Grid');
    expect(buttons[1]).toHaveAttribute('aria-label', 'Table');
  });

  it('applies correct size variant', () => {
    const { container } = render(() => (
      <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} size="lg" />
    ));

    const button = container.querySelector('button') as HTMLElement;
    expect(button.style.width).toBe('40px');
    expect(button.style.height).toBe('40px');
  });

  it('defaults to medium size', () => {
    const { container } = render(() => (
      <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />
    ));

    const button = container.querySelector('button') as HTMLElement;
    expect(button.style.width).toBe('32px');
    expect(button.style.height).toBe('32px');
  });

  it('renders custom icon function', () => {
    const customModes: ViewModeConfig[] = [
      {
        id: 'custom',
        label: 'Custom',
        icon: () => <span data-testid="custom-icon">⭐</span>,
      },
    ];

    render(() => <ViewSwitcher modes={customModes} activeMode="custom" onModeChange={() => {}} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders builtin icons for known mode IDs', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    // Each button should contain an SVG
    buttons.forEach((button) => {
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('handles mouse hover on inactive buttons', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    const inactiveButton = buttons[1]; // Table button (not active)

    fireEvent.mouseEnter(inactiveButton);
    expect(inactiveButton.style.color).toBe('var(--sk-text-primary)');

    fireEvent.mouseLeave(inactiveButton);
    expect(inactiveButton.style.color).toBe('var(--sk-text-secondary)');
  });

  it('does not change color on hover for active button', () => {
    render(() => <ViewSwitcher modes={mockModes} activeMode="card-grid" onModeChange={() => {}} />);

    const buttons = screen.getAllByRole('button');
    const activeButton = buttons[0];

    const originalColor = activeButton.style.color;
    fireEvent.mouseEnter(activeButton);
    expect(activeButton.style.color).toBe(originalColor);
  });
});
