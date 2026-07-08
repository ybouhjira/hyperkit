import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandPalette, CommandAction } from './CommandPalette';
import { registerNavigable, clearNavigables } from '../../navigation/NavigableRegistry';

describe('CommandPalette', () => {
  const mockActions: CommandAction[] = [
    {
      id: '1',
      label: 'Open Settings',
      icon: '⚙️',
      category: 'Settings',
      shortcut: '⌘,',
      handler: vi.fn(),
      keywords: ['preferences', 'config'],
    },
    {
      id: '2',
      label: 'New File',
      icon: '📄',
      category: 'File',
      shortcut: '⌘N',
      handler: vi.fn(),
    },
    {
      id: '3',
      label: 'Search Files',
      category: 'Navigation',
      handler: vi.fn(),
    },
    {
      id: '4',
      label: 'Uncategorized Action',
      handler: vi.fn(),
    },
  ];

  it('renders correctly when open', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    expect(screen.getByText('Open Settings')).toBeInTheDocument();
    expect(screen.getByText('New File')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={false} onOpenChange={onOpenChange} actions={mockActions} />);

    expect(screen.queryByPlaceholderText('Type a command...')).not.toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={mockActions}
        placeholder="Search commands..."
      />
    ));

    expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
  });

  it('renders with custom empty message', () => {
    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={[]}
        emptyMessage="Nothing here"
      />
    ));

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={mockActions}
        class="custom-class"
      />
    ));

    const palette = document.querySelector('.sk-cmd-palette');
    expect(palette).toHaveClass('custom-class');
  });

  it('groups actions by category', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument(); // Uncategorized goes to "Other"
  });

  it('filters actions by search query', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.input(input, { target: { value: 'settings' } });

    await waitFor(() => {
      expect(screen.getByText('Open Settings')).toBeInTheDocument();
      expect(screen.queryByText('New File')).not.toBeInTheDocument();
    });
  });

  it('filters actions by keywords', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.input(input, { target: { value: 'preferences' } });

    await waitFor(() => {
      expect(screen.getByText('Open Settings')).toBeInTheDocument();
      expect(screen.queryByText('New File')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no results', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.input(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('displays icons and shortcuts', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('⌘,')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('⌘N')).toBeInTheDocument();
  });

  it('executes action on click', async () => {
    const onOpenChange = vi.fn();
    const handler = vi.fn();
    const actions: CommandAction[] = [{ id: '1', label: 'Test Action', handler }];

    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={actions} />);

    const item = screen.getByText('Test Action');
    fireEvent.click(item);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on overlay click', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const overlay = document.querySelector('.sk-cmd-palette__overlay');
    fireEvent.click(overlay!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when clicking inside palette', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const palette = document.querySelector('.sk-cmd-palette');
    fireEvent.click(palette!);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation with ArrowDown', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      const items = document.querySelectorAll('.sk-cmd-palette__item');
      expect(items[1]).toHaveClass('sk-cmd-palette__item--selected');
    });
  });

  it('handles keyboard navigation with ArrowUp', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    // Move down first
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Then move up
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    await waitFor(() => {
      const items = document.querySelectorAll('.sk-cmd-palette__item');
      expect(items[1]).toHaveClass('sk-cmd-palette__item--selected');
    });
  });

  it('executes selected action on Enter key', async () => {
    const onOpenChange = vi.fn();
    const handler = vi.fn();
    const actions: CommandAction[] = [
      { id: '1', label: 'First Action', handler: vi.fn() },
      { id: '2', label: 'Second Action', handler },
    ];

    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={actions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('closes on Escape key', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates selection on mouse enter', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const items = document.querySelectorAll('.sk-cmd-palette__item');
    fireEvent.mouseEnter(items[2]);

    await waitFor(() => {
      expect(items[2]).toHaveClass('sk-cmd-palette__item--selected');
    });
  });

  it('resets selection when query changes', async () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const input = screen.getByPlaceholderText('Type a command...');

    // Select second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Change query - should reset to first item
    fireEvent.input(input, { target: { value: 'file' } });

    await waitFor(() => {
      const items = document.querySelectorAll('.sk-cmd-palette__item');
      expect(items[0]).toHaveClass('sk-cmd-palette__item--selected');
    });
  });

  it('sorts categories alphabetically with Other last', () => {
    const onOpenChange = vi.fn();
    render(() => <CommandPalette open={true} onOpenChange={onOpenChange} actions={mockActions} />);

    const categories = Array.from(document.querySelectorAll('.sk-cmd-palette__category')).map(
      (el) => el.textContent
    );

    expect(categories).toEqual(['File', 'Navigation', 'Settings', 'Other']);
  });
});

// ── Auto-discover + extraCommands ─────────────────────────────────────────────

describe('CommandPalette — autoDiscover mode', () => {
  function makeNavActions() {
    const actions = new Map<
      string,
      { name: string; description: string; handler: (p: unknown) => unknown }
    >();
    actions.set('focus', { name: 'focus', description: 'Focus this panel', handler: () => 'ok' });
    actions.set('close', { name: 'close', description: 'Close this panel', handler: () => 'ok' });
    return actions;
  }

  beforeEach(() => {
    clearNavigables();
  });

  it('renders discovered navigable actions when autoDiscover=true and palette opens', async () => {
    registerNavigable({
      id: 'chat-panel',
      label: 'Chat Panel',
      category: 'Panels',
      actions: makeNavActions(),
    });

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette open={true} onOpenChange={onOpenChange} actions={[]} autoDiscover={true} />
    ));

    await waitFor(() => {
      expect(screen.getByText('Chat Panel → focus')).toBeInTheDocument();
      expect(screen.getByText('Chat Panel → close')).toBeInTheDocument();
    });
  });

  it('discovered actions appear under the navigable category', async () => {
    registerNavigable({
      id: 'sidebar',
      label: 'Sidebar',
      category: 'Layout',
      actions: (() => {
        const m = new Map<string, { name: string; description: string; handler: () => unknown }>();
        m.set('toggle', {
          name: 'toggle',
          description: 'Toggle sidebar',
          handler: () => undefined,
        });
        return m;
      })(),
    });

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette open={true} onOpenChange={onOpenChange} actions={[]} autoDiscover={true} />
    ));

    await waitFor(() => {
      expect(screen.getByText('Layout')).toBeInTheDocument();
    });
  });

  it('merges extraCommands with discovered actions', async () => {
    registerNavigable({
      id: 'nav-x',
      label: 'Nav X',
      actions: (() => {
        const m = new Map<string, { name: string; description: string; handler: () => unknown }>();
        m.set('ping', { name: 'ping', description: 'Ping', handler: () => undefined });
        return m;
      })(),
    });

    const extra: CommandAction[] = [
      { id: 'extra-1', label: 'Extra Command', category: 'Custom', handler: vi.fn() },
    ];

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={[]}
        autoDiscover={true}
        extraCommands={extra}
      />
    ));

    await waitFor(() => {
      expect(screen.getByText('Nav X → ping')).toBeInTheDocument();
      expect(screen.getByText('Extra Command')).toBeInTheDocument();
    });
  });

  it('merges actions prop with discovered actions', async () => {
    registerNavigable({
      id: 'nav-y',
      label: 'Nav Y',
      actions: (() => {
        const m = new Map<string, { name: string; description: string; handler: () => unknown }>();
        m.set('act', { name: 'act', description: 'An action', handler: () => undefined });
        return m;
      })(),
    });

    const staticActions: CommandAction[] = [
      { id: 'static-1', label: 'Static Action', category: 'Static', handler: vi.fn() },
    ];

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={staticActions}
        autoDiscover={true}
      />
    ));

    await waitFor(() => {
      expect(screen.getByText('Nav Y → act')).toBeInTheDocument();
      expect(screen.getByText('Static Action')).toBeInTheDocument();
    });
  });

  it('deduplicates actions with the same id (first wins)', async () => {
    registerNavigable({
      id: 'dedup-nav',
      label: 'Dedup Nav',
      actions: (() => {
        const m = new Map<string, { name: string; description: string; handler: () => unknown }>();
        m.set('run', { name: 'run', description: 'Run it', handler: () => undefined });
        return m;
      })(),
    });

    // A static action with the same id as the discovered one
    const duplicateActions: CommandAction[] = [
      {
        id: 'dedup-nav:run',
        label: 'Duplicate — should not appear',
        category: 'Static',
        handler: vi.fn(),
      },
    ];

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        actions={duplicateActions}
        autoDiscover={true}
      />
    ));

    await waitFor(() => {
      expect(screen.getByText('Dedup Nav → run')).toBeInTheDocument();
      // Duplicate label must NOT be present
      expect(screen.queryByText('Duplicate — should not appear')).not.toBeInTheDocument();
    });
  });

  it('backward compat: actions prop only (no autoDiscover) still works', () => {
    const staticActions: CommandAction[] = [
      { id: 'bc-1', label: 'Backward Compat Action', handler: vi.fn() },
    ];

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette open={true} onOpenChange={onOpenChange} actions={staticActions} />
    ));

    expect(screen.getByText('Backward Compat Action')).toBeInTheDocument();
  });

  it('backward compat: does not show navigable actions when autoDiscover is false', async () => {
    registerNavigable({
      id: 'hidden-nav',
      label: 'Hidden Nav',
      actions: (() => {
        const m = new Map<string, { name: string; description: string; handler: () => unknown }>();
        m.set('hidden', {
          name: 'hidden',
          description: 'Should not appear',
          handler: () => undefined,
        });
        return m;
      })(),
    });

    const staticActions: CommandAction[] = [
      { id: 's1', label: 'Visible Static', handler: vi.fn() },
    ];

    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette open={true} onOpenChange={onOpenChange} actions={staticActions} />
    ));

    expect(screen.getByText('Visible Static')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Nav → hidden')).not.toBeInTheDocument();
  });

  it('shows empty message when no navigables registered and no actions', () => {
    const onOpenChange = vi.fn();
    render(() => (
      <CommandPalette open={true} onOpenChange={onOpenChange} actions={[]} autoDiscover={true} />
    ));

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  describe('icon prop', () => {
    it('accepts and renders a string icon (emoji)', () => {
      const actions: CommandAction[] = [
        { id: 's', label: 'String Icon', icon: '🚀', handler: vi.fn() },
      ];
      render(() => <CommandPalette open={true} onOpenChange={vi.fn()} actions={actions} />);
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('accepts and renders a JSX element icon', () => {
      const actions: CommandAction[] = [
        {
          id: 'j',
          label: 'JSX Icon',
          icon: (
            <span data-testid="jsx-icon" style={{ background: 'red', width: '8px', height: '8px' }}>
              dot
            </span>
          ),
          handler: vi.fn(),
        },
      ];
      render(() => <CommandPalette open={true} onOpenChange={vi.fn()} actions={actions} />);
      expect(screen.getByTestId('jsx-icon')).toBeInTheDocument();
    });

    it('omits icon container when no icon provided', () => {
      const actions: CommandAction[] = [{ id: 'n', label: 'No Icon', handler: vi.fn() }];
      const { container } = render(() => (
        <CommandPalette open={true} onOpenChange={vi.fn()} actions={actions} />
      ));
      expect(container.querySelector('.sk-cmd-palette__item-icon')).not.toBeInTheDocument();
    });
  });
});
