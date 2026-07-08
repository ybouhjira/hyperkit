import type { StoryDef } from '../../api/types'

interface KindBadgeProps {
  kind: StoryDef['kind']
}

const KIND_COLORS: Record<StoryDef['kind'], string> = {
  component: 'var(--sk-accent)',
  service: 'var(--sk-success)',
  algorithm: 'var(--sk-warning)',
}

const KIND_LABELS: Record<StoryDef['kind'], string> = {
  component: 'Component',
  service: 'Service',
  algorithm: 'Algorithm',
}

export function KindBadge(props: KindBadgeProps) {
  const color = () => KIND_COLORS[props.kind] ?? 'var(--sk-text-muted)'
  const label = () => KIND_LABELS[props.kind] ?? props.kind

  return (
    <span
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        padding: '1px var(--sk-space-xs)',
        'border-radius': 'var(--sk-radius-sm)',
        'font-size': 'var(--sk-font-size-xs)',
        'font-family': 'var(--sk-font-ui)',
        'font-weight': '500',
        color: color(),
        background: `color-mix(in srgb, ${color()} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color()} 30%, transparent)`,
        'white-space': 'nowrap',
      }}
    >
      {label()}
    </span>
  )
}
