import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { DateInput } from './DateInput';

describe('DateInput', () => {
  it('renders with label', () => {
    render(() => <DateInput label="Select Date" />);
    expect(screen.getByText('Select Date')).toBeInTheDocument();
  });

  it('renders date input', () => {
    const { container } = render(() => <DateInput label="Date" />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('date');
  });

  it('renders datetime-local input when includeTime is true', () => {
    const { container } = render(() => <DateInput label="DateTime" includeTime />);
    const input = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('datetime-local');
  });

  it('default value works', () => {
    const { container } = render(() => <DateInput label="Date" defaultValue="2025-03-15" />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('2025-03-15');
  });

  it('controlled value works', () => {
    const { container } = render(() => <DateInput label="Date" value="2025-06-20" />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('2025-06-20');
  });

  it('calls onChange on date change', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => <DateInput label="Date" onChange={handleChange} />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;

    fireEvent.input(input, { target: { value: '2025-12-25' } });
    expect(handleChange).toHaveBeenCalledWith('2025-12-25');
  });

  it('disabled state', () => {
    const { container } = render(() => <DateInput label="Date" disabled />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('custom class', () => {
    const { container } = render(() => <DateInput class="custom-class" />);
    const wrapper = container.querySelector('.sk-date-input');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('min/max constraints applied', () => {
    const { container } = render(() => (
      <DateInput label="Date" min="2025-01-01" max="2025-12-31" />
    ));
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.min).toBe('2025-01-01');
    expect(input.max).toBe('2025-12-31');
  });

  it('size variants render correctly', () => {
    const { container: containerSm } = render(() => <DateInput size="sm" />);
    expect(containerSm.querySelector('.sk-date-input')).toHaveClass('sm');

    const { container: containerMd } = render(() => <DateInput size="md" />);
    expect(containerMd.querySelector('.sk-date-input')).toHaveClass('md');

    const { container: containerLg } = render(() => <DateInput size="lg" />);
    expect(containerLg.querySelector('.sk-date-input')).toHaveClass('lg');
  });

  it('required attribute', () => {
    const { container } = render(() => <DateInput label="Date" required />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('clear button works', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => (
      <DateInput label="Date" defaultValue="2025-03-15" onChange={handleChange} />
    ));

    const clearButton = container.querySelector('.sk-date-input-clear') as HTMLButtonElement;
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('displays formatted date value', () => {
    render(() => <DateInput label="Date" defaultValue="2025-03-15" />);
    const display = screen.getByText(/March 15, 2025/i);
    expect(display).toBeInTheDocument();
  });

  it('placeholder is applied', () => {
    const { container } = render(() => <DateInput placeholder="Pick a date" />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.placeholder).toBe('Pick a date');
  });

  it('applies custom style prop', () => {
    const { container } = render(() => <DateInput style={{ 'background-color': 'red' }} />);
    const wrapper = container.querySelector('.sk-date-input') as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <DateInput unstyled class="custom" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).not.toContain('sk-');
    expect(wrapper?.className).toContain('custom');
  });
});
