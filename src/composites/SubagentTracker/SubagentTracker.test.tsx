import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SubagentTracker } from './SubagentTracker';
import type { SubagentInfo } from './SubagentTracker';

describe('SubagentTracker', () => {
  const now = Date.now();
  const mockAgents: SubagentInfo[] = [
    {
      id: '1',
      task: 'Analyzing codebase',
      model: 'Claude Opus',
      startedAt: now - 45000,
      status: 'running',
      prompt: 'Read all TypeScript files',
    },
    {
      id: '2',
      task: 'Writing tests',
      model: 'Claude Sonnet',
      startedAt: now - 120000,
      status: 'running',
      prompt: 'Generate unit tests',
    },
  ];

  describe('Rendering', () => {
    it('renders with no agents', () => {
      render(() => <SubagentTracker agents={[]} />);
      expect(screen.getByTestId('subagent-tracker')).toBeInTheDocument();
      expect(screen.getByText('No active subagents')).toBeInTheDocument();
    });

    it('renders with single agent', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
      expect(screen.getByText('Claude Opus')).toBeInTheDocument();
    });

    it('renders with multiple agents', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
      expect(screen.getByText('Writing tests')).toBeInTheDocument();
    });

    it('displays running count badge', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show badge when no running agents', () => {
      render(() => <SubagentTracker agents={[]} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('applies custom class', () => {
      render(() => <SubagentTracker agents={[]} class="custom-class" />);
      const tracker = screen.getByTestId('subagent-tracker');
      expect(tracker.className).toContain('custom-class');
    });
  });

  describe('Expand/Collapse', () => {
    it('defaults to expanded', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
    });

    it('can default to collapsed', () => {
      render(() => <SubagentTracker agents={mockAgents} defaultExpanded={false} />);
      expect(screen.queryByText('Analyzing codebase')).not.toBeInTheDocument();
    });

    it('toggles expansion when header is clicked', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      const header = screen.getByText('Running Subagents').closest('.sk-subagent-tracker__header');
      expect(header).not.toBeNull();

      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();

      fireEvent.click(header!);
      expect(screen.queryByText('Analyzing codebase')).not.toBeInTheDocument();

      fireEvent.click(header!);
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
    });

    it('toggles expansion when collapse button is clicked', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      const collapseBtn = screen.getByText('Collapse');

      fireEvent.click(collapseBtn);
      expect(screen.queryByText('Analyzing codebase')).not.toBeInTheDocument();
      expect(screen.getByText('Expand')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Expand'));
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
    });
  });

  describe('Agent Cards', () => {
    it('renders agent task description', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      expect(screen.getByText('Analyzing codebase')).toBeInTheDocument();
    });

    it('renders agent model badge', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      expect(screen.getByText('Claude Opus')).toBeInTheDocument();
    });

    it('renders agent prompt', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      expect(screen.getByText('Read all TypeScript files')).toBeInTheDocument();
    });

    it('does not render prompt when not provided', () => {
      const agentWithoutPrompt: SubagentInfo = {
        id: '1',
        task: 'Task without prompt',
        startedAt: now,
        status: 'running',
      };
      render(() => <SubagentTracker agents={[agentWithoutPrompt]} />);
      expect(screen.getByText('Task without prompt')).toBeInTheDocument();
    });

    it('truncates long prompts', () => {
      const longPrompt =
        'This is a very long prompt that should be truncated to 120 characters maximum. It contains a lot of text that would normally overflow.';
      const agentWithLongPrompt: SubagentInfo = {
        id: '1',
        task: 'Long task',
        startedAt: now,
        status: 'running',
        prompt: longPrompt,
      };
      render(() => <SubagentTracker agents={[agentWithLongPrompt]} />);
      const promptElement = screen.getByText(/This is a very long prompt/);
      expect(promptElement.textContent?.length).toBeLessThanOrEqual(123);
      expect(promptElement.textContent).toContain('...');
    });

    it('shows spinner for running agents', () => {
      const { container } = render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      const spinner = container.querySelector('.sk-subagent-tracker__spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('does not show spinner for completed agents', () => {
      const completedAgent: SubagentInfo = {
        ...mockAgents[0],
        status: 'completed',
      };
      const { container } = render(() => <SubagentTracker agents={[completedAgent]} />);
      const spinner = container.querySelector('.sk-subagent-tracker__spinner');
      expect(spinner).not.toBeInTheDocument();
    });

    it('applies correct status class', () => {
      render(() => <SubagentTracker agents={mockAgents} />);
      const card = screen.getByTestId('subagent-card-1');
      expect(card.className).toContain('sk-subagent-tracker__card--running');
    });
  });

  describe('Cancel Functionality', () => {
    it('shows cancel button when onCancel provided and agent is running', () => {
      const onCancel = vi.fn();
      render(() => <SubagentTracker agents={[mockAgents[0]]} onCancel={onCancel} />);
      expect(screen.getByTestId('cancel-1')).toBeInTheDocument();
    });

    it('does not show cancel button when onCancel not provided', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      expect(screen.queryByTestId('cancel-1')).not.toBeInTheDocument();
    });

    it('does not show cancel button for completed agents', () => {
      const completedAgent: SubagentInfo = {
        ...mockAgents[0],
        status: 'completed',
      };
      const onCancel = vi.fn();
      render(() => <SubagentTracker agents={[completedAgent]} onCancel={onCancel} />);
      expect(screen.queryByTestId('cancel-1')).not.toBeInTheDocument();
    });

    it('calls onCancel with correct agent id', () => {
      const onCancel = vi.fn();
      render(() => <SubagentTracker agents={[mockAgents[0]]} onCancel={onCancel} />);
      const cancelBtn = screen.getByTestId('cancel-1');
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalledWith('1');
    });
  });

  describe('Model Badge Variants', () => {
    it('applies info variant for Opus models', () => {
      render(() => <SubagentTracker agents={[mockAgents[0]]} />);
      const badge = screen.getByText('Claude Opus');
      expect(badge.className).toContain('sk-badge--info');
    });

    it('applies success variant for Sonnet models', () => {
      render(() => <SubagentTracker agents={[mockAgents[1]]} />);
      const badge = screen.getByText('Claude Sonnet');
      expect(badge.className).toContain('sk-badge--success');
    });

    it('applies warning variant for Haiku models', () => {
      const haikuAgent: SubagentInfo = {
        id: '1',
        task: 'Quick task',
        model: 'Claude Haiku',
        startedAt: now,
        status: 'running',
      };
      render(() => <SubagentTracker agents={[haikuAgent]} />);
      const badge = screen.getByText('Claude Haiku');
      expect(badge.className).toContain('sk-badge--warning');
    });

    it('applies default variant for unknown models', () => {
      const unknownAgent: SubagentInfo = {
        id: '1',
        task: 'Task',
        model: 'Unknown Model',
        startedAt: now,
        status: 'running',
      };
      render(() => <SubagentTracker agents={[unknownAgent]} />);
      const badge = screen.getByText('Unknown Model');
      expect(badge.className).toContain('sk-badge--default');
    });
  });

  describe('Elapsed Time', () => {
    it('formats elapsed time correctly', () => {
      const agent: SubagentInfo = {
        id: '1',
        task: 'Task',
        startedAt: now - 125000,
        status: 'running',
      };
      render(() => <SubagentTracker agents={[agent]} />);
      expect(screen.getByText(/02:0[45]/)).toBeInTheDocument();
    });

    it('pads single digits with zero', () => {
      const agent: SubagentInfo = {
        id: '1',
        task: 'Task',
        startedAt: now - 5000,
        status: 'running',
      };
      render(() => <SubagentTracker agents={[agent]} />);
      expect(screen.getByText(/00:0[45]/)).toBeInTheDocument();
    });
  });
});
