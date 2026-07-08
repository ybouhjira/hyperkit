import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { TreeNode } from './TreeNode';
import type { FileItem } from './FileExplorer';

const fileItem: FileItem = {
  name: 'index.ts',
  path: '/project/src/index.ts',
  isDirectory: false,
  size: 1024,
};

const dirItem: FileItem = {
  name: 'src',
  path: '/project/src',
  isDirectory: true,
};

describe('TreeNode', () => {
  it('renders item name', () => {
    render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('shows chevron for directories', () => {
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    expect(screen.getByTestId('chevron-collapsed')).toBeInTheDocument();
  });

  it('does not show chevron for files — only spacer', () => {
    render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    expect(screen.queryByTestId('chevron-collapsed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chevron-expanded')).not.toBeInTheDocument();
  });

  it('applies correct indentation based on depth', () => {
    const { getByTestId } = render(() => (
      <TreeNode
        item={fileItem}
        depth={3}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    const button = getByTestId(`tree-node-${fileItem.name}`);
    // depth=3 → 3 * 18 + 8 = 62px
    expect(button.style.paddingLeft).toBe('62px');
  });

  it('depth 0 has correct indentation', () => {
    const { getByTestId } = render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    const button = getByTestId(`tree-node-${fileItem.name}`);
    // depth=0 → 0 * 18 + 8 = 8px
    expect(button.style.paddingLeft).toBe('8px');
  });

  it('calls onToggleExpand when directory is clicked', async () => {
    const onToggleExpand = vi.fn();
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={onToggleExpand}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    await fireEvent.click(screen.getByTestId(`tree-node-${dirItem.name}`));
    expect(onToggleExpand).toHaveBeenCalledWith(dirItem.path);
  });

  it('does not call onItemClick when directory is clicked', async () => {
    const onItemClick = vi.fn();
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={onItemClick}
        isSelected={false}
      />
    ));
    await fireEvent.click(screen.getByTestId(`tree-node-${dirItem.name}`));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('calls onItemClick when file is clicked', async () => {
    const onItemClick = vi.fn();
    render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={onItemClick}
        isSelected={false}
      />
    ));
    await fireEvent.click(screen.getByTestId(`tree-node-${fileItem.name}`));
    expect(onItemClick).toHaveBeenCalledWith(fileItem, expect.any(MouseEvent));
  });

  it('does not call onToggleExpand when file is clicked', async () => {
    const onToggleExpand = vi.fn();
    render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={onToggleExpand}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    await fireEvent.click(screen.getByTestId(`tree-node-${fileItem.name}`));
    expect(onToggleExpand).not.toHaveBeenCalled();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={false}
        isLoading={true}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    // Spinner replaces the chevron
    expect(screen.queryByTestId('chevron-collapsed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chevron-expanded')).not.toBeInTheDocument();
    // The spinner character should be present
    const button = screen.getByTestId(`tree-node-${dirItem.name}`);
    expect(button.textContent).toContain('⟳');
  });

  it('rotates chevron when isExpanded is true', () => {
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={true}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    expect(screen.getByTestId('chevron-expanded')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-expanded').className).toContain(
      'sk-tree-node__chevron--expanded'
    );
  });

  it('does not rotate chevron when isExpanded is false', () => {
    render(() => (
      <TreeNode
        item={dirItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    const chevron = screen.getByTestId('chevron-collapsed');
    expect(chevron.className).not.toContain('rotate-90');
  });

  it('uses data-testid with item name', () => {
    render(() => (
      <TreeNode
        item={fileItem}
        depth={0}
        isExpanded={false}
        isLoading={false}
        onToggleExpand={vi.fn()}
        onItemClick={vi.fn()}
        isSelected={false}
      />
    ));
    expect(screen.getByTestId('tree-node-index.ts')).toBeInTheDocument();
  });
});
