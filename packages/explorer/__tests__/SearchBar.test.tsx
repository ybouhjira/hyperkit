import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { SearchBar } from '../src/components/Sidebar/SearchBar'
import { ExplorerProvider, useExplorer } from '../src/stores/explorerStore'

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(() => (
      <ExplorerProvider>
        <SearchBar />
      </ExplorerProvider>
    ))

    const input = screen.getByPlaceholderText('Search stories...')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('displays current search query', () => {
    function SearchBarWithQuery(props: { query: string }) {
      const { actions } = useExplorer()
      actions.setSearchQuery(props.query)
      return <SearchBar />
    }

    render(() => (
      <ExplorerProvider>
        <SearchBarWithQuery query="button" />
      </ExplorerProvider>
    ))

    const input = screen.getByPlaceholderText('Search stories...') as HTMLInputElement
    expect(input.value).toBe('button')
  })

  it('updates search query on input', () => {
    function TestWrapper() {
      const { state } = useExplorer()
      return (
        <div>
          <SearchBar />
          <div data-testid="query-display">{state.searchQuery}</div>
        </div>
      )
    }

    render(() => (
      <ExplorerProvider>
        <TestWrapper />
      </ExplorerProvider>
    ))

    const input = screen.getByPlaceholderText('Search stories...')
    fireEvent.input(input, { target: { value: 'button' } })

    const display = screen.getByTestId('query-display')
    expect(display.textContent).toBe('button')
  })
})
