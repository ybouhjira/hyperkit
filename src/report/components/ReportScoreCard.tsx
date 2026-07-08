import { type Component, splitProps, Show, For } from 'solid-js';
import { ProgressRing } from '../../primitives/ProgressRing';

export interface ReportScoreChip {
  text: string;
  variant: 'done' | 'partial' | 'missing';
}

export interface ReportScoreCardProps {
  value: number;
  label: string;
  description?: string;
  chips?: ReportScoreChip[];
  color?: string;
}

export const ReportScoreCard: Component<ReportScoreCardProps> = (props) => {
  const [local, others] = splitProps(props, ['value', 'label', 'description', 'chips', 'color']);

  return (
    <div class="sk-report-score" {...others}>
      <div class="sk-report-score__ring">
        <ProgressRing value={local.value} size={120} strokeWidth={8} color={local.color}>
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              'line-height': '1',
            }}
          >
            <span style={{ 'font-size': '2rem', 'font-weight': '800', color: local.color }}>
              {local.value}%
            </span>
            <small
              style={{
                'font-size': '0.7rem',
                'font-weight': '500',
                color: 'var(--sk-text-secondary)',
                'margin-top': '0.25rem',
              }}
            >
              complete
            </small>
          </div>
        </ProgressRing>
      </div>
      <div class="sk-report-score__details">
        <h3>{local.label}</h3>
        <Show when={local.description}>
          <p>{local.description}</p>
        </Show>
        <Show when={local.chips && local.chips.length > 0}>
          <div class="sk-report-score__chips">
            <For each={local.chips}>
              {(chip) => (
                <span class={`sk-report-score__chip sk-report-score__chip--${chip.variant}`}>
                  {chip.text}
                </span>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};
