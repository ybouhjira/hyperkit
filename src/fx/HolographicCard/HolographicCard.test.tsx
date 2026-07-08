import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { HolographicCard } from './HolographicCard';

describe('HolographicCard', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <HolographicCard>
        <span data-testid="child">Holo Content</span>
      </HolographicCard>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-holographic-card class', () => {
    const { container } = render(() => <HolographicCard>Content</HolographicCard>);
    expect(container.querySelector('.sk-holographic-card')).toBeInTheDocument();
  });

  it('applies animated class by default', () => {
    const { container } = render(() => <HolographicCard>Content</HolographicCard>);
    expect(container.querySelector('.sk-holographic-card')).toHaveClass(
      'sk-holographic-card--animated'
    );
  });

  it('does not apply animated class when animated=false', () => {
    const { container } = render(() => <HolographicCard animated={false}>Content</HolographicCard>);
    expect(container.querySelector('.sk-holographic-card')).not.toHaveClass(
      'sk-holographic-card--animated'
    );
  });

  it('applies hovered class on mouse enter and removes on leave', () => {
    const { container } = render(() => <HolographicCard>Content</HolographicCard>);
    const card = container.querySelector('.sk-holographic-card') as HTMLElement;

    fireEvent.mouseMove(card, { clientX: 50, clientY: 50 });
    expect(card).toHaveClass('sk-holographic-card--hovered');

    fireEvent.mouseLeave(card);
    expect(card).not.toHaveClass('sk-holographic-card--hovered');
  });

  it('renders shimmer overlay', () => {
    const { container } = render(() => <HolographicCard>Content</HolographicCard>);
    expect(container.querySelector('.sk-holographic-card__shimmer')).toBeInTheDocument();
  });

  it('sets intensity CSS variable', () => {
    const { container } = render(() => <HolographicCard intensity={0.8}>Content</HolographicCard>);
    const el = container.querySelector('.sk-holographic-card') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-holo-intensity')).toBe('0.8');
  });

  it('sets angle CSS variable', () => {
    const { container } = render(() => <HolographicCard angle={90}>Content</HolographicCard>);
    const el = container.querySelector('.sk-holographic-card') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-holo-angle')).toBe('90deg');
  });

  it('applies custom class', () => {
    const { container } = render(() => <HolographicCard class="my-holo">Content</HolographicCard>);
    expect(container.querySelector('.sk-holographic-card')).toHaveClass('my-holo');
  });
});
