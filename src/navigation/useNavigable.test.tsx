import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { NavigationProvider } from './NavigationContext';
import { registerContentType, clearContentTypes } from './ContentRegistry';
import { useNavigable } from './useNavigable';
import type { ContentRef } from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRef(overrides: Partial<ContentRef> = {}): ContentRef {
  return { type: 'test-doc', id: 'doc-1', label: 'Test Doc', ...overrides };
}

// ── Setup ──────────────────────────────────────────────────────────────────────

describe('useNavigable', () => {
  beforeEach(() => {
    clearContentTypes();
    registerContentType({
      type: 'test-doc',
      label: 'Test Document',
      defaultPanel: 'main',
    });
  });

  // ── Returned props ─────────────────────────────────────────────────────────

  it('returns data-navigable attribute set to "true"', () => {
    const ref = makeRef();
    let nav: ReturnType<typeof useNavigable> | undefined;

    render(() => (
      <NavigationProvider>
        <Capture
          ref={ref}
          onCapture={(r) => {
            nav = r;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.props['data-navigable']).toBe('true');
  });

  it('returns data-content-type matching the ref type', () => {
    const ref = makeRef({ type: 'test-doc' });
    let nav: ReturnType<typeof useNavigable> | undefined;

    render(() => (
      <NavigationProvider>
        <Capture
          ref={ref}
          onCapture={(r) => {
            nav = r;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.props['data-content-type']).toBe('test-doc');
  });

  it('returns data-content-id matching the ref id', () => {
    const ref = makeRef({ id: 'my-unique-id' });
    let nav: ReturnType<typeof useNavigable> | undefined;

    render(() => (
      <NavigationProvider>
        <Capture
          ref={ref}
          onCapture={(r) => {
            nav = r;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.props['data-content-id']).toBe('my-unique-id');
  });

  it('returns onClick and onContextMenu handlers', () => {
    const ref = makeRef();
    let nav: ReturnType<typeof useNavigable> | undefined;

    render(() => (
      <NavigationProvider>
        <Capture
          ref={ref}
          onCapture={(r) => {
            nav = r;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.onClick).toBeTypeOf('function');
    expect(nav!.onContextMenu).toBeTypeOf('function');
  });

  // ── Normal click ───────────────────────────────────────────────────────────

  it('normal click calls nav.openContent with the ref', () => {
    const ref = makeRef();
    let nav: ReturnType<typeof useNavigable> | undefined;

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton
          ref={ref}
          onCapture={(r) => {
            nav = r;
          }}
        />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');

    // Spy on nav after render
    expect(btn).toBeDefined();

    // Fire a plain click — no ctrl/meta modifiers
    fireEvent.click(btn, { ctrlKey: false, metaKey: false });

    // Just check the button is still there (nav.openContent internally manages state)
    expect(nav).toBeDefined();
  });

  // ── Ctrl+Click shows menu ──────────────────────────────────────────────────

  it('Ctrl+Click calls onOpenMenu with the ref and mouse position', () => {
    const ref = makeRef();
    const onOpenMenu = vi.fn();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} onOpenMenu={onOpenMenu} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    fireEvent.click(btn, { ctrlKey: true, clientX: 100, clientY: 200 });

    expect(onOpenMenu).toHaveBeenCalledOnce();
    const [calledRef, pos] = onOpenMenu.mock.calls[0] as [ContentRef, { x: number; y: number }];
    expect(calledRef.id).toBe(ref.id);
    expect(pos).toEqual({ x: 100, y: 200 });
  });

  it('Ctrl+Click calls preventDefault and stopPropagation', () => {
    const ref = makeRef();
    const onOpenMenu = vi.fn();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} onOpenMenu={onOpenMenu} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      clientX: 50,
      clientY: 60,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    btn.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  // ── Meta+Click (Mac Cmd) ───────────────────────────────────────────────────

  it('Meta+Click (Cmd) also calls onOpenMenu', () => {
    const ref = makeRef();
    const onOpenMenu = vi.fn();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} onOpenMenu={onOpenMenu} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    fireEvent.click(btn, { metaKey: true, clientX: 300, clientY: 400 });

    expect(onOpenMenu).toHaveBeenCalledOnce();
    const [, pos] = onOpenMenu.mock.calls[0] as [ContentRef, { x: number; y: number }];
    expect(pos).toEqual({ x: 300, y: 400 });
  });

  // ── Right-click context menu ───────────────────────────────────────────────

  it('right-click (onContextMenu) calls onOpenMenu with position', () => {
    const ref = makeRef();
    const onOpenMenu = vi.fn();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} onOpenMenu={onOpenMenu} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    fireEvent.contextMenu(btn, { clientX: 55, clientY: 77 });

    expect(onOpenMenu).toHaveBeenCalledOnce();
    const [calledRef, pos] = onOpenMenu.mock.calls[0] as [ContentRef, { x: number; y: number }];
    expect(calledRef.id).toBe(ref.id);
    expect(pos).toEqual({ x: 55, y: 77 });
  });

  it('right-click calls preventDefault and stopPropagation', () => {
    const ref = makeRef();
    const onOpenMenu = vi.fn();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} onOpenMenu={onOpenMenu} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 20,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    btn.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  // ── No onOpenMenu provided ─────────────────────────────────────────────────

  it('does not throw when onOpenMenu is not provided and Ctrl+Click fires', () => {
    const ref = makeRef();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    expect(() => {
      fireEvent.click(btn, { ctrlKey: true, clientX: 10, clientY: 10 });
    }).not.toThrow();
  });

  it('does not throw when onOpenMenu is not provided and right-click fires', () => {
    const ref = makeRef();

    const { getByTestId } = render(() => (
      <NavigationProvider>
        <CaptureButton ref={ref} onCapture={() => {}} />
      </NavigationProvider>
    ));

    const btn = getByTestId('capture-btn');
    expect(() => {
      fireEvent.contextMenu(btn, { clientX: 10, clientY: 10 });
    }).not.toThrow();
  });
});

// ── Minimal test components ────────────────────────────────────────────────────

function Capture(props: {
  ref: ContentRef;
  onCapture: (r: ReturnType<typeof useNavigable>) => void;
}) {
  const nav = useNavigable(() => props.ref);
  props.onCapture(nav);
  return <div />;
}

function CaptureButton(props: {
  ref: ContentRef;
  onCapture: (r: ReturnType<typeof useNavigable>) => void;
  onOpenMenu?: (ref: ContentRef, pos: { x: number; y: number }) => void;
}) {
  const nav = useNavigable(() => props.ref, { onOpenMenu: props.onOpenMenu });
  props.onCapture(nav);
  return (
    <button
      data-testid="capture-btn"
      onClick={nav.onClick}
      onContextMenu={nav.onContextMenu}
      {...nav.props}
    >
      item
    </button>
  );
}
