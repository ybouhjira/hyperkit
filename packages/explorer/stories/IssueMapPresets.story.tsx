import { defineStory } from '../src/api';
import { IssueMap } from '../src/components/IssueMap/IssueMap';
import type { IssueData } from '../src/components/IssueMap/types';
import type { IssueMapPresetName } from '../src/components/IssueMap/presets';

const DEMO_ISSUES: IssueData[] = [
  {
    id: 'issue-1',
    number: 1,
    title: 'Core Infrastructure Setup',
    status: 'active',
    progress: { done: 2, total: 5 },
    dependsOn: [],
    layer: 'Infrastructure',
    project: 'demo',
  },
  {
    id: 'issue-2',
    number: 2,
    title: 'API Design and Implementation',
    status: 'active',
    progress: { done: 1, total: 3 },
    dependsOn: ['issue-1'],
    layer: 'Core',
    project: 'demo',
  },
  {
    id: 'issue-3',
    number: 3,
    title: 'User Dashboard Component',
    status: 'ready',
    progress: { done: 0, total: 4 },
    dependsOn: ['issue-2'],
    layer: 'Features',
    project: 'demo',
  },
  {
    id: 'issue-4',
    number: 4,
    title: 'Authentication Module',
    status: 'blocked',
    progress: { done: 0, total: 2 },
    dependsOn: ['issue-2'],
    layer: 'Features',
    project: 'demo',
  },
  {
    id: 'issue-5',
    number: 5,
    title: 'Testing Framework',
    status: 'pending',
    progress: { done: 0, total: 0 },
    dependsOn: ['issue-1'],
    layer: 'Infrastructure',
    project: 'demo',
  },
];

const PRESETS: Array<{ name: IssueMapPresetName; title: string; description: string }> = [
  {
    name: 'full',
    title: 'Full (Default)',
    description: 'All features enabled — switcher, zoom, groups, labels, progress',
  },
  {
    name: 'minimal',
    title: 'Minimal',
    description: 'Clean graph with just issue numbers and titles',
  },
  {
    name: 'compact',
    title: 'Compact',
    description: 'Compact view with number, title, and badge only',
  },
  {
    name: 'enterprise',
    title: 'Enterprise',
    description: 'Full features with refined enterprise styling',
  },
  {
    name: 'dashboard',
    title: 'Dashboard',
    description: 'Embedded view without navigation chrome',
  },
];

export const IssueMapPresetsStory = defineStory({
  title: 'Issue Map Presets Gallery',
  category: 'Tools',
  render: () => {
    return (
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(600px, 1fr))',
          gap: '24px',
          padding: '24px',
          background: 'var(--sk-bg-primary, #0a0a0a)',
          'min-height': '100vh',
        }}
      >
        {PRESETS.map((preset) => (
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              border: '1px solid var(--sk-border, #333)',
              'border-radius': 'var(--sk-radius-lg, 12px)',
              overflow: 'hidden',
              background: 'var(--sk-bg-secondary, #1a1a1a)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                'border-bottom': '1px solid var(--sk-border, #333)',
                background: 'var(--sk-bg-elevated, #242424)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 8px 0',
                  'font-size': '18px',
                  'font-weight': '600',
                  color: 'var(--sk-text-primary, #fff)',
                  'font-family': 'var(--sk-font-ui)',
                }}
              >
                {preset.title}
              </h3>
              <p
                style={{
                  margin: '0',
                  'font-size': '13px',
                  color: 'var(--sk-text-secondary, #aaa)',
                  'font-family': 'var(--sk-font-ui)',
                  'line-height': '1.4',
                }}
              >
                {preset.description}
              </p>
            </div>
            <div style={{ flex: '1', 'min-height': '400px', position: 'relative' }}>
              <IssueMap issues={DEMO_ISSUES} preset={preset.name} />
            </div>
          </div>
        ))}
      </div>
    );
  },
  controls: {},
});
