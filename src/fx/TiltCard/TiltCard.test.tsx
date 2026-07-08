import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { TiltCard } from './TiltCard';

describe('TiltCard', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <TiltCard>
        <span data-testid="child">Test Content</span>
      </TiltCard>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-tilt-card class', () => {
    const { container } = render(() => <TiltCard>Content</TiltCard>);
    expect(container.querySelector('.sk-tilt-card')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <TiltCard class="my-card">Content</TiltCard>);
    expect(container.querySelector('.sk-tilt-card')).toHaveClass('my-card');
  });

  it('applies inline style', () => {
    const { container } = render(() => (
      <TiltCard style={{ 'max-width': '300px' }}>Content</TiltCard>
    ));
    const el = container.querySelector('.sk-tilt-card') as HTMLElement;
    expect(el.style.maxWidth).toBe('300px');
  });

  it('sets perspective CSS variable', () => {
    const { container } = render(() => <TiltCard perspective={800}>Content</TiltCard>);
    const el = container.querySelector('.sk-tilt-card') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-tilt-perspective')).toBe('800px');
  });

  it('renders glare overlay when glare=true', () => {
    const { container } = render(() => <TiltCard glare>Content</TiltCard>);
    expect(container.querySelector('.sk-tilt-card__glare')).toBeInTheDocument();
  });

  it('does not render glare overlay when glare=false', () => {
    const { container } = render(() => <TiltCard glare={false}>Content</TiltCard>);
    expect(container.querySelector('.sk-tilt-card__glare')).not.toBeInTheDocument();
  });

  it('resets tilt CSS vars on mouse leave', () => {
    const { container } = render(() => <TiltCard>Content</TiltCard>);
    const el = container.querySelector('.sk-tilt-card') as HTMLElement;
    fireEvent.mouseLeave(el);
    expect(el.style.getPropertyValue('--sk-tilt-x')).toBe('0deg');
    expect(el.style.getPropertyValue('--sk-tilt-y')).toBe('0deg');
    expect(el.style.getPropertyValue('--sk-tilt-scale')).toBe('1');
  });
});
