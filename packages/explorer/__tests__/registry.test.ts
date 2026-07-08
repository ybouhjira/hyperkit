import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerStory,
  getAllStories,
  getStory,
  searchStories,
  defineStory,
  clearStories,
} from '../src/api'

describe('registry', () => {
  beforeEach(() => {
    clearStories()
  })

  it('should register a story', () => {
    const story = defineStory({
      title: 'Test Story',
      category: 'Test',
      controls: {},
    })

    registerStory({
      id: 'test-1',
      title: 'Test Story',
      category: 'Test',
      def: story,
    })

    const allStories = getAllStories()
    expect(allStories).toHaveLength(1)
    expect(allStories[0]?.id).toBe('test-1')
  })

  it('should get a story by id', () => {
    const story = defineStory({
      title: 'Test Story',
      category: 'Test',
      controls: {},
    })

    registerStory({
      id: 'test-1',
      title: 'Test Story',
      category: 'Test',
      def: story,
    })

    const retrieved = getStory('test-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.id).toBe('test-1')
  })

  it('should return undefined for non-existent story', () => {
    const retrieved = getStory('non-existent')
    expect(retrieved).toBeUndefined()
  })

  it('should search stories by title', () => {
    const story1 = defineStory({ title: 'Button Story', category: 'Primitives', controls: {} })
    const story2 = defineStory({ title: 'Card Story', category: 'Primitives', controls: {} })

    registerStory({ id: 'button', title: 'Button Story', category: 'Primitives', def: story1 })
    registerStory({ id: 'card', title: 'Card Story', category: 'Primitives', def: story2 })

    const results = searchStories('button')
    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('button')
  })

  it('should search stories by category', () => {
    const story1 = defineStory({ title: 'Story 1', category: 'Components', controls: {} })
    const story2 = defineStory({ title: 'Story 2', category: 'Services', controls: {} })

    registerStory({ id: 's1', title: 'Story 1', category: 'Components', def: story1 })
    registerStory({ id: 's2', title: 'Story 2', category: 'Services', def: story2 })

    const results = searchStories('services')
    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('s2')
  })

  it('should search case-insensitively', () => {
    const story = defineStory({ title: 'Button Story', category: 'Primitives', controls: {} })
    registerStory({ id: 'button', title: 'Button Story', category: 'Primitives', def: story })

    const results = searchStories('BUTTON')
    expect(results).toHaveLength(1)
  })
})
