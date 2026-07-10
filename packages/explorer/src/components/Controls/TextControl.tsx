import type { TextControlDef } from '../../api/types'

interface TextControlProps {
  readonly control: TextControlDef
  readonly value: string
  readonly onChange: (value: string) => void
}

export function TextControl(props: TextControlProps) {
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
      <input
        type="text"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        style={{
          padding: '6px 8px',
          'font-family': 'var(--sk-font-ui)',
          'font-size': 'var(--sk-font-size-base)',
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
