import { Component, For } from 'solid-js';
import type { ViewMode } from './FileExplorer';
import './FileExplorer.css';

export interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  isNarrow?: boolean;
}

const VIEW_MODES: { mode: ViewMode; label: string }[] = [
  { mode: 'list', label: 'List' },
  { mode: 'icons', label: 'Icons' },
  { mode: 'gallery', label: 'Gallery' },
  { mode: 'tree', label: 'Tree' },
];

export const ViewModeSwitcher: Component<ViewModeSwitcherProps> = (props) => {
  return (
    <div class="sk-view-switcher" data-testid="view-mode-switcher">
      <For each={VIEW_MODES}>
        {(item) => {
          const isDisabled = () => props.isNarrow && item.mode !== 'list';
          return (
            <button
              onClick={() => !isDisabled() && props.onModeChange(item.mode)}
              class={`sk-view-switcher__btn${props.currentMode === item.mode && !isDisabled() ? ' sk-view-switcher__btn--active' : ''}`}
              title={isDisabled() ? 'Panel too narrow' : item.label}
              disabled={isDisabled()}
              data-testid={`view-mode-${item.mode}`}
            >
              {/* List icon */}
              {item.mode === 'list' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              )}
              {/* Icons icon */}
              {item.mode === 'icons' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
              {/* Gallery icon */}
              {item.mode === 'gallery' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clip-rule="evenodd"
                  />
                </svg>
              )}
              {/* Tree icon */}
              {item.mode === 'tree' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h3a1 1 0 010 2H8a1 1 0 01-1-1zm4 4a1 1 0 011-1h3a1 1 0 010 2h-3a1 1 0 01-1-1zm-8 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zM3 3v14M3 7h4M7 11h4M3 15h0"
                    clip-rule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        }}
      </For>
    </div>
  );
};
