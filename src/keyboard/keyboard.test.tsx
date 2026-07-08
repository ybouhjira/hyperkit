import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal, Component, Show } from 'solid-js';
import { KeyboardProvider } from './KeyboardProvider';
import { useKeyboard } from './useKeyboard';
import { useShortcut, useShortcuts } from './useShortcut';
import { KeyboardScope } from './KeyboardScope';
import { logger } from '../utils/logger';

// Helper to render within KeyboardProvider
function renderWithProvider(ui: () => import('solid-js').JSX.Element) {
  return render(() => <KeyboardProvider>{ui()}</KeyboardProvider>);
}

// Helper to dispatch keyboard events
function pressKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(window, { key, ...opts });
}

describe('Keyboard Service', () => {
  // 1. useShortcut registers and fires on matching keydown
  it('registers and fires shortcut on matching keydown', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'k',
        mod: true,
        handler,
        description: 'Test shortcut',
      });
      return <div>test</div>;
    };

    renderWithProvider(() => <TestComp />);
    // In jsdom, navigator.platform is not Mac, so mod maps to ctrlKey
    pressKey('k', { ctrlKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  // 2. Auto-unregisters on component unmount
  it('auto-unregisters on component unmount', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'j',
        handler,
        description: 'Unmount test',
      });
      return <div>test</div>;
    };

    const [show, setShow] = createSignal(true);

    renderWithProvider(() => (
      <Show when={show()}>
        <TestComp />
      </Show>
    ));

    pressKey('j');
    expect(handler).toHaveBeenCalledOnce();

    setShow(false);
    pressKey('j');
    expect(handler).toHaveBeenCalledOnce(); // not called again
  });

  // 3. Modifier matching: mod, ctrl, shift, alt
  it('matches mod modifier (meta on Mac)', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'p',
        mod: true,
        handler,
        description: 'Mod test',
      });
      return <div>test</div>;
    };

    renderWithProvider(() => <TestComp />);

    // Without modifier - should not fire
    pressKey('p');
    expect(handler).not.toHaveBeenCalled();

    // In jsdom (not Mac), mod maps to ctrlKey
    pressKey('p', { ctrlKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  // 4. Exact modifier match (no false positives with extra modifiers)
  it('requires exact modifier match', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'a',
        ctrl: true,
        handler,
        description: 'Exact match test',
      });
      return <div>test</div>;
    };

    renderWithProvider(() => <TestComp />);

    // Ctrl+Shift+A should NOT match (extra shift)
    pressKey('a', { ctrlKey: true, shiftKey: true });
    expect(handler).not.toHaveBeenCalled();

    // Ctrl+A should match
    pressKey('a', { ctrlKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  // 5. Input exclusion: doesn't fire in INPUT/TEXTAREA
  it('does not fire when focus is in an input element', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'k',
        mod: true,
        handler,
        description: 'Input exclusion test',
      });
      return <input data-testid="test-input" />;
    };

    renderWithProvider(() => <TestComp />);

    const input = screen.getByTestId('test-input');
    // In jsdom (not Mac), mod maps to ctrlKey
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  // 6. Escape exception: fires even in input fields
  it('fires Escape even in input fields', () => {
    const handler = vi.fn();

    const TestComp: Component = () => {
      useShortcut({
        key: 'Escape',
        handler,
        description: 'Escape test',
      });
      return <input data-testid="test-input" />;
    };

    renderWithProvider(() => <TestComp />);

    const input = screen.getByTestId('test-input');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handler).toHaveBeenCalledOnce();
  });

  // 7. Exclusive scope blocks non-global shortcuts
  it('exclusive scope blocks non-global shortcuts', () => {
    const globalHandler = vi.fn();
    const scopedHandler = vi.fn();
    const otherHandler = vi.fn();

    const GlobalShortcut: Component = () => {
      useShortcut({
        key: 'g',
        handler: globalHandler,
        description: 'Global shortcut',
        scope: 'global',
      });
      return null;
    };

    const ScopedShortcut: Component = () => {
      useShortcut({
        key: 's',
        handler: scopedHandler,
        description: 'Scoped shortcut',
        scope: 'modal',
      });
      return null;
    };

    const OtherShortcut: Component = () => {
      useShortcut({
        key: 'o',
        handler: otherHandler,
        description: 'Other scope shortcut',
        scope: 'other',
      });
      return null;
    };

    renderWithProvider(() => (
      <>
        <GlobalShortcut />
        <OtherShortcut />
        <KeyboardScope name="modal" exclusive>
          <ScopedShortcut />
        </KeyboardScope>
      </>
    ));

    pressKey('o');
    expect(otherHandler).not.toHaveBeenCalled(); // blocked by exclusive scope

    pressKey('s');
    expect(scopedHandler).toHaveBeenCalledOnce(); // in the active exclusive scope
  });

  // 8. Global shortcuts fire during exclusive scope
  it('global shortcuts fire during exclusive scope', () => {
    const globalHandler = vi.fn();

    const GlobalShortcut: Component = () => {
      useShortcut({
        key: 'g',
        handler: globalHandler,
        description: 'Global',
        scope: 'global',
      });
      return null;
    };

    renderWithProvider(() => (
      <>
        <GlobalShortcut />
        <KeyboardScope name="modal" exclusive>
          <div>modal content</div>
        </KeyboardScope>
      </>
    ));

    pressKey('g');
    expect(globalHandler).toHaveBeenCalledOnce();
  });

  // 9. Non-exclusive scopes allow all shortcuts
  it('non-exclusive scopes allow all shortcuts', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    const ShortcutA: Component = () => {
      useShortcut({
        key: 'a',
        handler: handlerA,
        description: 'Shortcut A',
        scope: 'panel-a',
      });
      return null;
    };

    const ShortcutB: Component = () => {
      useShortcut({
        key: 'b',
        handler: handlerB,
        description: 'Shortcut B',
        scope: 'panel-b',
      });
      return null;
    };

    renderWithProvider(() => (
      <>
        <KeyboardScope name="panel-a">
          <ShortcutA />
        </KeyboardScope>
        <ShortcutB />
      </>
    ));

    pressKey('a');
    expect(handlerA).toHaveBeenCalledOnce();
    pressKey('b');
    expect(handlerB).toHaveBeenCalledOnce();
  });

  // 10. Conflict detection warns in DEV mode
  it('warns on shortcut conflict in DEV mode', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const TestComp: Component = () => {
      useShortcut({
        key: 'x',
        ctrl: true,
        handler: () => {},
        description: 'First',
      });
      useShortcut({
        key: 'x',
        ctrl: true,
        handler: () => {},
        description: 'Second',
      });
      return <div>test</div>;
    };

    renderWithProvider(() => <TestComp />);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Shortcut conflict'));

    warnSpy.mockRestore();
  });

  // 11. shortcuts accessor is reactive
  it('shortcuts accessor is reactive', () => {
    const ShortcutCounter: Component = () => {
      const { shortcuts } = useKeyboard();
      return <span data-testid="count">{shortcuts().length}</span>;
    };

    const [show, setShow] = createSignal(false);

    const ConditionalShortcut: Component = () => {
      useShortcut({
        key: 'z',
        handler: () => {},
        description: 'Conditional',
      });
      return null;
    };

    renderWithProvider(() => (
      <>
        <ShortcutCounter />
        <Show when={show()}>
          <ConditionalShortcut />
        </Show>
      </>
    ));

    const countEl = screen.getByTestId('count');
    const initialCount = parseInt(countEl.textContent || '0');

    setShow(true);
    expect(parseInt(countEl.textContent || '0')).toBe(initialCount + 1);
  });

  // 12. useShortcuts batch registration
  it('useShortcuts registers multiple shortcuts', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    const TestComp: Component = () => {
      useShortcuts([
        { key: 'a', handler: handlerA, description: 'A' },
        { key: 'b', handler: handlerB, description: 'B' },
      ]);
      return <div>test</div>;
    };

    renderWithProvider(() => <TestComp />);

    pressKey('a');
    expect(handlerA).toHaveBeenCalledOnce();
    pressKey('b');
    expect(handlerB).toHaveBeenCalledOnce();
  });

  // 13. useKeyboard throws outside provider
  it('throws when useKeyboard used outside provider', () => {
    const BadComp: Component = () => {
      useKeyboard();
      return <div>bad</div>;
    };

    expect(() => {
      render(() => <BadComp />);
    }).toThrow('useKeyboard must be used within a KeyboardProvider');
  });
});
