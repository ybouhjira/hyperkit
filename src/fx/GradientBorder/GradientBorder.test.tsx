import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { GradientBorder } from './GradientBorder';

describe('GradientBorder', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <GradientBorder>
        <span data-testid="child">Content</span>
      </GradientBorder>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-gradient-border class', () => {
    const { container } = render(() => <GradientBorder>Content</GradientBorder>);
    expect(container.querySelector('.sk-gradient-border')).toBeInTheDocument();
  });

  it('applies animated class by default', () => {
    const { container } = render(() => <GradientBorder>Content</GradientBorder>);
    expect(container.querySelector('.sk-gradient-border')).toHaveClass(
      'sk-gradient-border--animated'
    );
  });

  it('does not apply animated class when animated=false', () => {
    const { container } = render(() => <GradientBorder animated={false}>Content</GradientBorder>);
    expect(container.querySelector('.sk-gradient-border')).not.toHaveClass(
      'sk-gradient-border--animated'
    );
  });

  it('sets border width CSS variable', () => {
    const { container } = render(() => <GradientBorder width={4}>Content</GradientBorder>);
    const el = container.querySelector('.sk-gradient-border') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-gb-width')).toBe('4px');
  });

  it('sets speed CSS variable', () => {
    const { container } = render(() => <GradientBorder speed={5}>Content</GradientBorder>);
    const el = container.querySelector('.sk-gradient-border') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-gb-speed')).toBe('5s');
  });

  it('sets radius CSS variable', () => {
    const { container } = render(() => <GradientBorder radius="12px">Content</GradientBorder>);
    const el = container.querySelector('.sk-gradient-border') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-gb-radius')).toBe('12px');
  });

  it('applies custom class', () => {
    const { container } = render(() => <GradientBorder class="my-gb">Content</GradientBorder>);
    expect(container.querySelector('.sk-gradient-border')).toHaveClass('my-gb');
  });

  it('renders inner wrapper', () => {
    const { container } = render(() => <GradientBorder>Content</GradientBorder>);
    expect(container.querySelector('.sk-gradient-border__inner')).toBeInTheDocument();
  });
});
