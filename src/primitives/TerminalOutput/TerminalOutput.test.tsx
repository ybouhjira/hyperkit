import { render } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TerminalOutput, type TerminalLine } from './TerminalOutput';

describe('TerminalOutput', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  const sampleLines: TerminalLine[] = [
    { type: 'system', text: 'Starting...' },
    { type: 'tool_call', text: 'npm run build' },
    { type: 'tool_result', text: 'Done in 3s' },
    { type: 'error', text: 'Warning: unused var' },
    { type: 'info', text: 'Output: dist/index.js' },
  ];

  it('renders with data-testid', () => {
    const { getByTestId } = render(() => <TerminalOutput lines={sampleLines} />);
    expect(getByTestId('terminal-output')).toBeInTheDocument();
  });

  it('renders all line types', () => {
    const { getAllByTestId } = render(() => <TerminalOutput lines={sampleLines} />);
    expect(getAllByTestId('terminal-line-system')).toHaveLength(1);
    expect(getAllByTestId('terminal-line-tool_call')).toHaveLength(1);
    expect(getAllByTestId('terminal-line-tool_result')).toHaveLength(1);
    expect(getAllByTestId('terminal-line-error')).toHaveLength(1);
    expect(getAllByTestId('terminal-line-info')).toHaveLength(1);
  });

  it('shows correct prefixes', () => {
    const { getAllByTestId } = render(() => <TerminalOutput lines={sampleLines} />);
    const prefixes = getAllByTestId('terminal-prefix');
    expect(prefixes[0].textContent).toBe('›'); // system
    expect(prefixes[1].textContent).toBe('→'); // tool_call
    expect(prefixes[2].textContent).toBe('←'); // tool_result
    expect(prefixes[3].textContent).toBe('✗'); // error
    expect(prefixes[4].textContent).toBe('ℹ'); // info
  });

  it('displays line text', () => {
    const { getAllByTestId } = render(() => <TerminalOutput lines={sampleLines} />);
    const texts = getAllByTestId('terminal-text');
    expect(texts[0].textContent).toBe('Starting...');
    expect(texts[1].textContent).toBe('npm run build');
    expect(texts[2].textContent).toBe('Done in 3s');
    expect(texts[3].textContent).toBe('Warning: unused var');
    expect(texts[4].textContent).toBe('Output: dist/index.js');
  });

  it('hides timestamps by default', () => {
    const { queryAllByTestId } = render(() => <TerminalOutput lines={sampleLines} />);
    expect(queryAllByTestId('terminal-time')).toHaveLength(0);
  });

  it('shows timestamps when enabled', () => {
    const linesWithTimestamps: TerminalLine[] = [
      { type: 'system', text: 'Starting...', timestamp: Date.now() },
      { type: 'info', text: 'Done', timestamp: Date.now() },
    ];
    const { getAllByTestId } = render(() => (
      <TerminalOutput lines={linesWithTimestamps} showTimestamps={true} />
    ));
    expect(getAllByTestId('terminal-time')).toHaveLength(2);
  });

  it('respects maxLines', () => {
    const { getAllByTestId } = render(() => <TerminalOutput lines={sampleLines} maxLines={2} />);
    const allLines = getAllByTestId(/^terminal-line-/);
    expect(allLines).toHaveLength(2);
  });

  it('shows last N lines when maxLines is set', () => {
    const { getAllByTestId } = render(() => <TerminalOutput lines={sampleLines} maxLines={2} />);
    const texts = getAllByTestId('terminal-text');
    expect(texts[0].textContent).toBe('Warning: unused var'); // second to last
    expect(texts[1].textContent).toBe('Output: dist/index.js'); // last
  });

  it('applies custom class', () => {
    const { getByTestId } = render(() => (
      <TerminalOutput lines={sampleLines} class="my-terminal" />
    ));
    const element = getByTestId('terminal-output');
    expect(element.classList.contains('my-terminal')).toBe(true);
  });

  it('handles empty lines array', () => {
    const { getByTestId } = render(() => <TerminalOutput lines={[]} />);
    expect(getByTestId('terminal-output')).toBeInTheDocument();
  });
});
