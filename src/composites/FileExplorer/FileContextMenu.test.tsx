import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FileContextMenu } from './FileContextMenu';
import type { FileItem } from './types';

const file: FileItem = { name: 'README.md', path: '/README.md', isDirectory: false };

function renderMenu(overrides: Partial<Parameters<typeof FileContextMenu>[0]> = {}) {
  return render(() => (
    <FileContextMenu item={file} x={100} y={200} open={true} onClose={vi.fn()} {...overrides} />
  ));
}

describe('FileContextMenu', () => {
  it('renders nothing when closed', () => {
    render(() => <FileContextMenu item={file} x={0} y={0} open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('file-context-menu')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    renderMenu();
    expect(screen.getByTestId('file-context-menu')).toBeInTheDocument();
  });

  it('positions the menu with inline styles', () => {
    renderMenu({ x: 100, y: 200 });
    const menu = screen.getByTestId('file-context-menu');
    expect(menu).toHaveStyle({ left: '100px', top: '200px' });
  });

  it('shows Open action when onOpen provided', () => {
    renderMenu({ onOpen: vi.fn() });
    expect(screen.getByTestId('ctx-action-open')).toBeInTheDocument();
  });

  it('calls onOpen when Open clicked', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    renderMenu({ onOpen, onClose });
    await fireEvent.click(screen.getByTestId('ctx-action-open'));
    expect(onOpen).toHaveBeenCalledWith(file);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Rename action when onRename provided', () => {
    renderMenu({ onRename: vi.fn() });
    expect(screen.getByTestId('ctx-action-rename')).toBeInTheDocument();
  });

  it('calls onRename when Rename clicked', async () => {
    const onRename = vi.fn();
    const onClose = vi.fn();
    renderMenu({ onRename, onClose });
    await fireEvent.click(screen.getByTestId('ctx-action-rename'));
    expect(onRename).toHaveBeenCalledWith(file);
  });

  it('shows Delete action with danger style when onDelete provided', () => {
    renderMenu({ onDelete: vi.fn() });
    const btn = screen.getByTestId('ctx-action-delete');
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('danger');
  });

  it('calls onDelete when delete clicked', async () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    renderMenu({ onDelete, onClose });
    await fireEvent.click(screen.getByTestId('ctx-action-delete'));
    expect(onDelete).toHaveBeenCalledWith(file);
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn();
    renderMenu({ onClose });
    await fireEvent.click(screen.getByTestId('file-context-menu-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Copy Path action when onCopyPath provided', () => {
    renderMenu({ onCopyPath: vi.fn() });
    expect(screen.getByTestId('ctx-action-copy-path')).toBeInTheDocument();
  });

  it('shows Show Info action when onShowInfo provided', () => {
    renderMenu({ onShowInfo: vi.fn() });
    expect(screen.getByTestId('ctx-action-info')).toBeInTheDocument();
  });

  it('renders extra actions', () => {
    renderMenu({
      extraActions: [{ id: 'custom-act', label: 'Custom Action' }],
      onAction: vi.fn(),
    });
    expect(screen.getByTestId('ctx-action-custom-act')).toBeInTheDocument();
  });

  it('calls onAction for extra actions', async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    renderMenu({
      extraActions: [{ id: 'my-action', label: 'My Action' }],
      onAction,
      onClose,
    });
    await fireEvent.click(screen.getByTestId('ctx-action-my-action'));
    expect(onAction).toHaveBeenCalledWith('my-action', file);
  });

  it('shows separator when both open and delete are provided', () => {
    renderMenu({ onOpen: vi.fn(), onDelete: vi.fn() });
    expect(screen.getAllByTestId('context-menu-separator').length).toBeGreaterThan(0);
  });
});
