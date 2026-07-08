import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FileExplorerToolbar } from './FileExplorerToolbar';
import type { ViewMode } from './FileExplorer';

function defaultProps(overrides: Partial<Parameters<typeof FileExplorerToolbar>[0]> = {}) {
  return {
    currentPath: '/project/src',
    canGoUp: false,
    viewMode: 'list' as ViewMode,
    onNavigateUp: vi.fn(),
    onViewModeChange: vi.fn(),
    ...overrides,
  };
}

describe('FileExplorerToolbar', () => {
  it('renders toolbar', () => {
    render(() => <FileExplorerToolbar {...defaultProps()} />);
    expect(screen.getByTestId('file-explorer-toolbar')).toBeInTheDocument();
  });

  it('shows navigate-up button when canGoUp is true', () => {
    render(() => <FileExplorerToolbar {...defaultProps({ canGoUp: true })} />);
    expect(screen.getByTestId('navigate-up')).toBeInTheDocument();
  });

  it('hides navigate-up button when canGoUp is false', () => {
    render(() => <FileExplorerToolbar {...defaultProps({ canGoUp: false })} />);
    expect(screen.queryByTestId('navigate-up')).not.toBeInTheDocument();
  });

  it('calls onNavigateUp when up button clicked', async () => {
    const onNavigateUp = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ canGoUp: true, onNavigateUp })} />);
    await fireEvent.click(screen.getByTestId('navigate-up'));
    expect(onNavigateUp).toHaveBeenCalled();
  });

  it('shows search input when onSearchChange provided', () => {
    const onSearchChange = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onSearchChange })} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('hides search input when onSearchChange not provided', () => {
    render(() => <FileExplorerToolbar {...defaultProps()} />);
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', async () => {
    const onSearchChange = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onSearchChange, searchQuery: '' })} />);
    const input = screen.getByTestId('search-input');
    await fireEvent.input(input, { target: { value: 'test' } });
    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('shows searchQuery value in input', () => {
    const onSearchChange = vi.fn();
    render(() => (
      <FileExplorerToolbar {...defaultProps({ onSearchChange, searchQuery: 'hello' })} />
    ));
    const input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('defaults searchQuery to empty string when undefined', () => {
    const onSearchChange = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onSearchChange })} />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('shows refresh button when onRefresh provided', () => {
    const onRefresh = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onRefresh })} />);
    expect(screen.getByTitle('Refresh')).toBeInTheDocument();
  });

  it('hides refresh button when onRefresh not provided', () => {
    render(() => <FileExplorerToolbar {...defaultProps()} />);
    expect(screen.queryByTitle('Refresh')).not.toBeInTheDocument();
  });

  it('calls onRefresh when refresh button clicked', async () => {
    const onRefresh = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onRefresh })} />);
    await fireEvent.click(screen.getByTitle('Refresh'));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('shows create folder button when onCreateFolder provided', () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    expect(screen.getByTestId('create-folder-btn')).toBeInTheDocument();
  });

  it('hides create folder button when onCreateFolder not provided', () => {
    render(() => <FileExplorerToolbar {...defaultProps()} />);
    expect(screen.queryByTestId('create-folder-btn')).not.toBeInTheDocument();
  });

  it('shows folder name input when create button clicked', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));
    expect(screen.getByTestId('new-folder-input')).toBeInTheDocument();
  });

  it('calls onCreateFolder on Enter with name', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: 'new-dir' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCreateFolder).toHaveBeenCalledWith('new-dir');
  });

  it('trims folder name before creating', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: '  my-folder  ' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCreateFolder).toHaveBeenCalledWith('my-folder');
  });

  it('does not call onCreateFolder for empty name', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: '   ' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCreateFolder).not.toHaveBeenCalled();
  });

  it('cancels folder creation on Escape', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: 'test' } });
    await fireEvent.keyDown(input, { key: 'Escape' });

    // Should go back to showing the create button
    expect(screen.getByTestId('create-folder-btn')).toBeInTheDocument();
  });

  it('creates folder on blur with valid name', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: 'blur-dir' } });
    await fireEvent.blur(input);

    expect(onCreateFolder).toHaveBeenCalledWith('blur-dir');
  });

  it('resets input after successful creation', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: 'new-dir' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    // Should show create button again after successful creation
    expect(screen.getByTestId('create-folder-btn')).toBeInTheDocument();
  });

  it('handles other key presses without creating folder', async () => {
    const onCreateFolder = vi.fn();
    render(() => <FileExplorerToolbar {...defaultProps({ onCreateFolder })} />);
    await fireEvent.click(screen.getByTestId('create-folder-btn'));

    const input = screen.getByTestId('new-folder-input');
    await fireEvent.input(input, { target: { value: 'test' } });
    await fireEvent.keyDown(input, { key: 'a' });

    // Should still be in input mode, not created
    expect(onCreateFolder).not.toHaveBeenCalled();
    expect(screen.getByTestId('new-folder-input')).toBeInTheDocument();
  });
});
