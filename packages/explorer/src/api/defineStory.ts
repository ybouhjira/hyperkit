import type { JSX } from 'solid-js'
import type { ComponentStoryDef, ControlDef } from './types'

export function defineStory(config: {
  title?: string
  category?: string
  component?: (props: Record<string, unknown>) => JSX.Element
  render?: (props: Record<string, unknown>) => JSX.Element
  controls?: Record<string, ControlDef>
  layout?: 'padded' | 'fullscreen'
}): ComponentStoryDef {
  return {
    kind: 'component',
    title: config.title ?? 'Untitled',
    category: config.category ?? 'Components',
    component: config.component,
    render: config.render,
    controls: config.controls ?? {},
    layout: config.layout,
  }
}
