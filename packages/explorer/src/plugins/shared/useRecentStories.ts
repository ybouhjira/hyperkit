import { createSignal } from 'solid-js'
import type { PluginContext } from '../types'

const DEFAULT_MAX = 10

export function useRecentStories(ctx: PluginContext, maxItems = DEFAULT_MAX) {
  const getRecent = (): string[] => {
    const saved = ctx.getConfig<string[]>('recentStories')
    return saved ?? []
  }

  const [recent, setRecent] = createSignal<string[]>(getRecent())

  function push(id: string): void {
    const current = recent().filter((r) => r !== id)
    const updated = [id, ...current].slice(0, maxItems)
    setRecent(updated)
    ctx.setConfig('recentStories', updated)
  }

  return { recent, push }
}
