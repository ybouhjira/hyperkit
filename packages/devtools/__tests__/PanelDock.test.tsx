import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { ParentProps } from 'solid-js';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import { Panel } from '../src/ui/Panel';
import { Toolbar } from '../src/ui/Toolbar';
import { DOCK_STORAGE_KEY } from '../src/dock/dockState';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
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

function panel(container: HTMLElement): HTMLElement {
  return container.querySelector('.sk-devtools') as HTMLElement;
}

function handle(container: HTMLElement): HTMLElement {
  return container.querySelector('.sk-devtools__resize-handle') as HTMLElement;
}

function dockButton(container: HTMLElement, title: string): HTMLElement {
  return container.querySelector(`button[title="${title}"]`) as HTMLElement;
}

describe('Panel docking', () => {
  it('docks to the bottom by default with the default height', () => {
    const { container } = renderPanel();
    const el = panel(container);
    expect(el.classList.contains('sk-devtools--bottom')).toBe(true);
    expect(el.style.height).toBe('300px');
    expect(el.style.width).toBe('');
    expect(handle(container).classList.contains('sk-devtools__resize-handle--bottom')).toBe(true);
  });

  it('restores a persisted dock position on mount', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'right');
    const { container } = renderPanel();
    const el = panel(container);
    expect(el.classList.contains('sk-devtools--right')).toBe(true);
    expect(el.style.width).toBe('380px');
    expect(el.style.height).toBe('');
    expect(handle(container).classList.contains('sk-devtools__resize-handle--right')).toBe(true);
  });

  it('ignores an invalid persisted value and docks to the bottom', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'ceiling');
    const { container } = renderPanel();
    expect(panel(container).classList.contains('sk-devtools--bottom')).toBe(true);
  });

  it('switches dock position from the header control and persists it', () => {
    const { container } = renderPanel();
    fireEvent.click(dockButton(container, 'Dock to left'));
    const el = panel(container);
    expect(el.classList.contains('sk-devtools--left')).toBe(true);
    expect(el.style.width).toBe('380px');
    expect(localStorage.getItem(DOCK_STORAGE_KEY)).toBe('left');

    fireEvent.click(dockButton(container, 'Dock to bottom'));
    expect(panel(container).classList.contains('sk-devtools--bottom')).toBe(true);
    expect(localStorage.getItem(DOCK_STORAGE_KEY)).toBe('bottom');
  });

  it('marks the active dock position button', () => {
    const { container } = renderPanel();
    expect(
      dockButton(container, 'Dock to bottom').classList.contains('sk-devtools__dock-btn--active'),
    ).toBe(true);
    fireEvent.click(dockButton(container, 'Dock to right'));
    expect(
      dockButton(container, 'Dock to right').classList.contains('sk-devtools__dock-btn--active'),
    ).toBe(true);
    expect(
      dockButton(container, 'Dock to bottom').classList.contains('sk-devtools__dock-btn--active'),
    ).toBe(false);
  });
});

describe('Panel resizing', () => {
  it('resizes a bottom dock vertically (drag up grows the panel)', () => {
    const { container } = renderPanel();
    fireEvent.mouseDown(handle(container), { clientX: 0, clientY: 500 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: 400 });
    expect(panel(container).style.height).toBe('400px');
    fireEvent.mouseUp(document);
    // After mouseup the listeners are gone — further movement does nothing.
    fireEvent.mouseMove(document, { clientX: 0, clientY: 100 });
    expect(panel(container).style.height).toBe('400px');
  });

  it('clamps a bottom dock between 150 and viewport-100', () => {
    const { container } = renderPanel();
    fireEvent.mouseDown(handle(container), { clientX: 0, clientY: 500 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: 5000 });
    expect(panel(container).style.height).toBe('150px');
    fireEvent.mouseMove(document, { clientX: 0, clientY: -5000 });
    expect(panel(container).style.height).toBe(`${window.innerHeight - 100}px`);
    fireEvent.mouseUp(document);
  });

  it('resizes a right dock horizontally (drag left grows the panel)', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'right');
    const { container } = renderPanel();
    fireEvent.mouseDown(handle(container), { clientX: 800, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 700, clientY: 0 });
    expect(panel(container).style.width).toBe('480px');
    fireEvent.mouseUp(document);
  });

  it('resizes a left dock horizontally (drag right grows the panel) with clamping', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'left');
    const { container } = renderPanel();
    fireEvent.mouseDown(handle(container), { clientX: 380, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 480, clientY: 0 });
    expect(panel(container).style.width).toBe('480px');
    fireEvent.mouseMove(document, { clientX: -5000, clientY: 0 });
    expect(panel(container).style.width).toBe('250px');
    fireEvent.mouseMove(document, { clientX: 5000, clientY: 0 });
    expect(panel(container).style.width).toBe(`${window.innerWidth - 100}px`);
    fireEvent.mouseUp(document);
  });

  it('remembers a separate size per dock edge', () => {
    const { container } = renderPanel();
    // Grow the bottom dock.
    fireEvent.mouseDown(handle(container), { clientX: 0, clientY: 500 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: 300 });
    fireEvent.mouseUp(document);
    expect(panel(container).style.height).toBe('500px');

    // Side dock starts at its own default…
    fireEvent.click(dockButton(container, 'Dock to right'));
    expect(panel(container).style.width).toBe('380px');

    // …and the bottom height survives the round trip.
    fireEvent.click(dockButton(container, 'Dock to bottom'));
    expect(panel(container).style.height).toBe('500px');
  });

  it('hides the panel entirely when panelVisible is false', () => {
    const { container } = render(() => (
      <DevToolsProvider>
        <Panel>
          <div class="sk-devtools__body">body</div>
        </Panel>
      </DevToolsProvider>
    ));
    expect(panel(container)).toBeNull();
  });
});
