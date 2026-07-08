import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <GlassCard>
        <span data-testid="child">Glass Content</span>
      </GlassCard>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-glass-card class', () => {
    const { container } = render(() => <GlassCard>Content</GlassCard>);
    expect(container.querySelector('.sk-glass-card')).toBeInTheDocument();
  });

  it('applies border class by default', () => {
    const { container } = render(() => <GlassCard>Content</GlassCard>);
    expect(container.querySelector('.sk-glass-card')).toHaveClass('sk-glass-card--border');
  });

  it('does not apply border class when border=false', () => {
    const { container } = render(() => <GlassCard border={false}>Content</GlassCard>);
    expect(container.querySelector('.sk-glass-card')).not.toHaveClass('sk-glass-card--border');
  });

  it('applies custom class', () => {
    const { container } = render(() => <GlassCard class="my-glass">Content</GlassCard>);
    expect(container.querySelector('.sk-glass-card')).toHaveClass('my-glass');
  });

  it('sets blur CSS variable', () => {
    const { container } = render(() => <GlassCard blur={20}>Content</GlassCard>);
    const el = container.querySelector('.sk-glass-card') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-glass-blur')).toBe('20px');
  });

  it('sets opacity CSS variable', () => {
    const { container } = render(() => <GlassCard opacity={0.3}>Content</GlassCard>);
    const el = container.querySelector('.sk-glass-card') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-glass-opacity')).toBe('0.3');
  });

  it('applies inline style', () => {
    const { container } = render(() => (
      <GlassCard style={{ 'max-width': '400px' }}>Content</GlassCard>
    ));
    const el = container.querySelector('.sk-glass-card') as HTMLElement;
    expect(el.style.maxWidth).toBe('400px');
  });
});
