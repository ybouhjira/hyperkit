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

  it('fixes to bottom of the viewport', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.style.position).toBe('fixed');
    expect(nav.style.bottom).toBe('0px');
    expect(nav.style.left).toBe('0px');
    expect(nav.style.right).toBe('0px');
  });

  it('has the safe-area data marker for iOS/Android home-indicator padding', () => {
    // jsdom silently drops `env()` values in inline styles, so we attach a
    // data attribute that can be asserted in tests AND used by consumers to
    // style via CSS if they'd like to override.
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.hasAttribute('data-sk-safe-area-bottom')).toBe(true);
  });

  it('applies accent color + top indicator on the active item', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} activeId="home" />);
    const home = getByTestId('mobile-bottom-bar-item-home') as HTMLElement;
    expect(home.style.color).toContain('var(--sk-accent)');
    expect(home.style.borderTop).toContain('var(--sk-accent)');
  });

  it('uses token-based background and border', () => {
    const { getByTestId } = render(() => <MobileBottomBar items={items} />);
    const nav = getByTestId('mobile-bottom-bar') as HTMLElement;
    expect(nav.style.background).toContain('var(--sk-bg-secondary)');
    expect(nav.style.borderTop).toContain('var(--sk-border)');
  });
});
