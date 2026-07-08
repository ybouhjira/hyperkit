import { For } from 'solid-js'
import type { SelectControlDef } from '../../api/types'

interface SelectControlProps {
  readonly control: SelectControlDef
  readonly value: string
  readonly onChange: (value: string) => void
}

export function SelectControl(props: SelectControlProps) {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
      {props.control.label && (
        <label
          style={{
            'font-size': '12px',
            'font-family': 'var(--sk-font-ui)',
            color: 'var(--sk-text-secondary)',
          }}
        >
          {props.control.label}
        </label>
      )}
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        style={{
          padding: '6px 8px',
          'font-family': 'var(--sk-font-ui)',
          'font-size': '13px',
          background: 'var(--sk-bg-primary)',
          color: 'var(--sk-text-primary)',
          border: '1px solid var(--sk-border)',
          'border-radius': 'var(--sk-radius-sm)',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <For each={[...props.control.options]}>
          {(option) => <option value={option}>{option}</option>}
        </For>
      </select>
    </div>
  )
}
