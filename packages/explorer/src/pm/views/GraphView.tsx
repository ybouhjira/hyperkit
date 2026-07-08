import { createMemo, Show } from 'solid-js'
import type { PMIssue } from '../types'
import { toIssueMapData } from '../mappers'
import { IssueMap } from '../../components/IssueMap/IssueMap'
import type { IssueMapBehavior } from '../../components/IssueMap/types'
import type { PartsConfig, ComponentPreset } from '../../components/IssueMap/parts'
import type { IssueMapPartName, IssueMapPresetName } from '../../components/IssueMap/presets'
import { Spinner } from '@ybouhjira/hyperkit'

export interface GraphViewProps {
  issues: readonly PMIssue[]
  issueMapConfig?: Partial<IssueMapBehavior>
  behavior?: Partial<IssueMapBehavior>
  preset?: IssueMapPresetName | ComponentPreset<IssueMapPartName>
  parts?: PartsConfig<IssueMapPartName>
}

export function GraphView(props: GraphViewProps) {
  const issueData = createMemo(() => props.issues.map(toIssueMapData))

  return (
    <Show when={issueData().length > 0} fallback={
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '100%', gap: '12px' }}>
        <Spinner size="lg" color="primary" />
        <span style={{ color: 'var(--sk-text-secondary)', 'font-size': '14px' }}>Loading issue graph...</span>
      </div>
    }>
      <div style={{ width: '100%', height: '100%', 'min-height': '500px' }}>
        <IssueMap
          issues={issueData()}
          config={props.issueMapConfig}
          behavior={props.behavior}
          preset={props.preset}
          parts={props.parts}
        />
      </div>
    </Show>
  )
}
