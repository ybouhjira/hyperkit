import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ToolExecution } from './ToolExecution';

describe('ToolExecution', () => {
  it('renders tool name', () => {
    render(() => <ToolExecution toolName="Read" status="success" />);
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(() => <ToolExecution toolName="Bash" status="running" />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('shows error status', () => {
    render(() => <ToolExecution toolName="Write" status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows duration when provided', () => {
    render(() => <ToolExecution toolName="Read" status="success" duration={150} />);
    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('shows input and output when expanded', () => {
    render(() => (
      <ToolExecution
        toolName="Read"
        status="success"
        input="/path/to/file"
        output="file contents here"
        defaultOpen
      />
    ));
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('/path/to/file')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('file contents here')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <ToolExecution toolName="Test" status="success" class="my-class" />);
    expect(screen.getByTestId('tool-execution').className).toContain('my-class');
  });
});
