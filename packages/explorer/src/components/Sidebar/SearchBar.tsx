import { useExplorer } from '../../stores/explorerStore'

export function SearchBar() {
  const { state, actions } = useExplorer()

  return (
    <div style={{ padding: '12px' }}>
      <input
        type="text"
        placeholder="Search stories..."
        value={state.searchQuery}
        onInput={(e) => actions.setSearchQuery(e.currentTarget.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          'font-family': 'var(--sk-font-ui)',
          'font-size': '13px',
          background: 'var(--sk-bg-primary)',
          color: 'var(--sk-text-primary)',
          border: '1px solid var(--sk-border)',
          'border-radius': 'var(--sk-radius-md)',
          outline: 'none',
        }}
      />
    </div>
  )
}
