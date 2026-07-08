import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Flex } from './Flex';

describe('Flex', () => {
  it('renders with display flex by default', () => {
    const { container } = render(() => <Flex>Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.display).toBe('flex');
  });

  it('renders with display inline-flex when inline is true', () => {
    const { container } = render(() => <Flex inline>Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.display).toBe('inline-flex');
  });

  it('applies flex direction', () => {
    const { container } = render(() => <Flex direction="column">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.flexDirection).toBe('column');
  });

  it('applies align-items', () => {
    const { container } = render(() => <Flex align="center">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.alignItems).toBe('center');
  });

  it('maps align start/end to flex-start/flex-end', () => {
    const { container } = render(() => <Flex align="start">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.alignItems).toBe('flex-start');
  });

  it('applies justify-content', () => {
    const { container } = render(() => <Flex justify="center">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.justifyContent).toBe('center');
  });

  it('maps justify between to space-between', () => {
    const { container } = render(() => <Flex justify="between">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.justifyContent).toBe('space-between');
  });

  it('applies gap', () => {
    const { container } = render(() => <Flex gap="md">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.gap).toContain('var(--sk-space-md)');
  });

  it('applies wrap', () => {
    const { container } = render(() => <Flex wrap="wrap">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.style.flexWrap).toBe('wrap');
  });

  it('forwards native title attribute', () => {
    const { container } = render(() => <Flex title="tooltip text">Content</Flex>);
    const element = container.querySelector('div');
    expect(element?.getAttribute('title')).toBe('tooltip text');
  });

  it('forwards onMouseEnter handler', () => {
    const handler = vi.fn();
    const { container } = render(() => <Flex onMouseEnter={handler}>Content</Flex>);
    container.querySelector('div')?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('forwards onMouseLeave handler', () => {
    const handler = vi.fn();
    const { container } = render(() => <Flex onMouseLeave={handler}>Content</Flex>);
    container.querySelector('div')?.dispatchEvent(new MouseEvent('mouseleave'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('forwards data-* attributes', () => {
    const { container } = render(() => <Flex data-testid="flex-root">Content</Flex>);
    expect(container.querySelector('[data-testid="flex-root"]')).toBeInTheDocument();
  });

  it('inherits Box props', () => {
    const { container } = render(() => (
      <Flex p="lg" bg="accent" borderRadius="md">
        Content
      </Flex>
    ));
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-lg)');
    expect(element?.style.background).toContain('var(--sk-accent)');
    expect(element?.style.borderRadius).toContain('var(--sk-radius-md)');
  });
});
