import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

describe('SegmentedControl', () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  it('renders all option labels', () => {
    render(() => <SegmentedControl options={OPTIONS} />);
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('renders with role="radiogroup" on container', () => {
    render(() => <SegmentedControl options={OPTIONS} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders each option with role="radio"', () => {
    render(() => <SegmentedControl options={OPTIONS} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  // ── Uncontrolled default value ────────────────────────────────────────────

  it('selects the defaultValue option', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" />);
    const weekBtn = screen.getByRole('radio', { name: 'Week' });
    expect(weekBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('marks non-default options as unchecked', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" />);
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'false');
  });

  it('has no selection when no defaultValue or value provided', () => {
    render(() => <SegmentedControl options={OPTIONS} />);
    screen.getAllByRole('radio').forEach((btn) => {
      expect(btn).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ── Controlled value ──────────────────────────────────────────────────────

  it('reflects controlled value', () => {
    render(() => <SegmentedControl options={OPTIONS} value="month" />);
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false');
  });

  it('updates when controlled value changes', () => {
    const [val, setVal] = createSignal('day');
    render(() => <SegmentedControl options={OPTIONS} value={val()} onChange={setVal} />);
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');
    setVal('week');
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false');
  });

  // ── Click interaction ─────────────────────────────────────────────────────

  it('calls onChange with the clicked option value', () => {
    const onChange = vi.fn();
    render(() => <SegmentedControl options={OPTIONS} defaultValue="day" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('updates uncontrolled selection on click', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="day" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Month' }));
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false');
  });

  // ── Disabled state ────────────────────────────────────────────────────────

  it('does not call onChange when the entire control is disabled', () => {
    const onChange = vi.fn();
    render(() => (
      <SegmentedControl options={OPTIONS} defaultValue="day" disabled onChange={onChange} />
    ));
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies disabled class on the container when disabled', () => {
    render(() => <SegmentedControl options={OPTIONS} disabled />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('sk-segmented-control--disabled');
  });

  it('does not call onChange for an individually disabled option', () => {
    const onChange = vi.fn();
    const opts = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
    ];
    render(() => <SegmentedControl options={opts} defaultValue="a" onChange={onChange} />);
    const bBtn = screen.getByRole('radio', { name: 'B' });
    expect(bBtn).toBeDisabled();
    fireEvent.click(bBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets data-disabled on individually disabled option', () => {
    const opts = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
    ];
    render(() => <SegmentedControl options={opts} />);
    const bBtn = screen.getByRole('radio', { name: 'B' });
    expect(bBtn).toHaveAttribute('data-disabled', '');
  });

  // ── data-selected ─────────────────────────────────────────────────────────

  it('sets data-selected on the selected option', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" />);
    const weekBtn = screen.getByRole('radio', { name: 'Week' });
    expect(weekBtn).toHaveAttribute('data-selected', '');
  });

  it('does not set data-selected on unselected options', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" />);
    expect(screen.getByRole('radio', { name: 'Day' })).not.toHaveAttribute('data-selected');
    expect(screen.getByRole('radio', { name: 'Month' })).not.toHaveAttribute('data-selected');
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it('moves to the next option on ArrowRight', () => {
    const onChange = vi.fn();
    render(() => <SegmentedControl options={OPTIONS} defaultValue="day" onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('moves to the previous option on ArrowLeft', () => {
    const onChange = vi.fn();
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('wraps from last to first on ArrowRight', () => {
    const onChange = vi.fn();
    render(() => <SegmentedControl options={OPTIONS} defaultValue="month" onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('wraps from first to last on ArrowLeft', () => {
    const onChange = vi.fn();
    render(() => <SegmentedControl options={OPTIONS} defaultValue="day" onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('does not move on keyboard when disabled', () => {
    const onChange = vi.fn();
    render(() => (
      <SegmentedControl options={OPTIONS} defaultValue="day" disabled onChange={onChange} />
    ));
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── Tab index ─────────────────────────────────────────────────────────────

  it('selected option has tabIndex 0, others have -1', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="week" />);
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('tabindex', '-1');
  });

  // ── Styling ───────────────────────────────────────────────────────────────

  it('applies the correct size class', () => {
    render(() => <SegmentedControl options={OPTIONS} size="sm" />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('sk-segmented-control--sm');
  });

  it('applies md size class by default', () => {
    render(() => <SegmentedControl options={OPTIONS} />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('sk-segmented-control--md');
  });

  it('applies lg size class', () => {
    render(() => <SegmentedControl options={OPTIONS} size="lg" />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('sk-segmented-control--lg');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(() => <SegmentedControl options={OPTIONS} fullWidth />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('sk-segmented-control--full-width');
  });

  it('applies custom class to the container', () => {
    render(() => <SegmentedControl options={OPTIONS} class="my-control" />);
    expect(screen.getByTestId('segmented-control')).toHaveClass('my-control');
  });

  it('removes sk-* classes when unstyled is true', () => {
    render(() => <SegmentedControl options={OPTIONS} unstyled />);
    const container = screen.getByTestId('segmented-control');
    expect(container.className).toBe('');
  });

  it('selected option has sk-segmented-control__option--selected class', () => {
    render(() => <SegmentedControl options={OPTIONS} defaultValue="day" />);
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveClass(
      'sk-segmented-control__option--selected'
    );
  });

  it('uses aria-label on the radiogroup', () => {
    render(() => <SegmentedControl options={OPTIONS} aria-label="View period" />);
    expect(screen.getByRole('radiogroup', { name: 'View period' })).toBeInTheDocument();
  });
});
