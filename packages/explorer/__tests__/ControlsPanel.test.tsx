import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ControlsPanel } from '../src/components/Controls/ControlsPanel'
import { ExplorerProvider } from '../src/stores/explorerStore'
import { control } from '../src/api'

describe('ControlsPanel', () => {
  it('should render empty state when no controls', () => {
    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={{}} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('No controls available')).toBeInTheDocument()
  })

  it('should render text control', () => {
    const controls = {
      label: control.text('Hello', 'Label'),
    }

    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={controls} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('should render number control', () => {
    const controls = {
      count: control.number(42, { label: 'Count' }),
    }

    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={controls} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Count')).toBeInTheDocument()
    expect(screen.getByDisplayValue('42')).toBeInTheDocument()
  })

  it('should render boolean control', () => {
    const controls = {
      enabled: control.boolean(true, 'Enabled'),
    }

    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={controls} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Enabled')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('should render select control', () => {
    const controls = {
      choice: control.select(['a', 'b', 'c'], 'b', 'Choice'),
    }

    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={controls} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Choice')).toBeInTheDocument()
    const select = screen.getByDisplayValue('b') as HTMLSelectElement
    expect(select.tagName).toBe('SELECT')
    expect(select.value).toBe('b')
  })

  it('should render json control', () => {
    const controls = {
      data: control.json({ key: 'value' }, 'Data'),
    }

    render(() => (
      <ExplorerProvider>
        <ControlsPanel controls={controls} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Data')).toBeInTheDocument()
    const textarea = screen.getByDisplayValue(/key/) as HTMLTextAreaElement
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea.value).toContain('"key"')
    expect(textarea.value).toContain('"value"')
  })
})
