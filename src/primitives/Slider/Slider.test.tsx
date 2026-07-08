import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Slider } from './Slider';
import { settleLazy } from '../../__fixtures__/settleLazy';

// Kobalte Slider relies on DOM measurements for fill percentage and thumb positioning.
// JSDOM returns 0-sized rects, causing calc(NaN%) which css-tree cannot parse.
beforeAll(() => {
  Element.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 200,
    height: 20,
    top: 0,
    right: 200,
    bottom: 20,
    left: 0,
    toJSON: () => '',
  });

  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (
    prop: string,
    value: string,
    priority?: string
  ) {
    if (typeof value === 'string' && value.includes('NaN')) return;
    return originalSetProperty.call(this, prop, value, priority ?? '');
  };
});

// Helper: Kobalte renders multiple elements with role="slider"
const getSliderInput = (container: HTMLElement) =>
  container.querySelector('input[type="range"]') as HTMLInputElement;

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./Slider.client');
}, 30_000);

describe('Slider', () => {
  it('renders with label', async () => {
    render(() => <Slider label="Volume" defaultValue={50} />);
    await settleLazy();
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('shows current value by default', async () => {
    render(() => <Slider label="Volume" defaultValue={75} />);
    await settleLazy();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('hides value when showValue is false', async () => {
    render(() => <Slider label="Volume" defaultValue={75} showValue={false} />);
    await settleLazy();
    expect(screen.queryByText('75')).not.toBeInTheDocument();
  });

  it('accepts onChange prop', async () => {
    const onChange = vi.fn();
    const { container } = render(() => <Slider defaultValue={50} onChange={onChange} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input).toBeInTheDocument();
  });

  it('respects disabled state', async () => {
    const { container } = render(() => <Slider defaultValue={50} disabled />);
    await settleLazy();
    const root = container.querySelector('.sk-slider');
    expect(root).toHaveAttribute('data-disabled');
  });

  it('applies custom class', async () => {
    const { container } = render(() => <Slider class="custom-slider" defaultValue={50} />);
    await settleLazy();
    expect(container.querySelector('.sk-slider.custom-slider')).toBeInTheDocument();
  });

  it('uses default min and max values', async () => {
    const { container } = render(() => <Slider defaultValue={50} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
  });

  it('respects custom min and max values', async () => {
    const { container } = render(() => <Slider defaultValue={25} min={0} max={50} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input.min).toBe('0');
    expect(input.max).toBe('50');
  });

  it('respects custom step value', async () => {
    const { container } = render(() => <Slider defaultValue={50} step={10} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input.step).toBe('10');
  });

  it('renders without label', async () => {
    const { container } = render(() => <Slider defaultValue={30} />);
    await settleLazy();
    expect(container.querySelector('.sk-slider__label')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-slider')).toBeInTheDocument();
  });

  it('unstyled removes sk-* classes', async () => {
    const { container } = render(() => <Slider unstyled class="custom" defaultValue={50} />);
    await settleLazy();
    const root = container.firstElementChild;
    expect(root?.className).not.toContain('sk-');
    expect(root?.className).toContain('custom');
  });

  it('renders controlled slider with value prop', async () => {
    render(() => <Slider value={42} label="Controlled" />);
    await settleLazy();
    expect(screen.getByText('Controlled')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders uncontrolled slider with defaultValue', async () => {
    const { container } = render(() => <Slider defaultValue={30} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input).toBeInTheDocument();
  });

  it('uses minValue as default when no defaultValue in uncontrolled mode', async () => {
    const { container } = render(() => <Slider min={10} max={90} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input.min).toBe('10');
    expect(input.max).toBe('90');
  });

  it('hides value label when showValue is false with label', async () => {
    const { container } = render(() => (
      <Slider label="Volume" defaultValue={75} showValue={false} />
    ));
    await settleLazy();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(container.querySelector('.sk-slider__value')).not.toBeInTheDocument();
  });

  it('shows value label by default when label is present', async () => {
    const { container } = render(() => <Slider label="Speed" defaultValue={60} />);
    await settleLazy();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(container.querySelector('.sk-slider__value')).toBeInTheDocument();
  });

  it('renders unstyled slider with label', async () => {
    const { container } = render(() => <Slider unstyled label="Unstyled" defaultValue={50} />);
    await settleLazy();
    expect(screen.getByText('Unstyled')).toBeInTheDocument();
    // Label container should not have sk-* class
    const header = container.querySelector('.sk-slider__header');
    expect(header).not.toBeInTheDocument();
  });

  it('renders unstyled slider with value label', async () => {
    const { container } = render(() => (
      <Slider unstyled label="Unstyled" defaultValue={50} showValue />
    ));
    await settleLazy();
    // The value label element should exist but without sk-* class
    const valueEl = container.querySelector('.sk-slider__value');
    expect(valueEl).not.toBeInTheDocument();
  });

  it('applies default class when no custom class', async () => {
    const { container } = render(() => <Slider defaultValue={50} />);
    await settleLazy();
    const root = container.querySelector('.sk-slider');
    expect(root).toBeInTheDocument();
  });

  it('renders without onChange', async () => {
    const { container } = render(() => <Slider defaultValue={50} />);
    await settleLazy();
    expect(getSliderInput(container)).toBeInTheDocument();
  });

  it('calls onChange when provided', async () => {
    const onChange = vi.fn();
    const { container } = render(() => <Slider defaultValue={50} onChange={onChange} />);
    await settleLazy();
    expect(getSliderInput(container)).toBeInTheDocument();
  });

  it('handles value=0 as controlled', async () => {
    render(() => <Slider value={0} label="Zero" />);
    await settleLazy();
    expect(screen.getByText('Zero')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('unstyled without class uses empty string', async () => {
    const { container } = render(() => <Slider unstyled defaultValue={50} />);
    await settleLazy();
    const root = container.firstElementChild;
    expect(root?.className).not.toContain('sk-slider');
  });

  it('uses defaults for min, max, step when not provided', async () => {
    const { container } = render(() => <Slider defaultValue={50} />);
    await settleLazy();
    const input = getSliderInput(container);
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('1');
  });
});
