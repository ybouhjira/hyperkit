import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { SessionIndicator } from './SessionIndicator';

describe('SessionIndicator', () => {
  it('renders session name', () => {
    render(() => <SessionIndicator status="idle" name="Session 1" />);
    expect(screen.getByText('Session 1')).toBeInTheDocument();
  });

  it('shows model when provided', () => {
    render(() => <SessionIndicator status="streaming" name="Test" model="Claude 4" />);
    expect(screen.getByText('Claude 4')).toBeInTheDocument();
  });

  it('hides model when not provided', () => {
    render(() => <SessionIndicator status="idle" name="Test" />);
    expect(screen.queryByText('Claude')).not.toBeInTheDocument();
  });

  it('shows unread count badge', () => {
    render(() => <SessionIndicator status="idle" name="Test" unreadCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides unread badge when count is 0', () => {
    const { container } = render(() => (
      <SessionIndicator status="idle" name="Test" unreadCount={0} />
    ));
    // Should not render the count badge
    expect(container.querySelectorAll('[class*="count"]').length).toBe(0);
  });

  it('applies custom class', () => {
    render(() => <SessionIndicator status="idle" name="Test" class="w-full" />);
    expect(screen.getByTestId('session-indicator').className).toContain('w-full');
  });
});
