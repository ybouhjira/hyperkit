import type { NumberControlDef } from '../../api/types'

interface NumberControlProps {
  readonly control: NumberControlDef
  readonly value: number
  readonly onChange: (value: number) => void
}

export function NumberControl(props: NumberControlProps) {
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
        type="number"
        value={props.value}
        min={props.control.min}
        max={props.control.max}
        step={props.control.step ?? 1}
        onInput={(e) => props.onChange(parseFloat(e.currentTarget.value))}
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
