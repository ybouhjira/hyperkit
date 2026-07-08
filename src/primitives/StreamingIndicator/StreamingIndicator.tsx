import { Component, Show, splitProps } from 'solid-js';
import './StreamingIndicator.css';

/** Props for the StreamingIndicator component. */
export interface StreamingIndicatorProps {
  /** Whether to show the indicator. */
  visible: boolean;
  /** Status message to display.
   * @default 'Thinking...' */
  message?: string;
  /** Additional CSS classes. */
  class?: string;
}

/** Animated indicator with three pulsing dots and customizable message. */
export const StreamingIndicator: Component<StreamingIndicatorProps> = (props) => {
  const [local, others] = splitProps(props, ['visible', 'message', 'class']);

  return (
    <Show when={local.visible}>
      <div
        data-testid="streaming-indicator"
        class={`sk-streaming ${local.class ?? ''}`}
        {...others}
      >
        <div class="sk-streaming__dots" data-testid="streaming-indicator-dots">
          <span class="sk-streaming__dot" style={{ 'animation-delay': '0ms' }} />
          <span class="sk-streaming__dot" style={{ 'animation-delay': '150ms' }} />
          <span class="sk-streaming__dot" style={{ 'animation-delay': '300ms' }} />
        </div>
        <span class="sk-streaming__text">{local.message ?? 'Thinking...'}</span>
      </div>
    </Show>
  );
};
