import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title correctly', () => {
    render(() => <EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(() => <EmptyState title="No items" description="Try adding some items" />);
    expect(screen.getByText('Try adding some items')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(() => <EmptyState title="No items" />);
    const description = container.querySelector('.sk-empty-state__description');
    expect(description).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(() => <EmptyState title="No items" icon="inbox" />);
    const iconContainer = container.querySelector('.sk-empty-state__icon');
    expect(iconContainer).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    const { container } = render(() => <EmptyState title="No items" />);
    const iconContainer = container.querySelector('.sk-empty-state__icon');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(() => <EmptyState title="No items" action={<button>Add Item</button>} />);
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('does not render action when not provided', () => {
    const { container } = render(() => <EmptyState title="No items" />);
    const actionContainer = container.querySelector('.sk-empty-state__action');
    expect(actionContainer).not.toBeInTheDocument();
  });

  it('applies base class', () => {
    const { container } = render(() => <EmptyState title="No items" />);
    const emptyState = container.querySelector('.sk-empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <EmptyState title="No items" class="custom-class" />);
    const emptyState = container.querySelector('.sk-empty-state');
    expect(emptyState?.classList.contains('custom-class')).toBe(true);
  });

  it('renders all parts together', () => {
    const { container } = render(() => (
      <EmptyState
        title="No items found"
        description="Get started by adding your first item"
        icon="inbox"
        action={<button>Add Item</button>}
      />
    ));

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Get started by adding your first item')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(container.querySelector('.sk-empty-state__icon')).toBeInTheDocument();
  });

  it('applies title class', () => {
    const { container } = render(() => <EmptyState title="No items" />);
    const title = container.querySelector('.sk-empty-state__title');
    expect(title).toBeInTheDocument();
    expect(title?.tagName).toBe('H3');
  });

  it('applies description class', () => {
    const { container } = render(() => (
      <EmptyState title="No items" description="Description text" />
    ));
    const description = container.querySelector('.sk-empty-state__description');
    expect(description).toBeInTheDocument();
    expect(description?.tagName).toBe('P');
  });

  it('wraps action in action container', () => {
    const { container } = render(() => (
      <EmptyState title="No items" action={<button>Action</button>} />
    ));
    const actionContainer = container.querySelector('.sk-empty-state__action');
    expect(actionContainer).toBeInTheDocument();
    expect(actionContainer?.querySelector('button')).toBeInTheDocument();
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <EmptyState title="No items" unstyled class="custom" />);
    const emptyState = container.firstElementChild;
    expect(emptyState?.className).not.toContain('sk-');
    expect(emptyState?.className).toContain('custom');
  });
});
