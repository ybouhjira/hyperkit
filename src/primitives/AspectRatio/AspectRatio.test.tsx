import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio', () => {
  it('renders without errors with default ratio', () => {
    const { container } = render(() => <AspectRatio>Content</AspectRatio>);
    const element = container.querySelector('div');
    expect(element).toBeTruthy();
    expect(element?.textContent).toBe('Content');
  });

  it('renders without errors with 16:9 ratio', () => {
    const { container } = render(() => <AspectRatio ratio={16 / 9}>Content</AspectRatio>);
    const element = container.querySelector('div');
    expect(element).toBeTruthy();
  });

  it('renders without errors with 4:3 ratio', () => {
    const { container } = render(() => <AspectRatio ratio={4 / 3}>Content</AspectRatio>);
    const element = container.querySelector('div');
    expect(element).toBeTruthy();
  });

  it('has overflow hidden by default', () => {
    const { container } = render(() => <AspectRatio>Content</AspectRatio>);
    const element = container.querySelector('div');
    expect(element?.style.overflow).toBe('hidden');
  });

  it('allows overflow to be overridden', () => {
    const { container } = render(() => (
      <AspectRatio style={{ overflow: 'visible' }}>Content</AspectRatio>
    ));
    const element = container.querySelector('div');
    expect(element?.style.overflow).toBe('visible');
  });

  it('renders children', () => {
    const { container } = render(() => (
      <AspectRatio>
        <span>Child</span>
      </AspectRatio>
    ));
    expect(container.textContent).toContain('Child');
  });

  it('inherits BoxProps', () => {
    const { container } = render(() => (
      <AspectRatio p="lg" bg="secondary" borderRadius="md">
        Content
      </AspectRatio>
    ));
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-lg)');
    expect(element?.style.background).toContain('var(--sk-bg-secondary)');
    expect(element?.style.borderRadius).toContain('var(--sk-radius-md)');
  });

  it('merges custom style with aspect-ratio', () => {
    const { container } = render(() => (
      <AspectRatio ratio={2} style={{ background: 'blue' }}>
        Content
      </AspectRatio>
    ));
    const element = container.querySelector('div');
    // aspect-ratio not supported in jsdom, but verify style merging works
    expect(element?.style.overflow).toBe('hidden');
    expect(element?.style.background).toBe('blue');
  });
});
