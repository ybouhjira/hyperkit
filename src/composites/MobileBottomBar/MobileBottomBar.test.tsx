import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { MobileBottomBar } from './MobileBottomBar';

const items = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'chat', label: 'Chat', icon: 'C', badge: 3 },
  { id: 'me', label: 'Me', icon: 'M' },
];

describe('MobileBottomBar', () => {
  it('renders nav landmark with default aria-label', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar');
    expect(nav.tagName).toBe('NAV');
    expect(nav.getAttribute('aria-label')).toBe('Primary');
  });

  it('respects custom aria-label', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} aria-label="Main" />);
    expect(getByTestId('mobile-bottom-bar').getAttribute('aria-label')).toBe('Main');
  });

  it('renders one button per item with testable ids', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    expect(getByTestId('mobile-bottom-bar-item-home')).toBeTruthy();
    expect(getByTestId('mobile-bottom-bar-item-chat')).toBeTruthy();
    expect(getByTestId('mobile-bottom-bar-item-me')).toBeTruthy();
  });

  it('fires onSelect with the item id on click', () => {
    const onSelect = vi.fn();
    const { getByTestId } = render(() => <MobileBottomBar items={items} onSelect={onSelect} />);
    fireEvent.click(getByTestId('mobile-bottom-bar-item-chat'));
    expect(onSelect).toHaveBeenCalledWith('chat');
  });

  it('marks the active item with aria-current and data-active', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} activeId="chat" />);
    const chat = getByTestId('mobile-bottom-bar-item-chat');
    const home = getByTestId('mobile-bottom-bar-item-home');
    expect(chat.getAttribute('aria-current')).toBe('page');
    expect(chat.hasAttribute('data-active')).toBe(true);
    expect(home.getAttribute('aria-current')).toBeNull();
    expect(home.hasAttribute('data-active')).toBe(false);
  });

  it('renders a badge when provided', () => {
    const { getByTestId, queryByTestId } = render(() => <MobileBottomBar items={items} />);
    expect(getByTestId('mobile-bottom-bar-badge-chat').textContent).toBe('3');
    expect(queryByTestId('mobile-bottom-bar-badge-home')).toBeNull();
  });

  it('does not fire onSelect for disabled items', () => {
    const onSelect = vi.fn();
    const { getByTestId } = render(() => (
      <MobileBottomBar
        items={[
          { id: 'a', label: 'A', icon: 'a' },
          { id: 'b', label: 'B', icon: 'b', disabled: true },
        ]}
        onSelect={onSelect}
      />
    ));
    fireEvent.click(getByTestId('mobile-bottom-bar-item-b'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders nothing when hidden', () => {
    const { queryByTestId } = render(() => <MobileBottomBar items={items} hidden />);
    expect(queryByTestId('mobile-bottom-bar')).toBeNull();
  });

  it('applies the sk-mobile-bottom-bar class on the root nav', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.classList.contains('sk-mobile-bottom-bar')).toBe(true);
  });

  it('merges a custom class and passes the style prop through', () => {
    const { getByTestId } = render(() => (
      <MobileBottomBar items={items} class="my-bar" style={{ 'z-index': '77' }} />
    ));
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.classList.contains('sk-mobile-bottom-bar')).toBe(true);
    expect(nav.classList.contains('my-bar')).toBe(true);
    expect(nav.style.zIndex).toBe('77');
  });

  it('has the safe-area data marker for iOS/Android home-indicator padding', () => {
    // jsdom silently drops `env()` values in inline styles, so we attach a
    // data attribute that can be asserted in tests AND used by consumers to
    // style via CSS if they'd like to override.
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.hasAttribute('data-sk-safe-area-bottom')).toBe(true);
  });

  it('marks the active item with the active modifier class (accent + top rail in CSS)', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} activeId="home" />);
    const home = getByTestId('mobile-bottom-bar-item-home') as HTMLElement;
    const chat = getByTestId('mobile-bottom-bar-item-chat') as HTMLElement;
    expect(home.classList.contains('sk-mobile-bottom-bar__item--active')).toBe(true);
    expect(chat.classList.contains('sk-mobile-bottom-bar__item--active')).toBe(false);
  });

  it('applies BEM classes on items, icons, badges, and labels', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    expect(
      getByTestId('mobile-bottom-bar-item-home').classList.contains('sk-mobile-bottom-bar__item')
    ).toBe(true);
    expect(
      getByTestId('mobile-bottom-bar-icon-home').classList.contains('sk-mobile-bottom-bar__icon')
    ).toBe(true);
    expect(
      getByTestId('mobile-bottom-bar-badge-chat').classList.contains('sk-mobile-bottom-bar__badge')
    ).toBe(true);
  });
});
