import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { NavigationMenu } from './NavigationMenu';
import { NavigationProvider } from './NavigationContext';
import { registerContentType, clearContentTypes } from './ContentRegistry';

beforeEach(() => {
  clearContentTypes();
  registerContentType({
    type: 'test-content',
    label: 'Test Content',
    defaultPanel: 'main-panel',
  });
});

function renderMenu(props?: { onClose?: () => void }) {
  const onClose = props?.onClose ?? vi.fn();
  return {
    onClose,
    ...render(() => (
      <NavigationProvider>
        <NavigationMenu
          contentRef={{ type: 'test-content', id: 'item-1', label: 'Test Item' }}
          position={{ x: 100, y: 200 }}
          onClose={onClose}
        />
      </NavigationProvider>
    )),
  };
}

describe('NavigationMenu', () => {
  it('renders the menu container', () => {
    const { container } = renderMenu();

    const menu = container.querySelector('.sk-navigation-menu');
    expect(menu).toBeInTheDocument();
  });

  it('renders Open menu item', () => {
    const { getByText } = renderMenu();

    expect(getByText('Open')).toBeInTheDocument();
  });

  it('renders Open in New Tab menu item', () => {
    const { getByText } = renderMenu();

    expect(getByText('Open in New Tab')).toBeInTheDocument();
  });

  it('renders Open in New Panel menu item', () => {
    const { getByText } = renderMenu();

    expect(getByText('Open in New Panel')).toBeInTheDocument();
  });

  it('positions the menu at the given coordinates', () => {
    const { container } = renderMenu();

    const menu = container.querySelector('.sk-navigation-menu') as HTMLElement;
    expect(menu.style.left).toBe('100px');
    expect(menu.style.top).toBe('200px');
  });

  it('calls onClose when Open is clicked', async () => {
    const onClose = vi.fn();
    const { getByText } = renderMenu({ onClose });

    await fireEvent.click(getByText('Open'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Open in New Tab is clicked', async () => {
    const onClose = vi.fn();
    const { getByText } = renderMenu({ onClose });

    await fireEvent.click(getByText('Open in New Tab'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Open in New Panel is clicked', async () => {
    const onClose = vi.fn();
    const { getByText } = renderMenu({ onClose });

    await fireEvent.click(getByText('Open in New Panel'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders a separator between Open and other items', () => {
    const { container } = renderMenu();

    // Separator renders as a div with height:1px (no space in jsdom serialization)
    const html = container.innerHTML;
    expect(html).toContain('height:1px');
  });

  it('positions the menu with left and top styles', () => {
    const { container } = renderMenu();

    const menu = container.querySelector('.sk-navigation-menu') as HTMLElement;
    // SolidJS only sets the dynamic styles (left/top) as inline style attributes
    expect(menu.getAttribute('style')).toContain('left: 100px');
    expect(menu.getAttribute('style')).toContain('top: 200px');
  });
});
