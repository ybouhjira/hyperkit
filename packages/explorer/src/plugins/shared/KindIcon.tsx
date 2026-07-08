import type { StoryDef } from '../../api/types'

interface KindIconProps {
  kind: StoryDef['kind']
}

const KIND_ICONS: Record<StoryDef['kind'], string> = {
  component: '🧩',
  service: '⚡',
  algorithm: '📊',
}

const KIND_COLORS: Record<StoryDef['kind'], string> = {
  component: 'var(--sk-accent)',
  service: 'var(--sk-success)',
  algorithm: 'var(--sk-warning)',
}

export function KindIcon(props: KindIconProps) {
  return (
    <span
      title={props.kind}
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: '16px',
        height: '16px',
        'font-size': '11px',
        color: KIND_COLORS[props.kind] ?? 'var(--sk-text-muted)',
        'flex-shrink': '0',
      }}
    >
      {KIND_ICONS[props.kind] ?? '•'}
    </span>
  )
}

export function KindDot(props: KindIconProps) {
  const color = () => KIND_COLORS[props.kind] ?? 'var(--sk-text-muted)'

  return (
    <span
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        'border-radius': '50%',
        background: color(),
        'flex-shrink': '0',
      }}
    />
  )
}
