import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { TreeView } from './TreeView';
import type { FileItem } from './FileExplorer';

const srcDir: FileItem = { name: 'src', path: '/project/src', isDirectory: true };
const docsDir: FileItem = { name: 'docs', path: '/project/docs', isDirectory: true };
const readmeFile: FileItem = {
  name: 'README.md',
  path: '/project/README.md',
  isDirectory: false,
  size: 1024,
};
const packageFile: FileItem = {
  name: 'package.json',
  path: '/project/package.json',
  isDirectory: false,
  size: 512,
};

const items: FileItem[] = [readmeFile, srcDir, packageFile, docsDir];

describe('TreeView', () => {
  it('renders all items', () => {
    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    expect(screen.getByTestId('tree-node-src')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-docs')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-README.md')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-package.json')).toBeInTheDocument();
  });

  it('sorts directories first, then alphabetically within each group', () => {
    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    const nodes = screen.getAllByTestId(/^tree-node-/);
    const names = nodes.map((n) => n.getAttribute('data-testid')?.replace('tree-node-', ''));
    // directories first (docs, src alphabetically), then files sorted by localeCompare
    expect(names[0]).toBe('docs');
    expect(names[1]).toBe('src');
    // Files sorted by localeCompare: package.json < README.md (locale-aware)
    const fileNames = names.slice(2);
    expect(fileNames).toEqual([...fileNames].sort((a, b) => a!.localeCompare(b!)));
    // Verify both files appear somewhere in positions 2 and 3
    expect(fileNames).toContain('README.md');
    expect(fileNames).toContain('package.json');
  });

  it('shows children of expanded directories from childrenCache', () => {
    const indexFile: FileItem = {
      name: 'index.ts',
      path: '/project/src/index.ts',
      isDirectory: false,
    };
    const childrenCache = new Map<string, FileItem[]>([[srcDir.path, [indexFile]]]);

    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set([srcDir.path])}
        childrenCache={childrenCache}
        selectedPaths={new Set()}
      />
    ));
    expect(screen.getByTestId('tree-node-index.ts')).toBeInTheDocument();
  });

  it('does not show children of collapsed directories', () => {
    const indexFile: FileItem = {
      name: 'index.ts',
      path: '/project/src/index.ts',
      isDirectory: false,
    };
    const childrenCache = new Map<string, FileItem[]>([[srcDir.path, [indexFile]]]);

    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        childrenCache={childrenCache}
        selectedPaths={new Set()}
      />
    ));
    expect(screen.queryByTestId('tree-node-index.ts')).not.toBeInTheDocument();
  });

  it('does not show children when path is expanded but not in childrenCache', () => {
    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set([srcDir.path])}
        childrenCache={new Map()}
        selectedPaths={new Set()}
      />
    ));
    // No extra tree-nodes beyond the top-level items
    const nodes = screen.getAllByTestId(/^tree-node-/);
    expect(nodes).toHaveLength(4);
  });

  it('calls onToggleExpand when directory is clicked', async () => {
    const onToggleExpand = vi.fn();
    render(() => (
      <TreeView
        items={[srcDir]}
        onItemClick={vi.fn()}
        onToggleExpand={onToggleExpand}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    await fireEvent.click(screen.getByTestId('tree-node-src'));
    expect(onToggleExpand).toHaveBeenCalledWith(srcDir.path);
  });

  it('calls onItemClick when file is clicked', async () => {
    const onItemClick = vi.fn();
    render(() => (
      <TreeView
        items={[readmeFile]}
        onItemClick={onItemClick}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    await fireEvent.click(screen.getByTestId('tree-node-README.md'));
    expect(onItemClick).toHaveBeenCalledWith(readmeFile, expect.any(MouseEvent));
  });

  it('handles empty items array', () => {
    render(() => (
      <TreeView
        items={[]}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    expect(screen.getByTestId('tree-view')).toBeInTheDocument();
    expect(screen.queryAllByTestId(/^tree-node-/)).toHaveLength(0);
  });

  it('increments depth for nested children', () => {
    const indexFile: FileItem = {
      name: 'index.ts',
      path: '/project/src/index.ts',
      isDirectory: false,
    };
    const childrenCache = new Map<string, FileItem[]>([[srcDir.path, [indexFile]]]);

    render(() => (
      <TreeView
        items={[srcDir]}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set([srcDir.path])}
        childrenCache={childrenCache}
        depth={0}
        selectedPaths={new Set()}
      />
    ));

    const parentNode = screen.getByTestId('tree-node-src');
    const childNode = screen.getByTestId('tree-node-index.ts');

    // parent depth=0 → 0*18+8 = 8px
    expect(parentNode.style.paddingLeft).toBe('8px');
    // child depth=1 → 1*18+8 = 26px
    expect(childNode.style.paddingLeft).toBe('26px');
  });

  it('renders tree-view container element', () => {
    render(() => (
      <TreeView
        items={items}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        selectedPaths={new Set()}
      />
    ));
    expect(screen.getByTestId('tree-view')).toBeInTheDocument();
  });

  it('passes loadingPaths to child TreeNodes', () => {
    render(() => (
      <TreeView
        items={[srcDir]}
        onItemClick={vi.fn()}
        onToggleExpand={vi.fn()}
        expandedPaths={new Set()}
        loadingPaths={new Set([srcDir.path])}
        selectedPaths={new Set()}
      />
    ));
    // When loading, spinner appears instead of chevron
    const button = screen.getByTestId('tree-node-src');
    expect(button.textContent).toContain('⟳');
  });
});
