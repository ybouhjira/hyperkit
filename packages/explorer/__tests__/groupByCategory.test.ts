import { describe, it, expect } from 'vitest'
import { groupByCategory } from '../src/utils/groupByCategory'
import type { StoryEntry, StoryGroup } from '../src/api/types'

describe('groupByCategory', () => {
  it('should handle empty array', () => {
    const result = groupByCategory([])
    expect(result).toEqual([])
  })

  it('should handle single-level categories', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Story 1',
        category: 'Primitives',
        def: { kind: 'component', title: 'Story 1', category: 'Primitives', controls: {} },
      },
      {
        id: '2',
        title: 'Story 2',
        category: 'Primitives',
        def: { kind: 'component', title: 'Story 2', category: 'Primitives', controls: {} },
      },
    ]

    const result = groupByCategory(stories)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Primitives')
    expect(result[0].children).toHaveLength(2)
    expect(result[0].children[0]).toEqual(stories[0])
    expect(result[0].children[1]).toEqual(stories[1])
  })

  it('should handle nested categories (Primitives/Button)', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Button Story',
        category: 'Primitives/Button',
        def: {
          kind: 'component',
          title: 'Button Story',
          category: 'Primitives/Button',
          controls: {},
        },
      },
      {
        id: '2',
        title: 'Card Story',
        category: 'Primitives/Card',
        def: {
          kind: 'component',
          title: 'Card Story',
          category: 'Primitives/Card',
          controls: {},
        },
      },
    ]

    const result = groupByCategory(stories)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Primitives')
    expect(result[0].children).toHaveLength(2)

    const buttonGroup = result[0].children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Button'
    )
    const cardGroup = result[0].children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Card'
    )

    expect(buttonGroup).toBeDefined()
    expect(buttonGroup?.children).toHaveLength(1)
    expect(buttonGroup?.children[0]).toEqual(stories[0])

    expect(cardGroup).toBeDefined()
    expect(cardGroup?.children).toHaveLength(1)
    expect(cardGroup?.children[0]).toEqual(stories[1])
  })

  it('should handle mixed single-level and nested categories', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Button Story',
        category: 'Primitives/Button',
        def: {
          kind: 'component',
          title: 'Button Story',
          category: 'Primitives/Button',
          controls: {},
        },
      },
      {
        id: '2',
        title: 'Text Story',
        category: 'Primitives',
        def: {
          kind: 'component',
          title: 'Text Story',
          category: 'Primitives',
          controls: {},
        },
      },
      {
        id: '3',
        title: 'Card Story',
        category: 'Primitives/Card',
        def: {
          kind: 'component',
          title: 'Card Story',
          category: 'Primitives/Card',
          controls: {},
        },
      },
    ]

    const result = groupByCategory(stories)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Primitives')
    expect(result[0].children).toHaveLength(3)

    // Should have: Text story + Button subgroup + Card subgroup
    const textStory = result[0].children.find(
      (c): c is StoryEntry => 'id' in c && c.title === 'Text Story'
    )
    const buttonGroup = result[0].children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Button'
    )
    const cardGroup = result[0].children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Card'
    )

    expect(textStory).toBeDefined()
    expect(buttonGroup).toBeDefined()
    expect(buttonGroup?.children).toHaveLength(1)
    expect(cardGroup).toBeDefined()
    expect(cardGroup?.children).toHaveLength(1)
  })

  it('should handle multiple top-level categories', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Button',
        category: 'Primitives',
        def: { kind: 'component', title: 'Button', category: 'Primitives', controls: {} },
      },
      {
        id: '2',
        title: 'Dashboard',
        category: 'Composites',
        def: { kind: 'component', title: 'Dashboard', category: 'Composites', controls: {} },
      },
    ]

    const result = groupByCategory(stories)

    expect(result).toHaveLength(2)

    const primitivesGroup = result.find((g) => g.name === 'Primitives')
    const compositesGroup = result.find((g) => g.name === 'Composites')

    expect(primitivesGroup).toBeDefined()
    expect(primitivesGroup?.children).toHaveLength(1)

    expect(compositesGroup).toBeDefined()
    expect(compositesGroup?.children).toHaveLength(1)
  })

  it('should handle empty category string', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Story',
        category: '',
        def: { kind: 'component', title: 'Story', category: '', controls: {} },
      },
    ]

    const result = groupByCategory(stories)

    // Empty categories should be ignored, resulting in empty array
    expect(result).toEqual([])
  })

  it('should handle deeply nested categories', () => {
    const stories: StoryEntry[] = [
      {
        id: '1',
        title: 'Deep Story',
        category: 'Level1/Level2/Level3',
        def: {
          kind: 'component',
          title: 'Deep Story',
          category: 'Level1/Level2/Level3',
          controls: {},
        },
      },
    ]

    const result = groupByCategory(stories)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Level1')

    const level2 = result[0].children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Level2'
    )
    expect(level2).toBeDefined()

    const level3 = level2?.children.find(
      (c): c is StoryGroup => 'name' in c && c.name === 'Level3'
    )
    expect(level3).toBeDefined()
    expect(level3?.children).toHaveLength(1)
    expect(level3?.children[0]).toEqual(stories[0])
  })
})
