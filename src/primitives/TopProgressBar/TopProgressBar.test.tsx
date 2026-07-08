import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal } from 'solid-js';
import { TopProgressBar } from './TopProgressBar';

const getBar = () => document.querySelector('[data-sk-top-progress]') as HTMLElement | null;
const getFill = () => document.querySelector('[data-sk-top-progress-fill]') as HTMLElement | null;

describe('TopProgressBar', () => {
  afterEach(() => {
    // Remove injected keyframes between tests to avoid cross-test leakage.
    document.getElementById('sk-top-progress-keyframes')?.remove();
  });

  it('does not render when inactive initially', () => {
    render(() => <TopProgressBar active={false} />);
    expect(getBar()).toBeNull();
  });

  it('renders when active with indeterminate mode by default', () => {
    render(() => <TopProgressBar active={true} />);
    const bar = getBar();
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute('data-mode')).toBe('indeterminate');
  });

  it('applies indeterminate shimmer animation to fill', () => {
    render(() => <TopProgressBar active={true} />);
    const fill = getFill();
    expect(fill).not.toBeNull();
    expect(fill!.style.animation).toContain('sk-top-progress-shimmer');
    expect(fill!.style.width).toBe('30%');
  });

  it('renders determinate fill width when progress provided', () => {
    render(() => <TopProgressBar active={true} progress={0.5} />);
    const bar = getBar();
    expect(bar!.getAttribute('data-mode')).toBe('determinate');
    const fill = getFill();
    expect(fill!.style.width).toBe('50%');
  });

  it('clamps progress above 1', () => {
    render(() => <TopProgressBar active={true} progress={5} />);
    expect(getFill()!.style.width).toBe('100%');
  });

  it('clamps progress below 0', () => {
    render(() => <TopProgressBar active={true} progress={-2} />);
    expect(getFill()!.style.width).toBe('0%');
  });

  it('sets aria attributes for determinate progress', () => {
    render(() => <TopProgressBar active={true} progress={0.42} />);
    const bar = getBar()!;
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('1');
    expect(bar.getAttribute('aria-valuenow')).toBe('0.42');
  });

  it('omits numeric aria-valuenow in indeterminate mode', () => {
    render(() => <TopProgressBar active={true} />);
    const bar = getBar()!;
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
  });

  it('applies custom color to fill', () => {
    render(() => <TopProgressBar active={true} color="tomato" />);
    expect(getFill()!.style.background).toBe('tomato');
  });

  it('applies custom height to container', () => {
    render(() => <TopProgressBar active={true} height={4} />);
    expect(getBar()!.style.height).toBe('4px');
  });

  it('defaults to 2px height', () => {
    render(() => <TopProgressBar active={true} />);
    expect(getBar()!.style.height).toBe('2px');
  });

  it('merges custom style into container', () => {
    render(() => <TopProgressBar active={true} style={{ 'z-index': '123' }} />);
    expect(getBar()!.style.zIndex).toBe('123');
  });

  it('injects shimmer keyframes stylesheet once', () => {
    render(() => <TopProgressBar active={true} />);
    const styleEls = document.querySelectorAll('#sk-top-progress-keyframes');
    expect(styleEls.length).toBe(1);
  });

  it('unmounts after fade-out window when active becomes false', async () => {
    const [active, setActive] = createSignal(true);
    render(() => <TopProgressBar active={active()} />);
    expect(getBar()).not.toBeNull();
    setActive(false);
    // Allow effect + 200ms fade-out timeout to flush.
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    expect(getBar()).toBeNull();
  });

  describe('reduced motion', () => {
    const originalMatchMedia = window.matchMedia;
    beforeEach(() => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
    });
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('skips shimmer animation and shows steady 80% opacity bar', () => {
      render(() => <TopProgressBar active={true} />);
      const fill = getFill()!;
      expect(fill.style.animation).toBe('');
      expect(fill.style.width).toBe('100%');
      expect(fill.style.opacity).toBe('0.8');
    });

    it('skips container opacity transition', () => {
      render(() => <TopProgressBar active={true} />);
      expect(getBar()!.style.transition).toBe('none');
    });

    it('skips determinate width transition', () => {
      render(() => <TopProgressBar active={true} progress={0.3} />);
      expect(getFill()!.style.transition).toBe('none');
    });
  });
});
