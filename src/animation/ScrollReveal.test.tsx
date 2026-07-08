import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { ScrollReveal } from './ScrollReveal';

// Mock IntersectionObserver
let observerCallback: IntersectionObserverCallback;
let observerOptions: IntersectionObserverInit | undefined;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  mockObserve.mockClear();
  mockUnobserve.mockClear();
  mockDisconnect.mockClear();

  class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
      observerCallback = cb;
      observerOptions = opts;
    }
    observe = mockObserve;
    unobserve = mockUnobserve;
    disconnect = mockDisconnect;
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

function triggerIntersection(isIntersecting: boolean, target?: Element) {
  const entry = {
    isIntersecting,
    target: target ?? document.createElement('div'),
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry;

  observerCallback([entry], {} as IntersectionObserver);
}

describe('ScrollReveal', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <ScrollReveal>
        <span>Hello World</span>
      </ScrollReveal>
    ));

    expect(getByText('Hello World')).toBeInTheDocument();
  });

  it('starts invisible (opacity 0)', () => {
    const { container } = render(() => (
      <ScrollReveal>
        <span>Content</span>
      </ScrollReveal>
    ));

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
  });

  it('creates IntersectionObserver on mount and observes the element', () => {
    render(() => <ScrollReveal>content</ScrollReveal>);

    expect(mockObserve).toHaveBeenCalledOnce();
  });

  it('becomes visible when intersecting', () => {
    const { container } = render(() => (
      <ScrollReveal>
        <span>Content</span>
      </ScrollReveal>
    ));

    const wrapper = container.firstElementChild as HTMLElement;
    triggerIntersection(true, wrapper);

    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transform).toBe('none');
  });

  it('uses default threshold of 0.1', () => {
    render(() => <ScrollReveal>content</ScrollReveal>);

    expect(observerOptions?.threshold).toBe(0.1);
  });

  it('respects custom threshold prop', () => {
    render(() => <ScrollReveal threshold={0.5}>content</ScrollReveal>);

    expect(observerOptions?.threshold).toBe(0.5);
  });

  it('applies delay to transition', () => {
    const { container } = render(() => <ScrollReveal delay={200}>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transition).toContain('200ms');
  });

  it('applies duration to transition', () => {
    const { container } = render(() => <ScrollReveal duration={1000}>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transition).toContain('1000ms');
  });

  it('uses default duration of 600ms', () => {
    const { container } = render(() => <ScrollReveal>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transition).toContain('600ms');
  });

  it('unobserves after intersection when once=true (default)', () => {
    const { container } = render(() => <ScrollReveal>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    triggerIntersection(true, wrapper);

    expect(mockUnobserve).toHaveBeenCalledOnce();
  });

  it('does not unobserve when once=false', () => {
    const { container } = render(() => <ScrollReveal once={false}>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    triggerIntersection(true, wrapper);

    expect(mockUnobserve).not.toHaveBeenCalled();
  });

  it('resets visibility when not intersecting and once=false', () => {
    const { container } = render(() => <ScrollReveal once={false}>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    triggerIntersection(true, wrapper);
    expect(wrapper.style.opacity).toBe('1');

    triggerIntersection(false, wrapper);
    expect(wrapper.style.opacity).toBe('0');
  });

  it('applies fade-up transform by default', () => {
    const { container } = render(() => <ScrollReveal>content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('translateY(30px)');
  });

  it('applies scale-in transform', () => {
    const { container } = render(() => <ScrollReveal animation="scale-in">content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('scale(0.9)');
  });

  it('applies slide-left transform', () => {
    const { container } = render(() => <ScrollReveal animation="slide-left">content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('translateX(-30px)');
  });

  it('applies slide-right transform', () => {
    const { container } = render(() => (
      <ScrollReveal animation="slide-right">content</ScrollReveal>
    ));

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('translateX(30px)');
  });

  it('applies fade-in with no transform', () => {
    const { container } = render(() => <ScrollReveal animation="fade-in">content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('none');
  });

  it('passes class prop through', () => {
    const { container } = render(() => <ScrollReveal class="my-class">content</ScrollReveal>);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('my-class')).toBe(true);
  });

  it('disconnects observer on cleanup', () => {
    const { unmount } = render(() => <ScrollReveal>content</ScrollReveal>);

    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
