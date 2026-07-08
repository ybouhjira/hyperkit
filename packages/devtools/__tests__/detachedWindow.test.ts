import { describe, it, expect, afterEach, vi } from 'vitest';
import { copyStylesInto, openDetachedWindow } from '../src/dock/detachedWindow';

interface FakeWindow {
  document: Document;
  closed: boolean;
  addEventListener: (type: string, fn: EventListener) => void;
  removeEventListener: (type: string, fn: EventListener) => void;
  close: () => void;
  /** Test helper — simulates the user closing the popup. */
  firePageHide: () => void;
}

function createFakeWindow(): FakeWindow {
  const doc = document.implementation.createHTMLDocument('popup');
  const listeners = new Map<string, Set<EventListener>>();
  const win: FakeWindow = {
    document: doc,
    closed: false,
    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener: (type, fn) => {
      listeners.get(type)?.delete(fn);
    },
    close: vi.fn(() => {
      win.closed = true;
    }),
    firePageHide: () => {
      for (const fn of listeners.get('pagehide') ?? []) {
        fn(new Event('pagehide'));
      }
    },
  };
  return win;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('copyStylesInto', () => {
  it('clones <style> and stylesheet <link> nodes into the target head', () => {
    const source = document.implementation.createHTMLDocument('source');
    const style = source.createElement('style');
    style.textContent = '.sk-devtools { color: var(--sk-text-primary); }';
    source.head.appendChild(style);
    const link = source.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/dist/hyperkit-devtools.css';
    source.head.appendChild(link);
    const icon = source.createElement('link');
    icon.rel = 'icon';
    icon.href = '/favicon.png';
    source.head.appendChild(icon);

    const target = document.implementation.createHTMLDocument('target');
    copyStylesInto(target, source);

    expect(target.head.querySelectorAll('style')).toHaveLength(1);
    expect(target.head.querySelector('style')?.textContent).toContain('--sk-text-primary');
    expect(target.head.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(1);
    expect(target.head.querySelectorAll('link[rel="icon"]')).toHaveLength(0);
  });

  it('copies inline --sk-* token vars from the source <html> element', () => {
    const source = document.implementation.createHTMLDocument('source');
    source.documentElement.setAttribute('style', '--sk-accent: #1264a3;');
    const target = document.implementation.createHTMLDocument('target');
    copyStylesInto(target, source);
    expect(target.documentElement.getAttribute('style')).toBe('--sk-accent: #1264a3;');
  });

  it('leaves the target <html> style alone when the source has none', () => {
    const source = document.implementation.createHTMLDocument('source');
    const target = document.implementation.createHTMLDocument('target');
    copyStylesInto(target, source);
    expect(target.documentElement.getAttribute('style')).toBeNull();
  });
});

describe('openDetachedWindow', () => {
  it('returns null when the popup is blocked', () => {
    const openWindow = vi.fn().mockReturnValue(null);
    expect(openDetachedWindow({ openWindow })).toBeNull();
    expect(openWindow).toHaveBeenCalledWith('', 'hk-devtools', 'popup=yes,width=480,height=640');
  });

  it('passes custom dimensions to the popup features', () => {
    const openWindow = vi.fn().mockReturnValue(null);
    openDetachedWindow({ openWindow, width: 800, height: 500 });
    expect(openWindow).toHaveBeenCalledWith('', 'hk-devtools', 'popup=yes,width=800,height=500');
  });

  it('prepares the popup: title, copied styles, and a mount node', () => {
    const fake = createFakeWindow();
    const source = document.implementation.createHTMLDocument('source');
    const style = source.createElement('style');
    style.textContent = '.sk-devtools__body { padding: var(--sk-space-md); }';
    source.head.appendChild(style);

    const handle = openDetachedWindow({
      openWindow: () => fake as unknown as Window,
      sourceDocument: source,
      title: 'My DevTools',
    });

    expect(handle).not.toBeNull();
    expect(fake.document.title).toBe('My DevTools');
    expect(fake.document.head.querySelector('style')?.textContent).toContain('--sk-space-md');
    expect(handle!.mount.className).toBe('sk-devtools-detached-root');
    expect(handle!.mount.parentElement).toBe(fake.document.body);
    expect(handle!.window).toBe(fake as unknown as Window);
  });

  it('uses the global window.open and document by default', () => {
    const fake = createFakeWindow();
    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue(fake as unknown as Window);
    const marker = document.createElement('style');
    marker.textContent = '.detach-marker { color: var(--sk-accent); }';
    document.head.appendChild(marker);

    const handle = openDetachedWindow();

    expect(openSpy).toHaveBeenCalledWith('', 'hk-devtools', 'popup=yes,width=480,height=640');
    expect(fake.document.title).toBe('HyperKit DevTools');
    expect(fake.document.head.textContent).toContain('detach-marker');
    handle!.dispose();
    marker.remove();
  });

  it('fires onClose exactly once when the user closes the popup', () => {
    const fake = createFakeWindow();
    const onClose = vi.fn();
    openDetachedWindow({ openWindow: () => fake as unknown as Window, onClose });

    fake.firePageHide();
    fake.firePageHide();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('survives a user close without an onClose callback', () => {
    const fake = createFakeWindow();
    openDetachedWindow({ openWindow: () => fake as unknown as Window });
    expect(() => fake.firePageHide()).not.toThrow();
  });

  it('dispose closes the popup and suppresses onClose', () => {
    const fake = createFakeWindow();
    const onClose = vi.fn();
    const handle = openDetachedWindow({
      openWindow: () => fake as unknown as Window,
      onClose,
    });

    handle!.dispose();
    expect(fake.close).toHaveBeenCalledTimes(1);
    fake.firePageHide();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dispose does not re-close an already closed popup', () => {
    const fake = createFakeWindow();
    const handle = openDetachedWindow({ openWindow: () => fake as unknown as Window });
    fake.closed = true;
    handle!.dispose();
    expect(fake.close).not.toHaveBeenCalled();
  });

  it('onClose does not fire for a pagehide after dispose removed the listener', () => {
    const fake = createFakeWindow();
    const onClose = vi.fn();
    const handle = openDetachedWindow({
      openWindow: () => fake as unknown as Window,
      onClose,
    });
    handle!.dispose();
    handle!.dispose(); // idempotent
    fake.firePageHide();
    expect(onClose).not.toHaveBeenCalled();
  });
});
