import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SessionSearch, SessionData } from './SessionSearch';

describe('SessionSearch', () => {
  const mockSessions: SessionData[] = [
    {
      id: '1',
      name: 'Project Planning',
      messages: [
        { id: 'm1', content: "Let's discuss the architecture" },
        { id: 'm2', content: 'We need to implement the API' },
      ],
    },
    {
      id: '2',
      name: 'Bug Fixes',
      messages: [
        { id: 'm3', content: 'Fix the login issue' },
        { id: 'm4', content: 'Update dependencies' },
      ],
    },
    {
      id: '3',
      name: 'Feature Development',
      messages: [
        { id: 'm5', content: 'Add search functionality' },
        { id: 'm6', content: 'Implement dark mode' },
      ],
    },
  ];

  it('renders when open', () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
      />
    ));

    expect(screen.getByPlaceholderText('Search sessions and messages...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={false}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
      />
    ));

    expect(
      screen.queryByPlaceholderText('Search sessions and messages...')
    ).not.toBeInTheDocument();
  });

  it('filters sessions by name', async () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
        debounceMs={0}
      />
    ));

    const input = screen.getByPlaceholderText('Search sessions and messages...');
    fireEvent.input(input, { target: { value: 'planning' } });

    await waitFor(() => {
      const results = document.querySelectorAll('.sk-session-search__result');
      expect(results.length).toBe(1);
      expect(results[0].textContent).toContain('Project Planning');
    });
  });

  it('filters messages by content', async () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
        debounceMs={0}
      />
    ));

    const input = screen.getByPlaceholderText('Search sessions and messages...');
    fireEvent.input(input, { target: { value: 'architecture' } });

    await waitFor(() => {
      expect(screen.getByText(/architecture/)).toBeInTheDocument();
    });
  });

  it('closes on Escape key', async () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
      />
    ));

    const container = document.querySelector('.sk-session-search')!;
    fireEvent.keyDown(container, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onSelect when result clicked', async () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();

    render(() => (
      <SessionSearch
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        sessions={mockSessions}
        debounceMs={0}
      />
    ));

    const input = screen.getByPlaceholderText('Search sessions and messages...');
    fireEvent.input(input, { target: { value: 'planning' } });

    await waitFor(() => {
      const results = document.querySelectorAll('.sk-session-search__result');
      expect(results.length).toBeGreaterThan(0);
    });

    const result = document.querySelector('.sk-session-search__result')!;
    fireEvent.click(result);

    expect(onSelect).toHaveBeenCalledWith({
      sessionId: '1',
      sessionName: 'Project Planning',
      matchType: 'name',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
