import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { GlowElement } from './GlowElement';

describe('GlowElement', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <GlowElement>
        <span data-testid="child">Glowing!</span>
      </GlowElement>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-glow-element class', () => {
    const { container } = render(() => <GlowElement>Content</GlowElement>);
    expect(container.querySelector('.sk-glow-element')).toBeInTheDocument();
  });

  it('applies pulse class when pulse=true', () => {
    const { container } = render(() => <GlowElement pulse>Content</GlowElement>);
    expect(container.querySelector('.sk-glow-element')).toHaveClass('sk-glow-element--pulse');
  });

  it('does not apply pulse class when pulse=false', () => {
    const { container } = render(() => <GlowElement pulse={false}>Content</GlowElement>);
    expect(container.querySelector('.sk-glow-element')).not.toHaveClass('sk-glow-element--pulse');
  });

  it('applies custom class', () => {
    const { container } = render(() => <GlowElement class="my-glow">Content</GlowElement>);
    expect(container.querySelector('.sk-glow-element')).toHaveClass('my-glow');
  });

  it('sets glow color CSS variable', () => {
    const { container } = render(() => <GlowElement color="red">Content</GlowElement>);
    const el = container.querySelector('.sk-glow-element') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-glow-color')).toBe('red');
  });

  it('sets glow size CSS variable', () => {
    const { container } = render(() => <GlowElement size={30}>Content</GlowElement>);
    const el = container.querySelector('.sk-glow-element') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-glow-size')).toBe('30px');
  });

  it('renders as a custom element tag', () => {
    const { container } = render(() => <GlowElement as="span">Content</GlowElement>);
    expect(container.querySelector('span.sk-glow-element')).toBeInTheDocument();
  });

  it('sets pulse speed CSS variable', () => {
    const { container } = render(() => (
      <GlowElement pulse pulseSpeed={3}>
        Content
      </GlowElement>
    ));
    const el = container.querySelector('.sk-glow-element') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-glow-pulse-speed')).toBe('3s');
  });
});
