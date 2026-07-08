// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Effect, Exit, Cause } from 'effect';
import { validateUINode, LiveRenderError } from './node-schema.js';
import { sanitizeProps } from './prop-sanitizer.js';
import { NodeRenderer } from './NodeRenderer.js';

// ── Helper: extract the error from an Effect exit ────────────────────────────

async function getError(effect: Effect.Effect<unknown, LiveRenderError>): Promise<LiveRenderError> {
  const exit = await Effect.runPromiseExit(effect);
  if (Exit.isFailure(exit)) {
    const err = Cause.failureOption(exit.cause);
    if (err._tag === 'Some') return err.value;
  }
  throw new Error('Expected effect to fail but it succeeded');
}

// ── validateUINode ────────────────────────────────────────────────────────────

describe('validateUINode', () => {
  it('accepts a plain string leaf', async () => {
    const result = await Effect.runPromise(validateUINode('hello'));
    expect(result).toBe('hello');
  });

  it('accepts a minimal component node', async () => {
    const result = await Effect.runPromise(
      validateUINode({ component: 'Text', children: ['hello'] })
    );
    expect(result).toMatchObject({ component: 'Text' });
  });

  it('accepts a nested Stack > Text tree', async () => {
    const input = {
      component: 'Stack',
      children: [{ component: 'Text', children: ['hello'] }],
    };
    const result = await Effect.runPromise(validateUINode(input));
    expect(result).toMatchObject({ component: 'Stack' });
  });

  it('rejects depth > 20', async () => {
    let node: unknown = 'leaf';
    for (let i = 0; i < 22; i++) {
      node = { component: 'Box', children: [node] };
    }
    const err = await getError(validateUINode(node));
    expect(err).toBeInstanceOf(LiveRenderError);
    expect(err.reason).toMatch(/depth/i);
  });

  it('rejects __proto__ key parsed from JSON at root level', async () => {
    // Use JSON.parse so __proto__ becomes an actual enumerable own property
    const input = JSON.parse('{"component":"Box","__proto__":{}}') as unknown;
    const err = await getError(validateUINode(input));
    expect(err).toBeInstanceOf(LiveRenderError);
    expect(err.reason).toMatch(/forbidden key/i);
  });

  it('rejects __proto__ key parsed from JSON inside props', async () => {
    const input = JSON.parse('{"component":"Box","props":{"__proto__":null}}') as unknown;
    const err = await getError(validateUINode(input));
    expect(err).toBeInstanceOf(LiveRenderError);
    expect(err.reason).toMatch(/forbidden key/i);
  });

  it('rejects non-object, non-string root', async () => {
    const err = await getError(validateUINode(42));
    expect(err).toBeInstanceOf(LiveRenderError);
  });

  it('rejects node without component field', async () => {
    const err = await getError(validateUINode({ children: [] }));
    expect(err).toBeInstanceOf(LiveRenderError);
  });
});

// ── sanitizeProps ─────────────────────────────────────────────────────────────

describe('sanitizeProps', () => {
  it('strips onClick prop', () => {
    const { sanitized, stripped } = sanitizeProps({ onClick: () => {} });
    expect(sanitized['onClick']).toBeUndefined();
    expect(stripped).toContain('onClick');
  });

  it('strips onInput prop', () => {
    const { stripped } = sanitizeProps({ onInput: vi.fn() });
    expect(stripped).toContain('onInput');
  });

  it('keeps safe data props', () => {
    const { sanitized } = sanitizeProps({ variant: 'primary', size: 'md' });
    expect(sanitized['variant']).toBe('primary');
    expect(sanitized['size']).toBe('md');
  });

  it('strips external href', () => {
    const { sanitized, stripped } = sanitizeProps({ href: 'https://evil.com/steal' });
    expect(sanitized['href']).toBeUndefined();
    expect(stripped).toContain('href');
  });

  it('strips javascript: href', () => {
    const { stripped } = sanitizeProps({ href: 'javascript:alert(1)' });
    expect(stripped).toContain('href');
  });

  it('allows localhost href', () => {
    const { sanitized } = sanitizeProps({ href: 'http://localhost:3100/foo' });
    expect(sanitized['href']).toBe('http://localhost:3100/foo');
  });

  it('allows relative src', () => {
    const { sanitized } = sanitizeProps({ src: '/api/image.png' });
    expect(sanitized['src']).toBe('/api/image.png');
  });

  it('returns empty sanitized + empty stripped when no props', () => {
    const { sanitized, stripped } = sanitizeProps(undefined);
    expect(sanitized).toEqual({});
    expect(stripped).toEqual([]);
  });
});

// ── NodeRenderer ──────────────────────────────────────────────────────────────

describe('NodeRenderer', () => {
  it('renders a Stack > Text tree', () => {
    const { container } = render(() => (
      <NodeRenderer
        node={{ component: 'Stack', children: [{ component: 'Text', children: ['hello'] }] }}
      />
    ));
    expect(container.textContent).toContain('hello');
  });

  it('renders error div for unknown component but keeps siblings', () => {
    const { container } = render(() => (
      <NodeRenderer
        node={{
          component: 'Stack',
          children: [{ component: 'DoesNotExist' }, { component: 'Text', children: ['sibling'] }],
        }}
      />
    ));
    expect(container.querySelector('.sk-live-error')).toBeTruthy();
    expect(container.textContent).toContain('sibling');
  });

  it('strips onClick before passing to component', () => {
    // If onClick were passed through, SolidJS would attach an event listener;
    // the important thing is no error is thrown and the component renders.
    const { container } = render(() => (
      <NodeRenderer
        node={{
          component: 'Text',
          props: { onClick: 'alert(1)' } as Record<string, unknown>,
          children: ['safe'],
        }}
      />
    ));
    expect(container.textContent).toContain('safe');
  });

  it('renders a plain string leaf', () => {
    const { container } = render(() => <NodeRenderer node="bare string" />);
    expect(container.textContent).toContain('bare string');
  });
});
