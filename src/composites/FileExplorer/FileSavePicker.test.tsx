import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FileSavePicker } from './FileSavePicker';
import type { FileItem } from './types';

const items: FileItem[] = [
  { name: 'src', path: '/src', isDirectory: true },
  { name: 'README.md', path: '/README.md', isDirectory: false },
];

describe('FileSavePicker', () => {
  it('renders nothing when closed', () => {
    render(() => <FileSavePicker open={false} onClose={vi.fn()} onSave={vi.fn()} items={items} />);
    expect(screen.queryByTestId('file-save-picker')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(() => <FileSavePicker open={true} onClose={vi.fn()} onSave={vi.fn()} items={items} />);
    expect(screen.getByTestId('file-save-picker')).toBeInTheDocument();
  });

  it('shows default title', () => {
    render(() => <FileSavePicker open={true} onClose={vi.fn()} onSave={vi.fn()} items={items} />);
    expect(screen.getByText('Save file')).toBeInTheDocument();
  });

  it('shows custom title', () => {
    render(() => (
      <FileSavePicker
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        items={items}
        title="Export CSV"
      />
    ));
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('pre-fills filename from defaultFileName', () => {
    render(() => (
      <FileSavePicker
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        items={items}
        defaultFileName="export.csv"
      />
    ));
    const input = screen.getByTestId('file-save-name-input') as HTMLInputElement;
    expect(input.value).toBe('export.csv');
  });

  it('calls onClose when Cancel clicked', async () => {
    const onClose = vi.fn();
    render(() => <FileSavePicker open={true} onClose={onClose} onSave={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-save-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(() => <FileSavePicker open={true} onClose={onClose} onSave={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-save-picker-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Save button is disabled when filename is empty', () => {
    render(() => <FileSavePicker open={true} onClose={vi.fn()} onSave={vi.fn()} items={items} />);
    expect(screen.getByTestId('file-save-confirm')).toBeDisabled();
  });

  it('calls onSave and onClose when filename set and Save clicked', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(() => (
      <FileSavePicker
        open={true}
        onClose={onClose}
        onSave={onSave}
        items={items}
        defaultPath="/"
        defaultFileName="output.csv"
      />
    ));
    await fireEvent.click(screen.getByTestId('file-save-confirm'));
    expect(onSave).toHaveBeenCalledWith('/', 'output.csv');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows overwrite warning when existing file name entered', async () => {
    render(() => (
      <FileSavePicker
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        items={items}
        defaultFileName="README.md"
      />
    ));
    // First Save click triggers warning
    await fireEvent.click(screen.getByTestId('file-save-confirm'));
    expect(screen.getByTestId('overwrite-warning')).toBeInTheDocument();
  });

  it('calls onSave on second click after overwrite warning', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(() => (
      <FileSavePicker
        open={true}
        onClose={onClose}
        onSave={onSave}
        items={items}
        defaultPath="/"
        defaultFileName="README.md"
      />
    ));
    // First click: warning
    await fireEvent.click(screen.getByTestId('file-save-confirm'));
    expect(onSave).not.toHaveBeenCalled();
    // Second click: confirms
    await fireEvent.click(screen.getByTestId('file-save-confirm'));
    expect(onSave).toHaveBeenCalledWith('/', 'README.md');
  });

  it('accepts backdrop click to close', async () => {
    const onClose = vi.fn();
    render(() => <FileSavePicker open={true} onClose={onClose} onSave={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-save-picker-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('pressing Enter in filename input triggers save', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(() => (
      <FileSavePicker
        open={true}
        onClose={onClose}
        onSave={onSave}
        items={items}
        defaultFileName="new-file.txt"
      />
    ));
    const input = screen.getByTestId('file-save-name-input');
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalled();
  });

  it('pressing Escape in filename input closes dialog', async () => {
    const onClose = vi.fn();
    render(() => (
      <FileSavePicker
        open={true}
        onClose={onClose}
        onSave={vi.fn()}
        items={items}
        defaultFileName="new.txt"
      />
    ));
    const input = screen.getByTestId('file-save-name-input');
    await fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
