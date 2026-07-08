import { type JSX, type Component, splitProps, For, Show, createMemo } from 'solid-js';
import { GapCard } from './GapCard';

export type Severity = 'critical' | 'important' | 'nice';

export interface GapItem {
  id: string;
  title: string;
  severity: Severity;
  rows?: { tag: 'problem' | 'solution' | 'precedent'; text: string }[];
}

export interface GapAnalysisProps {
  title?: string;
  gaps: GapItem[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const GapAnalysis: Component<GapAnalysisProps> = (props) => {
  const [local, rest] = splitProps(props, ['title', 'gaps', 'class', 'style']);

  const counts = createMemo(() => {
    const critical = local.gaps.filter((g) => g.severity === 'critical').length;
    const important = local.gaps.filter((g) => g.severity === 'important').length;
    const nice = local.gaps.filter((g) => g.severity === 'nice').length;
    return { critical, important, nice };
  });

  const groupedGaps = createMemo(() => {
    const groups: { severity: Severity; label: string; gaps: GapItem[] }[] = [];
    const severityOrder: Severity[] = ['critical', 'important', 'nice'];
    const severityLabels = {
      critical: 'Critical',
      important: 'Important',
      nice: 'Nice to Have',
    };

    severityOrder.forEach((sev) => {
      const filtered = local.gaps.filter((g) => g.severity === sev);
      if (filtered.length > 0) {
        groups.push({
          severity: sev,
          label: severityLabels[sev],
          gaps: filtered,
        });
      }
    });

    return groups;
  });

  return (
    <div class={`sk-report-gap-analysis ${local.class || ''}`} style={local.style} {...rest}>
      <div class="sk-report-gap-analysis__header">
        <Show when={local.title}>
          <h3 class="sk-report-gap-analysis__title">{local.title}</h3>
        </Show>
        <div class="sk-report-gap-analysis__counters">
          <Show when={counts().critical > 0}>
            <span class="sk-report-gap-count sk-report-gap-count--critical">
              {counts().critical} Critical
            </span>
          </Show>
          <Show when={counts().important > 0}>
            <span class="sk-report-gap-count sk-report-gap-count--important">
              {counts().important} Important
            </span>
          </Show>
          <Show when={counts().nice > 0}>
            <span class="sk-report-gap-count sk-report-gap-count--nice">
              {counts().nice} Nice to Have
            </span>
          </Show>
        </div>
      </div>

      <For each={groupedGaps()}>
        {(group) => (
          <div class="sk-report-severity-group">
            <div class={`sk-report-severity-label sk-report-severity-label--${group.severity}`}>
              {group.label}
            </div>
            <For each={group.gaps}>
              {(gap) => (
                <GapCard id={gap.id} title={gap.title} severity={gap.severity} rows={gap.rows} />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
