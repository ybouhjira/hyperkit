import type { BooleanControlDef } from '../../api/types'

interface BooleanControlProps {
  readonly control: BooleanControlDef
  readonly value: boolean
  readonly onChange: (value: boolean) => void
}

export function BooleanControl(props: BooleanControlProps) {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer',
        }}
      />
      {props.control.label && (
        <label
          style={{
            'font-size': 'var(--sk-font-size-base)',
            'font-family': 'var(--sk-font-ui)',
            color: 'var(--sk-text-primary)',
            cursor: 'pointer',
          }}
        >
          {props.control.label}
        </label>
      )}
    </div>
  )
}
