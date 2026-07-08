import { describe, it, expect } from 'vitest'
import { control } from '../src/api'

describe('controls', () => {
  it('should create text control', () => {
    const textControl = control.text('default', 'Label')
    expect(textControl.type).toBe('text')
    expect(textControl.defaultValue).toBe('default')
    expect(textControl.label).toBe('Label')
  })

  it('should create number control', () => {
    const numberControl = control.number(42, { min: 0, max: 100, step: 1, label: 'Count' })
    expect(numberControl.type).toBe('number')
    expect(numberControl.defaultValue).toBe(42)
    expect(numberControl.min).toBe(0)
    expect(numberControl.max).toBe(100)
    expect(numberControl.step).toBe(1)
    expect(numberControl.label).toBe('Count')
  })

  it('should create boolean control', () => {
    const booleanControl = control.boolean(true, 'Enabled')
    expect(booleanControl.type).toBe('boolean')
    expect(booleanControl.defaultValue).toBe(true)
    expect(booleanControl.label).toBe('Enabled')
  })

  it('should create select control', () => {
    const selectControl = control.select(['a', 'b', 'c'], 'b', 'Choice')
    expect(selectControl.type).toBe('select')
    expect(selectControl.options).toEqual(['a', 'b', 'c'])
    expect(selectControl.defaultValue).toBe('b')
    expect(selectControl.label).toBe('Choice')
  })

  it('should create json control', () => {
    const jsonControl = control.json({ key: 'value' }, 'Data')
    expect(jsonControl.type).toBe('json')
    expect(jsonControl.defaultValue).toEqual({ key: 'value' })
    expect(jsonControl.label).toBe('Data')
  })
})
