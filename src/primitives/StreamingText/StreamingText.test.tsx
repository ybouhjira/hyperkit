import { render } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { StreamingText } from './StreamingText';

describe('StreamingText', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  it('renders with data-testid', () => {
    const [chunks] = createSignal(['Hello']);
    const { getByTestId } = render(() => <StreamingText chunks={chunks} />);
    expect(getByTestId('streaming-text')).toBeInTheDocument();
  });

  it('joins chunks and renders content', () => {
    const [chunks] = createSignal(['Hello ', 'world']);
    const { getByTestId } = render(() => <StreamingText chunks={chunks} />);
    const element = getByTestId('streaming-text');
    expect(element.textContent).toContain('Hello world');
  });

  it('renders in markdown format by default', () => {
    const [chunks] = createSignal(['Hello']);
    const { queryByTestId } = render(() => <StreamingText chunks={chunks} />);
    expect(queryByTestId('streaming-text-plain')).not.toBeInTheDocument();
  });

  it('renders in plain format when specified', () => {
    const [chunks] = createSignal(['Hello']);
    const { getByTestId } = render(() => <StreamingText chunks={chunks} format="plain" />);
    expect(getByTestId('streaming-text-plain')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const [chunks] = createSignal(['Hello']);
    const { getByTestId } = render(() => <StreamingText chunks={chunks} class="my-stream" />);
    const element = getByTestId('streaming-text');
    expect(element.classList.contains('my-stream')).toBe(true);
  });

  it('handles empty chunks', () => {
    const [chunks] = createSignal([]);
    const { getByTestId } = render(() => <StreamingText chunks={chunks} />);
    expect(getByTestId('streaming-text')).toBeInTheDocument();
  });
});
