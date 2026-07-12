import { Component, createSignal, For, createEffect, onCleanup, createMemo } from 'solid-js';
import { Dialog } from '../../primitives/Dialog';
import { useTheme } from '../../theme/useTheme';
import { ThemeConfig } from '../../theme/types';
import '@ybouhjira/hyperkit-styles/composites/ThemePickerModal/ThemePickerModal.css';

export interface ThemePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GRID_COLUMNS = 3;

/**
 * Data: macOS traffic-light colors (close/minimize/zoom). Part of the mini-IDE
 * illustration and intentionally identical in every theme preview — these are
 * content, not host-theme chrome, so they must NOT follow --sk-* tokens.
 */
const TRAFFIC_LIGHT_COLORS = ['#ff5f57', '#febc2e', '#28c840'] as const;

type Category = 'all' | 'dark' | 'light' | 'editor' | 'platform';

/**
 * Renders a miniature IDE mock painted with the TARGET theme's own colors
 * (inline, from `props.theme.colors`) — deliberately not the active theme's
 * --sk-* tokens, since each card must preview the theme it represents.
 */
function MiniIdePreview(props: { theme: ThemeConfig }) {
  const t = () => props.theme.colors;
  return (
    <div
      class="sk-theme-card__ide"
      style={{ background: t().bgPrimary, border: `1px solid ${t().border}` }}
    >
      {/* Title bar */}
      <div class="sk-theme-card__titlebar" style={{ background: t().bgSecondary }}>
        <div class="sk-theme-card__dots">
          <For each={TRAFFIC_LIGHT_COLORS}>{(dot) => <span style={{ background: dot }} />}</For>
        </div>
        <span class="sk-theme-card__name" style={{ color: t().textSecondary }}>
          {props.theme.name}
        </span>
      </div>
      {/* Body */}
      <div class="sk-theme-card__body">
        {/* Sidebar */}
        <div class="sk-theme-card__sidebar" style={{ background: t().bgSecondary }}>
          <div class="sk-theme-card__sidebar-icon" style={{ background: t().accent }} />
          <div class="sk-theme-card__sidebar-icon" style={{ background: t().textMuted }} />
          <div class="sk-theme-card__sidebar-icon" style={{ background: t().textMuted }} />
        </div>
        {/* Editor */}
        <div class="sk-theme-card__editor" style={{ background: t().bgPrimary }}>
          <code style={{ color: t().textPrimary }}>
            <span style={{ color: t().accent }}>import</span> {'{ Signal }'}{' '}
            <span style={{ color: t().accent }}>from</span>{' '}
            <span style={{ color: t().success }}>'solid'</span>;{'\n'}
            <span style={{ color: t().accent }}>export function</span> App() {'{'}
            {'\n'}
            {'  '}
            <span style={{ color: t().accent }}>const</span> count = createSignal(0);{'\n'}
            {'  '}
            <span style={{ color: t().accent }}>return</span> {'<div />'};{'\n'}
            {'}'}
          </code>
        </div>
      </div>
      {/* Terminal */}
      <div
        class="sk-theme-card__terminal"
        style={{ background: t().bgSecondary, 'border-top': `1px solid ${t().border}` }}
      >
        <span style={{ color: t().success }}>$</span>
        <span style={{ color: t().textSecondary }}> npm run dev</span>
        {'\n'}
        <span style={{ color: t().textMuted }}>Ready on port 3200</span>
      </div>
    </div>
  );
}

function categorizeTheme(theme: ThemeConfig): Category[] {
  const categories: Category[] = ['all'];
  const id = theme.id.toLowerCase();

  // Dark/Light based on ID
  if (id.includes('dark') || id.includes('ocean')) {
    categories.push('dark');
  } else if (id.includes('light')) {
    categories.push('light');
  } else {
    // Check bg brightness heuristically
    const bgHex = theme.colors.bgPrimary;
    if (bgHex.startsWith('#') && bgHex.length >= 7) {
      const r = parseInt(bgHex.slice(1, 3), 16);
      const g = parseInt(bgHex.slice(3, 5), 16);
      const b = parseInt(bgHex.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      categories.push(brightness < 128 ? 'dark' : 'light');
    } else {
      // Non-hex colors (rgb, hsl, named): default to dark
      categories.push('dark');
    }
  }

  // Editor-inspired
  if (['zed', 'cursor', 'sublime', 'warp', 'linear'].some((editor) => id.includes(editor))) {
    categories.push('editor');
  }

  // Platform
  if (['ubuntu', 'material', 'macos', 'windows'].some((platform) => id.includes(platform))) {
    categories.push('platform');
  }

  return categories;
}

export const ThemePickerModal: Component<ThemePickerModalProps> = (props) => {
  const { theme, setTheme, themes } = useTheme();
  const [category, setCategory] = createSignal<Category>('all');
  const [focusedIndex, setFocusedIndex] = createSignal<number>(0);

  const filteredThemes = createMemo(() => {
    const cat = category();
    if (cat === 'all') return themes;
    return themes.filter((t) => categorizeTheme(t).includes(cat));
  });

  const handleThemeClick = (themeConfig: ThemeConfig) => {
    setTheme(themeConfig.id);
    props.onOpenChange(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    const currentIndex = focusedIndex();
    const totalThemes = filteredThemes().length;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(Math.min(currentIndex + 1, totalThemes - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(Math.max(currentIndex - 1, 0));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(currentIndex + GRID_COLUMNS, totalThemes - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(currentIndex - GRID_COLUMNS, 0));
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const themeConfig = filteredThemes()[currentIndex];
        if (themeConfig != null) {
          handleThemeClick(themeConfig);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        props.onOpenChange(false);
        break;
    }
  };

  // Gate keyboard listener by open state
  createEffect(() => {
    if (props.open) {
      window.addEventListener('keydown', handleKeyDown);
      // Set initial focus to current theme in filtered list
      const currentThemeIndex = filteredThemes().findIndex((t) => t.id === theme().id);
      if (currentThemeIndex !== -1) {
        setFocusedIndex(currentThemeIndex);
      }
    }

    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  // Reset focus when category changes
  createEffect(() => {
    category();
    setFocusedIndex(0);
  });

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Select Theme"
      description="Choose a theme to customize the appearance of your application"
      class="sk-theme-picker-modal"
    >
      <div class="sk-theme-picker-modal__content">
        {/* Header with current theme and category tabs */}
        <div class="sk-theme-picker-modal__header">
          <div class="sk-theme-picker-modal__current">
            Current: <strong>{theme().name}</strong>
          </div>
          <div class="sk-theme-picker-modal__tabs" role="tablist" aria-label="Theme categories">
            <button
              class="sk-theme-picker-modal__tab"
              classList={{ 'sk-theme-picker-modal__tab--active': category() === 'all' }}
              onClick={() => setCategory('all')}
              role="tab"
              aria-selected={category() === 'all'}
            >
              All
            </button>
            <button
              class="sk-theme-picker-modal__tab"
              classList={{ 'sk-theme-picker-modal__tab--active': category() === 'dark' }}
              onClick={() => setCategory('dark')}
              role="tab"
              aria-selected={category() === 'dark'}
            >
              Dark
            </button>
            <button
              class="sk-theme-picker-modal__tab"
              classList={{ 'sk-theme-picker-modal__tab--active': category() === 'light' }}
              onClick={() => setCategory('light')}
              role="tab"
              aria-selected={category() === 'light'}
            >
              Light
            </button>
            <button
              class="sk-theme-picker-modal__tab"
              classList={{ 'sk-theme-picker-modal__tab--active': category() === 'editor' }}
              onClick={() => setCategory('editor')}
              role="tab"
              aria-selected={category() === 'editor'}
            >
              Editor-Inspired
            </button>
            <button
              class="sk-theme-picker-modal__tab"
              classList={{ 'sk-theme-picker-modal__tab--active': category() === 'platform' }}
              onClick={() => setCategory('platform')}
              role="tab"
              aria-selected={category() === 'platform'}
            >
              Platform
            </button>
          </div>
        </div>

        {/* Theme Grid */}
        <div class="sk-theme-picker-modal__grid">
          <For each={filteredThemes()}>
            {(themeConfig, index) => {
              const isSelected = () => theme().id === themeConfig.id;
              const isFocused = () => focusedIndex() === index();

              return (
                <button
                  class="sk-theme-picker-modal__theme-card"
                  classList={{
                    'sk-theme-picker-modal__theme-card--selected': isSelected(),
                    'sk-theme-picker-modal__theme-card--focused': isFocused(),
                  }}
                  onClick={() => handleThemeClick(themeConfig)}
                  aria-label={`Select ${themeConfig.name} theme`}
                  aria-pressed={isSelected()}
                  tabIndex={isFocused() ? 0 : -1}
                >
                  <MiniIdePreview theme={themeConfig} />
                </button>
              );
            }}
          </For>
        </div>

        {/* Footer with keyboard hints */}
        <div class="sk-theme-picker-modal__footer">
          <span>Arrow keys to navigate • Enter/Space to select • Esc to close</span>
        </div>
      </div>
    </Dialog>
  );
};
