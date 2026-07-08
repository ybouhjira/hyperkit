import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Separator } from './Separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(() => <Separator />);
    const separator = container.querySelector('hr');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('sk-separator', 'sk-separator--horizontal');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical separator when orientation is vertical', () => {
    const { container } = render(() => <Separator orientation="vertical" />);
    const separator = container.querySelector('div');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('sk-separator', 'sk-separator--vertical');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies custom class', () => {
    const { container } = render(() => <Separator class="custom-class" />);
    const separator = container.querySelector('hr');
    expect(separator).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    const { container } = render(() => <Separator style={{ 'background-color': 'red' }} />);
    const separator = container.querySelector('hr');
    expect(separator).toHaveAttribute('style');
    expect(separator?.getAttribute('style')).toContain('background-color');
  });

  it('sets correct aria-orientation for horizontal', () => {
    const { container } = render(() => <Separator orientation="horizontal" />);
    const separator = container.querySelector('hr');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('sets correct aria-orientation for vertical', () => {
    const { container } = render(() => <Separator orientation="vertical" />);
    const separator = container.querySelector('div');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('unstyled removes sk-separator classes', () => {
    const { container } = render(() => <Separator unstyled class="custom" />);
    const sep = container.querySelector('hr');
    expect(sep?.className).not.toContain('sk-separator');
    expect(sep?.className).toContain('custom');
  });
});
