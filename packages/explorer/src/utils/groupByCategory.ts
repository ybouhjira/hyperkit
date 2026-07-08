import type { StoryEntry, StoryGroup } from '../api/types'

interface TreeNode {
  readonly name: string
  readonly stories: StoryEntry[]
  readonly subgroups: Map<string, TreeNode>
}

function createTreeNode(name: string): TreeNode {
  return {
    name,
    stories: [],
    subgroups: new Map(),
  }
}

function treeNodeToStoryGroup(node: TreeNode): StoryGroup {
  const children: Array<StoryGroup | StoryEntry> = [
    ...node.stories,
    ...Array.from(node.subgroups.values()).map(treeNodeToStoryGroup),
  ]

  return {
    name: node.name,
    children,
  }
}

export function groupByCategory(stories: readonly StoryEntry[]): StoryGroup[] {
  const root = createTreeNode('')

  for (const story of stories) {
    const parts = story.category.split('/').filter((part) => part.length > 0)

    if (parts.length === 0) {
      // Story has no category or empty category - add to root
      ;(root.stories as StoryEntry[]).push(story)
      continue
    }

    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!part) continue

      const isLast = i === parts.length - 1

      if (!current.subgroups.has(part)) {
        ;(current.subgroups as Map<string, TreeNode>).set(
          part,
          createTreeNode(part)
        )
      }

      const nextNode = current.subgroups.get(part)!

      if (isLast) {
        // Add story to this node
        ;(nextNode.stories as StoryEntry[]).push(story)
      } else {
        // Continue traversing
        current = nextNode
      }
    }
  }

  // Convert root's subgroups to StoryGroup array
  return Array.from(root.subgroups.values()).map(treeNodeToStoryGroup)
}
