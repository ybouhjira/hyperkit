import { Component, For } from 'solid-js';
import { ViewSwitcherProps, ViewModeConfig } from './types';
import type { JSX } from 'solid-js';

// Built-in SVG icons for common view modes
const builtinIcons: Record<string, () => JSX.Element> = {
  'card-grid': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  table: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="6" width="14" height="2" rx="1" />
      <rect x="1" y="10" width="14" height="2" rx="1" />
    </svg>
  ),
  timeline: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" stroke-width="1.5" />
      <path
        d="M8 4 L8 8 L11 11"
        stroke="currentColor"
        fill="none"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  ),
  kanban: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="3" height="12" rx="1" />
      <rect x="6" y="2" width="3" height="8" rx="1" />
      <rect x="11" y="2" width="3" height="10" rx="1" />
    </svg>
  ),
};

// Size configurations
const sizeConfig = {
  sm: { button: 24, icon: 14 },
  md: { button: 32, icon: 16 },
  lg: { button: 40, icon: 20 },
};

/**
 * ViewSwitcher - Toggle bar for switching between view modes
 *
 * Renders a horizontal row of icon buttons for switching between different
 * view modes (e.g., card grid, table, timeline, kanban).
 */
export const ViewSwitcher: Component<ViewSwitcherProps> = (props) => {
  const size = () => props.size || 'md';
  const dimensions = () => sizeConfig[size()];

  const renderIcon = (mode: ViewModeConfig): JSX.Element => {
    // If icon is a function, call it
    if (typeof mode.icon === 'function') {
      return mode.icon();
    }

    // If icon is a string, check builtin icons first
    if (typeof mode.icon === 'string') {
      const builtinIcon = builtinIcons[mode.icon];
      if (builtinIcon) {
        return builtinIcon();
      }

      // Fallback: treat as SVG path data
      return (
        <svg
          width={dimensions().icon}
          height={dimensions().icon}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d={mode.icon} />
        </svg>
      );
    }

    // Fallback: empty icon
    return <></>;
  };

  const containerStyle = {
    display: 'flex',
    gap: '2px',
    background: 'var(--sk-bg-secondary)',
    'border-radius': 'var(--sk-radius-md)',
    padding: '2px',
  };

  const buttonStyle = (isActive: boolean) => ({
    border: 'none',
    cursor: 'pointer',
    'border-radius': 'var(--sk-radius-sm)',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    color: isActive ? 'var(--sk-accent)' : 'var(--sk-text-secondary)',
    background: isActive ? 'var(--sk-bg-elevated)' : 'transparent',
    transition: 'all 0.15s ease',
    width: `${dimensions().button}px`,
    height: `${dimensions().button}px`,
    padding: '0',
  });

  const buttonHoverStyle = {
    color: 'var(--sk-text-primary)',
  };

  return (
    <div style={containerStyle}>
      <For each={props.modes}>
        {(mode) => {
          const isActive = () => mode.id === props.activeMode;

          return (
            <button
              type="button"
              style={buttonStyle(isActive())}
              onClick={() => props.onModeChange(mode.id)}
              title={mode.tooltip || mode.label}
              aria-label={mode.label}
              aria-pressed={isActive()}
              onMouseEnter={(e) => {
                if (!isActive()) {
                  Object.assign(e.currentTarget.style, buttonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive()) {
                  e.currentTarget.style.color = 'var(--sk-text-secondary)';
                }
              }}
            >
              {renderIcon(mode)}
            </button>
          );
        }}
      </For>
    </div>
  );
};
