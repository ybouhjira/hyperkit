import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FileExplorer } from './FileExplorer';

const items = [
  { name: 'src', path: '/project/src', isDirectory: true },
  { name: 'README.md', path: '/project/README.md', isDirectory: false, size: 1024 },
  { name: 'package.json', path: '/project/package.json', isDirectory: false, size: 512 },
  { name: 'docs', path: '/project/docs', isDirectory: true },
];

describe('FileExplorer', () => {
  it('renders file items', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('shows current path', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    expect(screen.getByTestId('path-breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('project')).toBeInTheDocument();
  });

  it('sorts directories first', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    const allItems = screen.getByTestId('file-list').querySelectorAll('[data-testid^="entry-"]');
    // Directories should come first (docs, src), then files
    expect(allItems[0].textContent).toContain('docs');
    expect(allItems[1].textContent).toContain('src');
  });

  it('calls onNavigate for directories', async () => {
    const onNavigate = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project" onNavigate={onNavigate} />);
    await fireEvent.click(screen.getByText('src'));
    expect(onNavigate).toHaveBeenCalledWith('/project/src');
  });

  it('calls onSelect for files', async () => {
    const onSelect = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project" onSelect={onSelect} />);
    await fireEvent.click(screen.getByText('README.md'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'README.md' }));
  });

  it('shows loading state', () => {
    render(() => <FileExplorer items={[]} currentPath="/project" loading />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(() => <FileExplorer items={[]} currentPath="/project" />);
    expect(screen.getByTestId('empty-dir')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <FileExplorer items={[]} currentPath="/" class="h-96" />);
    expect(screen.getByTestId('file-explorer').className).toContain('h-96');
  });

  it('shows toolbar by default', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    expect(screen.getByTestId('file-explorer-toolbar')).toBeInTheDocument();
  });

  it('hides toolbar when showToolbar is false', () => {
    render(() => <FileExplorer items={items} currentPath="/project" showToolbar={false} />);
    expect(screen.queryByTestId('file-explorer-toolbar')).not.toBeInTheDocument();
  });

  it('shows current path in toolbar', () => {
    render(() => <FileExplorer items={items} currentPath="/my/path" />);
    const breadcrumb = screen.getByTestId('path-breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
    expect(screen.getByText('path')).toBeInTheDocument();
  });

  it('renders icons view when viewMode is icons', () => {
    render(() => <FileExplorer items={items} currentPath="/project" viewMode="icons" />);
    expect(screen.getByTestId('icons-view')).toBeInTheDocument();
    expect(
      screen.getByTestId('icons-view').querySelectorAll('[data-testid^="entry-"]').length
    ).toBe(items.length);
  });

  it('renders gallery view when viewMode is gallery', () => {
    render(() => <FileExplorer items={items} currentPath="/project" viewMode="gallery" />);
    expect(screen.getByTestId('gallery-view')).toBeInTheDocument();
    expect(
      screen.getByTestId('gallery-view').querySelectorAll('[data-testid^="entry-"]').length
    ).toBe(items.length);
  });

  it('renders tree view when viewMode is tree', () => {
    const expandedPaths = new Set(['/project/src']);
    const childrenCache = new Map([
      ['/project/src', [{ name: 'index.ts', path: '/project/src/index.ts', isDirectory: false }]],
    ]);
    render(() => (
      <FileExplorer
        items={items}
        currentPath="/project"
        viewMode="tree"
        expandedPaths={expandedPaths}
        childrenCache={childrenCache}
      />
    ));
    expect(screen.getAllByTestId('tree-view').length).toBeGreaterThan(0);
  });

  // ── Selection ───────────────────────────────────────────────────────────────

  it('calls onSelectionChange on file click', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));
    await fireEvent.click(screen.getByText('README.md'));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['/project/README.md']));
  });

  it('multi-select with ctrl+click', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));
    // First file
    await fireEvent.click(screen.getByText('README.md'));
    // Ctrl+click second file
    await fireEvent.click(screen.getByText('package.json'), { ctrlKey: true });
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(['/project/README.md', '/project/package.json'])
    );
  });

  it('ctrl+click deselects already selected file', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));
    await fireEvent.click(screen.getByText('README.md'));
    // Ctrl+click same file to deselect
    await fireEvent.click(screen.getByText('README.md'), { ctrlKey: true });
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([]));
  });

  // ── Status bar ──────────────────────────────────────────────────────────────

  it('shows status bar with item count', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    const statusbar = screen.getByTestId('file-explorer-statusbar');
    expect(statusbar).toBeInTheDocument();
    expect(statusbar.textContent).toContain('4 items');
  });

  it('shows singular "item" for one item', () => {
    const singleItem = [{ name: 'file.txt', path: '/file.txt', isDirectory: false }];
    render(() => <FileExplorer items={singleItem} currentPath="/" />);
    const statusbar = screen.getByTestId('file-explorer-statusbar');
    expect(statusbar.textContent).toContain('1 item');
  });

  it('shows selected count in status bar', () => {
    const selectedPaths = new Set(['/project/README.md']);
    render(() => (
      <FileExplorer items={items} currentPath="/project" selectedPaths={selectedPaths} />
    ));
    const statusbar = screen.getByTestId('file-explorer-statusbar');
    expect(statusbar.textContent).toContain('1 selected');
  });

  // ── Search/filter ───────────────────────────────────────────────────────────

  it('filters items by search query', async () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);

    const searchInput = screen.getByPlaceholderText('Filter...');
    await fireEvent.input(searchInput, { target: { value: 'README' } });

    // Only README.md should be visible
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.queryByText('package.json')).not.toBeInTheDocument();
    expect(screen.queryByText('src')).not.toBeInTheDocument();
  });

  it('shows "No items match your search" for empty results', async () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);

    const searchInput = screen.getByPlaceholderText('Filter...');
    await fireEvent.input(searchInput, { target: { value: 'zzzznonexistent' } });

    expect(screen.getByText('No items match your search')).toBeInTheDocument();
  });

  it('shows "Filtered" in status bar when search is active', async () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);

    const searchInput = screen.getByPlaceholderText('Filter...');
    await fireEvent.input(searchInput, { target: { value: 'README' } });

    const statusbar = screen.getByTestId('file-explorer-statusbar');
    expect(statusbar.textContent).toContain('Filtered');
  });

  // ── Keyboard navigation ────────────────────────────────────────────────────

  it('ArrowDown selects the first item', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));

    const explorer = screen.getByTestId('file-explorer');
    await fireEvent.keyDown(explorer, { key: 'ArrowDown' });

    // First sorted item is 'docs' (directory first, alphabetical)
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['/project/docs']));
  });

  it('Enter on directory calls onNavigate', async () => {
    const onNavigate = vi.fn();
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer
        items={items}
        currentPath="/project"
        onNavigate={onNavigate}
        onSelectionChange={onSelectionChange}
      />
    ));

    const explorer = screen.getByTestId('file-explorer');
    // Move to first item (docs directory)
    await fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    // Press Enter to navigate into it
    await fireEvent.keyDown(explorer, { key: 'Enter' });

    expect(onNavigate).toHaveBeenCalledWith('/project/docs');
  });

  it('Backspace calls onBack', async () => {
    const onBack = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project" onBack={onBack} />);

    const explorer = screen.getByTestId('file-explorer');
    await fireEvent.keyDown(explorer, { key: 'Backspace' });

    expect(onBack).toHaveBeenCalled();
  });

  it('Ctrl+A selects all items', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));

    const explorer = screen.getByTestId('file-explorer');
    await fireEvent.keyDown(explorer, { key: 'a', ctrlKey: true });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(items.map((i) => i.path)));
  });

  it('Escape clears selection', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));

    const explorer = screen.getByTestId('file-explorer');
    // Select something first
    await fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    // Then escape
    await fireEvent.keyDown(explorer, { key: 'Escape' });

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
  });

  // ── Sort ─────────────────────────────────────────────────────────────────────

  it('sorts by name ascending by default (dirs first)', () => {
    render(() => <FileExplorer items={items} currentPath="/project" />);
    const entries = screen.getByTestId('file-list').querySelectorAll('[data-testid^="entry-"]');
    // Directories first: docs, src; then files: package.json, README.md
    expect(entries[0].textContent).toContain('docs');
    expect(entries[1].textContent).toContain('src');
    expect(entries[2].textContent).toContain('package.json');
    expect(entries[3].textContent).toContain('README.md');
  });

  it('passes controlled sort props', () => {
    const onSortChange = vi.fn();
    render(() => (
      <FileExplorer
        items={items}
        currentPath="/project"
        sortField="size"
        sortDirection="desc"
        onSortChange={onSortChange}
      />
    ));
    // Should render without error
    expect(screen.getByTestId('file-list')).toBeInTheDocument();
  });

  // ── Sort interactions ──────────────────────────────────────────────────────

  it('toggles sort direction when clicking the same column header', async () => {
    const onSortChange = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project" onSortChange={onSortChange} />);

    // Default sort is by 'name' asc. Click the Name column header to toggle to desc.
    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith('name', 'desc');
  });

  it('sets new sort field when clicking a different column header', async () => {
    const onSortChange = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project" onSortChange={onSortChange} />);

    // Default sort is by 'name'. Click 'Size' header to sort by size.
    const sizeHeader = screen.getByText('Size');
    await fireEvent.click(sizeHeader);

    expect(onSortChange).toHaveBeenCalledWith('size', 'asc');
  });

  // ── Toolbar navigation ────────────────────────────────────────────────────

  it('calls onBack when navigate-up button is clicked in toolbar', async () => {
    const onBack = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project/src" onBack={onBack} />);

    const upBtn = screen.getByTestId('navigate-up');
    await fireEvent.click(upBtn);

    expect(onBack).toHaveBeenCalled();
  });

  it('calls onNavigate when breadcrumb segment is clicked', async () => {
    const onNavigate = vi.fn();
    render(() => <FileExplorer items={items} currentPath="/project/src" onNavigate={onNavigate} />);

    // The breadcrumb shows the root '/' plus path segments (project, src)
    // Click 'project' segment to navigate to /project
    const projectCrumb = screen.getByText('project');
    await fireEvent.click(projectCrumb);

    expect(onNavigate).toHaveBeenCalledWith('/project');
  });

  // ── Shift+click range selection ───────────────────────────────────────────

  it('shift+click selects a range of items', async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <FileExplorer items={items} currentPath="/project" onSelectionChange={onSelectionChange} />
    ));

    // Click first file (README.md is 3rd in sorted order: docs, src, package.json, README.md)
    await fireEvent.click(screen.getByText('package.json'));
    // Shift+click on README.md to range-select
    await fireEvent.click(screen.getByText('README.md'), { shiftKey: true });

    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(['/project/package.json', '/project/README.md'])
    );
  });

  // ── Hides status bar ────────────────────────────────────────────────────────

  it('hides status bar when showStatusBar is false', () => {
    render(() => <FileExplorer items={items} currentPath="/project" showStatusBar={false} />);
    expect(screen.queryByTestId('file-explorer-statusbar')).not.toBeInTheDocument();
  });

  // ── Enter on file calls onSelect ────────────────────────────────────────────

  it('Enter on file calls onSelect', async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    // Only files (no dirs) so ArrowDown lands on a file
    const fileItems = [{ name: 'README.md', path: '/project/README.md', isDirectory: false }];
    render(() => (
      <FileExplorer
        items={fileItems}
        currentPath="/project"
        onSelect={onSelect}
        onSelectionChange={onSelectionChange}
      />
    ));

    const explorer = screen.getByTestId('file-explorer');
    await fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    await fireEvent.keyDown(explorer, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'README.md' }));
  });
});
