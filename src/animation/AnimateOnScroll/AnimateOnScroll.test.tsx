import { render } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnimateOnScroll } from './AnimateOnScroll';

let intersectionCallback: IntersectionObserverCallback;
let observeMock: ReturnType<typeof vi.fn>;
let disconnectMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observeMock = vi.fn();
  disconnectMock = vi.fn();

  // Must use a real function (not arrow) so `new` works
  window.IntersectionObserver = function (
    this: IntersectionObserver,
    callback: IntersectionObserverCallback
  ) {
    intersectionCallback = callback;
    this.observe = observeMock;
    this.unobserve = vi.fn();
    this.disconnect = disconnectMock;
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
    this.takeRecords = () => [];
  } as unknown as typeof IntersectionObserver;
});

describe('AnimateOnScroll', () => {
  it('renders children', () => {
    const { container } = render(() => (
      <AnimateOnScroll>
        <div data-testid="child">Test Content</div>
      </AnimateOnScroll>
    ));

    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('starts with hidden state (no visible class)', () => {
    const { container } = render(() => (
      <AnimateOnScroll>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');
    expect(wrapper).not.toHaveClass('sk-animate-on-scroll--visible');
  });

  it('applies visible class on intersection', () => {
    const { container } = render(() => (
      <AnimateOnScroll>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');

    intersectionCallback(
      [{ isIntersecting: true, target: wrapper } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    expect(wrapper).toHaveClass('sk-animate-on-scroll--visible');
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <AnimateOnScroll class="custom-class">
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('accepts different animation types', () => {
    const cases: [string, string][] = [
      ['fadeIn', 'fade-in'],
      ['fadeUp', 'fade-up'],
      ['fadeDown', 'fade-down'],
      ['slideLeft', 'slide-left'],
      ['slideRight', 'slide-right'],
      ['scale', 'scale'],
    ];

    for (const [animation, cssClass] of cases) {
      const { container } = render(() => (
        <AnimateOnScroll animation={animation as 'fadeIn'}>
          <div>Content</div>
        </AnimateOnScroll>
      ));

      const wrapper = container.querySelector('.sk-animate-on-scroll');
      expect(wrapper).toHaveClass(`sk-animate-on-scroll--${cssClass}`);
    }
  });

  it('sets custom delay and duration as CSS vars', () => {
    const { container } = render(() => (
      <AnimateOnScroll delay={200} duration={1000}>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--sk-aos-delay')).toBe('200ms');
    expect(wrapper.style.getPropertyValue('--sk-aos-duration')).toBe('1000ms');
  });

  it('uses default animation (fadeIn) when not specified', () => {
    const { container } = render(() => (
      <AnimateOnScroll>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');
    expect(wrapper).toHaveClass('sk-animate-on-scroll--fade-in');
  });

  it('applies inline styles', () => {
    const { container } = render(() => (
      <AnimateOnScroll style={{ 'background-color': 'red' }}>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll') as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
  });

  it('defaults to once=true behavior', () => {
    const { container } = render(() => (
      <AnimateOnScroll>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');

    // Intersect - should become visible
    intersectionCallback(
      [{ isIntersecting: true, target: wrapper } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(wrapper).toHaveClass('sk-animate-on-scroll--visible');

    // Leave viewport - should stay visible (once=true disconnects)
    intersectionCallback(
      [{ isIntersecting: false, target: wrapper } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(wrapper).toHaveClass('sk-animate-on-scroll--visible');
  });

  it('supports once=false for repeating animations', () => {
    const { container } = render(() => (
      <AnimateOnScroll once={false}>
        <div>Content</div>
      </AnimateOnScroll>
    ));

    const wrapper = container.querySelector('.sk-animate-on-scroll');

    // Intersect - should become visible
    intersectionCallback(
      [{ isIntersecting: true, target: wrapper } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(wrapper).toHaveClass('sk-animate-on-scroll--visible');

    // Leave viewport - should hide again (once=false)
    intersectionCallback(
      [{ isIntersecting: false, target: wrapper } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(wrapper).not.toHaveClass('sk-animate-on-scroll--visible');
  });
});
