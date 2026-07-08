import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Container } from './Container';

describe('Container', () => {
  describe('Rendering', () => {
    it('renders children in a div', () => {
      const { container } = render(() => <Container>Container Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.tagName).toBe('DIV');
      expect(el.textContent).toBe('Container Content');
    });

    it('renders multiple children', () => {
      const { container } = render(() => (
        <Container>
          <div>Section 1</div>
          <div>Section 2</div>
        </Container>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.children).toHaveLength(2);
      expect(el.textContent).toContain('Section 1');
      expect(el.textContent).toContain('Section 2');
    });
  });

  describe('Max Width', () => {
    it('applies default max-width of 1200px', () => {
      const { container } = render(() => <Container>Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('1200px');
    });

    it('applies max-width from preset sm', () => {
      const { container } = render(() => <Container maxW="sm">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('640px');
    });

    it('applies max-width from preset md', () => {
      const { container } = render(() => <Container maxW="md">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('768px');
    });

    it('applies max-width from preset lg', () => {
      const { container } = render(() => <Container maxW="lg">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('1024px');
    });

    it('applies max-width from preset xl', () => {
      const { container } = render(() => <Container maxW="xl">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('1200px');
    });

    it('applies max-width from preset 2xl', () => {
      const { container } = render(() => <Container maxW="2xl">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('1400px');
    });

    it('applies custom max-width string', () => {
      const { container } = render(() => <Container maxW="900px">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('900px');
    });
  });

  describe('Centering', () => {
    it('centers by default with auto margins', () => {
      const { container } = render(() => <Container>Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.marginLeft).toBe('auto');
      expect(el.style.marginRight).toBe('auto');
    });

    it('removes auto margins when center={false}', () => {
      const { container } = render(() => <Container center={false}>Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.marginLeft).toBe('');
      expect(el.style.marginRight).toBe('');
    });
  });

  describe('Padding', () => {
    it('applies default horizontal padding', () => {
      const { container } = render(() => <Container>Content</Container>);
      const el = container.firstChild as HTMLElement;

      // Default is 'lg' token
      expect(el.style.paddingLeft).toBeTruthy();
      expect(el.style.paddingRight).toBeTruthy();
      expect(el.style.paddingLeft).toBe(el.style.paddingRight);
    });

    it('applies custom horizontal padding', () => {
      const { container } = render(() => <Container px="xl">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.paddingLeft).toBeTruthy();
      expect(el.style.paddingRight).toBeTruthy();
      expect(el.style.paddingLeft).toBe(el.style.paddingRight);
    });

    it('applies vertical padding', () => {
      const { container } = render(() => <Container py="md">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.paddingTop).toBeTruthy();
      expect(el.style.paddingBottom).toBeTruthy();
      expect(el.style.paddingTop).toBe(el.style.paddingBottom);
    });

    it('applies both horizontal and vertical padding', () => {
      const { container } = render(() => (
        <Container px="sm" py="lg">
          Content
        </Container>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.paddingLeft).toBeTruthy();
      expect(el.style.paddingRight).toBeTruthy();
      expect(el.style.paddingTop).toBeTruthy();
      expect(el.style.paddingBottom).toBeTruthy();
    });
  });

  describe('Width', () => {
    it('applies width 100%', () => {
      const { container } = render(() => <Container>Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.width).toBe('100%');
    });
  });

  describe('Props', () => {
    it('passes custom class', () => {
      const { container } = render(() => <Container class="custom-container">Content</Container>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('custom-container')).toBe(true);
    });

    it('passes custom style', () => {
      const { container } = render(() => (
        <Container style={{ background: 'gray' }}>Content</Container>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.background).toBe('gray');
    });

    it('merges computed style with custom style', () => {
      const { container } = render(() => (
        <Container maxW="md" style={{ border: '1px solid black' }}>
          Content
        </Container>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('768px');
      expect(el.style.border).toBe('1px solid black');
    });
  });

  describe('Combined Props', () => {
    it('applies all props together', () => {
      const { container } = render(() => (
        <Container maxW="lg" px="md" py="sm" center={true} class="page-container">
          Content
        </Container>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.maxWidth).toBe('1024px');
      expect(el.style.paddingLeft).toBeTruthy();
      expect(el.style.paddingTop).toBeTruthy();
      expect(el.style.marginLeft).toBe('auto');
      expect(el.style.marginRight).toBe('auto');
      expect(el.style.width).toBe('100%');
      expect(el.classList.contains('page-container')).toBe(true);
    });
  });
});
