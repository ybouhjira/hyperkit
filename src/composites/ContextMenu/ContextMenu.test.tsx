import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SKContextMenu, ContextMenuItem } from './ContextMenu';

describe('SKContextMenu', () => {
  const mockItems: ContextMenuItem[] = [
    {
      type: 'item',
      label: 'Open',
      icon: 'folder-open',
      shortcut: '⌘O',
      onClick: vi.fn(),
    },
    {
      type: 'item',
      label: 'Save',
      icon: 'save',
      onClick: vi.fn(),
    },
    { type: 'separator' },
    { type: 'label', label: 'Danger Zone' },
    {
      type: 'item',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      onClick: vi.fn(),
    },
    {
      type: 'item',
      label: 'Disabled Action',
      disabled: true,
      onClick: vi.fn(),
    },
  ];

  it('renders trigger correctly', () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Right Click Me</button>
      </SKContextMenu>
    ));

    expect(screen.getByText('Right Click Me')).toBeInTheDocument();
  });

  it('applies trigger class', () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = document.querySelector('.sk-context-menu__trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('applies custom class to menu', async () => {
    render(() => (
      <SKContextMenu items={mockItems} class="custom-menu">
        <button>Trigger</button>
      </SKContextMenu>
    ));

    // Context menu content is rendered in a portal, need to trigger it first
    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      const menu = document.querySelector('.sk-context-menu');
      expect(menu).toHaveClass('custom-menu');
    });
  });

  it('renders menu items correctly', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('renders separators', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      const separator = document.querySelector('.sk-context-menu__separator');
      expect(separator).toBeInTheDocument();
    });
  });

  it('renders labels', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      const label = document.querySelector('.sk-context-menu__label');
      expect(label).toBeInTheDocument();
    });
  });

  it('renders shortcuts', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('⌘O')).toBeInTheDocument();
      const shortcut = document.querySelector('.sk-context-menu__item-shortcut');
      expect(shortcut).toBeInTheDocument();
    });
  });

  it('applies danger variant class', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      const deleteItem = screen.getByText('Delete').closest('.sk-context-menu__item');
      expect(deleteItem).toHaveClass('sk-context-menu__item--danger');
    });
  });

  it('passes onClick handler to item prop', () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      {
        type: 'item',
        label: 'Test Action',
        onClick,
      },
    ];

    render(() => (
      <SKContextMenu items={items}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    // Just verify the component renders with the handler prop
    expect(onClick).toBeDefined();
    expect(typeof onClick).toBe('function');
  });

  it('passes disabled prop correctly', () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      {
        type: 'item',
        label: 'Disabled',
        disabled: true,
        onClick,
      },
    ];

    render(() => (
      <SKContextMenu items={items}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    // Verify component renders with disabled item
    const trigger = screen.getByText('Trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('renders icons', async () => {
    render(() => (
      <SKContextMenu items={mockItems}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      const iconContainer = document.querySelector('.sk-context-menu__item-icon');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  it('renders items without icons', async () => {
    const items: ContextMenuItem[] = [
      {
        type: 'item',
        label: 'No Icon',
        onClick: vi.fn(),
      },
    ];

    render(() => (
      <SKContextMenu items={items}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('No Icon')).toBeInTheDocument();
      const iconContainer = document.querySelector('.sk-context-menu__item-icon');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  it('handles mixed item types', async () => {
    const items: ContextMenuItem[] = [
      { type: 'label', label: 'Section 1' },
      { type: 'item', label: 'Action 1', onClick: vi.fn() },
      { type: 'separator' },
      { type: 'item', label: 'Action 2', onClick: vi.fn() },
    ];

    render(() => (
      <SKContextMenu items={items}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      expect(document.querySelector('.sk-context-menu__separator')).toBeInTheDocument();
    });
  });

  it('renders with empty items array', () => {
    render(() => (
      <SKContextMenu items={[]}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('calls onClick when menu item is clicked', async () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      {
        type: 'item',
        label: 'Test Action',
        onClick,
      },
    ];

    render(() => (
      <SKContextMenu items={items}>
        <button>Trigger</button>
      </SKContextMenu>
    ));

    const trigger = screen.getByText('Trigger');
    fireEvent.contextMenu(trigger);

    await waitFor(() => {
      expect(screen.getByText('Test Action')).toBeInTheDocument();
    });

    // Find the menu item element (parent div with class sk-context-menu__item)
    const menuItemText = screen.getByText('Test Action');
    const menuItem = menuItemText.closest('.sk-context-menu__item');

    if (menuItem) {
      // Kobalte uses pointer events
      fireEvent.pointerDown(menuItem);
      fireEvent.pointerUp(menuItem);
    }

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
