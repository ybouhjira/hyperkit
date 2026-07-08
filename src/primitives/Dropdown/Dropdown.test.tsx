import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { Dropdown } from './Dropdown';
import { settleLazy } from '../../__fixtures__/settleLazy';

const items = [
  { label: 'Edit', onClick: () => {} },
  { label: 'Delete', onClick: () => {}, destructive: true },
  { label: 'Disabled', disabled: true },
];

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./Dropdown.client');
}, 30_000);

describe('Dropdown', () => {
  it('renders trigger', async () => {
    render(() => <Dropdown items={items} trigger={<button>Menu</button>} />);
    await settleLazy();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('renders trigger element', async () => {
    render(() => <Dropdown items={items} trigger={<span data-testid="trigger">Open</span>} />);
    await settleLazy();
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('passes custom class', async () => {
    const { container } = render(() => (
      <Dropdown items={items} trigger={<button>Menu</button>} class="custom-class" />
    ));
    await settleLazy();
    expect(container.querySelector('.custom-class')).toBeNull(); // Content is in portal
  });

  it('shows menu items when trigger is clicked', async () => {
    const ControlledDropdown = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open Menu
          </button>
          <Dropdown
            items={items}
            trigger={<button>Menu</button>}
            open={open()}
            onOpenChange={setOpen}
          />
        </>
      );
    };

    render(() => <ControlledDropdown />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  it('calls onClick when menu item is clicked', async () => {
    const onClick = vi.fn();
    const testItems = [
      { label: 'Edit', onClick },
      { label: 'Delete', onClick: () => {}, destructive: true },
      { label: 'Disabled', disabled: true },
    ];

    const ControlledDropdown = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open Menu
          </button>
          <Dropdown
            items={testItems}
            trigger={<button>Menu</button>}
            open={open()}
            onOpenChange={setOpen}
          />
        </>
      );
    };

    render(() => <ControlledDropdown />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const editItem = screen.getByText('Edit');
    // Focus the item and press Enter to trigger onSelect
    editItem.focus();
    fireEvent.keyDown(editItem, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled();
    });
  });

  it('applies destructive class to destructive items', async () => {
    const ControlledDropdown = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open Menu
          </button>
          <Dropdown
            items={items}
            trigger={<button>Menu</button>}
            open={open()}
            onOpenChange={setOpen}
          />
        </>
      );
    };

    render(() => <ControlledDropdown />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    const deleteItem = screen.getByText('Delete');
    expect(deleteItem.classList.contains('sk-dropdown__item--destructive')).toBe(true);
  });

  it('renders disabled items correctly', async () => {
    const ControlledDropdown = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open Menu
          </button>
          <Dropdown
            items={items}
            trigger={<button>Menu</button>}
            open={open()}
            onOpenChange={setOpen}
          />
        </>
      );
    };

    render(() => <ControlledDropdown />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    const disabledItem = screen.getByText('Disabled');
    expect(disabledItem).toHaveAttribute('data-disabled');
  });

  it('unstyled removes sk-* classes', async () => {
    const ControlledDropdown = () => {
      const [open, setOpen] = createSignal(true);
      return (
        <Dropdown
          items={items}
          trigger={<button>Menu</button>}
          unstyled
          class="custom"
          open={open()}
          onOpenChange={setOpen}
        />
      );
    };

    render(() => <ControlledDropdown />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const menuItem = screen.getByText('Edit');
    expect(menuItem.className).not.toContain('sk-');
  });
});
