/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { AnimationProvider, useAnimationContext } from './AnimationProvider';

describe('animation/AnimationProvider', () => {
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
    render(() => (
      <AnimationProvider>
        <div>Test Content</div>
      </AnimationProvider>
    ));

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide animation context', () => {
    function TestComponent() {
      const context = useAnimationContext();
      return <div>Enabled: {context.config().enabled.toString()}</div>;
    }

    render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    expect(screen.getByText(/Enabled: true/)).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    function TestComponent() {
      useAnimationContext();
      return <div>Test</div>;
    }

    expect(() => {
      render(() => <TestComponent />);
    }).toThrow('useAnimationContext must be used within an AnimationProvider');
  });

  it('should apply CSS variables to DOM', () => {
    render(() => (
      <AnimationProvider>
        <div>Test</div>
      </AnimationProvider>
    ));

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--sk-transition-duration')).toBeTruthy();
    expect(root.style.getPropertyValue('--sk-transition-timing')).toBe(
      'cubic-bezier(0.4, 0, 0.2, 1)'
    );
  });

  it('should update CSS variables when config changes', () => {
    function TestComponent() {
      const { setSpeedMultiplier } = useAnimationContext();
      return <button onClick={() => setSpeedMultiplier(2)}>Change Speed</button>;
    }

    const { container } = render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    const button = container.querySelector('button')!;
    button.click();

    const root = document.documentElement;
    const duration = root.style.getPropertyValue('--sk-transition-duration');
    // 200ms * 2 = 400ms
    expect(duration).toContain('400');
  });

  it('should persist config to localStorage', () => {
    function TestComponent() {
      const { setEnabled } = useAnimationContext();
      return <button onClick={() => setEnabled(false)}>Disable</button>;
    }

    const { container } = render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    const button = container.querySelector('button')!;
    button.click();

    const saved = localStorage.getItem('sk-animation-config');
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!).enabled).toBe(false);
  });

  it('should load config from localStorage on mount', () => {
    localStorage.setItem(
      'sk-animation-config',
      JSON.stringify({ enabled: false, speedMultiplier: 0.5 })
    );

    function TestComponent() {
      const { config } = useAnimationContext();
      return <div>Speed: {config().speedMultiplier}</div>;
    }

    render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    expect(screen.getByText('Speed: 0.5')).toBeInTheDocument();
  });

  it('should provide setEnabled method', () => {
    function TestComponent() {
      const { config, setEnabled } = useAnimationContext();
      return (
        <div>
          <div>Enabled: {config().enabled.toString()}</div>
          <button onClick={() => setEnabled(false)}>Disable</button>
        </div>
      );
    }

    const { container } = render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    expect(screen.getByText(/Enabled: true/)).toBeInTheDocument();

    const button = container.querySelector('button')!;
    button.click();

    expect(screen.getByText(/Enabled: false/)).toBeInTheDocument();
  });

  it('should provide setSpeedMultiplier method', () => {
    function TestComponent() {
      const { config, setSpeedMultiplier } = useAnimationContext();
      return (
        <div>
          <div>Speed: {config().speedMultiplier}</div>
          <button onClick={() => setSpeedMultiplier(2)}>Change</button>
        </div>
      );
    }

    const { container } = render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    expect(screen.getByText('Speed: 1')).toBeInTheDocument();

    const button = container.querySelector('button')!;
    button.click();

    expect(screen.getByText('Speed: 2')).toBeInTheDocument();
  });

  it('should calculate isActive based on enabled and reduced motion', () => {
    function TestComponent() {
      const { isActive } = useAnimationContext();
      return <div>Active: {isActive().toString()}</div>;
    }

    render(() => (
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    ));

    // Default state (enabled=true, no reduced motion in test env)
    expect(screen.getByText(/Active: true/)).toBeInTheDocument();
  });
});
