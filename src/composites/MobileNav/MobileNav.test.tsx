import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { MobileNav } from './MobileNav';

const mockSessions = [
  { id: '1', name: 'Session 1', status: 'idle' as const },
  { id: '2', name: 'Session 2', status: 'streaming' as const },
  { id: '3', name: 'Error Session', status: 'error' as const, unreadCount: 3 },
];

describe('MobileNav', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('renders on mobile viewport', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="1" />);
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('shows active session name', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="1" />);
    const sessionName = document.querySelector('.sk-mobile-nav__session-name');
    expect(sessionName?.textContent).toBe('Session 1');
  });

  it('shows correct status indicator', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="2" />);
    const status = screen.getByTestId('session-status');
    expect(status.className).toContain('sk-mobile-nav__status--streaming');
  });

  it('shows unread count badge when present', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="3" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show badge when unreadCount is 0', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="1" />);
    const badges = screen.queryAllByText(/^\d+$/);
    expect(badges.length).toBe(0);
  });

  it('renders dropdown selector', () => {
    render(() => <MobileNav sessions={mockSessions} activeSessionId="1" />);
    const selector = document.querySelector('.sk-mobile-nav__selector');
    expect(selector).toBeInTheDocument();
  });

  it('defaults to first session when no activeSessionId provided', () => {
    render(() => <MobileNav sessions={mockSessions} />);
    const sessionName = document.querySelector('.sk-mobile-nav__session-name');
    expect(sessionName?.textContent).toBe('Session 1');
  });

  it('applies custom class', () => {
    render(() => <MobileNav sessions={mockSessions} class="custom-nav" />);
    const nav = screen.getByTestId('mobile-nav');
    expect(nav.className).toContain('custom-nav');
  });

  it('calls onSessionSelect when session changes', () => {
    const onSessionSelect = vi.fn();
    render(() => (
      <MobileNav sessions={mockSessions} activeSessionId="1" onSessionSelect={onSessionSelect} />
    ));
    expect(onSessionSelect).not.toHaveBeenCalled();
  });

  it('hides on desktop viewport when hideAbove is tablet', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(() => <MobileNav sessions={mockSessions} hideAbove="tablet" />);
    const nav = screen.queryByTestId('mobile-nav');
    expect(nav).not.toBeInTheDocument();
  });

  it('shows on phone viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    render(() => <MobileNav sessions={mockSessions} />);
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('renders with empty sessions array', () => {
    render(() => <MobileNav sessions={[]} />);
    const nav = screen.getByTestId('mobile-nav');
    expect(nav).toBeInTheDocument();
  });

  it('has proper aria-label for accessibility', () => {
    render(() => <MobileNav sessions={mockSessions} />);
    const nav = screen.getByTestId('mobile-nav');
    expect(nav.getAttribute('aria-label')).toBe('Mobile navigation');
  });
});
