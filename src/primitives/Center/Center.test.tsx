import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Center } from './Center';

describe('Center', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      const { container } = render(() => <Center>Centered Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.textContent).toBe('Centered Content');
    });

    it('renders multiple children', () => {
      const { container } = render(() => (
        <Center>
          <div>Child 1</div>
          <div>Child 2</div>
        </Center>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.children).toHaveLength(2);
      expect(el.textContent).toContain('Child 1');
      expect(el.textContent).toContain('Child 2');
    });
  });

  describe('Centering', () => {
    it('centers content with flexbox', () => {
      const { container } = render(() => <Center>Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.display).toBe('flex');
      expect(el.style.alignItems).toBe('center');
      expect(el.style.justifyContent).toBe('center');
    });
  });

  describe('Props', () => {
    it('passes custom class', () => {
      const { container } = render(() => <Center class="custom-center">Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('custom-center')).toBe(true);
    });

    it('passes custom style', () => {
      const { container } = render(() => <Center style={{ background: 'blue' }}>Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.background).toBe('blue');
    });

    it('merges centering style with custom style', () => {
      const { container } = render(() => <Center style={{ padding: '20px' }}>Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.display).toBe('flex');
      expect(el.style.alignItems).toBe('center');
      expect(el.style.justifyContent).toBe('center');
      expect(el.style.padding).toBe('20px');
    });
  });

  describe('Flex Props Inheritance', () => {
    it('inherits Flex props like direction', () => {
      const { container } = render(() => <Center direction="column">Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.flexDirection).toBe('column');
    });

    it('inherits Flex props like gap', () => {
      const { container } = render(() => <Center gap="md">Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gap).toBeTruthy();
    });

    it('can override align and justify', () => {
      const { container } = render(() => (
        <Center align="flex-start" justify="space-between">
          Content
        </Center>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.alignItems).toBe('flex-start');
      expect(el.style.justifyContent).toBe('space-between');
    });
  });

  describe('Box Props Inheritance', () => {
    it('inherits Box props like width', () => {
      const { container } = render(() => <Center w="100%">Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.width).toBe('100%');
    });

    it('inherits Box props like height', () => {
      const { container } = render(() => <Center h="200px">Content</Center>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.height).toBe('200px');
    });
  });
});
