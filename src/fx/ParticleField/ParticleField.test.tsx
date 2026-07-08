import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { ParticleField } from './ParticleField';

// Override the synchronous RAF mock from test-setup.ts.
// ParticleField uses an infinite rAF loop — the global synchronous mock
// would cause a stack overflow. Replace it with a no-op for these tests.
beforeEach(() => {
  let rafId = 0;
  globalThis.requestAnimationFrame = vi.fn(() => ++rafId);
  globalThis.cancelAnimationFrame = vi.fn();
  // Stub getContext so ParticleField doesn't throw on headless canvas
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
  });
});

describe('ParticleField', () => {
  it('renders without errors', () => {
    const { container } = render(() => <ParticleField />);
    expect(container.querySelector('.sk-particle-field')).toBeInTheDocument();
  });

  it('renders a canvas element', () => {
    const { container } = render(() => <ParticleField />);
    expect(container.querySelector('canvas.sk-particle-field__canvas')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <ParticleField class="my-field" />);
    expect(container.querySelector('.sk-particle-field')).toHaveClass('my-field');
  });

  it('applies inline style', () => {
    const { container } = render(() => <ParticleField style={{ height: '500px' }} />);
    const el = container.querySelector('.sk-particle-field') as HTMLElement;
    expect(el.style.height).toBe('500px');
  });

  it('canvas is present when interactive=true', () => {
    const { container } = render(() => <ParticleField interactive={true} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('canvas is present when interactive=false', () => {
    const { container } = render(() => <ParticleField interactive={false} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('starts requestAnimationFrame on mount', () => {
    render(() => <ParticleField />);
    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
  });
});
