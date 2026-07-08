import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Component } from 'solid-js';
import { DesktopProvider, useDesktopContext } from './DesktopProvider';
import { WebAdapter } from './adapters/WebAdapter';
import type { DesktopAdapter } from './types';
import { DesktopCapability } from './types';

class MockAdapter implements DesktopAdapter {
  readonly capabilities = new Set([DesktopCapability.NativeWindowControls]);
  minimizeWindow = () => {};
}

describe('DesktopProvider', () => {
  it('should use WebAdapter as default when no adapter provided', () => {
    const TestComponent: Component = () => {
      const adapter = useDesktopContext();
      return <div data-testid="result">{adapter.capabilities.size}</div>;
    };

    const { getByTestId } = render(() => (
      <DesktopProvider>
        <TestComponent />
      </DesktopProvider>
    ));

    expect(getByTestId('result').textContent).toBe('0');
  });

  it('should provide custom adapter via context', () => {
    const customAdapter = new MockAdapter();

    const TestComponent: Component = () => {
      const adapter = useDesktopContext();
      return (
        <div data-testid="result">
          {adapter.capabilities.has(DesktopCapability.NativeWindowControls) ? 'yes' : 'no'}
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

  it('should return WebAdapter when used outside provider (graceful fallback)', () => {
    const TestComponent: Component = () => {
      const adapter = useDesktopContext();
      return <div data-testid="result">{adapter.capabilities.size}</div>;
    };

    const { getByTestId } = render(() => <TestComponent />);

    expect(getByTestId('result').textContent).toBe('0');
  });

  it('should return instance of WebAdapter when outside provider', () => {
    const TestComponent: Component = () => {
      const adapter = useDesktopContext();
      return <div data-testid="result">{adapter instanceof WebAdapter ? 'web' : 'other'}</div>;
    };

    const { getByTestId } = render(() => <TestComponent />);

    expect(getByTestId('result').textContent).toBe('web');
  });
});
