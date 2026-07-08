import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('renders the label', () => {
    render(() => <FilterChip label="Events" />);
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('renders with unselected state by default', () => {
    render(() => <FilterChip label="Test" />);
    const chip = screen.getByTestId('filter-chip');
    expect(chip).not.toHaveClass('sk-filter-chip--selected');
    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });

  it('renders in selected state', () => {
    render(() => <FilterChip label="Test" selected />);
    const chip = screen.getByTestId('filter-chip');
    expect(chip).toHaveClass('sk-filter-chip--selected');
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onToggle with true when unselected chip is clicked', () => {
    const onToggle = vi.fn();
    render(() => <FilterChip label="Test" selected={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('filter-chip'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false when selected chip is clicked', () => {
    const onToggle = vi.fn();
    render(() => <FilterChip label="Test" selected={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('filter-chip'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('does not call onToggle when disabled', () => {
    const onToggle = vi.fn();
    render(() => <FilterChip label="Test" disabled onToggle={onToggle} />);
    const chip = screen.getByTestId('filter-chip');
    fireEvent.click(chip);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('applies disabled class and aria-disabled when disabled', () => {
    render(() => <FilterChip label="Test" disabled />);
    const chip = screen.getByTestId('filter-chip');
    expect(chip).toHaveClass('sk-filter-chip--disabled');
    expect(chip).toBeDisabled();
  });

  it('toggles on Enter key (native button behavior via click)', () => {
    const onToggle = vi.fn();
    render(() => <FilterChip label="Test" selected={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('filter-chip'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('toggles on Space key (native button behavior via click)', () => {
    const onToggle = vi.fn();
    render(() => <FilterChip label="Test" selected={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('filter-chip'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('applies sm size class', () => {
    render(() => <FilterChip label="Test" size="sm" />);
    expect(screen.getByTestId('filter-chip')).toHaveClass('sk-filter-chip--sm');
  });

  it('applies md size class by default', () => {
    render(() => <FilterChip label="Test" />);
    expect(screen.getByTestId('filter-chip')).toHaveClass('sk-filter-chip--md');
  });

  it('renders icon when provided', () => {
    render(() => <FilterChip label="Test" icon={<span data-testid="chip-icon">★</span>} />);
    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <FilterChip label="Test" class="my-chip" />);
    expect(screen.getByTestId('filter-chip')).toHaveClass('my-chip');
  });

  it('has role button with aria-pressed for accessibility', () => {
    render(() => <FilterChip label="Test" />);
    const chip = screen.getByRole('button', { name: 'Test' });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });
});
