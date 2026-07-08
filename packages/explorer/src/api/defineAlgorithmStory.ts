import type { AlgorithmStoryDef, ControlDef } from './types'

export function defineAlgorithmStory(config: {
  name: string
  category?: string
  description?: string
  controls?: Record<string, ControlDef>
  run: (inputs: Record<string, unknown>) => unknown
  visualize?: 'json' | 'table' | 'dag'
}): AlgorithmStoryDef {
  return {
    kind: 'algorithm',
    title: config.name,
    category: config.category ?? 'Algorithms',
    description: config.description,
    controls: config.controls ?? {},
    run: config.run,
    visualize: config.visualize ?? 'json',
  }
}
