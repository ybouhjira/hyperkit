import type { Component } from 'solid-js';
import { Show, splitProps } from 'solid-js';
import { Card } from '../../primitives/Card/Card';
import { Badge } from '../../primitives/Badge/Badge';
import './RepoCard.css';

export interface RepoInfo {
  readonly name: string;
  readonly fullName: string;
  readonly description?: string;
  readonly localPath?: string;
  readonly branch?: string;
  readonly isDirty?: boolean;
  readonly uncommittedCount?: number;
  readonly commitsAhead?: number;
  readonly commitsBehind?: number;
  readonly lastCommitMessage?: string;
  readonly lastCommitTime?: string;
  readonly stars?: number;
  readonly forks?: number;
  readonly openIssues?: number;
  readonly language?: string;
  readonly isPrivate?: boolean;
}

export interface RepoCardProps {
  readonly repo: RepoInfo;
  readonly onOpen?: () => void;
  readonly onTerminal?: () => void;
  readonly onIssues?: () => void;
  readonly onStartWork?: () => void;
}

const getLanguageColor = (language?: string): string => {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572a5',
    Elixir: '#6e4a7e',
    Rust: '#dea584',
    Go: '#00add8',
    Java: '#b07219',
  };
  return colors[language ?? ''] ?? '#858585';
};

export const RepoCard: Component<RepoCardProps> = (props) => {
  const [local, others] = splitProps(props, [
    'repo',
    'onOpen',
    'onTerminal',
    'onIssues',
    'onStartWork',
  ]);

  const isClean = () => !local.repo.isDirty;
  const hasGitInfo = () => local.repo.localPath && local.repo.branch;

  const formatCommitsInfo = () => {
    const parts: string[] = [];
    if (local.repo.commitsAhead !== undefined && local.repo.commitsAhead > 0) {
      parts.push(`${local.repo.commitsAhead} ahead`);
    }
    if (local.repo.commitsBehind !== undefined && local.repo.commitsBehind > 0) {
      parts.push(`${local.repo.commitsBehind} behind`);
    }
    return parts.length > 0 ? `(${parts.join(', ')})` : '';
  };

  return (
    <Card variant="default" hoverable class="sk-repo-card" {...others}>
      <div class="sk-repo-card__title-row">
        <h3 class="sk-repo-card__title">{local.repo.name}</h3>
        <Show when={local.repo.isPrivate}>
          <Badge variant="default">Private</Badge>
        </Show>
      </div>

      <Show when={local.repo.description}>
        <p class="sk-repo-card__description">{local.repo.description}</p>
      </Show>

      <Show
        when={
          local.repo.stars !== undefined ||
          local.repo.forks !== undefined ||
          local.repo.openIssues !== undefined
        }
      >
        <div class="sk-repo-card__stats">
          <Show when={local.repo.stars !== undefined}>
            <span class="sk-repo-card__stat">
              <span>★</span>
              <span>{local.repo.stars}</span>
            </span>
          </Show>
          <Show when={local.repo.forks !== undefined}>
            <span class="sk-repo-card__stat">
              <span>🍴</span>
              <span>{local.repo.forks}</span>
            </span>
          </Show>
          <Show when={local.repo.openIssues !== undefined}>
            <span class="sk-repo-card__stat">
              <span>📋</span>
              <span>{local.repo.openIssues} open issues</span>
            </span>
          </Show>
          <Show when={local.repo.language}>
            <span class="sk-repo-card__stat">
              <span
                class="sk-repo-card__language-dot"
                style={{ background: getLanguageColor(local.repo.language) }}
              />
              <span>{local.repo.language}</span>
            </span>
          </Show>
        </div>
      </Show>

      <Show when={local.repo.localPath}>
        <div class="sk-repo-card__path">📁 {local.repo.localPath}</div>
      </Show>

      <Show when={hasGitInfo()}>
        <div class="sk-repo-card__git">
          <span>🌿 {local.repo.branch}</span>
          <span
            class={`sk-repo-card__status-indicator ${
              isClean() ? 'sk-repo-card__status--clean' : 'sk-repo-card__status--dirty'
            }`}
          >
            <Show when={isClean()} fallback={<>● {local.repo.uncommittedCount ?? 0} changes</>}>
              ✅ clean
            </Show>
          </span>
          <Show when={formatCommitsInfo()}>
            <span>{formatCommitsInfo()}</span>
          </Show>
        </div>
      </Show>

      <Show when={local.repo.lastCommitMessage}>
        <div class="sk-repo-card__last-commit">
          Last: "{local.repo.lastCommitMessage}" · {local.repo.lastCommitTime}
        </div>
      </Show>

      <div class="sk-repo-card__actions">
        <Show when={local.onOpen}>
          <button
            class="sk-repo-card__button"
            onClick={() => local.onOpen?.()}
            aria-label={`Open ${local.repo.name}`}
          >
            Open
          </button>
        </Show>
        <Show when={local.onTerminal}>
          <button
            class="sk-repo-card__button"
            onClick={() => local.onTerminal?.()}
            aria-label={`Terminal ${local.repo.name}`}
          >
            Terminal
          </button>
        </Show>
        <Show when={local.onIssues}>
          <button
            class="sk-repo-card__button"
            onClick={() => local.onIssues?.()}
            aria-label={`Issues ${local.repo.name}`}
          >
            Issues
          </button>
        </Show>
        <Show when={local.onStartWork}>
          <button
            class="sk-repo-card__button"
            onClick={() => local.onStartWork?.()}
            aria-label={`Start Work ${local.repo.name}`}
          >
            Start Work
          </button>
        </Show>
      </div>
    </Card>
  );
};
