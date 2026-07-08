import { RepoCard } from '@ybouhjira/hyperkit'
import type { RepoInfo } from '@ybouhjira/hyperkit'
import { defineStory, control } from '../src/api'
import { For } from 'solid-js'

const mockRepos: readonly RepoInfo[] = [
  {
    name: 'hyperkit',
    fullName: 'ybouhjira/hyperkit',
    description: 'SolidJS component library',
    localPath: '~/Projects/hyperkit',
    branch: 'main',
    isDirty: false,
    uncommittedCount: 0,
    commitsAhead: 2,
    commitsBehind: 0,
    lastCommitMessage: 'fix canvas panning',
    lastCommitTime: '2h ago',
    stars: 12,
    forks: 3,
    openIssues: 8,
    language: 'TypeScript',
    isPrivate: false,
  },
  {
    name: 'phoenix-erp',
    fullName: 'ybouhjira/phoenix-erp',
    description: 'Enterprise resource planning system built with Phoenix',
    localPath: '~/Projects/phoenix-erp',
    branch: 'develop',
    isDirty: true,
    uncommittedCount: 5,
    commitsAhead: 0,
    commitsBehind: 1,
    lastCommitMessage: 'add inventory module',
    lastCommitTime: '1d ago',
    stars: 3,
    forks: 1,
    openIssues: 2,
    language: 'Elixir',
    isPrivate: true,
  },
  {
    name: 'uml-viewer',
    fullName: 'ybouhjira/uml-viewer',
    description: 'Interactive UML diagram viewer and editor',
    stars: 1,
    forks: 0,
    openIssues: 0,
    language: 'JavaScript',
    isPrivate: false,
  },
]

export default defineStory({
  title: 'Composites/RepoCard',
  component: RepoCard,
  controls: {
    isDirty: control.boolean(false, 'Show Dirty State'),
  },
  render: (props) => {
    const gridStyle = {
      display: 'grid',
      'grid-template-columns': 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '16px',
      padding: '16px',
    }

    const repos = () => mockRepos.map((repo) => ({
      ...repo,
      isDirty: props.isDirty !== undefined ? props.isDirty : repo.isDirty,
      uncommittedCount: props.isDirty ? (repo.uncommittedCount || 5) : 0,
    }))

    return (
      <div style={gridStyle}>
        <For each={repos()}>
          {(repo) => (
            <RepoCard
              repo={repo}
              onOpen={() => console.log('Open:', repo.name)}
              onTerminal={() => console.log('Terminal:', repo.name)}
              onIssues={() => console.log('Issues:', repo.name)}
              onStartWork={() => console.log('Start work:', repo.name)}
            />
          )}
        </For>
      </div>
    )
  },
})
