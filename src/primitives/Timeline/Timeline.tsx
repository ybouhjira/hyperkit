import { type JSX, type Component, splitProps, For, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Timeline/Timeline.css';

/** Configuration for a single timeline step. */
export interface TimelineStep {
  /** Step title text. */
  title: string;
  /** Optional description below the title. */
  description?: string;
  /** Step status (determines dot color).
   * @default 'pending' */
  status?: 'completed' | 'active' | 'pending';
  /** Optional icon element shown instead of step number. */
  icon?: JSX.Element;
  /** Optional metadata text (e.g., date, time). */
  meta?: string;
}

/** Props for the Timeline component. */
export interface TimelineProps {
  /** Array of timeline steps. */
  steps: TimelineStep[];
  /** Timeline orientation.
   * @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

/** Step-by-step timeline with status indicators, connecting lines, and optional icons. */
export const Timeline: Component<TimelineProps> = (props) => {
  const [local, others] = splitProps(props, ['steps', 'orientation', 'size', 'class', 'style']);

  const orientation = () => local.orientation ?? 'vertical';
  const size = () => local.size ?? 'md';

  return (
    <div
      class={`sk-timeline sk-timeline--${orientation()} sk-timeline--${size()} ${local.class ?? ''}`}
      style={local.style}
      {...others}
    >
      <For each={local.steps}>
        {(step, index) => (
          <div class={`sk-timeline__item sk-timeline__item--${step.status ?? 'pending'}`}>
            <div class="sk-timeline__marker">
              <div class="sk-timeline__dot">
                <Show when={step.icon} fallback={index() + 1}>
                  {step.icon}
                </Show>
              </div>
              <Show when={index() < local.steps.length - 1}>
                <div class="sk-timeline__line" />
              </Show>
            </div>
            <div class="sk-timeline__content">
              <div class="sk-timeline__title">{step.title}</div>
              <Show when={step.description}>
                <div class="sk-timeline__description">{step.description}</div>
              </Show>
              <Show when={step.meta}>
                <div class="sk-timeline__meta">{step.meta}</div>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
