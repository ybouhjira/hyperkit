import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FilePicker } from './FilePicker';
import type { FileItem } from './types';

const items: FileItem[] = [
  { name: 'src', path: '/src', isDirectory: true },
  { name: 'README.md', path: '/README.md', isDirectory: false },
  { name: 'package.json', path: '/package.json', isDirectory: false },
];

describe('FilePicker', () => {
  it('renders nothing when closed', () => {
    render(() => <FilePicker open={false} onClose={vi.fn()} onPick={vi.fn()} items={items} />);
    expect(screen.queryByTestId('file-picker')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(() => <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={items} />);
    expect(screen.getByTestId('file-picker')).toBeInTheDocument();
  });

  it('shows default title', () => {
    render(() => <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={items} />);
    expect(screen.getByText('Choose a file')).toBeInTheDocument();
  });

  it('shows custom title', () => {
    render(() => (
      <FilePicker
        open={true}
        onClose={vi.fn()}
        onPick={vi.fn()}
        items={items}
        title="Pick an image"
      />
    ));
    expect(screen.getByText('Pick an image')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(() => <FilePicker open={true} onClose={onClose} onPick={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-picker-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(() => <FilePicker open={true} onClose={onClose} onPick={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-picker-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn();
    render(() => <FilePicker open={true} onClose={onClose} onPick={vi.fn()} items={items} />);
    await fireEvent.click(screen.getByTestId('file-picker-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Choose button is disabled when nothing is selected', () => {
    render(() => <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={items} />);
    const chooseBtn = screen.getByTestId('file-picker-choose');
    expect(chooseBtn).toBeDisabled();
  });

  it('shows loading state in embedded explorer', () => {
    render(() => (
      <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={[]} loading={true} />
    ));
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('filters items when filter prop provided', () => {
    const onlyMd = (item: FileItem) => item.name.endsWith('.md');
    render(() => (
      <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={items} filter={onlyMd} />
    ));
    // README.md should show, package.json should not
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.queryByText('package.json')).not.toBeInTheDocument();
    // directories always show
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  it('is a dialog with aria-modal', () => {
    render(() => <FilePicker open={true} onClose={vi.fn()} onPick={vi.fn()} items={items} />);
    const dialog = screen.getByTestId('file-picker');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
