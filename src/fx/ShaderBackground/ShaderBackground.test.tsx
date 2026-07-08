import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { ShaderBackground } from './ShaderBackground';

describe('ShaderBackground', () => {
  it('renders without errors', () => {
    const { container } = render(() => <ShaderBackground />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with sk-shader-bg class', () => {
    const { container } = render(() => <ShaderBackground />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-shader-bg')).toBe(true);
  });

  it('renders a canvas element', () => {
    const { container } = render(() => <ShaderBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('renders children in content overlay', () => {
    const { getByText } = render(() => (
      <ShaderBackground>
        <span>Hello Shader</span>
      </ShaderBackground>
    ));
    expect(getByText('Hello Shader')).toBeTruthy();
  });

  it('applies custom class', () => {
    const { container } = render(() => <ShaderBackground class="my-custom" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-custom')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => <ShaderBackground style={{ height: '400px' }} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('400px');
  });

  it('renders all presets without errors', () => {
    const presets = ['noise', 'gradient', 'waves', 'aurora'] as const;
    for (const preset of presets) {
      const { container, unmount } = render(() => <ShaderBackground preset={preset} />);
      expect(container.firstChild).toBeTruthy();
      unmount();
    }
  });
});
