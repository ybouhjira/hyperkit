import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  describe('Rendering', () => {
    it('renders children in a span by default', () => {
      const { container } = render(() => <Text>Test Content</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Test Content');
    });

    it('renders as specified element via as prop', () => {
      const { container } = render(() => <Text as="h1">Heading</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.tagName).toBe('H1');
      expect(el.textContent).toBe('Heading');
    });

    it('renders as p when as="p"', () => {
      const { container } = render(() => <Text as="p">Paragraph</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.tagName).toBe('P');
      expect(el.textContent).toBe('Paragraph');
    });
  });

  describe('Styling', () => {
    it('applies font-size from size prop', () => {
      const { container } = render(() => <Text size="lg">Large Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.fontSize).toBeTruthy();
    });

    it('applies font-weight from weight prop', () => {
      const { container } = render(() => <Text weight="bold">Bold Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.fontWeight).toBeTruthy();
    });

    it('applies numeric weight', () => {
      const { container } = render(() => <Text weight={600}>Semi Bold</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.fontWeight).toBe('600');
    });

    it('applies color from color prop', () => {
      const { container } = render(() => <Text color="primary">Colored</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.color).toBeTruthy();
    });

    it('applies text-align from align prop', () => {
      const { container } = render(() => <Text align="center">Centered</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--align-center')).toBe(true);
    });

    it('applies truncation styles', () => {
      const { container } = render(() => <Text truncate>Long text that should truncate</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--truncate')).toBe(true);
    });

    it('applies line-clamp styles', () => {
      const { container } = render(() => <Text lineClamp={2}>Multi line text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--clamp')).toBe(true);
      expect(el.style.getPropertyValue('--sk-text-line-clamp')).toBe('2');
    });

    it('applies gradient text', () => {
      const gradient = 'linear-gradient(to right, red, blue)';
      const { container } = render(() => <Text gradient={gradient}>Gradient</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--gradient')).toBe(true);
      expect(el.style.getPropertyValue('--sk-text-gradient')).toBe(gradient);
    });

    it('applies margin-bottom from mb prop', () => {
      const { container } = render(() => <Text mb="md">Text with margin</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.marginBottom).toBeTruthy();
    });

    it('applies margin-top from mt prop', () => {
      const { container } = render(() => <Text mt="lg">Text with margin</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.marginTop).toBeTruthy();
    });

    it('applies letter-spacing', () => {
      const { container } = render(() => <Text letterSpacing="2px">Spaced</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.letterSpacing).toBe('2px');
    });

    it('applies line-height as number', () => {
      const { container } = render(() => <Text lineHeight={1.5}>Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.lineHeight).toBe('1.5');
    });

    it('applies line-height as string', () => {
      const { container } = render(() => <Text lineHeight="2em">Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.lineHeight).toBe('2em');
    });

    it('applies max-width as number', () => {
      const { container } = render(() => <Text maxW={300}>Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('300px');
    });

    it('applies max-width as string', () => {
      const { container } = render(() => <Text maxW="50%">Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('50%');
    });

    it('applies white-space', () => {
      const { container } = render(() => <Text whiteSpace="pre-wrap">Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--ws-pre-wrap')).toBe(true);
    });

    it('applies font-style: italic when italic prop is true', () => {
      const { container } = render(() => <Text italic>Italic Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--italic')).toBe(true);
    });

    it('does not apply italic by default', () => {
      const { container } = render(() => <Text>Normal Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('sk-text--italic')).toBe(false);
    });

    it('applies error color', () => {
      const { container } = render(() => <Text color="error">Error</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.color).toContain('--sk-error');
    });

    it('applies success color', () => {
      const { container } = render(() => <Text color="success">Success</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.color).toContain('--sk-success');
    });

    it('applies warning color', () => {
      const { container } = render(() => <Text color="warning">Warning</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.color).toContain('--sk-warning');
    });

    it('applies info color', () => {
      const { container } = render(() => <Text color="info">Info</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.color).toContain('--sk-info');
    });
  });

  describe('Props', () => {
    it('passes custom class', () => {
      const { container } = render(() => <Text class="custom-text">Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('custom-text')).toBe(true);
    });

    it('merges custom style with computed style', () => {
      const { container } = render(() => (
        <Text size="lg" style={{ color: 'red' }}>
          Text
        </Text>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.fontSize).toBeTruthy(); // from size="lg"
      expect(el.style.color).toBe('red'); // from custom style
    });

    it('forwards onClick handler', () => {
      const handleClick = vi.fn();
      const { container } = render(() => <Text onClick={handleClick}>Click me</Text>);
      const el = container.firstChild as HTMLElement;

      el.click();
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('forwards title attribute', () => {
      const { container } = render(() => <Text title="Tooltip">Text</Text>);
      const el = container.firstChild as HTMLElement;

      expect(el.title).toBe('Tooltip');
    });
  });

  describe('font', () => {
    it('applies monospace font via font="mono"', () => {
      const { container } = render(() => <Text font="mono">12:34:56</Text>);
      const el = container.firstChild as HTMLElement;
      expect(el.classList.contains('sk-text--font-mono')).toBe(true);
    });

    it('applies UI font via font="body"', () => {
      const { container } = render(() => <Text font="body">hello</Text>);
      const el = container.firstChild as HTMLElement;
      expect(el.classList.contains('sk-text--font-body')).toBe(true);
    });

    it('does not set font-family by default', () => {
      const { container } = render(() => <Text>hello</Text>);
      const el = container.firstChild as HTMLElement;
      expect(el.style.fontFamily).toBe('');
      expect(el.classList.contains('sk-text--font-mono')).toBe(false);
      expect(el.classList.contains('sk-text--font-body')).toBe(false);
    });
  });

  describe('root class', () => {
    it('applies the sk-text class on the root element', () => {
      const { container } = render(() => <Text>hello</Text>);
      const el = container.firstChild as HTMLElement;
      expect(el.classList.contains('sk-text')).toBe(true);
    });
  });
});
