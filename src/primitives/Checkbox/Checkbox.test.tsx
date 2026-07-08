import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders the checkbox', () => {
    render(() => <Checkbox />);
    expect(screen.getByTestId('checkbox-root')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(() => <Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders the hidden input', () => {
    render(() => <Checkbox />);
    expect(screen.getByTestId('checkbox-input')).toBeInTheDocument();
  });

  it('fires onChange when clicked', () => {
    const onChange = vi.fn();
    render(() => <Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByTestId('checkbox-control'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('passes checked state to Kobalte', () => {
    render(() => <Checkbox checked={true} onChange={() => undefined} />);
    const root = screen.getByTestId('checkbox-root');
    expect(root.getAttribute('data-checked')).toBe('');
  });

  it('is disabled when disabled prop is true', () => {
    render(() => <Checkbox disabled />);
    const root = screen.getByTestId('checkbox-root');
    expect(root.getAttribute('data-disabled')).toBe('');
  });

  it('applies sm size class', () => {
    render(() => <Checkbox size="sm" />);
    expect(screen.getByTestId('checkbox-root')).toHaveClass('sk-checkbox--sm');
  });

  it('applies md size class by default', () => {
    render(() => <Checkbox />);
    expect(screen.getByTestId('checkbox-root')).toHaveClass('sk-checkbox--md');
  });

  it('applies lg size class', () => {
    render(() => <Checkbox size="lg" />);
    expect(screen.getByTestId('checkbox-root')).toHaveClass('sk-checkbox--lg');
  });

  it('renders indeterminate state via kobalte prop', () => {
    render(() => <Checkbox indeterminate />);
    const root = screen.getByTestId('checkbox-root');
    expect(root.getAttribute('data-indeterminate')).toBe('');
  });

  it('applies custom class', () => {
    render(() => <Checkbox class="my-check" />);
    expect(screen.getByTestId('checkbox-root')).toHaveClass('my-check');
  });

  it('renders without label when label prop is absent', () => {
    render(() => <Checkbox />);
    const labels = document.querySelectorAll('.sk-checkbox__label');
    expect(labels.length).toBe(0);
  });
});
