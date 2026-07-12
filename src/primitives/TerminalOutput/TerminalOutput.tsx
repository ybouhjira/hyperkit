import { Component, createMemo, createEffect, For, Show, splitProps, untrack } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/TerminalOutput/TerminalOutput.css';

/** Types of terminal output lines. */
export type TerminalLineType = 'system' | 'tool_call' | 'tool_result' | 'error' | 'info';

/** Configuration for a single terminal line. */
export interface TerminalLine {
  /** Line type (determines color and prefix). */
  type: TerminalLineType;
  /** Text content to display. */
  text: string;
  /** Optional Unix timestamp in milliseconds. */
  timestamp?: number;
}

/** Props for the TerminalOutput component. */
export interface TerminalOutputProps {
  /** Array of lines to display. */
  lines: TerminalLine[];
  /** Maximum number of lines to keep.
   * @default 500 */
  maxLines?: number;
  /** Show timestamps for each line.
   * @default false */
  showTimestamps?: boolean;
  /** Additional CSS classes. */
  class?: string;
}

const TYPE_CLASS_MAP: Record<TerminalLineType, string> = {
  system: 'system',
  tool_call: 'tool-call',
  tool_result: 'tool-result',
  error: 'error',
  info: 'info',
};

const PREFIX_MAP: Record<TerminalLineType, string> = {
  system: '›',
  tool_call: '→',
  tool_result: '←',
  error: '✗',
  info: 'ℹ',
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/** Terminal-style output display with auto-scroll, color-coded lines, and timestamps. */
export const TerminalOutput: Component<TerminalOutputProps> = (props) => {
  const [local, others] = splitProps(props, ['lines', 'maxLines', 'showTimestamps', 'class']);
  let containerRef: HTMLDivElement | undefined;

  const maxLines = () => local.maxLines ?? 500;
  const showTimestamps = () => local.showTimestamps ?? false;

  const visibleLines = createMemo(() => {
    const max = maxLines();
    return local.lines.slice(-max);
  });

  createEffect(() => {
    const _lines = local.lines;
    const el = containerRef;
    if (el) {
      untrack(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }
  });

  return (
    <div
      ref={containerRef}
      data-testid="terminal-output"
      class={`sk-terminal ${local.class ?? ''}`}
      {...others}
    >
      <For each={visibleLines()}>
        {(line) => (
          <div
            class={`sk-terminal__line sk-terminal__line--${TYPE_CLASS_MAP[line.type]}`}
            data-testid={`terminal-line-${line.type}`}
          >
            <span class="sk-terminal__prefix" data-testid="terminal-prefix">
              {PREFIX_MAP[line.type]}
            </span>
            <Show when={showTimestamps() && line.timestamp}>
              <span class="sk-terminal__time" data-testid="terminal-time">
                {formatTime(line.timestamp ?? 0)}
              </span>
            </Show>
            <span class="sk-terminal__text" data-testid="terminal-text">
              {line.text}
            </span>
          </div>
        )}
      </For>
    </div>
  );
};
