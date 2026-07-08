/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Transition } from './Transition';
import { AnimationProvider } from './AnimationProvider';

describe('animation/Transition', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
    // Mock matchMedia
    window.matchMedia =
      window.matchMedia ||
      function (query) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        };
      };
  });

  it('should render children', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="fade">
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    expect(container.textContent).toContain('Content');
  });

  it('should apply fade animation styles', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="fade" duration={200}>
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper).toBeDefined();
    // After mount, should have opacity: 1 and transition
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transition).toContain('200ms');
  });

  it('should apply slide-up animation styles', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="slide-up" duration={300}>
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transform).toBe('translateY(0)');
    expect(wrapper.style.transition).toContain('300ms');
  });

  it('should apply scale animation styles', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="scale">
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transform).toBe('scale(1)');
  });

  it('should use default duration of 200ms', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="fade">
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.transition).toContain('200ms');
  });

  it('should render without animation when preset is none', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="none">
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.transition).toBe('');
    expect(wrapper.style.opacity).toBe('');
  });

  it('should render without animation when no preset provided', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition>
          <span>Content</span>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.transition).toBe('');
  });

  it('should wrap children in a div element', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Transition preset="fade">
          <button>Click me</button>
        </Transition>
      </AnimationProvider>
    ));

    const wrapper = container.querySelector('div')!;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.querySelector('button')).toBeDefined();
  });
});
