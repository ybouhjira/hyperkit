import { useExplorer } from '../../stores/explorerStore'

export function SearchBar() {
  const { state, actions } = useExplorer()

  return (
    <div style={{ padding: 'var(--sk-space-sm)' }}>
      <input
        type="text"
        placeholder="Search stories..."
        value={state.searchQuery}
        onInput={(e) => actions.setSearchQuery(e.currentTarget.value)}
        style={{
          width: '100%',
          padding: 'var(--sk-space-sm)',
          'font-family': 'var(--sk-font-mono)',
          'font-size': 'var(--sk-font-size-sm)',
          background: 'var(--sk-bg-primary)',
          color: 'var(--sk-text-primary)',
          border: '1px solid var(--sk-border)',
          'border-radius': 'var(--sk-radius-sm)',
          outline: 'none',
        }}
      />
    </div>
  )
}
