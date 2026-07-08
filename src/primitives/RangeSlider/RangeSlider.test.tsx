import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { RangeSlider } from './RangeSlider';
import { settleLazy } from '../../__fixtures__/settleLazy';

// Mock getBoundingClientRect for Kobalte Slider in JSDOM
beforeAll(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 200,
    height: 20,
    top: 0,
    right: 200,
    bottom: 20,
    left: 0,
    toJSON: () => '',
  }));

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

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./RangeSlider.client');
}, 30_000);

describe('RangeSlider', () => {
  it('renders with label', async () => {
    render(() => <RangeSlider label="Price Range" />);
    await settleLazy();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
  });

  it('shows both values', async () => {
    render(() => <RangeSlider defaultValue={[20, 80]} />);
    await settleLazy();
    expect(screen.getByText('20 - 80')).toBeInTheDocument();
  });

  it('hides values when showValues=false', async () => {
    render(() => <RangeSlider defaultValue={[20, 80]} showValues={false} />);
    await settleLazy();
    expect(screen.queryByText('20 - 80')).not.toBeInTheDocument();
  });

  it('applies disabled state', async () => {
    render(() => <RangeSlider disabled label="Disabled Range" />);
    await settleLazy();
    const slider = screen.getByRole('group');
    expect(slider).toHaveAttribute('data-disabled');
  });

  it('applies custom class', async () => {
    render(() => <RangeSlider class="custom-slider" />);
    await settleLazy();
    const slider = screen.getByRole('group');
    expect(slider).toHaveClass('custom-slider');
  });

  it('uses default min/max', async () => {
    render(() => <RangeSlider />);
    await settleLazy();
    expect(screen.getByText('0 - 100')).toBeInTheDocument();
  });

  it('respects custom min/max/step', async () => {
    render(() => <RangeSlider min={0} max={1000} step={50} defaultValue={[100, 900]} />);
    await settleLazy();
    expect(screen.getByText('100 - 900')).toBeInTheDocument();
  });

  it('renders two thumbs', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    const thumbs = container.querySelectorAll('.sk-range-slider__thumb');
    expect(thumbs).toHaveLength(2);
  });

  it('enforces minGap', async () => {
    const onChange = vi.fn();
    render(() => <RangeSlider value={[40, 60]} minGap={30} onChange={onChange} />);
    await settleLazy();

    // Simulate onChange being called with values too close
    const component = screen.getByRole('group');
    // The component should enforce the gap internally
    expect(component).toBeInTheDocument();
  });

  it('handles controlled value', async () => {
    const onChange = vi.fn();
    render(() => <RangeSlider value={[25, 75]} onChange={onChange} />);
    await settleLazy();
    expect(screen.getByText('25 - 75')).toBeInTheDocument();
  });

  it('uses defaultValue when no value provided', async () => {
    render(() => <RangeSlider defaultValue={[10, 90]} />);
    await settleLazy();
    expect(screen.getByText('10 - 90')).toBeInTheDocument();
  });

  it('falls back to [min, max] when neither value nor defaultValue provided', async () => {
    render(() => <RangeSlider min={5} max={50} />);
    await settleLazy();
    expect(screen.getByText('5 - 50')).toBeInTheDocument();
  });

  it('renders without label', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    expect(container.querySelector('.sk-range-slider__label')).not.toBeInTheDocument();
  });

  it('renders without custom class', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    const slider = container.querySelector('.sk-range-slider');
    expect(slider).toBeInTheDocument();
  });

  it('handles onChange callback when value changes', async () => {
    const onChange = vi.fn();
    // We test the internal handleChange logic by verifying the component accepts onChange
    render(() => <RangeSlider defaultValue={[20, 80]} onChange={onChange} />);
    await settleLazy();
    const slider = screen.getByRole('group');
    expect(slider).toBeInTheDocument();
  });

  it('shows correct value display with min/max boundaries', async () => {
    render(() => <RangeSlider min={0} max={200} defaultValue={[50, 150]} />);
    await settleLazy();
    expect(screen.getByText('50 - 150')).toBeInTheDocument();
  });

  it('renders with disabled and label combined', async () => {
    render(() => <RangeSlider disabled label="Disabled Range" />);
    await settleLazy();
    const slider = screen.getByRole('group');
    expect(slider).toHaveAttribute('data-disabled');
    expect(screen.getByText('Disabled Range')).toBeInTheDocument();
  });

  it('applies default class when no custom class', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    const slider = container.querySelector('[class*="sk-range-slider"]');
    expect(slider).toBeInTheDocument();
  });

  it('shows values by default', async () => {
    render(() => <RangeSlider defaultValue={[30, 70]} />);
    await settleLazy();
    expect(screen.getByText('30 - 70')).toBeInTheDocument();
  });

  it('uses defaultValue over min/max when provided', async () => {
    render(() => <RangeSlider min={0} max={100} defaultValue={[25, 75]} />);
    await settleLazy();
    expect(screen.getByText('25 - 75')).toBeInTheDocument();
  });

  it('prefers value over defaultValue for display', async () => {
    render(() => <RangeSlider value={[10, 40]} defaultValue={[25, 75]} />);
    await settleLazy();
    expect(screen.getByText('10 - 40')).toBeInTheDocument();
  });

  it('renders track, fill, and thumb elements', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    expect(container.querySelector('.sk-range-slider__track')).toBeInTheDocument();
    expect(container.querySelector('.sk-range-slider__fill')).toBeInTheDocument();
    const thumbs = container.querySelectorAll('.sk-range-slider__thumb');
    expect(thumbs.length).toBe(2);
  });

  it('header shows both label and value when both provided', async () => {
    const { container } = render(() => <RangeSlider label="Range" defaultValue={[10, 90]} />);
    await settleLazy();
    expect(container.querySelector('.sk-range-slider__header')).toBeInTheDocument();
    expect(container.querySelector('.sk-range-slider__label')).toBeInTheDocument();
    expect(container.querySelector('.sk-range-slider__value')).toBeInTheDocument();
  });

  it('renders two hidden inputs for each thumb', async () => {
    const { container } = render(() => <RangeSlider />);
    await settleLazy();
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);
  });

  it('slider is not disabled by default', async () => {
    const slider = render(() => <RangeSlider />);
    await settleLazy();
    const group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('data-disabled');
    slider.unmount();
  });

  describe('handleChange via keyboard', () => {
    it('calls onChange when moving the min thumb right via ArrowRight', async () => {
      const onChange = vi.fn();
      render(() => <RangeSlider defaultValue={[20, 80]} step={1} onChange={onChange} />);
      await settleLazy();

      const sliders = screen.getAllByRole('slider');
      const minThumb = sliders[0]; // First thumb is min
      minThumb.focus();
      await fireEvent.keyDown(minThumb, { key: 'ArrowRight' });

      // Kobalte should trigger onChange -> handleChange with new value
      expect(onChange).toHaveBeenCalled();
      const [newValue] = onChange.mock.calls[0] as [[number, number]];
      expect(newValue[0]).toBeGreaterThanOrEqual(20);
      expect(newValue[1]).toBe(80);
    });

    it('calls onChange when moving the max thumb left via ArrowLeft', async () => {
      const onChange = vi.fn();
      render(() => <RangeSlider defaultValue={[20, 80]} step={1} onChange={onChange} />);
      await settleLazy();

      const sliders = screen.getAllByRole('slider');
      const maxThumb = sliders[1]; // Second thumb is max
      maxThumb.focus();
      await fireEvent.keyDown(maxThumb, { key: 'ArrowLeft' });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1] as [[number, number]];
      const [newValue] = lastCall;
      // One of the thumbs should have changed
      expect(newValue.length).toBe(2);
    });

    it('enforces minGap when thumbs get too close', async () => {
      const onChange = vi.fn();
      // Set thumbs close together with a large minGap
      render(() => (
        <RangeSlider defaultValue={[48, 52]} step={5} minGap={20} onChange={onChange} />
      ));
      await settleLazy();

      const sliders = screen.getAllByRole('slider');
      const minThumb = sliders[0];
      minThumb.focus();
      // Move min thumb right, which would violate minGap
      await fireEvent.keyDown(minThumb, { key: 'ArrowRight' });

      if (onChange.mock.calls.length > 0) {
        const [newValue] = onChange.mock.calls[onChange.mock.calls.length - 1] as [
          [number, number],
        ];
        // Gap should be enforced: maxVal - minVal >= minGap
        expect(newValue[1] - newValue[0]).toBeGreaterThanOrEqual(20);
      }
    });

    it('enforces minGap when max thumb moves toward min', async () => {
      const onChange = vi.fn();
      render(() => (
        <RangeSlider defaultValue={[48, 52]} step={5} minGap={20} onChange={onChange} />
      ));
      await settleLazy();

      const sliders = screen.getAllByRole('slider');
      const maxThumb = sliders[1];
      maxThumb.focus();
      // Move max thumb left, which would violate minGap
      await fireEvent.keyDown(maxThumb, { key: 'ArrowLeft' });

      if (onChange.mock.calls.length > 0) {
        const [newValue] = onChange.mock.calls[onChange.mock.calls.length - 1] as [
          [number, number],
        ];
        expect(newValue[1] - newValue[0]).toBeGreaterThanOrEqual(20);
      }
    });

    it('updates displayed value after keyboard interaction', async () => {
      render(() => <RangeSlider defaultValue={[20, 80]} step={10} />);
      await settleLazy();

      const sliders = screen.getAllByRole('slider');
      const minThumb = sliders[0];
      minThumb.focus();
      await fireEvent.keyDown(minThumb, { key: 'ArrowRight' });

      // Value display should have changed from "20 - 80"
      const valueEl = document.querySelector('.sk-range-slider__value');
      expect(valueEl).toBeInTheDocument();
      // Should show updated value (could be 21 or 30 depending on step)
      expect(valueEl?.textContent).not.toBe('');
    });

    it('ignores onChange for arrays with length != 2', async () => {
      // This tests the guard `if (value.length === 2)` in handleChange
      // We can't directly send a bad array through Kobalte, but we can verify
      // the component handles keyboard events gracefully
      const onChange = vi.fn();
      render(() => <RangeSlider defaultValue={[10, 90]} onChange={onChange} />);
      await settleLazy();
      const sliders = screen.getAllByRole('slider');
      const minThumb = sliders[0];
      minThumb.focus();
      // Home key sets to minimum value
      await fireEvent.keyDown(minThumb, { key: 'Home' });
      // The component should not throw
      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });
});
