import { describe, it, expect, vi } from 'vitest'
import { isCSFModule, convertCSFModule } from '../src/api/csfAdapter'

// Sample CSF module that matches the format in src/**/*.stories.tsx
const sampleCSFModule = {
  default: {
    title: 'Data Entry/Button',
    component: (props: { children?: string; variant?: string }) => {
      return null
    },
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: ['primary', 'secondary', 'ghost', 'danger'],
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
      },
      loading: { control: 'boolean' },
      disabled: { control: 'boolean' },
    },
  },
  Primary: {
    args: { children: 'Primary Button', variant: 'primary' },
  },
  Secondary: {
    args: { children: 'Secondary', variant: 'secondary' },
  },
  Ghost: {
    args: { children: 'Ghost', variant: 'ghost' },
  },
  Danger: {
    args: { children: 'Danger', variant: 'danger' },
  },
}

describe('CSF Integration', () => {
  it('detects a real CSF module', () => {
    expect(isCSFModule(sampleCSFModule)).toBe(true)
  })

  it('converts a real CSF module to Explorer format', () => {
    const entries = convertCSFModule(sampleCSFModule, 'src/primitives/Button/Button.stories.tsx')

    // Should create 4 story entries (one for each named export)
    expect(entries).toHaveLength(4)

    // Check first story
    const primaryStory = entries.find((e) => e.title.includes('Primary'))
    expect(primaryStory).toBeDefined()
    expect(primaryStory?.category).toBe('Data Entry')
    expect(primaryStory?.def.kind).toBe('component')

    // Check that controls were converted correctly
    const def = primaryStory?.def
    if (def && def.kind === 'component') {
      expect(def.controls.variant).toBeDefined()
      expect(def.controls.variant.type).toBe('select')
      expect(def.controls.size).toBeDefined()
      expect(def.controls.loading).toBeDefined()
      expect(def.controls.disabled).toBeDefined()
    }
  })

  it('creates working render functions', () => {
    const entries = convertCSFModule(sampleCSFModule, 'src/primitives/Button/Button.stories.tsx')

    const primaryStory = entries.find((e) => e.title.includes('Primary'))
    expect(primaryStory).toBeDefined()

    const def = primaryStory?.def
    if (def && def.kind === 'component') {
      expect(def.render).toBeDefined()

      // Should be able to call the render function
      const result = def.render?.({ variant: 'primary' })
      expect(result).toBeDefined()
    }
  })

  it('handles stories with custom render functions', () => {
    const moduleWithCustomRender = {
      default: {
        title: 'Data Display/Card',
        component: () => null,
      },
      Clickable: {
        render: () => {
          return null
        },
      },
    }

    const entries = convertCSFModule(moduleWithCustomRender, 'src/Card.stories.tsx')
    expect(entries).toHaveLength(1)

    const def = entries[0]?.def
    if (def && def.kind === 'component') {
      expect(def.render).toBeDefined()
      const result = def.render?.({})
      expect(result).toBeDefined()
    }
  })

  it('preserves all story metadata', () => {
    const entries = convertCSFModule(sampleCSFModule, 'src/primitives/Button/Button.stories.tsx')

    // All entries should have valid IDs
    entries.forEach((entry) => {
      expect(entry.id).toBeTruthy()
      expect(entry.id).toMatch(/^[a-z0-9-]+$/)
    })

    // All entries should have the same category
    entries.forEach((entry) => {
      expect(entry.category).toBe('Data Entry')
    })

    // All titles should include the component name
    entries.forEach((entry) => {
      expect(entry.title).toContain('Button')
    })
  })
})
