import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { PanelCollapsedStrip } from './PanelCollapsedStrip';
import type { PanelConfig, PanelState } from './types';

const createConfig = (id: string, overrides?: Partial<PanelConfig>): PanelConfig => ({
  id,
  title: `Panel ${id}`,
  defaultPosition: 'left',
  render: () => <div>Content</div>,
  ...overrides,
});

const createState = (id: string, overrides?: Partial<PanelState>): PanelState => ({
  id,
  position: 'left',
  size: 280,
  collapsed: false,
  visible: true,
  order: 0,
  ...overrides,
});

describe('PanelCollapsedStrip', () => {
  it('renders nothing when no panels are collapsed', () => {
    const panels = [{ config: createConfig('p1'), state: createState('p1', { collapsed: false }) }];
    const { container } = render(() => (
      <PanelCollapsedStrip panels={panels} direction="vertical" onExpand={vi.fn()} />
    ));
    expect(container.innerHTML).toBe('');
  });

  it('renders buttons for collapsed panels', () => {
    const panels = [
      { config: createConfig('p1', { icon: '📁' }), state: createState('p1', { collapsed: true }) },
      { config: createConfig('p2'), state: createState('p2', { collapsed: false }) },
    ];
    render(() => <PanelCollapsedStrip panels={panels} direction="vertical" onExpand={vi.fn()} />);
    expect(screen.getByText('Panel p1')).toBeInTheDocument();
    expect(screen.queryByText('Panel p2')).not.toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  it('calls onExpand with panel ID when button clicked', () => {
    const onExpand = vi.fn();
    const panels = [{ config: createConfig('p1'), state: createState('p1', { collapsed: true }) }];
    render(() => <PanelCollapsedStrip panels={panels} direction="vertical" onExpand={onExpand} />);
    fireEvent.click(screen.getByText('Panel p1'));
    expect(onExpand).toHaveBeenCalledWith('p1');
  });

  it('applies vertical class for vertical direction', () => {
    const panels = [{ config: createConfig('p1'), state: createState('p1', { collapsed: true }) }];
    const { container } = render(() => (
      <PanelCollapsedStrip panels={panels} direction="vertical" onExpand={vi.fn()} />
    ));
    const strip = container.querySelector('.sk-collapsed-strip');
    expect(strip!.classList.contains('sk-collapsed-strip--vertical')).toBe(true);
  });

  it('applies horizontal class for horizontal direction', () => {
    const panels = [{ config: createConfig('p1'), state: createState('p1', { collapsed: true }) }];
    const { container } = render(() => (
      <PanelCollapsedStrip panels={panels} direction="horizontal" onExpand={vi.fn()} />
    ));
    const strip = container.querySelector('.sk-collapsed-strip');
    expect(strip!.classList.contains('sk-collapsed-strip--horizontal')).toBe(true);
  });

  it('skips hidden panels even if collapsed', () => {
    const panels = [
      { config: createConfig('p1'), state: createState('p1', { collapsed: true, visible: false }) },
    ];
    const { container } = render(() => (
      <PanelCollapsedStrip panels={panels} direction="vertical" onExpand={vi.fn()} />
    ));
    expect(container.innerHTML).toBe('');
  });
});
