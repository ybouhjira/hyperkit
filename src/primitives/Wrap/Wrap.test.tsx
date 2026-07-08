import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Wrap } from './Wrap';

describe('Wrap', () => {
  it('renders with flex-wrap: wrap', () => {
    const { container } = render(() => <Wrap>Content</Wrap>);
    const element = container.querySelector('div');
    expect(element?.style.flexWrap).toBe('wrap');
  });

  it('renders with row direction', () => {
    const { container } = render(() => <Wrap>Content</Wrap>);
    const element = container.querySelector('div');
    expect(element?.style.flexDirection).toBe('row');
  });

  it('applies sm gap by default', () => {
    const { container } = render(() => <Wrap>Content</Wrap>);
    const element = container.querySelector('div');
    expect(element?.style.gap).toContain('var(--sk-space-sm)');
  });

  it('applies custom spacing', () => {
    const { container } = render(() => <Wrap spacing="lg">Content</Wrap>);
    const element = container.querySelector('div');
    expect(element?.style.gap).toContain('var(--sk-space-lg)');
  });

  it('inherits Flex alignment props', () => {
    const { container } = render(() => (
      <Wrap align="center" justify="between">
        Content
      </Wrap>
    ));
    const element = container.querySelector('div');
    expect(element?.style.alignItems).toBe('center');
    expect(element?.style.justifyContent).toBe('space-between');
  });

  it('inherits Box props', () => {
    const { container } = render(() => (
      <Wrap p="lg" bg="secondary" borderRadius="lg">
        Content
      </Wrap>
    ));
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-lg)');
    expect(element?.style.background).toContain('var(--sk-bg-secondary)');
    expect(element?.style.borderRadius).toContain('var(--sk-radius-lg)');
  });

  it('renders children', () => {
    const { container } = render(() => (
      <Wrap>
        <div>Child 1</div>
        <div>Child 2</div>
      </Wrap>
    ));
    expect(container.textContent).toContain('Child 1');
    expect(container.textContent).toContain('Child 2');
  });
});
