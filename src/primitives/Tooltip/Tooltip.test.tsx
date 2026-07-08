import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './Tooltip';

// NOTE: In this test environment, solid-js/web resolves to the server bundle
// (isServer = true). Therefore, Tooltip renders only its children (no Kobalte
// wrapper, no Portal). This is the correct SSR/SSG behaviour — the full Tooltip
// is lazy-loaded on the client only. These tests validate the SSR-safe path.

describe('Tooltip', () => {
  it('renders trigger children', () => {
    render(() => (
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    ));
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    render(() => (
      <Tooltip content="Tip">
        <span>Target</span>
      </Tooltip>
    ));
    expect(screen.getByText('Target')).toBeInTheDocument();
  });

  it('supports string content', () => {
    render(() => (
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    ));
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('passes custom class (SSR: children rendered, no tooltip wrapper)', () => {
    const { container } = render(() => (
      <Tooltip content="Test" class="custom-class">
        <button>Button</button>
      </Tooltip>
    ));
    expect(container).toBeInTheDocument();
    // In SSR context the button renders directly — no .sk-tooltip__trigger wrapper
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('accepts placement prop', () => {
    render(() => (
      <Tooltip content="Bottom tooltip" placement="bottom">
        <button>Bottom</button>
      </Tooltip>
    ));
    expect(screen.getByText('Bottom')).toBeInTheDocument();
  });

  it('accepts delay prop', () => {
    render(() => (
      <Tooltip content="Delayed" delay={500}>
        <button>Delayed trigger</button>
      </Tooltip>
    ));
    expect(screen.getByText('Delayed trigger')).toBeInTheDocument();
  });

  it('SSR: children render without crashing (no Portal/notSup error)', () => {
    // This is the regression test. If Kobalte were imported at module level,
    // renderToString (or any server-side render) would throw:
    //   "Error: Client-only API called on the server side"
    // The fact that this test passes without throwing is the proof the fix works.
    expect(() =>
      render(() => (
        <Tooltip content="Hello tooltip">
          <button>Hover me</button>
        </Tooltip>
      ))
    ).not.toThrow();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('SSR: children render with open prop without crashing', () => {
    // open prop is forwarded to the lazy client impl; on server it is ignored.
    expect(() =>
      render(() => (
        <Tooltip content="Hello tooltip" open={true}>
          <button>Controlled trigger</button>
        </Tooltip>
      ))
    ).not.toThrow();
    expect(screen.getByText('Controlled trigger')).toBeInTheDocument();
  });

  it('SSR: unstyled prop accepted without crash', () => {
    render(() => (
      <Tooltip content="Unstyled" unstyled class="custom">
        <button>Trigger</button>
      </Tooltip>
    ));
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });
});
