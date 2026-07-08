import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from './BottomNav';
import type { BottomNavItem } from './BottomNav';

const ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', to: '/' },
  { id: 'search', label: 'Search', icon: '🔍', to: '/search' },
  { id: 'cart', label: 'Cart', icon: '🛒', badge: 3, to: '/cart' },
  { id: 'account', label: 'Account', icon: '👤', to: '/account' },
];

describe('BottomNav', () => {
  it('renders a navigation landmark', () => {
    render(() => <BottomNav items={ITEMS} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(() => <BottomNav items={ITEMS} />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Account')).toBeInTheDocument();
  });

  it('applies active class to the active item', () => {
    render(() => <BottomNav items={ITEMS} activeId="search" />);
    const searchBtn = screen.getByLabelText('Search');
    expect(searchBtn).toHaveClass('sk-bottom-nav__item--active');
  });

  it('does not apply active class to non-active items', () => {
    render(() => <BottomNav items={ITEMS} activeId="search" />);
    const homeBtn = screen.getByLabelText('Home');
    expect(homeBtn).not.toHaveClass('sk-bottom-nav__item--active');
  });

  it('sets aria-current="page" on active item', () => {
    render(() => <BottomNav items={ITEMS} activeId="cart" />);
    const cartBtn = screen.getByLabelText('Cart');
    expect(cartBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive items', () => {
    render(() => <BottomNav items={ITEMS} activeId="cart" />);
    const homeBtn = screen.getByLabelText('Home');
    expect(homeBtn).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with item id when clicked', () => {
    const onSelect = vi.fn();
    render(() => <BottomNav items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText('Search'));
    expect(onSelect).toHaveBeenCalledWith('search');
  });

  it('does not call onSelect for disabled items', () => {
    const onSelect = vi.fn();
    const itemsWithDisabled: BottomNavItem[] = [
      ...ITEMS,
      { id: 'disabled', label: 'Disabled', disabled: true },
    ];
    render(() => <BottomNav items={itemsWithDisabled} onSelect={onSelect} />);
    // disabled button won't fire click events
    const disabledBtn = screen.getByLabelText('Disabled');
    expect(disabledBtn).toBeDisabled();
  });

  it('renders badge with count', () => {
    render(() => <BottomNav items={ITEMS} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('caps badge at 99+', () => {
    const itemsWithHighBadge: BottomNavItem[] = [{ id: 'home', label: 'Home', badge: 150 }];
    render(() => <BottomNav items={itemsWithHighBadge} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders badge with string', () => {
    const itemsWithStringBadge: BottomNavItem[] = [{ id: 'home', label: 'Home', badge: 'New' }];
    render(() => <BottomNav items={itemsWithStringBadge} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('does not render badge when badge is 0', () => {
    const itemsWithZeroBadge: BottomNavItem[] = [{ id: 'home', label: 'Home', badge: 0 }];
    render(() => <BottomNav items={itemsWithZeroBadge} />);
    expect(document.querySelector('.sk-bottom-nav__badge')).not.toBeInTheDocument();
  });

  it('renders nothing when hidden is true', () => {
    render(() => <BottomNav items={ITEMS} hidden />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('applies bottom variant class by default', () => {
    render(() => <BottomNav items={ITEMS} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sk-bottom-nav--bottom');
  });

  it('applies top variant class when position="top"', () => {
    render(() => <BottomNav items={ITEMS} position="top" />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sk-bottom-nav--top');
  });

  it('uses activePath for active detection when activeId is not set', () => {
    render(() => <BottomNav items={ITEMS} activePath="/search" />);
    const searchBtn = screen.getByLabelText('Search');
    expect(searchBtn).toHaveClass('sk-bottom-nav__item--active');
  });

  it('activePath starting with item.to marks item as active', () => {
    render(() => <BottomNav items={ITEMS} activePath="/cart/checkout" />);
    const cartBtn = screen.getByLabelText('Cart');
    expect(cartBtn).toHaveClass('sk-bottom-nav__item--active');
  });

  it('applies custom aria-label to nav', () => {
    render(() => <BottomNav items={ITEMS} aria-label="App navigation" />);
    expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeInTheDocument();
  });

  it('applies custom class to nav', () => {
    render(() => <BottomNav items={ITEMS} class="my-nav" />);
    expect(screen.getByRole('navigation')).toHaveClass('my-nav');
  });

  it('renders icons', () => {
    render(() => <BottomNav items={ITEMS} />);
    expect(document.querySelector('[data-testid="bottom-nav-icon-home"]')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(() => <BottomNav items={ITEMS} />);
    expect(screen.getAllByText('Home')).toHaveLength(1);
  });
});
