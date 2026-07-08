import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Box } from './Box';

describe('Box', () => {
  it('renders as div by default', () => {
    const { container } = render(() => <Box>Content</Box>);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders with custom element via as prop', () => {
    const { container } = render(() => <Box as="span">Content</Box>);
    expect(container.querySelector('span')).toBeTruthy();
  });

  it('applies padding correctly', () => {
    const { container } = render(() => <Box p="md">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-md)');
  });

  it('applies background color', () => {
    const { container } = render(() => <Box bg="accent">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.background).toContain('var(--sk-accent)');
  });

  it('applies accent-muted background via token', () => {
    const { container } = render(() => <Box bg="accent-muted">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.background).toContain('var(--sk-accent-muted)');
  });

  it('applies accent-subtle background via token', () => {
    const { container } = render(() => <Box bg="accent-subtle">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.background).toContain('var(--sk-accent-subtle)');
  });

  it('applies border when border prop is true', () => {
    const { container } = render(() => <Box border>Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.border).toContain('1px solid');
  });

  it('applies custom width and height', () => {
    const { container } = render(() => (
      <Box w={300} h={200}>
        Content
      </Box>
    ));
    const element = container.querySelector('div');
    expect(element?.style.width).toBe('300px');
    expect(element?.style.height).toBe('200px');
  });

  it('applies border radius', () => {
    const { container } = render(() => <Box borderRadius="lg">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.borderRadius).toContain('var(--sk-radius-lg)');
  });

  it('applies shadow', () => {
    const { container } = render(() => <Box shadow="md">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.boxShadow).toContain('var(--sk-shadow-md)');
  });

  it('applies position styles', () => {
    const { container } = render(() => (
      <Box position="absolute" top={10} left={20}>
        Content
      </Box>
    ));
    const element = container.querySelector('div');
    expect(element?.style.position).toBe('absolute');
    expect(element?.style.top).toBe('10px');
    expect(element?.style.left).toBe('20px');
  });

  it('applies cursor style', () => {
    const { container } = render(() => <Box cursor="pointer">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.cursor).toBe('pointer');
  });

  it('applies transition when transition prop is true', () => {
    const { container } = render(() => <Box transition>Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.transition).toContain('all');
  });

  it('forwards onClick handler', () => {
    let clicked = false;
    const { container } = render(() => <Box onClick={() => (clicked = true)}>Content</Box>);
    const element = container.querySelector('div') as HTMLDivElement;
    element.click();
    expect(clicked).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(() => <Box class="custom-class">Content</Box>);
    const element = container.querySelector('.custom-class');
    expect(element).toBeTruthy();
  });

  it('merges custom styles', () => {
    const { container } = render(() => (
      <Box style={{ 'font-weight': 'bold' }} p="md">
        Content
      </Box>
    ));
    const element = container.querySelector('div');
    expect(element?.style.fontWeight).toBe('bold');
    expect(element?.style.padding).toContain('var(--sk-space-md)');
  });

  it('applies overflow style', () => {
    const { container } = render(() => <Box overflow="hidden">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.overflow).toBe('hidden');
  });

  it('applies display style', () => {
    const { container } = render(() => <Box display="flex">Content</Box>);
    const element = container.querySelector('div');
    expect(element?.style.display).toBe('flex');
  });

  it('applies flex child properties', () => {
    const { container } = render(() => (
      <Box flex={1} alignSelf="center">
        Content
      </Box>
    ));
    const element = container.querySelector('div');
    expect(element?.style.flex).toContain('1');
    expect(element?.style.alignSelf).toBe('center');
  });

  describe('as="form"', () => {
    it('renders a real <form> element', () => {
      const { container } = render(() => (
        <Box as="form">
          <input name="x" />
        </Box>
      ));
      expect(container.querySelector('form')).toBeTruthy();
    });

    it('fires onSubmit when the form is submitted', () => {
      const handleSubmit = vi.fn((e: Event) => e.preventDefault());
      const { container } = render(() => (
        <Box as="form" onSubmit={handleSubmit}>
          <button type="submit">Go</button>
        </Box>
      ));

      const form = container.querySelector('form');
      expect(form).toBeTruthy();
      fireEvent.submit(form!);
      expect(handleSubmit).toHaveBeenCalledOnce();
    });

    it('fires onReset when the form is reset', () => {
      const handleReset = vi.fn();
      const { container } = render(() => (
        <Box as="form" onReset={handleReset}>
          <input name="x" />
        </Box>
      ));

      const form = container.querySelector('form');
      fireEvent.reset(form!);
      expect(handleReset).toHaveBeenCalledOnce();
    });

    it('supports onChange bubbling from form inputs', () => {
      const handleChange = vi.fn();
      const { container } = render(() => (
        <Box as="form" onChange={handleChange}>
          <input name="x" data-testid="input" />
        </Box>
      ));

      const input = container.querySelector('input')!;
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
