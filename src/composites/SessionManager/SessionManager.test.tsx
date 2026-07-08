import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { SessionManager, type SessionInfo } from './SessionManager';

const mockSessions: SessionInfo[] = [
  {
    id: '1',
    prompt: 'Implement SessionManager component',
    status: 'active',
    model: 'claude-opus-4',
    project: 'hyperkit',
    startedAt: '2026-03-08T10:00:00Z',
    duration: 45,
    cost: 2.5,
    tasks: [
      { id: 't1', subject: 'Create component', status: 'completed' },
      { id: 't2', subject: 'Add tests', status: 'in_progress' },
      { id: 't3', subject: 'Update docs', status: 'pending' },
    ],
    subagents: [
      {
        id: 's1',
        model: 'sonnet',
        status: 'running',
        description: 'Writing component code',
        startedAt: '2026-03-08T10:15:00Z',
        parentId: null,
      },
      {
        id: 's2',
        model: 'haiku',
        status: 'waiting',
        description: 'Running tests',
        startedAt: '2026-03-08T10:20:00Z',
        parentId: 's1',
      },
    ],
  },
  {
    id: '2',
    prompt: 'Fix bug in ThemeProvider',
    status: 'paused',
    model: 'claude-sonnet-4',
    project: 'hyperkit',
    startedAt: '2026-03-08T09:00:00Z',
    duration: 30,
    cost: 1.2,
    tasks: [
      { id: 't4', subject: 'Debug issue', status: 'completed' },
      { id: 't5', subject: 'Apply fix', status: 'pending' },
    ],
    subagents: [],
  },
  {
    id: '3',
    prompt: 'Update documentation',
    status: 'completed',
    model: 'claude-haiku-4',
    project: 'docs',
    startedAt: '2026-03-08T08:00:00Z',
    duration: 120,
    cost: 0.5,
    tasks: [
      { id: 't6', subject: 'Write API docs', status: 'completed' },
      { id: 't7', subject: 'Add examples', status: 'completed' },
    ],
    subagents: [],
  },
  {
    id: '4',
    prompt: 'Deploy to production',
    status: 'failed',
    model: 'claude-opus-4',
    project: 'backend',
    startedAt: '2026-03-08T07:00:00Z',
    duration: 15,
    cost: 0.8,
    tasks: [{ id: 't8', subject: 'Run deployment', status: 'completed' }],
    subagents: [],
  },
];

describe('SessionManager', () => {
  it('renders session cards for each session', () => {
    render(() => <SessionManager sessions={mockSessions} />);

    expect(screen.getByText('Implement SessionManager component')).toBeInTheDocument();
    expect(screen.getByText('Fix bug in ThemeProvider')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.getByText('Deploy to production')).toBeInTheDocument();
  });

  it('shows correct status indicators', () => {
    const { container } = render(() => <SessionManager sessions={mockSessions} />);

    // Check that status dots are rendered (they're divs with specific background colors)
    const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('shows subagent tree with proper hierarchy', () => {
    render(() => <SessionManager sessions={mockSessions} />);

    expect(screen.getByText(/Writing component code/)).toBeInTheDocument();
    expect(screen.getByText(/Running tests/)).toBeInTheDocument();
  });

  it('shows task progress bar', () => {
    render(() => <SessionManager sessions={mockSessions} />);

    expect(screen.getByText('1/3 tasks')).toBeInTheDocument();
    expect(screen.getByText('1/2 tasks')).toBeInTheDocument();
    expect(screen.getByText('2/2 tasks')).toBeInTheDocument();
  });

  it('calls onViewChat when button clicked', () => {
    const onViewChat = vi.fn();
    render(() => <SessionManager sessions={mockSessions} onViewChat={onViewChat} />);

    const buttons = screen.getAllByText('View Chat');
    fireEvent.click(buttons[0]);

    expect(onViewChat).toHaveBeenCalledWith('1');
  });

  it('calls onPause for active sessions', () => {
    const onPause = vi.fn();
    render(() => <SessionManager sessions={mockSessions} onPause={onPause} />);

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    expect(onPause).toHaveBeenCalledWith('1');
  });

  it('calls onResume for paused sessions', () => {
    const onResume = vi.fn();
    render(() => <SessionManager sessions={mockSessions} onResume={onResume} />);

    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);

    expect(onResume).toHaveBeenCalledWith('2');
  });

  it('calls onStop when stop button clicked', () => {
    const onStop = vi.fn();
    render(() => <SessionManager sessions={mockSessions} onStop={onStop} />);

    const stopButtons = screen.getAllByText('Stop');
    fireEvent.click(stopButtons[0]);

    expect(onStop).toHaveBeenCalledWith('1');
  });

  it('groups sessions by project when groupBy="project"', () => {
    render(() => <SessionManager sessions={mockSessions} groupBy="project" />);

    // Check for group headers (uppercase h2 elements)
    const hyperkitHeaders = screen.getAllByText((content, element) => {
      return element?.tagName === 'H2' && content === 'hyperkit';
    });
    expect(hyperkitHeaders.length).toBeGreaterThan(0);

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'docs';
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'backend';
      })
    ).toBeInTheDocument();
  });

  it('groups sessions by status when groupBy="status"', () => {
    render(() => <SessionManager sessions={mockSessions} groupBy="status" />);

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'active';
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'paused';
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'completed';
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H2' && content === 'failed';
      })
    ).toBeInTheDocument();
  });

  it('handles empty sessions array', () => {
    const { container } = render(() => <SessionManager sessions={[]} />);

    expect(container.querySelector('div')).toBeInTheDocument();
    expect(screen.queryByText('tasks')).not.toBeInTheDocument();
  });
});
