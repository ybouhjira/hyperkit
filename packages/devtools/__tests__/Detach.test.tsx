import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { ParentProps } from 'solid-js';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import { Panel } from '../src/ui/Panel';
import { Toolbar } from '../src/ui/Toolbar';

let iframe: HTMLIFrameElement;
let popup: Window;
let marker: HTMLStyleElement;

beforeEach(() => {
  localStorage.clear();
  // A realistic same-origin "popup": an iframe contentWindow has a real
  // document, defaultView, and event plumbing — unlike an inert document.
  iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  popup = iframe.contentWindow as Window;
  Object.defineProperty(popup, 'close', { configurable: true, value: vi.fn() });

  marker = document.createElement('style');
  marker.textContent = '.detach-style-marker { color: var(--sk-accent); }';
  document.head.appendChild(marker);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  iframe.remove();
  marker.remove();
});

function Visible(props: ParentProps) {
  const { dispatch } = useDevTools();
  dispatch({ type: 'SET_PANEL_VISIBLE', payload: true });
  return <>{props.children}</>;
}

function renderPanel() {
  return render(() => (
    <DevToolsProvider>
      <Visible>
        <Panel>
          <Toolbar />
          <div class="sk-devtools__body">body</div>
        </Panel>
      </Visible>
    </DevToolsProvider>
  ));
}

function detach(container: HTMLElement) {
  fireEvent.click(
    container.querySelector('button[title="Detach into separate window"]') as HTMLElement,
  );
}

describe('Detach / pop-out', () => {
  it('moves the whole panel into the popup window so it covers nothing in the IDE', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();

    detach(container);

    expect(openSpy).toHaveBeenCalledWith('', 'hk-devtools', 'popup=yes,width=480,height=640');
    // Nothing left docked over the main window.
    expect(container.querySelector('.sk-devtools')).toBeNull();
    // The full panel (toolbar + body) lives in the popup, marked detached.
    const detached = popup.document.body.querySelector('.sk-devtools--detached');
    expect(detached).not.toBeNull();
    expect(detached!.querySelector('.sk-devtools__header')).not.toBeNull();
    expect(detached!.querySelector('.sk-devtools__body')).not.toBeNull();
    expect(popup.document.title).toBe('HyperKit DevTools');
  });

  it('copies the main window stylesheets into the popup document', () => {
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();
    detach(container);
    expect(popup.document.head.textContent).toContain('detach-style-marker');
  });

  it('re-attaches from the popup toolbar button and closes the popup', () => {
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();
    detach(container);

    const reattach = popup.document.querySelector(
      'button[title="Re-attach panel"]',
    ) as HTMLElement;
    expect(reattach).not.toBeNull();
    reattach.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(container.querySelector('.sk-devtools--bottom')).not.toBeNull();
    expect(popup.document.body.querySelector('.sk-devtools--detached')).toBeNull();
    expect(popup.close).toHaveBeenCalled();
  });

  it('re-attaches when the user closes the popup window', () => {
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();
    detach(container);
    expect(container.querySelector('.sk-devtools')).toBeNull();

    popup.dispatchEvent(new Event('pagehide'));

    expect(container.querySelector('.sk-devtools--bottom')).not.toBeNull();
  });

  it('docking from the popup toolbar re-attaches to that edge', () => {
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();
    detach(container);

    const dockRight = popup.document.querySelector(
      'button[title="Dock to right"]',
    ) as HTMLElement;
    dockRight.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(container.querySelector('.sk-devtools--right')).not.toBeNull();
    expect(popup.document.body.querySelector('.sk-devtools--detached')).toBeNull();
  });

  it('falls back to the docked panel when the popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const { container } = renderPanel();
    detach(container);
    expect(container.querySelector('.sk-devtools--bottom')).not.toBeNull();
  });

  it('marks the detach button active while detached', () => {
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { container } = renderPanel();
    detach(container);
    const btn = popup.document.querySelector('button[title="Re-attach panel"]') as HTMLElement;
    expect(btn.classList.contains('sk-devtools__dock-btn--active')).toBe(true);
  });
});
