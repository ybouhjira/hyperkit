import { describe, it, expect } from 'vitest'
import { isCSFModule, convertCSFModule } from '../src/api/csfAdapter'
import type { ComponentStoryDef } from '../src/api/types'

describe('csfAdapter', () => {
  describe('isCSFModule', () => {
    it('returns true for a valid CSF module', () => {
      const mod = {
        default: {
          title: 'Data Entry/Button',
          component: () => null,
        },
      }
      expect(isCSFModule(mod)).toBe(true)
    })

    it('returns false for a module without default export', () => {
      const mod = {
        Primary: { args: {} },
      }
      expect(isCSFModule(mod)).toBe(false)
    })

    it('returns false for a module with non-object default export', () => {
      const mod = {
        default: 'not an object',
      }
      expect(isCSFModule(mod)).toBe(false)
    })

    it('returns false for a module with default export missing title', () => {
      const mod = {
        default: {
          component: () => null,
        },
      }
      expect(isCSFModule(mod)).toBe(false)
    })

    it('returns false for a module with non-string title', () => {
      const mod = {
        default: {
          title: 123,
          component: () => null,
        },
      }
      expect(isCSFModule(mod)).toBe(false)
    })
  })

  describe('convertCSFModule', () => {
    describe('title parsing', () => {
      it('parses category and title from slash-separated format', () => {
        const mod = {
          default: {
            title: 'Data Entry/Button',
            component: () => null,
          },
          Primary: {
            args: { children: 'Click' },
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(1)
        expect(entries[0]?.category).toBe('Data Entry')
        expect(entries[0]?.title).toContain('Button')
      })

      it('uses "Components" as default category when no slash present', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Primary: {
            args: { children: 'Click' },
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(1)
        expect(entries[0]?.category).toBe('Components')
      })

      it('handles nested categories with multiple slashes', () => {
        const mod = {
          default: {
            title: 'Forms/Inputs/TextInput',
            component: () => null,
          },
          Default: {
            args: {},
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(1)
        expect(entries[0]?.category).toBe('Forms/Inputs')
        expect(entries[0]?.title).toContain('TextInput')
      })
    })

    describe('story title formatting', () => {
      it('converts PascalCase export names to readable titles', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          AllSizes: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries[0]?.title).toContain('All Sizes')
      })

      it('preserves single-word export names', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Primary: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries[0]?.title).toContain('Primary')
      })

      it('creates full title with component name prefix', () => {
        const mod = {
          default: {
            title: 'Data Entry/Button',
            component: () => null,
          },
          Primary: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries[0]?.title).toBe('Button - Primary')
      })
    })

    describe('argTypes conversion', () => {
      it('converts select control with string form', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              variant: {
                control: 'select',
                options: ['primary', 'secondary'],
              },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.variant).toEqual({
          type: 'select',
          options: ['primary', 'secondary'],
          defaultValue: 'primary',
        })
      })

      it('converts select control with object form', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              size: {
                control: { type: 'select' },
                options: ['sm', 'md', 'lg'],
              },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.size).toEqual({
          type: 'select',
          options: ['sm', 'md', 'lg'],
          defaultValue: 'sm',
        })
      })

      it('converts boolean control', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              disabled: { control: 'boolean' },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.disabled).toEqual({
          type: 'boolean',
          defaultValue: false,
        })
      })

      it('converts text control', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              placeholder: { control: 'text' },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.placeholder).toEqual({
          type: 'text',
          defaultValue: '',
        })
      })

      it('converts number control', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              count: { control: 'number' },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.count).toEqual({
          type: 'number',
          defaultValue: 0,
        })
      })

      it('uses defaultValue.summary when present', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              variant: {
                control: 'select',
                options: ['primary', 'secondary', 'ghost'],
                defaultValue: { summary: 'secondary' },
              },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.variant).toEqual({
          type: 'select',
          options: ['primary', 'secondary', 'ghost'],
          defaultValue: 'secondary',
        })
      })

      it('uses table.defaultValue.summary as fallback', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
            argTypes: {
              size: {
                control: 'select',
                options: ['sm', 'md', 'lg'],
                table: {
                  defaultValue: { summary: 'md' },
                },
              },
            },
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls.size).toEqual({
          type: 'select',
          options: ['sm', 'md', 'lg'],
          defaultValue: 'md',
        })
      })

      it('handles missing argTypes', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Default: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef
        expect(def.controls).toEqual({})
      })
    })

    describe('story exports', () => {
      it('skips default export', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(0)
      })

      it('skips __namedExportsOrder', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          __namedExportsOrder: ['Primary', 'Secondary'],
          Primary: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(1)
        expect(entries[0]?.title).toContain('Primary')
      })

      it('processes multiple story exports', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Primary: { args: {} },
          Secondary: { args: {} },
          Disabled: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(3)
        expect(entries.map((e) => e.title)).toEqual([
          'Button - Primary',
          'Button - Secondary',
          'Button - Disabled',
        ])
      })

      it('skips non-object exports', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Primary: { args: {} },
          someString: 'not a story',
          someNumber: 123,
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries).toHaveLength(1)
      })
    })

    describe('render functions', () => {
      it('creates render function from story args and meta component', () => {
        const TestComponent = (props: { text: string }) => props.text
        const mod = {
          default: {
            title: 'Button',
            component: TestComponent,
          },
          Primary: {
            args: { text: 'Hello' },
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef

        // Render function should merge story args with control values
        const result = def.render?.({ override: 'World' })
        expect(result).toBeDefined()
      })

      it('uses story render function when present', () => {
        const customRender = () => 'Custom Render'
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          WithRender: {
            render: customRender,
          },
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef

        expect(def.render).toBeDefined()
      })

      it('creates render function with only meta component', () => {
        const TestComponent = () => 'Test'
        const mod = {
          default: {
            title: 'Button',
            component: TestComponent,
          },
          Simple: {},
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef

        expect(def.render).toBeDefined()
      })

      it('provides fallback render when no component or render available', () => {
        const mod = {
          default: {
            title: 'Button',
          },
          NoRender: {},
        }
        const entries = convertCSFModule(mod, 'test/path')
        const def = entries[0]?.def as ComponentStoryDef

        const result = def.render?.({})
        expect(result).toBeDefined()
      })
    })

    describe('story IDs', () => {
      it('generates unique IDs from path and export name', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          Primary: { args: {} },
          Secondary: { args: {} },
        }
        const entries = convertCSFModule(mod, 'test/path')
        expect(entries[0]?.id).toMatch(/test-path-primary/)
        expect(entries[1]?.id).toMatch(/test-path-secondary/)
      })

      it('normalizes IDs to lowercase with hyphens', () => {
        const mod = {
          default: {
            title: 'Button',
            component: () => null,
          },
          AllSizes: { args: {} },
        }
        const entries = convertCSFModule(mod, 'Test/Path/File.stories.tsx')
        expect(entries[0]?.id).toMatch(/^[a-z0-9-]+$/)
      })
    })

    describe('integration', () => {
      it('converts a realistic Button story module', () => {
        const ButtonComponent = () => null
        const mod = {
          default: {
            title: 'Data Entry/Button',
            component: ButtonComponent,
            argTypes: {
              variant: {
                control: 'select',
                options: ['primary', 'secondary', 'ghost'],
              },
              size: {
                control: 'select',
                options: ['sm', 'md', 'lg'],
              },
              disabled: { control: 'boolean' },
            },
          },
          Primary: {
            args: { children: 'Primary Button', variant: 'primary' },
          },
          Secondary: {
            args: { children: 'Secondary', variant: 'secondary' },
          },
          Loading: {
            render: () => 'Loading...',
          },
        }

        const entries = convertCSFModule(mod, 'src/Button.stories.tsx')
        expect(entries).toHaveLength(3)

        // Check first story
        expect(entries[0]?.category).toBe('Data Entry')
        expect(entries[0]?.title).toBe('Button - Primary')
        const def0 = entries[0]?.def as ComponentStoryDef
        expect(def0.kind).toBe('component')
        expect(def0.controls.variant).toBeDefined()
        expect(def0.controls.size).toBeDefined()
        expect(def0.controls.disabled).toBeDefined()
        expect(def0.render).toBeDefined()

        // Check story with custom render
        expect(entries[2]?.title).toBe('Button - Loading')
        const def2 = entries[2]?.def as ComponentStoryDef
        expect(def2.render).toBeDefined()
      })

      it('converts a story module without argTypes', () => {
        const mod = {
          default: {
            title: 'Feedback/Spinner',
            component: () => null,
          },
          Default: {
            render: () => 'Spinner',
          },
          Large: {
            render: () => 'Large Spinner',
          },
        }

        const entries = convertCSFModule(mod, 'src/Spinner.stories.tsx')
        expect(entries).toHaveLength(2)

        entries.forEach((entry) => {
          expect(entry.category).toBe('Feedback')
          const def = entry.def as ComponentStoryDef
          expect(def.controls).toEqual({})
          expect(def.render).toBeDefined()
        })
      })
    })
  })
})
