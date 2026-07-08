import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { CursorSpotlight } from './CursorSpotlight';

describe('CursorSpotlight', () => {
  it('renders children without errors', () => {
    const { container } = render(() => (
      <CursorSpotlight>
        <span data-testid="child">Content</span>
      </CursorSpotlight>
    ));
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies sk-cursor-spotlight class', () => {
    const { container } = render(() => <CursorSpotlight>Content</CursorSpotlight>);
    expect(container.querySelector('.sk-cursor-spotlight')).toBeInTheDocument();
  });

  it('renders spotlight overlay element', () => {
    const { container } = render(() => <CursorSpotlight>Content</CursorSpotlight>);
    expect(container.querySelector('.sk-cursor-spotlight__overlay')).toBeInTheDocument();
  });

  it('sets size CSS variable', () => {
    const { container } = render(() => <CursorSpotlight size={300}>Content</CursorSpotlight>);
    const el = container.querySelector('.sk-cursor-spotlight') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-spotlight-size')).toBe('300px');
  });

  it('sets color CSS variable', () => {
    const { container } = render(() => <CursorSpotlight color="hotpink">Content</CursorSpotlight>);
    const el = container.querySelector('.sk-cursor-spotlight') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-spotlight-color')).toBe('hotpink');
  });

  it('sets blend CSS variable', () => {
    const { container } = render(() => <CursorSpotlight blend="overlay">Content</CursorSpotlight>);
    const el = container.querySelector('.sk-cursor-spotlight') as HTMLElement;
    expect(el.style.getPropertyValue('--sk-spotlight-blend')).toBe('overlay');
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <CursorSpotlight class="my-spotlight">Content</CursorSpotlight>
    ));
    expect(container.querySelector('.sk-cursor-spotlight')).toHaveClass('my-spotlight');
  });

  it('overlay is hidden before mouse enters', () => {
    const { container } = render(() => <CursorSpotlight>Content</CursorSpotlight>);
    const overlay = container.querySelector('.sk-cursor-spotlight__overlay') as HTMLElement;
    expect(overlay.style.opacity).toBe('0');
  });

  it('overlay becomes visible on mouse move', () => {
    const { container } = render(() => <CursorSpotlight opacity={0.2}>Content</CursorSpotlight>);
    const el = container.querySelector('.sk-cursor-spotlight') as HTMLElement;
    const overlay = container.querySelector('.sk-cursor-spotlight__overlay') as HTMLElement;

    fireEvent.mouseMove(el, { clientX: 100, clientY: 100 });
    expect(overlay.style.opacity).not.toBe('0');
  });

  it('overlay hides on mouse leave', () => {
    const { container } = render(() => <CursorSpotlight opacity={0.2}>Content</CursorSpotlight>);
    const el = container.querySelector('.sk-cursor-spotlight') as HTMLElement;
    const overlay = container.querySelector('.sk-cursor-spotlight__overlay') as HTMLElement;

    fireEvent.mouseMove(el, { clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(el);
    expect(overlay.style.opacity).toBe('0');
  });
});
