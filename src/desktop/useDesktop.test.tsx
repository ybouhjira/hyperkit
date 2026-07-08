import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Component } from 'solid-js';
import { DesktopProvider } from './DesktopProvider';
import { useDesktop } from './useDesktop';
import type { DesktopAdapter } from './types';
import { DesktopCapability } from './types';

class MockAdapter implements DesktopAdapter {
  readonly capabilities = new Set([
    DesktopCapability.NativeWindowControls,
    DesktopCapability.NativeFileDialog,
  ]);
  minimizeWindow = () => {};
  openFileDialog = async () => null;
}

describe('useDesktop', () => {
  it('should return hasCapability that returns true for existing capabilities', () => {
    const customAdapter = new MockAdapter();

    const TestComponent: Component = () => {
      const { hasCapability } = useDesktop();
      return (
        <div data-testid="result">
          {hasCapability(DesktopCapability.NativeWindowControls) ? 'yes' : 'no'}
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <DesktopProvider adapter={customAdapter}>
        <TestComponent />
      </DesktopProvider>
    ));

    expect(getByTestId('result').textContent).toBe('yes');
  });

  it('should return hasCapability that returns false for missing capabilities', () => {
    const customAdapter = new MockAdapter();

    const TestComponent: Component = () => {
      const { hasCapability } = useDesktop();
      return (
        <div data-testid="result">
          {hasCapability(DesktopCapability.NativeNotifications) ? 'yes' : 'no'}
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <DesktopProvider adapter={customAdapter}>
        <TestComponent />
      </DesktopProvider>
    ));

    expect(getByTestId('result').textContent).toBe('no');
  });

  it('should return adapter via useDesktop', () => {
    const customAdapter = new MockAdapter();

    const TestComponent: Component = () => {
      const { adapter } = useDesktop();
      return <div data-testid="result">{adapter.capabilities.size}</div>;
    };

    const { getByTestId } = render(() => (
      <DesktopProvider adapter={customAdapter}>
        <TestComponent />
      </DesktopProvider>
    ));

    expect(getByTestId('result').textContent).toBe('2');
  });

  it('should check multiple capabilities correctly', () => {
    const customAdapter = new MockAdapter();

    const TestComponent: Component = () => {
      const { hasCapability } = useDesktop();
      const windowControls = hasCapability(DesktopCapability.NativeWindowControls);
      const fileDialog = hasCapability(DesktopCapability.NativeFileDialog);
      const notifications = hasCapability(DesktopCapability.NativeNotifications);
      return (
        <div data-testid="result">
          {windowControls && fileDialog && !notifications ? 'correct' : 'wrong'}
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <DesktopProvider adapter={customAdapter}>
        <TestComponent />
      </DesktopProvider>
    ));

    expect(getByTestId('result').textContent).toBe('correct');
  });

  it('should work outside provider with WebAdapter fallback', () => {
    const TestComponent: Component = () => {
      const { adapter, hasCapability } = useDesktop();
      return (
        <div data-testid="result">
          {adapter.capabilities.size === 0 && !hasCapability(DesktopCapability.NativeWindowControls)
            ? 'fallback'
            : 'error'}
        </div>
      );
    };

    const { getByTestId } = render(() => <TestComponent />);

    expect(getByTestId('result').textContent).toBe('fallback');
  });
});
