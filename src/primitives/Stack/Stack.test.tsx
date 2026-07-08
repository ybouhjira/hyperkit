import { For } from 'solid-js';
import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders with column direction by default', () => {
    const { container } = render(() => <Stack>Content</Stack>);
    const element = container.querySelector('div');
    expect(element?.style.flexDirection).toBe('column');
  });

  it('applies md gap by default', () => {
    const { container } = render(() => <Stack>Content</Stack>);
    const element = container.querySelector('div');
    expect(element?.style.gap).toContain('var(--sk-space-md)');
  });

  it('renders horizontal when direction is horizontal', () => {
    const { container } = render(() => <Stack direction="horizontal">Content</Stack>);
    const element = container.querySelector('div');
    expect(element?.style.flexDirection).toBe('row');
  });

  it('renders vertical when direction is vertical', () => {
    const { container } = render(() => <Stack direction="vertical">Content</Stack>);
    const element = container.querySelector('div');
    expect(element?.style.flexDirection).toBe('column');
  });

  it('applies custom gap', () => {
    const { container } = render(() => <Stack gap="xl">Content</Stack>);
    const element = container.querySelector('div');
    expect(element?.style.gap).toContain('var(--sk-space-xl)');
  });

  it('inherits Flex props', () => {
    const { container } = render(() => (
      <Stack align="center" justify="between">
        Content
      </Stack>
    ));
    const element = container.querySelector('div');
    expect(element?.style.alignItems).toBe('center');
    expect(element?.style.justifyContent).toBe('space-between');
  });

  it('inherits Box props', () => {
    const { container } = render(() => (
      <Stack p="lg" bg="secondary" borderRadius="lg">
        Content
      </Stack>
    ));
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-lg)');
    expect(element?.style.background).toContain('var(--sk-bg-secondary)');
    expect(element?.style.borderRadius).toContain('var(--sk-radius-lg)');
  });

  describe('native HTML attribute forwarding', () => {
    it('forwards title', () => {
      const { container } = render(() => <Stack title="stack-tip">Content</Stack>);
      expect(container.querySelector('div')?.getAttribute('title')).toBe('stack-tip');
    });

    it('forwards onMouseEnter', () => {
      const handler = vi.fn();
      const { container } = render(() => <Stack onMouseEnter={handler}>Content</Stack>);
      container.querySelector('div')?.dispatchEvent(new MouseEvent('mouseenter'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('forwards onMouseLeave', () => {
      const handler = vi.fn();
      const { container } = render(() => <Stack onMouseLeave={handler}>Content</Stack>);
      container.querySelector('div')?.dispatchEvent(new MouseEvent('mouseleave'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('forwards data-* attributes', () => {
      const { container } = render(() => <Stack data-testid="stack-root">Content</Stack>);
      expect(container.querySelector('[data-testid="stack-root"]')).toBeInTheDocument();
    });
  });

  describe('wrap prop', () => {
    it('does not set flex-wrap by default', () => {
      const { container } = render(() => <Stack>Content</Stack>);
      const element = container.querySelector('div');
      expect(element?.style.flexWrap).toBe('');
    });

    it('sets flex-wrap: wrap when wrap is true', () => {
      const { container } = render(() => (
        <Stack wrap direction="horizontal">
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Stack>
      ));
      const element = container.querySelector('div');
      expect(element?.style.flexWrap).toBe('wrap');
    });

    it('wrapped horizontal stack with many children renders all', () => {
      const items = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
      const { container } = render(() => (
        <Stack wrap direction="horizontal" gap="xs">
          <For each={items}>{(t) => <span>{t}</span>}</For>
        </Stack>
      ));
      const element = container.querySelector('div');
      expect(element?.style.flexWrap).toBe('wrap');
      expect(element?.children.length).toBe(20);
    });
  });
});
