import type { ServiceStoryDef } from './types'

export function defineServiceStory(config: {
  name: string
  category?: string
  description?: string
  actions: Record<string, () => Promise<unknown> | unknown>
  output?: { showLogs?: boolean; showTiming?: boolean }
}): ServiceStoryDef {
  return {
    kind: 'service',
    title: config.name,
    category: config.category ?? 'Services',
    description: config.description,
    actions: config.actions,
    output: config.output,
  }
}
