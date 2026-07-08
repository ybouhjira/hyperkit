import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { NumberInput } from './NumberInput';
import { settleLazy } from '../../__fixtures__/settleLazy';

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./NumberInput.client');
}, 30_000);

describe('NumberInput', () => {
  it('renders without crashing', async () => {
    const { container } = render(() => <NumberInput />);
    await settleLazy();
    expect(container.querySelector('.sk-number-input')).toBeInTheDocument();
  });

  it('renders with label', async () => {
    render(() => <NumberInput label="Quantity" />);
    await settleLazy();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('shows default value', async () => {
    const { container } = render(() => <NumberInput defaultValue={5} />);
    await settleLazy();
    const input = container.querySelector('.sk-number-input__field') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('calls onChange when increment button is clicked', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => <NumberInput defaultValue={0} onChange={handleChange} />);
    await settleLazy();

    const incrementBtn = container.querySelector('.sk-number-input__button--increment');
    fireEvent.click(incrementBtn!);

    // Just verify onChange is called - Kobalte handles the value internally
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onChange when decrement button is clicked', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => <NumberInput defaultValue={5} onChange={handleChange} />);
    await settleLazy();

    const decrementBtn = container.querySelector('.sk-number-input__button--decrement');
    fireEvent.click(decrementBtn!);

    // Just verify onChange is called - Kobalte handles the value internally
    expect(handleChange).toHaveBeenCalled();
  });

  it('respects min value', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => (
      <NumberInput defaultValue={0} min={0} onChange={handleChange} />
    ));
    await settleLazy();

    const decrementBtn = container.querySelector('.sk-number-input__button--decrement');
    fireEvent.click(decrementBtn!);

    // Should not go below min
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('respects max value', async () => {
    const handleChange = vi.fn();
    const { container } = render(() => (
      <NumberInput defaultValue={10} max={10} onChange={handleChange} />
    ));
    await settleLazy();

    const incrementBtn = container.querySelector('.sk-number-input__button--increment');
    fireEvent.click(incrementBtn!);

    // Should not go above max
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies disabled state', async () => {
    const { container } = render(() => <NumberInput disabled />);
    await settleLazy();
    expect(container.querySelector('.sk-number-input[data-disabled]')).toBeInTheDocument();
  });

  it('applies size variants', async () => {
    const { container: smallContainer } = render(() => <NumberInput size="sm" />);
    await settleLazy();
    expect(smallContainer.querySelector('.sk-number-input--sm')).toBeInTheDocument();

    const { container: mediumContainer } = render(() => <NumberInput size="md" />);
    await settleLazy();
    expect(mediumContainer.querySelector('.sk-number-input--md')).toBeInTheDocument();

    const { container: largeContainer } = render(() => <NumberInput size="lg" />);
    await settleLazy();
    expect(largeContainer.querySelector('.sk-number-input--lg')).toBeInTheDocument();
  });

  it('applies custom class', async () => {
    const { container } = render(() => <NumberInput class="custom-number-input" />);
    await settleLazy();
    expect(container.querySelector('.sk-number-input.custom-number-input')).toBeInTheDocument();
  });

  it('accepts custom step value', async () => {
    const { container } = render(() => <NumberInput defaultValue={0} step={5} />);
    await settleLazy();

    // Verify the component renders with the step prop
    expect(container.querySelector('.sk-number-input')).toBeInTheDocument();
  });

  it('handles floating point values with precision', async () => {
    const { container } = render(() => <NumberInput defaultValue={1.5} step={0.5} />);
    await settleLazy();
    const input = container.querySelector('.sk-number-input__field') as HTMLInputElement;
    expect(input.value).toBe('1.5');
  });

  it('auto-detects precision from step', async () => {
    const { container } = render(() => <NumberInput defaultValue={0} step={0.01} />);
    await settleLazy();
    const input = container.querySelector('.sk-number-input__field') as HTMLInputElement;
    // With step=0.01, precision should be 2
    expect(input.value).toBe('0.00');
  });

  it('unstyled removes sk-* classes', async () => {
    const { container } = render(() => <NumberInput unstyled class="custom" />);
    await settleLazy();
    const root = container.firstElementChild;
    expect(root?.className).not.toContain('sk-');
    expect(root?.className).toContain('custom');
  });
});
