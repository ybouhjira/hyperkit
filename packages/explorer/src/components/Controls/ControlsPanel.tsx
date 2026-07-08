import { For, Show, createEffect } from 'solid-js'
import type { ControlDef } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'
import { TextControl } from './TextControl'
import { NumberControl } from './NumberControl'
import { BooleanControl } from './BooleanControl'
import { SelectControl } from './SelectControl'
import { JsonControl } from './JsonControl'

interface ControlsPanelProps {
  readonly controls: Record<string, ControlDef>
}

export function ControlsPanel(props: ControlsPanelProps) {
  const { state, actions } = useExplorer()

  createEffect(() => {
    const entries = Object.entries(props.controls)
    for (const [key, control] of entries) {
      if (!(key in state.controlValues)) {
        actions.setControlValue(key, control.defaultValue)
      }
    }
  })

  const controlEntries = () => Object.entries(props.controls)

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--sk-bg-secondary)',
        'border-top': '1px solid var(--sk-border)',
        'overflow-y': 'auto',
        'max-height': '300px',
      }}
    >
      <Show
        when={controlEntries().length > 0}
        fallback={
          <div
            style={{
              'font-family': 'var(--sk-font-ui)',
              'font-size': '13px',
              color: 'var(--sk-text-secondary)',
              'text-align': 'center',
              padding: '20px',
            }}
          >
            No controls available
          </div>
        }
      >
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
          <For each={controlEntries()}>
            {([key, control]) => {
              const value = () => state.controlValues[key] ?? control.defaultValue
              const onChange = (newValue: unknown) => {
                actions.setControlValue(key, newValue)
              }

              return (
                <div>
                  {control.type === 'text' && (
                    <TextControl
                      control={control}
                      value={value() as string}
                      onChange={onChange}
                    />
                  )}
                  {control.type === 'number' && (
                    <NumberControl
                      control={control}
                      value={value() as number}
                      onChange={onChange}
                    />
                  )}
                  {control.type === 'boolean' && (
                    <BooleanControl
                      control={control}
                      value={value() as boolean}
                      onChange={onChange}
                    />
                  )}
                  {control.type === 'select' && (
                    <SelectControl
                      control={control}
                      value={value() as string}
                      onChange={onChange}
                    />
                  )}
                  {control.type === 'json' && (
                    <JsonControl
                      control={control}
                      value={value()}
                      onChange={onChange}
                    />
                  )}
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
