import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

describe('Breadcrumb', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', icon: 'home', onClick: vi.fn() },
    { label: 'Documents', onClick: vi.fn() },
    { label: 'Current Page' },
  ];

  it('renders correctly with items', () => {
    render(() => <Breadcrumb items={mockItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('applies correct BEM CSS classes', () => {
    render(() => <Breadcrumb items={mockItems} />);

    expect(document.querySelector('.sk-breadcrumb')).toBeInTheDocument();
    expect(document.querySelector('.sk-breadcrumb-list')).toBeInTheDocument();
    expect(document.querySelectorAll('.sk-breadcrumb-item')).toHaveLength(3);
    expect(document.querySelectorAll('.sk-breadcrumb-link')).toHaveLength(3);
  });

  it('renders default separator', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} />);

    const separators = container.querySelectorAll('.sk-breadcrumb-separator');
    expect(separators).toHaveLength(2); // 3 items = 2 separators
    separators.forEach((separator) => {
      expect(separator.textContent).toBe('/');
    });
  });

  it('renders custom separator', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} separator=">" />);

    const separators = container.querySelectorAll('.sk-breadcrumb-separator');
    separators.forEach((separator) => {
      expect(separator.textContent).toBe('>');
    });
  });

  it('marks last item as current', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} />);

    const links = container.querySelectorAll('.sk-breadcrumb-link');
    const lastLink = links[links.length - 1];

    expect(lastLink).toHaveClass('current');
    expect(lastLink).toHaveAttribute('aria-current', 'page');
  });

  it('calls onClick for non-current items', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [{ label: 'Home', onClick }, { label: 'Current' }];

    render(() => <Breadcrumb items={items} />);

    // Kobalte renders links, find by text and click
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for current (last) item', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [{ label: 'Home' }, { label: 'Current', onClick }];

    render(() => <Breadcrumb items={items} />);

    const currentLink = screen.getByText('Current');
    fireEvent.click(currentLink);

    // Last item should not call onClick
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables last item', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} />);

    // Last item has data-disabled attribute
    const lastLink = container.querySelector('.sk-breadcrumb-link.current');
    expect(lastLink).toHaveAttribute('data-disabled');
  });

  it('does not disable non-last items with onClick', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} />);

    // First item should not be disabled
    const links = container.querySelectorAll('.sk-breadcrumb-link');
    const firstLink = links[0];
    expect(firstLink).not.toHaveAttribute('data-disabled');
  });

  it('renders icons when provided', () => {
    render(() => <Breadcrumb items={mockItems} />);

    // Home has an icon
    const homeLabel = screen.getByText('Home');
    const homeItem = homeLabel.closest('.sk-breadcrumb-link');
    expect(homeItem?.querySelector('.sk-icon')).toBeInTheDocument();
  });

  it('renders without icons when not provided', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home' }, { label: 'Documents' }];

    render(() => <Breadcrumb items={items} />);

    const homeLabel = screen.getByText('Home');
    const homeItem = homeLabel.closest('.sk-breadcrumb-link');
    expect(homeItem?.querySelector('.sk-icon')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} class="custom-class" />);

    expect(container.querySelector('.sk-breadcrumb.custom-class')).toBeInTheDocument();
  });

  it('renders single item without separator', () => {
    const items: BreadcrumbItem[] = [{ label: 'Only Item' }];
    const { container } = render(() => <Breadcrumb items={items} />);

    expect(container.querySelectorAll('.sk-breadcrumb-separator')).toHaveLength(0);
  });

  it('handles empty items array', () => {
    const { container } = render(() => <Breadcrumb items={[]} />);

    expect(container.querySelector('.sk-breadcrumb')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-breadcrumb-item')).toHaveLength(0);
  });

  it('renders label in span with correct class', () => {
    render(() => <Breadcrumb items={mockItems} />);

    const labels = screen.getAllByText(/Home|Documents|Current Page/);
    labels.forEach((label) => {
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('sk-breadcrumb-label');
    });
  });

  it('sets aria-hidden on separators', () => {
    const { container } = render(() => <Breadcrumb items={mockItems} />);

    const separators = container.querySelectorAll('.sk-breadcrumb-separator');
    separators.forEach((separator) => {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
