import { render, screen, waitFor, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { Select } from './Select';
import { settleLazy } from '../../__fixtures__/settleLazy';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./Select.client');
}, 30_000);

describe('Select', () => {
  it('renders with placeholder', async () => {
    render(() => <Select options={options} placeholder="Pick one" />);
    await settleLazy();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders trigger', async () => {
    render(() => <Select options={options} />);
    await settleLazy();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as disabled', async () => {
    render(() => <Select options={options} disabled />);
    await settleLazy();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows selected value', async () => {
    render(() => <Select options={options} value="a" />);
    await settleLazy();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('shows options when opened', async () => {
    const ControlledSelect = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open
          </button>
          <Select options={options} open={open()} onOpenChange={setOpen} />
        </>
      );
    };

    render(() => <ControlledSelect />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      const optionsInList = screen.getAllByRole('option');
      expect(optionsInList).toHaveLength(3);

      // Verify labels are in the listbox
      expect(optionsInList[0]).toHaveTextContent('Option A');
      expect(optionsInList[1]).toHaveTextContent('Option B');
      expect(optionsInList[2]).toHaveTextContent('Option C');
    });
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();

    const ControlledSelect = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open
          </button>
          <Select options={options} open={open()} onOpenChange={setOpen} onChange={onChange} />
        </>
      );
    };

    render(() => <ControlledSelect />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const optionsInList = screen.getAllByRole('option');
    const optionB = optionsInList.find((opt) => opt.textContent === 'Option B');

    expect(optionB).toBeTruthy();

    // Use keyboard navigation to select
    optionB!.focus();
    fireEvent.keyDown(optionB!, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('b');
    });
  });

  it('renders disabled options correctly', async () => {
    const ControlledSelect = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open
          </button>
          <Select options={options} open={open()} onOpenChange={setOpen} />
        </>
      );
    };

    render(() => <ControlledSelect />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const optionsInList = screen.getAllByRole('option');
    const optionC = optionsInList.find((opt) => opt.textContent === 'Option C');

    expect(optionC).toBeTruthy();
    expect(optionC).toHaveAttribute('data-disabled');
  });

  it('shows check indicator for selected item', async () => {
    const ControlledSelect = () => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button data-testid="controller" onClick={() => setOpen(true)}>
            Open
          </button>
          <Select options={options} value="a" open={open()} onOpenChange={setOpen} />
        </>
      );
    };

    render(() => <ControlledSelect />);

    const controller = screen.getByTestId('controller');
    fireEvent.click(controller);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const optionsInList = screen.getAllByRole('option');
    const optionA = optionsInList.find((opt) => opt.textContent === 'Option A');

    expect(optionA).toBeTruthy();

    const checkIndicator = optionA?.querySelector('.sk-select__item-check');
    expect(checkIndicator).toBeInTheDocument();
  });

  it('unstyled removes sk-* classes', async () => {
    render(() => <Select options={options} unstyled class="custom" />);
    await settleLazy();
    const trigger = screen.getByRole('button');
    expect(trigger.className).not.toContain('sk-');
    expect(trigger.className).toContain('custom');
  });
});
