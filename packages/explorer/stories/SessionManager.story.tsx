import { SessionManager, type SessionInfo } from '@ybouhjira/hyperkit'
import { defineStory, control } from '../src/api'

const mockSessions: SessionInfo[] = [
  {
    id: '1',
    prompt: 'Implement SessionManager component for SolidKit Explorer',
    status: 'active',
    model: 'claude-opus-4',
    project: 'hyperkit',
    startedAt: '2026-03-08T10:00:00Z',
    duration: 45,
    cost: 2.50,
    tasks: [
      { id: 't1', subject: 'Create component file', status: 'completed' },
      { id: 't2', subject: 'Add TypeScript types', status: 'completed' },
      { id: 't3', subject: 'Implement UI layout', status: 'completed' },
      { id: 't4', subject: 'Add tests', status: 'in_progress' },
      { id: 't5', subject: 'Create story', status: 'pending' }
    ],
    subagents: [
      {
        id: 's1',
        model: 'sonnet',
        status: 'running',
        description: 'Writing component code with inline styles',
        startedAt: '2026-03-08T10:15:00Z',
        parentId: null
      },
      {
        id: 's2',
        model: 'haiku',
        status: 'completed',
        description: 'Researching SolidJS best practices',
        startedAt: '2026-03-08T10:20:00Z',
        parentId: 's1'
      },
      {
        id: 's3',
        model: 'sonnet',
        status: 'waiting',
        description: 'Running vitest tests',
        startedAt: '2026-03-08T10:30:00Z',
        parentId: 's1'
      }
    ]
  },
  {
    id: '2',
    prompt: 'Fix theme CSS variables in Button component',
    status: 'paused',
    model: 'claude-sonnet-4',
    project: 'hyperkit',
    startedAt: '2026-03-08T09:00:00Z',
    duration: 30,
    cost: 1.20,
    tasks: [
      { id: 't6', subject: 'Debug CSS variable scope', status: 'completed' },
      { id: 't7', subject: 'Apply fix to component', status: 'pending' }
    ],
    subagents: [
      {
        id: 's4',
        model: 'haiku',
        status: 'waiting',
        description: 'Checking CSS variable inheritance',
        startedAt: '2026-03-08T09:15:00Z',
        parentId: null
      }
    ]
  },
  {
    id: '3',
    prompt: 'Update API documentation with examples',
    status: 'completed',
    model: 'claude-haiku-4',
    project: 'docs',
    startedAt: '2026-03-08T08:00:00Z',
    duration: 120,
    cost: 0.50,
    tasks: [
      { id: 't8', subject: 'Write component API docs', status: 'completed' },
      { id: 't9', subject: 'Add code examples', status: 'completed' },
      { id: 't10', subject: 'Generate llms.txt', status: 'completed' }
    ],
    subagents: []
  },
  {
    id: '4',
    prompt: 'Deploy to npm registry',
    status: 'failed',
    model: 'claude-opus-4',
    project: 'backend',
    startedAt: '2026-03-08T07:00:00Z',
    duration: 15,
    cost: 0.80,
    tasks: [
      { id: 't11', subject: 'Run npm publish', status: 'completed' }
    ],
    subagents: []
  }
]

export default defineStory({
  title: 'SessionManager',
  component: SessionManager,
  argTypes: {
    groupBy: control.select(['none', 'project', 'status', 'model'], 'none', 'Group By')
  },
  render: (args) => {
    return (
      <SessionManager
        sessions={mockSessions}
        groupBy={args.groupBy === 'none' ? undefined : args.groupBy}
        onViewChat={(id) => console.log('View chat:', id)}
        onPause={(id) => console.log('Pause session:', id)}
        onResume={(id) => console.log('Resume session:', id)}
        onStop={(id) => console.log('Stop session:', id)}
      />
    )
  }
})
