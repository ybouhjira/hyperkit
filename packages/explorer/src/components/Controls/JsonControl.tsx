import { createSignal } from 'solid-js'
import type { JsonControlDef } from '../../api/types'

interface JsonControlProps {
  readonly control: JsonControlDef
  readonly value: unknown
  readonly onChange: (value: unknown) => void
}

export function JsonControl(props: JsonControlProps) {
  const [textValue, setTextValue] = createSignal(
    JSON.stringify(props.value, null, 2)
  )
  const [error, setError] = createSignal<string | null>(null)

  const handleInput = (text: string) => {
    setTextValue(text)
    try {
      const parsed = JSON.parse(text)
      props.onChange(parsed)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
      {props.control.label && (
        <label
          style={{
            'font-size': 'var(--sk-font-size-sm)',
            'font-family': 'var(--sk-font-ui)',
            color: 'var(--sk-text-secondary)',
          }}
        >
          {props.control.label}
        </label>
      )}
      <textarea
        value={textValue()}
        onInput={(e) => handleInput(e.currentTarget.value)}
        rows={6}
        style={{
          padding: '8px',
          'font-family': 'var(--sk-font-mono)',
          'font-size': 'var(--sk-font-size-sm)',
          background: 'var(--sk-bg-primary)',
          color: 'var(--sk-text-primary)',
          border: `1px solid ${error() ? 'var(--sk-error)' : 'var(--sk-border)'}`,
          'border-radius': 'var(--sk-radius-sm)',
          outline: 'none',
          resize: 'vertical',
        }}
      />
      {error() && (
        <span
          style={{
            'font-size': 'var(--sk-font-size-xs)',
            'font-family': 'var(--sk-font-ui)',
            color: 'var(--sk-error)',
          }}
        >
          {error()}
        </span>
      )}
    </div>
  )
}
