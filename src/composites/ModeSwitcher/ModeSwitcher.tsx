import { Component, createSignal, Show, For, onMount, onCleanup, splitProps } from 'solid-js';
import { useMode, type Mode, modeDefinitions } from '../../hooks/useMode';
import { useShortcuts } from '../../keyboard';
import './ModeSwitcher.css';

export interface ModeSwitcherProps {
  class?: string;
}

export const ModeSwitcher: Component<ModeSwitcherProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [showExitHint, setShowExitHint] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;
  let timeoutId: number | undefined;

  // Initialize mode hook
  const { mode, setMode, getModeDefinition } = useMode();

  // Register keyboard shortcuts
  useShortcuts([
    {
      key: '1',
      mod: true,
      handler: () => setMode('developer'),
      description: 'Switch to Developer mode',
      category: 'Mode',
    },
    {
      key: '2',
      mod: true,
      handler: () => setMode('focus'),
      description: 'Switch to Focus mode',
      category: 'Mode',
    },
    {
      key: '3',
      mod: true,
      handler: () => setMode('tv'),
      description: 'Switch to TV mode',
      category: 'Mode',
    },
    {
      key: 'f',
      ctrl: true,
      shift: true,
      handler: () => {
        setMode('distraction-free');
        setShowExitHint(true);
        // Auto-hide exit hint after 3 seconds
        if (timeoutId != null) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setShowExitHint(false);
        }, 3000);
      },
      description: 'Toggle Distraction-Free mode',
      category: 'Mode',
      excludeInputs: false, // Allow in inputs for chat
    },
    {
      key: 'Escape',
      handler: () => {
        if (mode() === 'distraction-free') {
          setMode('developer');
          setShowExitHint(false);
        }
      },
      description: 'Exit Distraction-Free mode',
      category: 'Mode',
      excludeInputs: false,
    },
  ]);

  // Close dropdown on outside click
  const handleOutsideClick = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleOutsideClick);
    if (timeoutId != null) clearTimeout(timeoutId);
  });

  const currentMode = () => getModeDefinition(mode());

  const handleModeClick = (modeId: Mode) => {
    setMode(modeId);
    setIsDropdownOpen(false);

    // Show exit hint for distraction-free mode
    if (modeId === 'distraction-free') {
      setShowExitHint(true);
      if (timeoutId != null) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setShowExitHint(false);
      }, 3000);
    }
  };

  return (
    <>
      <div
        class={local.class ? `sk-mode-switcher ${local.class}` : 'sk-mode-switcher'}
        ref={dropdownRef}
        {...others}
      >
        <button
          class="sk-mode-switcher__trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen())}
          type="button"
          aria-label="Switch UI mode"
          aria-expanded={isDropdownOpen()}
        >
          <span class="sk-mode-switcher__icon">{currentMode().icon}</span>
          <span class="sk-mode-switcher__label">{currentMode().label}</span>
        </button>

        <Show when={isDropdownOpen()}>
          <div class="sk-mode-switcher__dropdown">
            <For each={modeDefinitions}>
              {(modeItem, index) => (
                <button
                  class={
                    mode() === modeItem.id
                      ? 'sk-mode-switcher__option sk-mode-switcher__option--active'
                      : 'sk-mode-switcher__option'
                  }
                  onClick={() => handleModeClick(modeItem.id)}
                  type="button"
                  aria-pressed={mode() === modeItem.id}
                >
                  <span class="sk-mode-switcher__option-icon">{modeItem.icon}</span>
                  <div class="sk-mode-switcher__option-content">
                    <div class="sk-mode-switcher__option-label">{modeItem.label}</div>
                    <div class="sk-mode-switcher__option-description">{modeItem.description}</div>
                  </div>
                  <Show when={index() < 3}>
                    <span class="sk-mode-switcher__option-shortcut">⌘{index() + 1}</span>
                  </Show>
                  <Show when={modeItem.id === 'distraction-free'}>
                    <span class="sk-mode-switcher__option-shortcut">⌃⇧F</span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>

      <Show when={showExitHint() && mode() === 'distraction-free'}>
        <div class="sk-mode-switcher__exit-hint">
          <span class="sk-mode-switcher__exit-hint-text">Press</span>
          <span class="sk-mode-switcher__exit-hint-key">ESC</span>
          <span class="sk-mode-switcher__exit-hint-text">to exit Distraction-Free mode</span>
        </div>
      </Show>
    </>
  );
};
