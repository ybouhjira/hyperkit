import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Poll } from './Poll';
import type { PollOption } from '../types';

const options: PollOption[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'maybe', label: 'Maybe' },
];

describe('Poll', () => {
  it('renders the label', () => {
    const { getByText } = render(() => (
      <Poll
        id="test-poll"
        label="Do you agree?"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('Do you agree?')).toBeInTheDocument();
  });

  it('renders all options', () => {
    const { getByText } = render(() => (
      <Poll
        id="test-poll"
        label="Do you agree?"
        options={options}
        selected={[]}
        onSelect={() => {}}
      />
    ));
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
    expect(getByText('Maybe')).toBeInTheDocument();
  });

  it('calls onSelect with option id on click (single select)', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <Poll id="test-poll" label="Vote" options={options} selected={[]} onSelect={onSelect} />
    ));
    fireEvent.click(getByText('Yes').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['yes']);
  });

  it('single select: deselects when clicking already-selected option', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <Poll id="test-poll" label="Vote" options={options} selected={['yes']} onSelect={onSelect} />
    ));
    fireEvent.click(getByText('Yes').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it('single select: clicking another option replaces selection', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <Poll id="test-poll" label="Vote" options={options} selected={['yes']} onSelect={onSelect} />
    ));
    fireEvent.click(getByText('No').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['no']);
  });

  it('multi select: clicking adds to selection', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <Poll
        id="test-poll"
        label="Vote (multi)"
        multiple
        options={options}
        selected={['yes']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Maybe').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['yes', 'maybe']);
  });

  it('multi select: clicking selected option removes it', () => {
    const onSelect = vi.fn();
    const { getByText } = render(() => (
      <Poll
        id="test-poll"
        label="Vote (multi)"
        multiple
        options={options}
        selected={['yes', 'no']}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByText('Yes').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(['no']);
  });

  it('selected option has --selected modifier class', () => {
    const { getByText } = render(() => (
      <Poll id="test-poll" label="Vote" options={options} selected={['yes']} onSelect={() => {}} />
    ));
    const btn = getByText('Yes').closest('button')!;
    expect(btn.classList.contains('sk-report-poll__option--selected')).toBe(true);
  });

  it('unselected option does not have --selected class', () => {
    const { getByText } = render(() => (
      <Poll id="test-poll" label="Vote" options={options} selected={[]} onSelect={() => {}} />
    ));
    const btn = getByText('No').closest('button')!;
    expect(btn.classList.contains('sk-report-poll__option--selected')).toBe(false);
  });
});
