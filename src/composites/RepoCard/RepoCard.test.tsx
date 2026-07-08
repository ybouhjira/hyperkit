import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { RepoCard } from './RepoCard';
import type { RepoInfo } from './RepoCard';

describe('RepoCard', () => {
  const baseRepo: RepoInfo = {
    name: 'hyperkit',
    fullName: 'ybouhjira/hyperkit',
    description: 'SolidJS component library',
    stars: 12,
    forks: 3,
    openIssues: 8,
    language: 'TypeScript',
  };

  it('renders repo name and description', () => {
    render(() => <RepoCard repo={baseRepo} />);
    expect(screen.getByText('hyperkit')).toBeInTheDocument();
    expect(screen.getByText('SolidJS component library')).toBeInTheDocument();
  });

  it('shows GitHub stats (stars, forks, open issues)', () => {
    render(() => <RepoCard repo={baseRepo} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('8 open issues')).toBeInTheDocument();
  });

  it('shows local path when available', () => {
    const repoWithPath: RepoInfo = {
      ...baseRepo,
      localPath: '~/Projects/hyperkit',
    };
    render(() => <RepoCard repo={repoWithPath} />);
    expect(screen.getByText(/~\/Projects\/hyperkit/)).toBeInTheDocument();
  });

  it('shows git branch name', () => {
    const repoWithGit: RepoInfo = {
      ...baseRepo,
      localPath: '~/Projects/hyperkit',
      branch: 'main',
      isDirty: false,
    };
    render(() => <RepoCard repo={repoWithGit} />);
    expect(screen.getByText(/main/)).toBeInTheDocument();
  });

  it('shows clean status when not dirty', () => {
    const cleanRepo: RepoInfo = {
      ...baseRepo,
      localPath: '~/Projects/hyperkit',
      branch: 'main',
      isDirty: false,
    };
    render(() => <RepoCard repo={cleanRepo} />);
    expect(screen.getByText(/clean/)).toBeInTheDocument();
  });

  it('shows dirty status with change count', () => {
    const dirtyRepo: RepoInfo = {
      ...baseRepo,
      localPath: '~/Projects/hyperkit',
      branch: 'main',
      isDirty: true,
      uncommittedCount: 5,
    };
    render(() => <RepoCard repo={dirtyRepo} />);
    expect(screen.getByText(/5 changes/)).toBeInTheDocument();
  });

  it('shows commits ahead/behind', () => {
    const repoWithCommits: RepoInfo = {
      ...baseRepo,
      localPath: '~/Projects/hyperkit',
      branch: 'main',
      isDirty: false,
      commitsAhead: 2,
      commitsBehind: 1,
    };
    render(() => <RepoCard repo={repoWithCommits} />);
    expect(screen.getByText(/2 ahead, 1 behind/)).toBeInTheDocument();
  });

  it('shows last commit message and time', () => {
    const repoWithCommit: RepoInfo = {
      ...baseRepo,
      lastCommitMessage: 'fix canvas panning',
      lastCommitTime: '2h ago',
    };
    render(() => <RepoCard repo={repoWithCommit} />);
    expect(screen.getByText(/fix canvas panning/)).toBeInTheDocument();
    expect(screen.getByText(/2h ago/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(() => (
      <RepoCard
        repo={baseRepo}
        onOpen={() => {}}
        onTerminal={() => {}}
        onIssues={() => {}}
        onStartWork={() => {}}
      />
    ));
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.getByText('Start Work')).toBeInTheDocument();
  });

  it('calls onOpen when Open clicked', () => {
    const onOpen = vi.fn();
    render(() => <RepoCard repo={baseRepo} onOpen={onOpen} />);
    fireEvent.click(screen.getByText('Open'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onStartWork when Start Work clicked', () => {
    const onStartWork = vi.fn();
    render(() => <RepoCard repo={baseRepo} onStartWork={onStartWork} />);
    fireEvent.click(screen.getByText('Start Work'));
    expect(onStartWork).toHaveBeenCalledTimes(1);
  });

  it('handles repo without local clone (no git info)', () => {
    const remoteOnlyRepo: RepoInfo = {
      name: 'remote-repo',
      fullName: 'user/remote-repo',
      description: 'Remote only repository',
      stars: 5,
    };
    render(() => <RepoCard repo={remoteOnlyRepo} />);
    expect(screen.getByText('remote-repo')).toBeInTheDocument();
    expect(screen.queryByText(/main/)).not.toBeInTheDocument();
    expect(screen.queryByText(/clean/)).not.toBeInTheDocument();
  });

  it('shows private badge for private repos', () => {
    const privateRepo: RepoInfo = {
      ...baseRepo,
      isPrivate: true,
    };
    render(() => <RepoCard repo={privateRepo} />);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('uses Card primitive with sk-card classes', () => {
    const { container } = render(() => <RepoCard repo={baseRepo} />);
    const card = container.querySelector('.sk-card');
    expect(card).toBeInTheDocument();
    expect(card?.classList.contains('sk-card--default')).toBe(true);
    expect(card?.classList.contains('sk-card--hoverable')).toBe(true);
  });

  it('uses Badge primitive for private indicator', () => {
    const privateRepo: RepoInfo = {
      ...baseRepo,
      isPrivate: true,
    };
    const { container } = render(() => <RepoCard repo={privateRepo} />);
    const badge = container.querySelector('.sk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge?.classList.contains('sk-badge--default')).toBe(true);
  });

  it('uses CSS classes instead of inline styles', () => {
    const { container } = render(() => <RepoCard repo={baseRepo} onOpen={() => {}} />);

    const repoCard = container.querySelector('.sk-repo-card');
    expect(repoCard).toBeInTheDocument();

    const titleRow = container.querySelector('.sk-repo-card__title-row');
    expect(titleRow).toBeInTheDocument();

    const title = container.querySelector('.sk-repo-card__title');
    expect(title).toBeInTheDocument();

    const description = container.querySelector('.sk-repo-card__description');
    expect(description).toBeInTheDocument();

    const button = container.querySelector('.sk-repo-card__button');
    expect(button).toBeInTheDocument();
  });
});
