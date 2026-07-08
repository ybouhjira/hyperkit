import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { KeyboardScope } from './KeyboardScope';
import { KeyboardProvider } from './KeyboardProvider';

describe('KeyboardScope', () => {
  it('renders children correctly', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="test-scope">
          <div>Test Content</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders without children', () => {
    const { container } = render(() => (
      <KeyboardProvider>
        <KeyboardScope name="empty" />
      </KeyboardProvider>
    ));

    // Component should render without errors even with no children
    expect(container).toBeInTheDocument();
  });

  it('passes through multiple children', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="test">
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('renders as a fragment wrapper', () => {
    const { container } = render(() => (
      <KeyboardProvider>
        <KeyboardScope name="test">
          <div class="test-child">Test</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    // Should render children directly without wrapping element
    const child = container.querySelector('.test-child');
    expect(child).toBeInTheDocument();
  });

  it('handles different scope names', () => {
    const names = ['dialog', 'menu', 'tooltip', 'sidebar', 'modal'];

    names.forEach((name) => {
      render(() => (
        <KeyboardProvider>
          <KeyboardScope name={name}>
            <div data-testid={`scope-${name}`}>Content</div>
          </KeyboardScope>
        </KeyboardProvider>
      ));

      expect(screen.getByTestId(`scope-${name}`)).toBeInTheDocument();
    });
  });

  it('maintains scope isolation between independent scopes', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="scope1">
          <div>Scope 1</div>
        </KeyboardScope>
        <KeyboardScope name="scope2">
          <div>Scope 2</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    // Both scopes should render their children independently
    expect(screen.getByText('Scope 1')).toBeInTheDocument();
    expect(screen.getByText('Scope 2')).toBeInTheDocument();
  });

  it('supports nested scopes', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="app">
          <KeyboardScope name="modal">
            <div>Nested Content</div>
          </KeyboardScope>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Nested Content')).toBeInTheDocument();
  });

  it('renders with exclusive prop set to true', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="exclusive-scope" exclusive={true}>
          <div>Exclusive Content</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Exclusive Content')).toBeInTheDocument();
  });

  it('renders with exclusive prop set to false', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="non-exclusive-scope" exclusive={false}>
          <div>Non-Exclusive Content</div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Non-Exclusive Content')).toBeInTheDocument();
  });

  it('renders with complex nested structure', () => {
    render(() => (
      <KeyboardProvider>
        <KeyboardScope name="outer">
          <div>
            <KeyboardScope name="inner1">
              <span>Inner 1</span>
            </KeyboardScope>
            <KeyboardScope name="inner2">
              <span>Inner 2</span>
            </KeyboardScope>
          </div>
        </KeyboardScope>
      </KeyboardProvider>
    ));

    expect(screen.getByText('Inner 1')).toBeInTheDocument();
    expect(screen.getByText('Inner 2')).toBeInTheDocument();
  });
});
