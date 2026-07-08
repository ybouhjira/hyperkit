import { createSignal } from 'solid-js'
import type { PluginContext } from '../types'

export function useFavoriteStories(ctx: PluginContext) {
  const getFavorites = (): string[] => {
    const saved = ctx.getConfig<string[]>('favoriteStories')
    return saved ?? []
  }

  const [favorites, setFavorites] = createSignal<string[]>(getFavorites())

  function toggle(id: string): void {
    const current = favorites()
    const updated = current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    setFavorites(updated)
    ctx.setConfig('favoriteStories', updated)
  }

  function isFavorite(id: string): boolean {
    return favorites().includes(id)
  }

  return { favorites, toggle, isFavorite }
}
