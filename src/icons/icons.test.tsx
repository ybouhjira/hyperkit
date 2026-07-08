import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { icons } from './icons';
import { Icon } from './Icon';

describe('icons registry', () => {
  it('has all expected icon names', () => {
    const expectedIcons = [
      // Navigation (9)
      'home',
      'arrow-left',
      'arrow-right',
      'chevron-down',
      'chevron-right',
      'chevron-up',
      'menu',
      'more-horizontal',
      'more-vertical',
      // Actions (11)
      'plus',
      'close',
      'check',
      'edit',
      'trash',
      'copy',
      'download',
      'upload',
      'search',
      'refresh',
      'external-link',
      // Status (5)
      'info',
      'warning',
      'error',
      'success',
      'loading',
      // Content (10)
      'file',
      'folder',
      'folder-open',
      'code',
      'terminal',
      'message',
      'image',
      'settings',
      'pin',
      'star',
      // IDE (10)
      'play',
      'pause',
      'stop',
      'debug',
      'split',
      'maximize',
      'minimize',
      'panel-left',
      'panel-right',
      'panel-bottom',
      // Chat/Dashboard (29)
      'circle',
      'circle-alert',
      'circle-check-big',
      'circle-stop',
      'clock',
      'cpu',
      'chart-column',
      'dollar-sign',
      'file-text',
      'focus',
      'funnel',
      'gauge',
      'git-branch',
      'house',
      'keyboard',
      'layout-grid',
      'list',
      'list-todo',
      'message-square',
      'minus',
      'monitor',
      'palette',
      'power',
      'radio',
      'square',
      'square-pen',
      'test-tube-diagonal',
      'wrench',
      'zap',
    ];

    for (const name of expectedIcons) {
      expect(icons[name], `Icon '${name}' should exist`).toBeDefined();
    }
  });

  it('has at least 127 manual icons plus generated icons', () => {
    expect(Object.keys(icons).length).toBeGreaterThanOrEqual(127);
  });

  it('all icons return valid JSX', () => {
    for (const [name, iconFn] of Object.entries(icons)) {
      const result = iconFn();
      expect(result, `Icon '${name}' should return JSX`).toBeDefined();
    }
  });

  it('renders each icon via Icon component without errors', () => {
    for (const name of Object.keys(icons)) {
      const { container, unmount } = render(() => <Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg, `Icon '${name}' should render an SVG`).toBeInTheDocument();
      unmount();
    }
  });

  it('all icon names use kebab-case (no camelCase)', () => {
    const invalidNames = Object.keys(icons).filter((name) => {
      // Check if name contains uppercase letters (would be camelCase)
      return /[A-Z]/.test(name);
    });

    expect(
      invalidNames,
      `Icon names should use kebab-case, found: ${invalidNames.join(', ')}`
    ).toHaveLength(0);
  });
});
