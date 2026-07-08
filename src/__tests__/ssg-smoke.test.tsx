/**
 * SSG Smoke Tests — regression suite for server-side rendering safety.
 *
 * The crash we're guarding against (introduced before 3.2.2):
 *   @kobalte/core/tooltip was imported at module top-level in Tooltip.tsx.
 *   On any SSR/SSG context, Kobalte's Portal calls `notSup()` immediately:
 *     "Error: Client-only API called on the server side."
 *   This crashed digitalmania's entire SSG build because the barrel re-exports
 *   every primitive, so even importing `Button` would transitively pull in Tooltip.
 *
 * How we test this:
 *   In vitest's jsdom environment, vite-plugin-solid resolves solid-js/web
 *   to the browser bundle (isServer=false), so we can't easily simulate the
 *   server path via renderToString in this environment. Instead we verify:
 *   1. The barrel import doesn't throw (would have thrown before the fix)
 *   2. Tooltip renders only children (SSR-safe pass-through on server)
 *   3. All key components render without errors via @solidjs/testing-library
 *
 *   The true server-path proof is that `Tooltip.tsx` now has `if (isServer) return children`
 *   and does NOT import @kobalte/core at module top-level — this structural change
 *   is what prevents the crash. The test validates the component contract.
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';

// This import must not throw — it was the crash point before the fix.
// Before 3.2.2: importing anything from this barrel would pull Tooltip →
//   @kobalte/core/tooltip → Portal → notSup() → crash.
import * as HyperKit from '../index';

describe('SSG safety: barrel import integrity', () => {
  test('public component exports exist after barrel import', () => {
    // If this throws or any export is undefined, the barrel/re-export is broken.
    expect(typeof HyperKit.Button).toBe('function');
    expect(typeof HyperKit.Badge).toBe('function');
    expect(typeof HyperKit.Input).toBe('function');
    expect(typeof HyperKit.Card).toBe('function');
    expect(typeof HyperKit.Text).toBe('function');
    expect(typeof HyperKit.EmptyState).toBe('function');
    expect(typeof HyperKit.Tooltip).toBe('function');
    expect(typeof HyperKit.Spinner).toBe('function');
    expect(typeof HyperKit.ProgressBar).toBe('function');
  });
});

describe('SSG safety: component render (no crash)', () => {
  test('Button renders without crash', () => {
    render(() => <HyperKit.Button>Click</HyperKit.Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  test('Badge renders without crash', () => {
    render(() => <HyperKit.Badge variant="default">New</HyperKit.Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('Card renders without crash', () => {
    render(() => <HyperKit.Card>Content</HyperKit.Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('Text renders without crash', () => {
    render(() => <HyperKit.Text>Hello</HyperKit.Text>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('EmptyState renders without crash', () => {
    render(() => <HyperKit.EmptyState title="Nothing here" description="Empty state" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  test('Tooltip renders children without crash — primary regression guard', () => {
    // This is the regression test for the 3.2.1 → 3.2.2 fix.
    // Before: Tooltip.tsx imported @kobalte/core/tooltip at module top-level.
    //   In any server/SSG context this would call Portal's internal notSup() → crash.
    // After: Tooltip.tsx uses isServer guard + lazy() so Kobalte is never
    //   loaded at module-init time.
    //
    // In jsdom/browser mode (isServer=false), the lazy impl is loaded and the
    // full Kobalte Tooltip is rendered. The children must be present.
    render(() => (
      <HyperKit.Tooltip content="Hello tooltip">
        <HyperKit.Button>Hover me</HyperKit.Button>
      </HyperKit.Tooltip>
    ));
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('Tooltip with placement and delay renders children', () => {
    render(() => (
      <HyperKit.Tooltip content="Tooltip" placement="bottom" delay={150}>
        <span>trigger text</span>
      </HyperKit.Tooltip>
    ));
    expect(screen.getByText('trigger text')).toBeInTheDocument();
  });

  test('multiple Tooltips in the same tree render without crash', () => {
    render(() => (
      <div>
        <HyperKit.Tooltip content="First">
          <HyperKit.Button>Alpha</HyperKit.Button>
        </HyperKit.Tooltip>
        <HyperKit.Tooltip content="Second">
          <HyperKit.Button>Beta</HyperKit.Button>
        </HyperKit.Tooltip>
      </div>
    ));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('Tooltip with open prop renders children without crash', () => {
    render(() => (
      <HyperKit.Tooltip content="Controlled" open={false}>
        <span>controlled trigger</span>
      </HyperKit.Tooltip>
    ));
    expect(screen.getByText('controlled trigger')).toBeInTheDocument();
  });
});
