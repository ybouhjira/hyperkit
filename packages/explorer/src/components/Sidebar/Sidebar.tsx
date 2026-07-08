import { SearchBar } from './SearchBar'
import { StoryTree } from './StoryTree'

export function Sidebar() {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        height: '100%',
        background: 'var(--sk-bg-secondary)',
        'border-right': '1px solid var(--sk-border)',
      }}
    >
      <SearchBar />
      <StoryTree />
    </div>
  )
}
