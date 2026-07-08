import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { MorphingBlob } from './MorphingBlob';

describe('MorphingBlob', () => {
  it('renders without errors', () => {
    const { container } = render(() => <MorphingBlob />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with sk-morphing-blob class', () => {
    const { container } = render(() => <MorphingBlob />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-morphing-blob')).toBe(true);
  });

  it('renders an SVG element', () => {
    const { container } = render(() => <MorphingBlob />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders a path element inside SVG', () => {
    const { container } = render(() => <MorphingBlob />);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
  });

  it('applies size as width and height on container', () => {
    const { container } = render(() => <MorphingBlob size={300} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('300px');
    expect(el.style.height).toBe('300px');
  });

  it('applies custom class', () => {
    const { container } = render(() => <MorphingBlob class="my-blob" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-blob')).toBe(true);
  });

  it('applies color to path fill', () => {
    const { container } = render(() => <MorphingBlob color="#ff0000" />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('#ff0000');
  });

  it('applies opacity to path', () => {
    const { container } = render(() => <MorphingBlob opacity={0.3} />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('opacity')).toBe('0.3');
  });
});
