import { createSignal, onMount } from 'solid-js'
import { defineStory, control } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { GraphView } from '../../src/pm/views/GraphView'
import type { PMIssue } from '../../src/pm/types'
import type { IssueMapGroupBy, IssueMapSwitcherVariant, IssueMapTransition } from '../../src/components/IssueMap/types'
import type { PartsConfig } from '../../src/components/IssueMap/parts'
import type { IssueMapPartName, IssueMapPresetName } from '../../src/components/IssueMap/presets'

const provider = new MockProvider()

export const PMGraphViewStory = defineStory({
  title: 'PM Graph View',
  category: 'PM',
  render: (controlValues: Record<string, unknown>) => {
    const [issues, setIssues] = createSignal<PMIssue[]>([])

    onMount(async () => {
      const allIssues = [
        ...await provider.fetchIssues('ybouhjira/hyperkit'),
        ...await provider.fetchIssues('ybouhjira/phoenix-erp'),
      ]
      setIssues(allIssues as PMIssue[])
    })

    const presetName = (controlValues.preset as string) ?? 'full';
    const behavior = {
      groupBy: (controlValues.groupBy as IssueMapGroupBy) ?? 'project',
      switcherVariant: (controlValues.switcherVariant as IssueMapSwitcherVariant) ?? 'tabs',
      transition: (controlValues.transition as IssueMapTransition) ?? 'crossfade',
      transitionDuration: (controlValues.transitionDuration as number) ?? 300,
      autoFit: (controlValues.autoFit as boolean) ?? true,
      showGrid: (controlValues.showGrid as boolean) ?? false,
    };

    // Part overrides from individual toggles
    const parts: PartsConfig<IssueMapPartName> = {};
    if (controlValues.showZoomControls === false) parts.zoomControls = false;
    if (controlValues.showProgress === false) parts.nodeProgressBar = false;
    if (controlValues.showProjectLabel === false) parts.nodeProjectLabel = false;
    if (controlValues.showLayerGroups === false) parts.layerGroups = false;

    return (
      <div style={{ width: '100%', height: 'calc(100vh - 200px)', 'min-height': '500px' }}>
        <GraphView
          issues={issues()}
          preset={presetName as IssueMapPresetName}
          behavior={behavior}
          parts={parts}
        />
      </div>
    )
  },
  controls: {
    preset: {
      type: 'select' as const,
      options: ['full', 'minimal', 'compact', 'enterprise', 'dashboard'],
      defaultValue: 'full',
    },
    groupBy: {
      type: 'select' as const,
      options: ['project', 'layer', 'status', 'none'],
      defaultValue: 'project',
    },
    switcherVariant: {
      type: 'select' as const,
      options: ['tabs', 'dropdown', 'pill'],
      defaultValue: 'tabs',
    },
    transition: {
      type: 'select' as const,
      options: ['crossfade', 'slide', 'none'],
      defaultValue: 'crossfade',
    },
    transitionDuration: { type: 'number' as const, defaultValue: 300 },
    showZoomControls: { type: 'boolean' as const, defaultValue: true },
    showProgress: { type: 'boolean' as const, defaultValue: true },
    showProjectLabel: { type: 'boolean' as const, defaultValue: true },
    showLayerGroups: { type: 'boolean' as const, defaultValue: true },
    autoFit: { type: 'boolean' as const, defaultValue: true },
    showGrid: { type: 'boolean' as const, defaultValue: false },
  },
})
