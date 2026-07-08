import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import type { DevToolsState } from '../src/context/types';
import { Toolbar } from '../src/ui/Toolbar';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

function renderToolbar(onClose?: () => void) {
  let state!: DevToolsState;
  function Grab() {
    state = useDevTools().state;
    return null;
  }
  const result = render(() => (
    <DevToolsProvider>
      <Grab />
      <Toolbar onClose={onClose} />
    </DevToolsProvider>
  ));
  return { ...result, state: () => state };
}

describe('Toolbar', () => {
  it('toggles inspect mode from the inspect button', () => {
    const { container, state } = renderToolbar();
    const btn = container.querySelector('.sk-devtools__inspect-btn') as HTMLElement;
    fireEvent.click(btn);
    expect(state().inspectMode).toBe(true);
    expect(btn.classList.contains('sk-devtools__inspect-btn--active')).toBe(true);
    fireEvent.click(btn);
    expect(state().inspectMode).toBe(false);
  });

  it('switches the active tab', () => {
    const { getByText, state } = renderToolbar();
    fireEvent.click(getByText('Logs'));
    expect(state().activeTab).toBe('logs');
  });

  it('close button calls the onClose override when provided', () => {
    const onClose = vi.fn();
    const { container, state } = renderToolbar(onClose);
    fireEvent.click(container.querySelector('.sk-devtools__close-btn') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(state().enabled).toBe(false);
  });

  it('close button toggles enabled when no onClose is provided', () => {
    const { container, state } = renderToolbar();
    fireEvent.click(container.querySelector('.sk-devtools__close-btn') as HTMLElement);
    expect(state().enabled).toBe(true);
  });
});
