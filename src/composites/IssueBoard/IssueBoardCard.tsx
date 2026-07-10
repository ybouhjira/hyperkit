import { For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import type { Issue, IssueLabel } from './IssueBoard';
import { getPriorityClass, getRelativeTime, normalizeLabelColor } from './issueBoardUtils';

export const renderLabel = (label: IssueLabel): JSX.Element => (
  <span
    class="sk-issue-label"
    style={{ '--sk-issue-label-color': normalizeLabelColor(label.color) }}
  >
    {label.name}
  </span>
);

export function IssueBoardCard(props: {
  readonly issue: Issue;
  readonly onIssueClick?: (issue: Issue) => void;
}): JSX.Element {
  return (
    <div class="sk-issue-card" onClick={() => props.onIssueClick?.(props.issue)}>
      <div class="sk-issue-card__header">
        <span class="sk-issue-card__number">#{props.issue.number}</span>
        <Show when={props.issue.priority}>
          <span class={getPriorityClass(props.issue.priority)}>{props.issue.priority}</span>
        </Show>
      </div>
      <div class="sk-issue-card__title">{props.issue.title}</div>
      <Show when={props.issue.labels.length > 0}>
        <div class="sk-issue-labels">
          <For each={props.issue.labels}>{renderLabel}</For>
        </div>
      </Show>
      <div class="sk-issue-card__repo">{props.issue.repo.split('/')[1] ?? props.issue.repo}</div>
    </div>
  );
}

export function IssueRow(props: {
  readonly issue: Issue;
  readonly onIssueClick?: (issue: Issue) => void;
  readonly onStartWork?: (issue: Issue) => void;
}): JSX.Element {
  return (
    <div class="sk-issue-row" onClick={() => props.onIssueClick?.(props.issue)}>
      <div
        class={`sk-issue-row__state sk-issue-row__state--${props.issue.state}`}
        role="img"
        aria-label={props.issue.state}
      />

      <div class="sk-issue-row__number">#{props.issue.number}</div>

      <div class="sk-issue-row__main">
        <div class="sk-issue-row__title">{props.issue.title}</div>
        <Show when={props.issue.labels.length > 0}>
          <div class="sk-issue-labels">
            <For each={props.issue.labels}>{renderLabel}</For>
          </div>
        </Show>
      </div>

      <div class="sk-issue-row__repo">{props.issue.repo.split('/')[1] ?? props.issue.repo}</div>

      <Show when={props.issue.priority}>
        <span class={getPriorityClass(props.issue.priority)}>{props.issue.priority}</span>
      </Show>

      <div class="sk-issue-row__time">{getRelativeTime(props.issue.updatedAt)}</div>

      <Show when={props.onStartWork}>
        <button
          class="sk-issue-row__start"
          onClick={(e) => {
            e.stopPropagation();
            props.onStartWork?.(props.issue);
          }}
        >
          ▶ Start
        </button>
      </Show>
    </div>
  );
}
