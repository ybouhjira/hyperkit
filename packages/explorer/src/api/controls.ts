import type {
  TextControlDef,
  NumberControlDef,
  BooleanControlDef,
  SelectControlDef,
  JsonControlDef,
} from './types'

export const control = {
  text: (defaultValue: string, label?: string): TextControlDef => ({
    type: 'text',
    defaultValue,
    label,
  }),

  number: (
    defaultValue: number,
    opts?: { min?: number; max?: number; step?: number; label?: string }
  ): NumberControlDef => ({
    type: 'number',
    defaultValue,
    ...opts,
  }),

  boolean: (defaultValue: boolean, label?: string): BooleanControlDef => ({
    type: 'boolean',
    defaultValue,
    label,
  }),

  select: (
    options: readonly string[],
    defaultValue: string,
    label?: string
  ): SelectControlDef => ({
    type: 'select',
    options,
    defaultValue,
    label,
  }),

  json: (defaultValue: unknown, label?: string): JsonControlDef => ({
    type: 'json',
    defaultValue,
    label,
  }),
}
