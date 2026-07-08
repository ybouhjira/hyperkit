import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShortcutsHelp } from './ShortcutsHelp';
import { KeyboardProvider, KeyboardContext } from './KeyboardProvider';
import { useContext, onMount } from 'solid-js';
import type { ShortcutConfig, ShortcutsHelpProps } from './types';

// Helper to wrap component with KeyboardProvider and register shortcuts
const renderWithProvider = (shortcuts: ShortcutConfig[], props: ShortcutsHelpProps) => {
  const TestWrapper = () => {
    const context = useContext(KeyboardContext);

    onMount(() => {
      if (context) {
        shortcuts.forEach((shortcut) => {
          context.register(shortcut);
        });
      }
    });

    return <ShortcutsHelp {...props} />;
  };

  return render(() => (
    <KeyboardProvider>
      <TestWrapper />
    </KeyboardProvider>
  ));
};

describe('ShortcutsHelp', () => {
  const mockShortcuts = [
    {
      key: 'k',
      mod: true,
      handler: vi.fn(),
      description: 'Search',
      category: 'Navigation',
    },
    {
      key: 'n',
      mod: true,
      handler: vi.fn(),
      description: 'New item',
      category: 'Actions',
    },
    {
      key: 'Escape',
      handler: vi.fn(),
      description: 'Close dialog',
      category: 'General',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search shortcuts...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProvider(mockShortcuts, { isOpen: false, onClose: vi.fn() });

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('displays all registered shortcuts grouped by category', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('New item')).toBeInTheDocument();
    expect(screen.getByText('Close dialog')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    renderWithProvider(mockShortcuts, {
      isOpen: true,
      onClose: vi.fn(),
      class: 'custom-class',
    });

    // Dialog renders in portal, so check document.body
    const dialog = document.body.querySelector('.sk-shortcuts-help.custom-class');
    expect(dialog).toBeInTheDocument();
  });

  it('filters shortcuts by search query', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');

    // Initially all shortcuts are visible
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('New item')).toBeInTheDocument();
    expect(screen.getByText('Close dialog')).toBeInTheDocument();

    // Filter by description
    fireEvent.input(searchInput, { target: { value: 'search' } });
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('New item')).not.toBeInTheDocument();
    expect(screen.queryByText('Close dialog')).not.toBeInTheDocument();
  });

  it('shows empty state when no shortcuts match search', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');
    fireEvent.input(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No shortcuts found')).toBeInTheDocument();
  });

  it('renders with BEM CSS classes', () => {
    renderWithProvider(mockShortcuts, {
      isOpen: true,
      onClose: vi.fn(),
    });

    // Dialog renders in portal, so check document.body
    expect(document.body.querySelector('.sk-shortcuts-help')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__search')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__search-input')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__list')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__group')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__category')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__items')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__item')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__description')).toBeInTheDocument();
    expect(document.body.querySelector('.sk-shortcuts-help__kbd')).toBeInTheDocument();
  });

  it('groups shortcuts under General when no category provided', () => {
    const shortcutsWithoutCategory = [
      {
        key: 'h',
        handler: vi.fn(),
        description: 'Help',
      },
    ];

    renderWithProvider(shortcutsWithoutCategory, { isOpen: true, onClose: vi.fn() });

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('filters shortcuts by key name', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');
    fireEvent.input(searchInput, { target: { value: 'escape' } });

    expect(screen.getByText('Close dialog')).toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('New item')).not.toBeInTheDocument();
  });

  it('search is case-insensitive', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');
    fireEvent.input(searchInput, { target: { value: 'SEARCH' } });

    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('filters shortcuts by category name', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');
    fireEvent.input(searchInput, { target: { value: 'navigation' } });

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('New item')).not.toBeInTheDocument();
    expect(screen.queryByText('Close dialog')).not.toBeInTheDocument();
  });

  it('clears search filter when input is cleared', () => {
    renderWithProvider(mockShortcuts, { isOpen: true, onClose: vi.fn() });

    const searchInput = screen.getByPlaceholderText('Search shortcuts...');

    // Apply filter
    fireEvent.input(searchInput, { target: { value: 'search' } });
    expect(screen.queryByText('New item')).not.toBeInTheDocument();

    // Clear filter
    fireEvent.input(searchInput, { target: { value: '' } });
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('New item')).toBeInTheDocument();
    expect(screen.getByText('Close dialog')).toBeInTheDocument();
  });
});
