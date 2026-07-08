/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { useAnimation } from './useAnimation';
import { AnimationProvider } from './AnimationProvider';

describe('animation/useAnimation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset CSS variables
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

  function TestComponent(props: { onMount: (result: ReturnType<typeof useAnimation>) => void }) {
    const animation = useAnimation();
    props.onMount(animation);
    return <div>Test</div>;
  }

  it('should return animation context values', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    expect(result).toBeDefined();
    expect(result?.config).toBeDefined();
    expect(result?.setEnabled).toBeDefined();
    expect(result?.setSpeedMultiplier).toBeDefined();
    expect(result?.transition).toBeDefined();
    expect(result?.isActive).toBeDefined();
  });

  it('should have default config', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    expect(result?.config().enabled).toBe(true);
    expect(result?.config().speedMultiplier).toBe(1);
    expect(result?.config().respectReducedMotion).toBe(true);
  });

  it('should generate transition string', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    const transition = result?.transition('opacity', { duration: 300 });
    expect(transition).toContain('opacity');
    expect(transition).toContain('300ms');
    expect(transition).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('should apply speed multiplier to duration', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent
          onMount={(r) => {
            result = r;
            r.setSpeedMultiplier(2);
          }}
        />
      </AnimationProvider>
    ));

    const transition = result?.transition('opacity', { duration: 100 });
    // 100ms * 2 = 200ms
    expect(transition).toContain('200ms');
  });

  it('should use default duration of 200ms', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    const transition = result?.transition('all');
    expect(transition).toContain('200ms');
  });

  it('should support custom easing', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    const transition = result?.transition('opacity', { easing: 'ease-in-out' });
    expect(transition).toContain('ease-in-out');
  });

  it('should support delay', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    const transition = result?.transition('opacity', { delay: 50 });
    expect(transition).toContain('50ms');
  });

  it('should return "none" when animations disabled', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent
          onMount={(r) => {
            result = r;
            r.setEnabled(false);
          }}
        />
      </AnimationProvider>
    ));

    const transition = result?.transition('opacity');
    expect(transition).toBe('none');
  });

  it('should update enabled state', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent
          onMount={(r) => {
            result = r;
          }}
        />
      </AnimationProvider>
    ));

    expect(result?.config().enabled).toBe(true);
    result?.setEnabled(false);
    expect(result?.config().enabled).toBe(false);
  });

  it('should update speed multiplier', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent
          onMount={(r) => {
            result = r;
          }}
        />
      </AnimationProvider>
    ));

    expect(result?.config().speedMultiplier).toBe(1);
    result?.setSpeedMultiplier(1.5);
    expect(result?.config().speedMultiplier).toBe(1.5);
  });

  it('should report isActive correctly when enabled', () => {
    let result: ReturnType<typeof useAnimation> | undefined;

    render(() => (
      <AnimationProvider>
        <TestComponent onMount={(r) => (result = r)} />
      </AnimationProvider>
    ));

    // Assuming no reduced motion preference
    expect(result?.isActive()).toBe(true);
  });
});
