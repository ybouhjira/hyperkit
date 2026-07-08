import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ToolApproval } from './ToolApproval';
import { ToolApprovalQueue } from './ToolApprovalQueue';
import { KeyboardProvider } from '../../keyboard';
import type { ToolApprovalItem } from './ToolApproval';

function renderWithKb(ui: () => import('solid-js').JSX.Element) {
  return render(() => <KeyboardProvider>{ui()}</KeyboardProvider>);
}

describe('ToolApproval', () => {
  it('renders tool name and parameters', () => {
    const input = { file_path: '/src/index.ts' };
    renderWithKb(() => (
      <ToolApproval tool="Read" input={input} onApprove={vi.fn()} onDeny={vi.fn()} />
    ));

    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText(/"file_path": "\/src\/index.ts"/)).toBeInTheDocument();
  });

  it('calls onApprove with alwaysAllow=false on Allow click', () => {
    const onApprove = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={onApprove}
        onDeny={vi.fn()}
      />
    ));

    const allowButton = screen.getByTestId('tool-approval-approve');
    fireEvent.click(allowButton);

    expect(onApprove).toHaveBeenCalledWith(false);
  });

  it('calls onApprove with alwaysAllow=true when checkbox checked', () => {
    const onApprove = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={onApprove}
        onDeny={vi.fn()}
      />
    ));

    const checkbox = screen.getByTestId('tool-approval-checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);

    const allowButton = screen.getByTestId('tool-approval-approve');
    fireEvent.click(allowButton);

    expect(onApprove).toHaveBeenCalledWith(true);
  });

  it('calls onDeny on Deny click', () => {
    const onDeny = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={vi.fn()}
        onDeny={onDeny}
      />
    ));

    const denyButton = screen.getByTestId('tool-approval-deny');
    fireEvent.click(denyButton);

    expect(onDeny).toHaveBeenCalled();
  });

  it('calls onDeny on backdrop click', () => {
    const onDeny = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={vi.fn()}
        onDeny={onDeny}
      />
    ));

    const backdrop = screen.getByTestId('tool-approval');
    fireEvent.click(backdrop);

    expect(onDeny).toHaveBeenCalled();
  });

  it('Enter key triggers approve', () => {
    const onApprove = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={onApprove}
        onDeny={vi.fn()}
      />
    ));

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onApprove).toHaveBeenCalledWith(false);
  });

  it('Escape key triggers deny', () => {
    const onDeny = vi.fn();
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={vi.fn()}
        onDeny={onDeny}
      />
    ));

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onDeny).toHaveBeenCalled();
  });

  it('applies custom class', () => {
    renderWithKb(() => (
      <ToolApproval
        tool="Read"
        input={{ file_path: '/test' }}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
        class="custom-class"
      />
    ));

    const backdrop = screen.getByTestId('tool-approval');
    expect(backdrop).toHaveClass('custom-class');
  });
});

describe('ToolApprovalQueue', () => {
  it('queue shows first item and badge count', () => {
    const queueItems: ToolApprovalItem[] = [
      { id: '1', tool: 'Read', input: { file_path: '/src/index.ts' } },
      { id: '2', tool: 'Bash', input: { command: 'npm install' } },
      { id: '3', tool: 'Write', input: { file_path: '/src/new.ts', content: 'code' } },
    ];

    renderWithKb(() => (
      <ToolApprovalQueue queue={queueItems} onApprove={vi.fn()} onDeny={vi.fn()} />
    ));

    // First item should be visible
    expect(screen.getByText('Read')).toBeInTheDocument();

    // Badge should show count
    const badge = screen.getByTestId('tool-approval-queue-badge');
    expect(badge).toHaveTextContent('3 pending approvals');
  });
});
