import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders children correctly', () => {
    const { container } = render(() => (
      <ScrollArea>
        <div data-testid="child">Test content</div>
      </ScrollArea>
    ));

    const child = container.querySelector('[data-testid="child"]');
    expect(child).toBeInTheDocument();
    expect(child?.textContent).toBe('Test content');
  });

  it('applies base CSS class', () => {
    const { container } = render(() => (
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area');
    expect(scrollArea).toBeInTheDocument();
  });

  it('applies custom class name', () => {
    const { container } = render(() => (
      <ScrollArea class="custom-scroll">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area');
    expect(scrollArea).toHaveClass('sk-scroll-area');
    expect(scrollArea).toHaveClass('custom-scroll');
  });

  it('applies max-height style with number value', () => {
    const { container } = render(() => (
      <ScrollArea maxHeight={300}>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.maxHeight).toBe('300px');
  });

  it('applies max-height style with string value', () => {
    const { container } = render(() => (
      <ScrollArea maxHeight="50vh">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.maxHeight).toBe('50vh');
  });

  it('does not apply max-height when undefined', () => {
    const { container } = render(() => (
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.maxHeight).toBe('');
  });

  it('renders multiple children', () => {
    const { container } = render(() => (
      <ScrollArea>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
        <div data-testid="child-3">Third</div>
      </ScrollArea>
    ));

    expect(container.querySelector('[data-testid="child-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-2"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-3"]')).toBeInTheDocument();
  });

  it('forwards other props to wrapper div', () => {
    const { container } = render(() => (
      <ScrollArea data-custom="test-value">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area');
    expect(scrollArea).toHaveAttribute('data-custom', 'test-value');
  });

  it('renders with string max-height in rem', () => {
    const { container } = render(() => (
      <ScrollArea maxHeight="20rem">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.maxHeight).toBe('20rem');
  });

  it('forwards style prop to outer container', () => {
    const { container } = render(() => (
      <ScrollArea style={{ 'flex-grow': 1, 'min-height': 0 }}>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.flexGrow).toBe('1');
    expect(scrollArea.style.minHeight).toBe('0px');
  });

  it('merges style with maxHeight (maxHeight wins over style)', () => {
    const { container } = render(() => (
      <ScrollArea style={{ 'flex-grow': 1 }} maxHeight={200}>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.flexGrow).toBe('1');
    expect(scrollArea.style.maxHeight).toBe('200px');
  });

  it('forwards classList', () => {
    const { container } = render(() => (
      <ScrollArea classList={{ 'is-active': true, 'is-hidden': false }}>
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area');
    expect(scrollArea).toHaveClass('is-active');
    expect(scrollArea).not.toHaveClass('is-hidden');
  });

  it('forwards native HTML attributes like title and aria-label', () => {
    const { container } = render(() => (
      <ScrollArea title="Scroll list" aria-label="Items">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area');
    expect(scrollArea).toHaveAttribute('title', 'Scroll list');
    expect(scrollArea).toHaveAttribute('aria-label', 'Items');
  });

  it('renders with percentage max-height', () => {
    const { container } = render(() => (
      <ScrollArea maxHeight="80%">
        <div>Content</div>
      </ScrollArea>
    ));

    const scrollArea = container.querySelector('.sk-scroll-area') as HTMLElement;
    expect(scrollArea.style.maxHeight).toBe('80%');
  });
});
