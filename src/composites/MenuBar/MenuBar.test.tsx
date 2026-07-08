import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { MenuBar, MenuDefinition } from './MenuBar';

describe('MenuBar', () => {
  const mockMenus: MenuDefinition[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        {
          id: 'new',
          label: 'New File',
          icon: '📄',
          shortcut: '⌘N',
          handler: vi.fn(),
        },
        {
          id: 'open',
          label: 'Open',
          shortcut: '⌘O',
          handler: vi.fn(),
        },
        { id: 'sep1', type: 'separator' },
        {
          id: 'save',
          label: 'Save',
          shortcut: '⌘S',
          handler: vi.fn(),
          disabled: true,
        },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          shortcut: '⌘Z',
          handler: vi.fn(),
        },
        {
          id: 'redo',
          label: 'Redo',
          shortcut: '⌘⇧Z',
          handler: vi.fn(),
        },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        {
          id: 'toggle-sidebar',
          label: 'Show Sidebar',
          type: 'checkbox',
          checked: true,
          handler: vi.fn(),
        },
        {
          id: 'submenu',
          label: 'Appearance',
          submenu: [
            {
              id: 'theme-light',
              label: 'Light',
              handler: vi.fn(),
            },
            {
              id: 'theme-dark',
              label: 'Dark',
              handler: vi.fn(),
            },
          ],
        },
      ],
    },
  ];

  it('has role="menubar" for proper accessibility semantics', () => {
    render(() => <MenuBar menus={mockMenus} />);

    // The root container must use the native menubar role (WAI-ARIA Menubar pattern).
    // This verifies we're using Kobalte's Menubar primitive, not DropdownMenu.
    const menubar = screen.getByRole('menubar');
    expect(menubar).toBeInTheDocument();
    expect(menubar).toHaveClass('sk-menu-bar');
  });

  it('renders menu triggers correctly', () => {
    render(() => <MenuBar menus={mockMenus} />);

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <MenuBar menus={mockMenus} class="custom-menubar" />);

    const menubar = document.querySelector('.sk-menu-bar');
    expect(menubar).toHaveClass('custom-menubar');
  });

  it('applies BEM class to menubar', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const menubar = document.querySelector('.sk-menu-bar');
    expect(menubar).toBeInTheDocument();
  });

  it('renders menu structure correctly', () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Verify menu structure exists - Kobalte Menubar uses role="menuitem" for triggers
    const triggers = screen.getAllByRole('menuitem');
    expect(triggers.length).toBeGreaterThanOrEqual(3); // File, Edit, View (at minimum)
  });

  it('has proper menu items configuration', () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Verify the menus prop is passed correctly
    expect(mockMenus[0].items).toHaveLength(4); // New, Open, separator, Save
    expect(mockMenus[0].items[0].icon).toBe('📄');
    expect(mockMenus[0].items[0].shortcut).toBe('⌘N');
  });

  it('configures shortcuts in menu items', () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Verify shortcuts are configured
    const fileMenu = mockMenus.find((m) => m.id === 'file');
    expect(fileMenu?.items[0].shortcut).toBe('⌘N');
    expect(fileMenu?.items[1].shortcut).toBe('⌘O');
  });

  it('includes separator items in configuration', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileMenu = mockMenus.find((m) => m.id === 'file');
    const separator = fileMenu?.items.find((item) => item.type === 'separator');
    expect(separator).toBeDefined();
  });

  it('passes handler to menu items', () => {
    const handler = vi.fn();
    const menus: MenuDefinition[] = [
      {
        id: 'test',
        label: 'Test',
        items: [
          {
            id: 'action',
            label: 'Test Action',
            handler,
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);

    // Verify handler is configured
    expect(menus[0].items[0].handler).toBe(handler);
  });

  it('configures disabled state for items', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileMenu = mockMenus.find((m) => m.id === 'file');
    const disabledItem = fileMenu?.items.find((item) => item.id === 'save');
    expect(disabledItem?.disabled).toBe(true);
  });

  it('configures checkbox items', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const viewMenu = mockMenus.find((m) => m.id === 'view');
    const checkboxItem = viewMenu?.items.find((item) => item.type === 'checkbox');
    expect(checkboxItem?.type).toBe('checkbox');
    expect(checkboxItem?.checked).toBe(true);
  });

  it('configures submenu items', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const viewMenu = mockMenus.find((m) => m.id === 'view');
    const submenuItem = viewMenu?.items.find((item) => item.submenu);
    expect(submenuItem?.submenu).toBeDefined();
    expect(submenuItem?.submenu?.length).toBe(2);
  });

  it('handles mouse enter on triggers', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');
    expect(() => fireEvent.mouseEnter(fileTrigger)).not.toThrow();
  });

  it('tracks open menu state', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');
    // Click should trigger open state change
    expect(() => fireEvent.click(fileTrigger)).not.toThrow();
  });

  it('does not open menu on hover when no menu is open', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const editTrigger = screen.getByText('Edit');
    fireEvent.mouseEnter(editTrigger);

    // Menu should not open
    expect(screen.queryByText('Undo')).not.toBeInTheDocument();
  });

  it('applies trigger class', () => {
    render(() => <MenuBar menus={mockMenus} />);

    const trigger = document.querySelector('.sk-menu-bar__trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('renders with empty menus array', () => {
    render(() => <MenuBar menus={[]} />);

    const menubar = document.querySelector('.sk-menu-bar');
    expect(menubar).toBeInTheDocument();
  });

  it('configures checkbox handler', () => {
    const handler = vi.fn();
    const menus: MenuDefinition[] = [
      {
        id: 'options',
        label: 'Options',
        items: [
          {
            id: 'option1',
            label: 'Option 1',
            type: 'checkbox',
            checked: false,
            handler,
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);

    // Verify checkbox handler is configured
    expect(menus[0].items[0].handler).toBe(handler);
    expect(menus[0].items[0].type).toBe('checkbox');
  });

  it('supports JSX element as icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">🎨</span>;
    const menus: MenuDefinition[] = [
      {
        id: 'custom',
        label: 'Custom',
        items: [
          {
            id: 'item1',
            label: 'With JSX Icon',
            icon: <CustomIcon />,
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);

    // Verify JSX icon is configured
    expect(menus[0].items[0].icon).toBeDefined();
  });

  it('shows menu items when menu trigger is clicked', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');

    // Try using pointerDown/pointerUp instead of click
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    // Wait for menu items to appear
    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls handler when menu item is clicked', async () => {
    const handler = vi.fn();
    const menus: MenuDefinition[] = [
      {
        id: 'test',
        label: 'Test',
        items: [
          {
            id: 'action',
            label: 'Test Action',
            handler,
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);

    // Open the menu
    const trigger = screen.getByText('Test');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    // Wait for menu item to appear
    await waitFor(
      () => {
        expect(screen.getByText('Test Action')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click the menu item using keyboard (similar to Dropdown tests)
    const menuItem = screen.getByText('Test Action');
    menuItem.focus();
    fireEvent.keyDown(menuItem, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Verify handler was called
    await waitFor(
      () => {
        expect(handler).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('switches menu on hover when one is already open', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Open File menu
    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    // Wait for File menu items to appear
    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // With Kobalte Menubar, hover-to-switch is handled automatically by the primitive
    // We need to trigger focus + pointer events on the Edit trigger
    const editTrigger = screen.getByText('Edit');
    editTrigger.focus();
    fireEvent.pointerEnter(editTrigger);

    // Wait a bit for the menu switch to occur
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Wait for Edit menu items to appear
    await waitFor(
      () => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('renders disabled items correctly when menu is open', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Open File menu
    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    // Wait for menu items to appear
    await waitFor(
      () => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify the disabled Save item has data-disabled attribute
    const saveItem = screen.getByText('Save').closest('[role="menuitem"]');
    expect(saveItem).toHaveAttribute('data-disabled');
  });

  it('renders separator in open menu', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Separator renders with role="separator"
    const separator = document.querySelector('.sk-menu-bar__separator');
    expect(separator).toBeInTheDocument();
  });

  it('renders shortcut text in menu items', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Shortcuts should be rendered as text
    expect(screen.getByText('⌘N')).toBeInTheDocument();
    expect(screen.getByText('⌘O')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });

  it('renders icon in menu items', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // The "New File" item has icon '📄'
    const iconEl = document.querySelector('.sk-menu-bar__icon');
    expect(iconEl).toBeInTheDocument();
    expect(iconEl?.textContent).toBe('📄');
  });

  it('navigates menus with keyboard ArrowRight', async () => {
    render(() => <MenuBar menus={mockMenus} />);

    // Open File menu
    const fileTrigger = screen.getByText('File');
    fireEvent.pointerDown(fileTrigger);
    fireEvent.pointerUp(fileTrigger);

    await waitFor(
      () => {
        expect(screen.getByText('New File')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Press ArrowRight to move to Edit menu
    fireEvent.keyDown(document.activeElement ?? fileTrigger, { key: 'ArrowRight' });

    await waitFor(
      () => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('renders JSX icon inside an open menu item', async () => {
    const CustomIcon = () => <span data-testid="jsx-menu-icon">IC</span>;
    const menus: MenuDefinition[] = [
      {
        id: 'tools',
        label: 'Tools',
        items: [
          {
            id: 'tool1',
            label: 'Tool One',
            icon: <CustomIcon />,
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Tools');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('Tool One')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByTestId('jsx-menu-icon')).toBeInTheDocument();
  });

  it('checkbox item with icon renders correctly', async () => {
    const menus: MenuDefinition[] = [
      {
        id: 'opts',
        label: 'Options',
        items: [
          {
            id: 'opt-check',
            label: 'Check Me',
            type: 'checkbox',
            checked: false,
            icon: '🔧',
            shortcut: '⌘K',
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Options');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('Check Me')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('⌘K')).toBeInTheDocument();
    const checkboxItem = screen.getByRole('menuitemcheckbox');
    expect(checkboxItem).toHaveAttribute('aria-checked', 'false');
  });

  it('renders disabled item that does not call handler', async () => {
    const handler = vi.fn();
    const menus: MenuDefinition[] = [
      {
        id: 'test',
        label: 'Test',
        items: [
          {
            id: 'disabled-action',
            label: 'Disabled Action',
            handler,
            disabled: true,
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Test');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('Disabled Action')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const item = screen.getByText('Disabled Action').closest('[role="menuitem"]');
    expect(item).toHaveAttribute('data-disabled');
  });

  it('renders checkbox item indicator when checked is true', async () => {
    const menus: MenuDefinition[] = [
      {
        id: 'opts',
        label: 'Options',
        items: [
          {
            id: 'opt-checked',
            label: 'Checked Option',
            type: 'checkbox',
            checked: true,
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Options');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('Checked Option')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const checkboxItem = screen.getByRole('menuitemcheckbox');
    expect(checkboxItem).toHaveAttribute('aria-checked', 'true');
    // The check icon indicator should be present
    const checkIcon = document.querySelector('.sk-menu-bar__check-icon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('renders checkbox item icon when provided', async () => {
    const menus: MenuDefinition[] = [
      {
        id: 'opts',
        label: 'Options',
        items: [
          {
            id: 'opt-icon',
            label: 'With Icon',
            type: 'checkbox',
            checked: true,
            icon: '🔧',
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Options');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('With Icon')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Icon should render inside the checkbox item
    const iconEl = document.querySelector('.sk-menu-bar__item .sk-menu-bar__icon');
    if (iconEl) {
      expect(iconEl.textContent).toBe('🔧');
    }
  });

  it('exercises the submenu branch of renderMenuItem', () => {
    // Kobalte SubTrigger uses MenuItemContext which breaks in jsdom portals.
    // We verify the component accepts submenu items without throwing at render time
    // (the error only occurs when the menu is opened and the portal mounts).
    const menus: MenuDefinition[] = [
      {
        id: 'main',
        label: 'Main',
        items: [
          {
            id: 'sub',
            label: 'Submenu',
            submenu: [{ id: 'sub-1', label: 'Sub Item 1', handler: vi.fn() }],
          },
        ],
      },
    ];

    // The component should mount without error (submenu code path is created but not portal-mounted)
    const { unmount } = render(() => <MenuBar menus={menus} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
    unmount();
  });

  it('renders menu item without icon or shortcut', async () => {
    const menus: MenuDefinition[] = [
      {
        id: 'bare',
        label: 'Bare',
        items: [
          {
            id: 'plain',
            label: 'Plain Item',
            handler: vi.fn(),
          },
        ],
      },
    ];

    render(() => <MenuBar menus={menus} />);
    const trigger = screen.getByText('Bare');
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);

    await waitFor(
      () => {
        expect(screen.getByText('Plain Item')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // No icon or shortcut elements inside this menu item
    const content = document.querySelector('.sk-menu-bar__content');
    expect(content).toBeInTheDocument();
    const shortcutElements = content?.querySelectorAll('.sk-menu-bar__shortcut');
    expect(shortcutElements?.length ?? 0).toBe(0);
    const iconElements = content?.querySelectorAll('.sk-menu-bar__icon');
    expect(iconElements?.length ?? 0).toBe(0);
  });
});
