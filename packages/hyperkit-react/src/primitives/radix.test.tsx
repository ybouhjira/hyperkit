import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox/Checkbox';
import { Switch } from './Switch/Switch';
import { Tabs } from './Tabs/Tabs';
import { Dialog } from './Dialog/Dialog';

describe('Checkbox (Radix)', () => {
  it('renders the sk-checkbox contract and mirrors data-checked', () => {
    render(<Checkbox label="Accept" defaultChecked />);
    const root = screen.getByTestId('checkbox-root');
    expect(root).toHaveClass('sk-checkbox', 'sk-checkbox--md');
    expect(root).toHaveAttribute('data-checked');
    expect(root.querySelector('.sk-checkbox__control')).not.toBeNull();
    expect(screen.getByText('Accept')).toHaveClass('sk-checkbox__label');
  });

  it('toggles state and fires onChange', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Opt in" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('checkbox-root')).toHaveAttribute('data-checked');
  });

  it('indeterminate sets the data attribute', () => {
    render(<Checkbox label="Some" indeterminate />);
    expect(screen.getByTestId('checkbox-root')).toHaveAttribute('data-indeterminate');
  });
});

describe('Switch (Radix)', () => {
  it('renders the sk-switch contract and mirrors data-checked on the control', () => {
    render(<Switch label="Dark mode" defaultChecked />);
    const control = screen.getByRole('switch');
    expect(control).toHaveClass('sk-switch__control');
    expect(control).toHaveAttribute('data-checked');
    expect(screen.getByText('Dark mode')).toHaveClass('sk-switch__label');
  });

  it('toggles and fires onChange', () => {
    const onChange = vi.fn();
    render(<Switch label="Auto-save" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('Tabs (Radix)', () => {
  const items = [
    { value: 'a', label: 'Tab A', content: <p>Content A</p> },
    { value: 'b', label: 'Tab B', content: <p>Content B</p> },
  ];

  it('renders the sk-tabs contract with data-selected on the active trigger', () => {
    render(<Tabs items={items} />);
    const triggerA = screen.getByRole('tab', { name: 'Tab A' });
    expect(triggerA).toHaveClass('sk-tabs__trigger');
    expect(triggerA).toHaveAttribute('data-selected');
    expect(screen.getByText('Content A')).toBeVisible();
  });

  it('switching tabs moves data-selected and content', () => {
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tab B' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('data-selected');
    expect(screen.getByText('Content B')).toBeVisible();
  });
});

describe('Dialog (Radix)', () => {
  it('renders title, description, body, and close in the sk-dialog contract', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Confirm" description="Are you sure?">
        <p>Body content</p>
      </Dialog>
    );
    expect(screen.getByText('Confirm')).toHaveClass('sk-dialog__title');
    expect(screen.getByText('Are you sure?')).toHaveClass('sk-dialog__description');
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toHaveClass('sk-dialog__close');
  });

  it('close button fires onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <p>b</p>
      </Dialog>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onOpenChange={() => {}} title="Hidden">
        <p>b</p>
      </Dialog>
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});
