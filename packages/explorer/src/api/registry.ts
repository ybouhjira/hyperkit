import type { StoryEntry } from './types'

const stories: Map<string, StoryEntry> = new Map()

export function registerStory(entry: StoryEntry): void {
  stories.set(entry.id, entry)
}

export function clearStories(): void {
  stories.clear()
}

export function getAllStories(): StoryEntry[] {
  return Array.from(stories.values())
}

export function getStory(id: string): StoryEntry | undefined {
  return stories.get(id)
}

export function searchStories(query: string): StoryEntry[] {
  const q = query.toLowerCase()
  return getAllStories().filter(
    (s) =>
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  )
}
