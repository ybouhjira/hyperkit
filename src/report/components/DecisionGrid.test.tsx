import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { DecisionGrid } from './DecisionGrid';
import type { DecisionGridOption } from '../types';

const options: DecisionGridOption[] = [
  { id: 'opt-a', label: 'Option A', description: 'First choice', icon: '🚀', tags: ['fast'] },
  { id: 'opt-b', label: 'Option B', description: 'Second choice' },
  { id: 'opt-c', label: 'Option C' },
];

describe('DecisionGrid', () => {
  it('renders all options', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick an option"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('Option A')).toBeInTheDocument();
    expect(getByText('Option B')).toBeInTheDocument();
    expect(getByText('Option C')).toBeInTheDocument();
  });

  it('renders the label', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick an option"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('Pick an option')).toBeInTheDocument();
  });

  it('renders description and icon when provided', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('First choice')).toBeInTheDocument();
    expect(getByText('🚀')).toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('fast')).toBeInTheDocument();
  });

  it('calls onSelect with option id when clicking an unselected option (single select)', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={[]}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Option A').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['opt-a']);
  });

  it('deselects when clicking selected option in single select', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={['opt-a']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Option A').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it('single select: clicking new option replaces previous selection', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={['opt-a']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Option B').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['opt-b']);
  });

  it('multi select: clicking adds to selection', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        multiple
        options={options}
        selected={['opt-a']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Option B').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['opt-a', 'opt-b']);
  });

  it('multi select: clicking selected option removes it', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        multiple
        options={options}
        selected={['opt-a', 'opt-b']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Option A').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['opt-b']);
  });

  it('selected option has --selected modifier class', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={['opt-a']}
        onSelect={() => {}}
      />
    ));
    const btn = getByText('Option A').closest('button')!;
    expect(btn.classList.contains('sk-report-decision-card--selected')).toBe(true);
  });

  it('unselected option does not have --selected class', () => {
    const { getByText } = render(() => (
      <DecisionGrid
        id="test-grid"
        label="Pick"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    const btn = getByText('Option A').closest('button')!;
    expect(btn.classList.contains('sk-report-decision-card--selected')).toBe(false);
  });
});
