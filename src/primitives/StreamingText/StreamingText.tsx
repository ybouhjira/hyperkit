import { Component, createMemo, createEffect, splitProps, Accessor } from 'solid-js';
import { Markdown } from '../Markdown';
import '@ybouhjira/hyperkit-styles/primitives/StreamingText/StreamingText.css';

/** Props for the StreamingText component. */
export interface StreamingTextProps {
  /** Reactive array of text chunks to display. */
  chunks: Accessor<string[]>;
  /** Output format.
   * @default 'markdown' */
  format?: 'markdown' | 'plain';
  /** Auto-scroll to bottom as content streams.
   * @default true */
  autoScroll?: boolean;
  /** Additional CSS classes. */
  class?: string;
}

/** Displays streaming text chunks with optional markdown rendering and auto-scroll. */
export const StreamingText: Component<StreamingTextProps> = (props) => {
  const [local, others] = splitProps(props, ['chunks', 'format', 'autoScroll', 'class']);
  let containerRef: HTMLDivElement | undefined;

  const joined = createMemo(() => local.chunks().join(''));
  const format = () => local.format ?? 'markdown';
  const autoScroll = () => local.autoScroll ?? true;

  createEffect(() => {
    if (autoScroll() && containerRef) {
      // Watch chunks changes and scroll
      local.chunks();
      containerRef.scrollTo({ top: containerRef.scrollHeight, behavior: 'smooth' });
    }
  });

  return (
    <div
      ref={containerRef}
      data-testid="streaming-text"
      class={`sk-streaming-text ${local.class ?? ''}`}
      {...others}
    >
      {format() === 'markdown' ? (
        <Markdown content={joined()} streaming={true} />
      ) : (
        <pre class="sk-streaming-text__plain" data-testid="streaming-text-plain">
          {joined()}
        </pre>
      )}
    </div>
  );
};
