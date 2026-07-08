import { Schema as S, Either } from 'effect'
import {
  SummaryGridContent,
  SummaryGridItem,
  TableContent,
  TableColumn,
  CodeContent,
  FlowDiagramContent,
  FlowLayer,
  LayerStackContent,
  LayerStackLayer,
  GapAnalysisContent,
  GapItem,
  GapRow,
  TimelineContent,
  PackageTreeContent,
  PresetGridContent,
  SourceListContent,
  TextContent,
  IssueListContent,
  DecisionGridContent,
  DecisionOption,
  PollContent,
  PollOption,
  FormFieldsContent,
  MockupLayoutContent,
  MockupTreeContent,
  MockupNode,
  AppContent,
  SectionContent,
} from './ContentSchema.js'

// --- helpers ---

function valid<A, I>(schema: S.Schema<A, I>, data: unknown): void {
  const result = S.decodeUnknownEither(schema)(data)
  expect(Either.isRight(result)).toBe(true)
}

function invalid<A, I>(schema: S.Schema<A, I>, data: unknown): void {
  const result = S.decodeUnknownEither(schema)(data)
  expect(Either.isLeft(result)).toBe(true)
}

// ─────────────────────────────────────────────
// 1. SummaryGridContent
// ─────────────────────────────────────────────

describe('SummaryGridContent', () => {
  const base = {
    type: 'summary-grid',
    items: [{ icon: '✅', title: 'Title', description: 'Desc' }],
  }

  it('accepts valid data', () => {
    valid(SummaryGridContent, base)
  })

  it('accepts optional iconColor', () => {
    valid(SummaryGridContent, {
      ...base,
      items: [{ icon: '✅', iconColor: 'teal', title: 'T', description: 'D' }],
    })
  })

  it('rejects missing type', () => {
    invalid(SummaryGridContent, { items: base.items })
  })

  it('rejects wrong type literal', () => {
    invalid(SummaryGridContent, { ...base, type: 'grid' })
  })

  it('rejects item missing icon', () => {
    invalid(SummaryGridItem, { title: 'T', description: 'D' })
  })

  it('rejects item missing title', () => {
    invalid(SummaryGridItem, { icon: '✅', description: 'D' })
  })

  it('rejects item missing description', () => {
    invalid(SummaryGridItem, { icon: '✅', title: 'T' })
  })

  it('rejects invalid iconColor value', () => {
    invalid(SummaryGridItem, { icon: '✅', iconColor: 'red', title: 'T', description: 'D' })
  })
})

// ─────────────────────────────────────────────
// 2. TableContent
// ─────────────────────────────────────────────

describe('TableContent', () => {
  const base = {
    type: 'table',
    columns: [{ key: 'name', label: 'Name' }],
    rows: [{ name: 'Alice' }],
  }

  it('accepts valid data', () => {
    valid(TableContent, base)
  })

  it('rejects string columns instead of {key, label} objects', () => {
    invalid(TableContent, { ...base, columns: ['name', 'age'] })
  })

  it('rejects column missing key', () => {
    invalid(TableColumn, { label: 'Name' })
  })

  it('rejects column missing label', () => {
    invalid(TableColumn, { key: 'name' })
  })

  it('rejects missing columns', () => {
    invalid(TableContent, { type: 'table', rows: [] })
  })

  it('rejects missing rows', () => {
    invalid(TableContent, { type: 'table', columns: [] })
  })
})

// ─────────────────────────────────────────────
// 3. CodeContent
// ─────────────────────────────────────────────

describe('CodeContent', () => {
  it('accepts minimal valid data', () => {
    valid(CodeContent, { type: 'code', code: 'const x = 1' })
  })

  it('accepts with optional language and label', () => {
    valid(CodeContent, { type: 'code', code: 'const x = 1', language: 'ts', label: 'Example' })
  })

  it('rejects missing code', () => {
    invalid(CodeContent, { type: 'code' })
  })

  it('rejects wrong type literal', () => {
    invalid(CodeContent, { type: 'snippet', code: 'x' })
  })
})

// ─────────────────────────────────────────────
// 4. FlowDiagramContent
// ─────────────────────────────────────────────

describe('FlowDiagramContent', () => {
  const layer = { id: 'l1', title: 'App Layer', color: 'app' as const }

  it('accepts valid data', () => {
    valid(FlowDiagramContent, { type: 'flow-diagram', layers: [layer] })
  })

  it('accepts with optional title', () => {
    valid(FlowDiagramContent, { type: 'flow-diagram', title: 'My Flow', layers: [layer] })
  })

  it('rejects layer missing id', () => {
    invalid(FlowLayer, { title: 'App', color: 'app' })
  })

  it('rejects layer with invalid color', () => {
    invalid(FlowLayer, { id: 'l1', title: 'App', color: 'orange' })
  })

  it('rejects missing layers', () => {
    invalid(FlowDiagramContent, { type: 'flow-diagram' })
  })
})

// ─────────────────────────────────────────────
// 5. LayerStackContent
// ─────────────────────────────────────────────

describe('LayerStackContent', () => {
  const layer = { label: 'UI', name: 'SolidJS', info: 'Reactivity', color: 'purple' as const }

  it('accepts valid data', () => {
    valid(LayerStackContent, { type: 'layer-stack', layers: [layer] })
  })

  it('rejects layer with invalid color', () => {
    invalid(LayerStackLayer, { label: 'UI', name: 'SolidJS', info: 'Reactivity', color: 'red' })
  })

  it('rejects layer missing info', () => {
    invalid(LayerStackLayer, { label: 'UI', name: 'SolidJS', color: 'blue' })
  })
})

// ─────────────────────────────────────────────
// 6. GapAnalysisContent
// ─────────────────────────────────────────────

describe('GapAnalysisContent', () => {
  const gap = {
    id: 'g1',
    title: 'Missing tests',
    severity: 'critical' as const,
    rows: [{ tag: 'problem' as const, text: 'No coverage' }],
  }

  it('accepts valid data', () => {
    valid(GapAnalysisContent, { type: 'gap-analysis', gaps: [gap] })
  })

  it('accepts without optional title', () => {
    valid(GapAnalysisContent, { type: 'gap-analysis', gaps: [] })
  })

  it('rejects gap missing id', () => {
    invalid(GapItem, { title: 'Missing tests', severity: 'critical' })
  })

  it('rejects gap with invalid severity', () => {
    invalid(GapItem, { id: 'g1', title: 'X', severity: 'low' })
  })

  it('rejects row with invalid tag', () => {
    invalid(GapRow, { tag: 'note', text: 'something' })
  })
})

// ─────────────────────────────────────────────
// 7. TimelineContent
// ─────────────────────────────────────────────

describe('TimelineContent', () => {
  it('accepts valid data with all optional fields', () => {
    valid(TimelineContent, {
      type: 'timeline',
      steps: [
        { title: 'Step 1', description: 'First step', status: 'completed', meta: 'Week 1' },
        { title: 'Step 2', status: 'active' },
        { title: 'Step 3', status: 'pending' },
      ],
    })
  })

  it('accepts minimal steps (title only)', () => {
    valid(TimelineContent, { type: 'timeline', steps: [{ title: 'Step 1' }] })
  })

  it('rejects step missing title', () => {
    invalid(TimelineContent, { type: 'timeline', steps: [{ status: 'active' }] })
  })

  it('rejects step with invalid status', () => {
    invalid(TimelineContent, { type: 'timeline', steps: [{ title: 'X', status: 'done' }] })
  })
})

// ─────────────────────────────────────────────
// 8. PackageTreeContent
// ─────────────────────────────────────────────

describe('PackageTreeContent', () => {
  it('accepts valid data', () => {
    valid(PackageTreeContent, {
      type: 'package-tree',
      boxes: [
        {
          name: 'hyperkit',
          note: 'Main package',
          items: ['Button', 'Text'],
          chips: [{ label: 'v2.5.0', detail: 'stable' }],
        },
      ],
    })
  })

  it('accepts minimal box (name only)', () => {
    valid(PackageTreeContent, { type: 'package-tree', boxes: [{ name: 'pkg' }] })
  })

  it('rejects box missing name', () => {
    invalid(PackageTreeContent, { type: 'package-tree', boxes: [{ items: ['x'] }] })
  })
})

// ─────────────────────────────────────────────
// 9. PresetGridContent
// ─────────────────────────────────────────────

describe('PresetGridContent', () => {
  const preset = { name: 'Ocean', description: 'Blue tones', gradient: 'linear-gradient(...)' }

  it('accepts valid data', () => {
    valid(PresetGridContent, { type: 'preset-grid', presets: [preset] })
  })

  it('rejects preset missing gradient', () => {
    invalid(PresetGridContent, {
      type: 'preset-grid',
      presets: [{ name: 'Ocean', description: 'Blue' }],
    })
  })

  it('rejects preset missing description', () => {
    invalid(PresetGridContent, {
      type: 'preset-grid',
      presets: [{ name: 'Ocean', gradient: 'linear-gradient(...)' }],
    })
  })
})

// ─────────────────────────────────────────────
// 10. SourceListContent
// ─────────────────────────────────────────────

describe('SourceListContent', () => {
  it('accepts valid data', () => {
    valid(SourceListContent, {
      type: 'source-list',
      groups: [
        {
          title: 'References',
          sources: [{ url: 'https://example.com', label: 'Example', description: 'A site' }],
        },
      ],
    })
  })

  it('accepts source without optional description', () => {
    valid(SourceListContent, {
      type: 'source-list',
      groups: [{ title: 'Refs', sources: [{ url: 'https://x.com', label: 'X' }] }],
    })
  })

  it('rejects source missing url', () => {
    invalid(SourceListContent, {
      type: 'source-list',
      groups: [{ title: 'Refs', sources: [{ label: 'X' }] }],
    })
  })

  it('rejects group missing title', () => {
    invalid(SourceListContent, {
      type: 'source-list',
      groups: [{ sources: [] }],
    })
  })
})

// ─────────────────────────────────────────────
// 11. TextContent
// ─────────────────────────────────────────────

describe('TextContent', () => {
  it('accepts plain text', () => {
    valid(TextContent, { type: 'text', content: 'Hello world' })
  })

  it('accepts with html flag', () => {
    valid(TextContent, { type: 'text', content: '<b>Bold</b>', html: true })
  })

  it('rejects missing content', () => {
    invalid(TextContent, { type: 'text' })
  })

  it('rejects html as non-boolean', () => {
    invalid(TextContent, { type: 'text', content: 'x', html: 'yes' })
  })
})

// ─────────────────────────────────────────────
// 12. IssueListContent
// ─────────────────────────────────────────────

describe('IssueListContent', () => {
  it('accepts valid data', () => {
    valid(IssueListContent, {
      type: 'issue-list',
      issues: [{ icon: '⚠️', title: 'Missing tests', description: 'No coverage' }],
    })
  })

  it('rejects issue missing icon', () => {
    invalid(IssueListContent, {
      type: 'issue-list',
      issues: [{ title: 'Missing tests', description: 'No coverage' }],
    })
  })

  it('rejects issue missing description', () => {
    invalid(IssueListContent, {
      type: 'issue-list',
      issues: [{ icon: '⚠️', title: 'Missing tests' }],
    })
  })
})

// ─────────────────────────────────────────────
// 13. DecisionGridContent — common mistake cases
// ─────────────────────────────────────────────

describe('DecisionGridContent', () => {
  const base = {
    type: 'decision-grid',
    id: 'tech-stack',
    label: 'Pick a framework',
    options: [
      { id: 'solid', label: 'SolidJS' },
      { id: 'react', label: 'React', description: 'Meta', icon: '⚛️', tags: ['popular'] },
    ],
  }

  it('accepts valid data', () => {
    valid(DecisionGridContent, base)
  })

  it('accepts with optional multiple and description', () => {
    valid(DecisionGridContent, { ...base, multiple: true, description: 'Choose wisely' })
  })

  it('rejects missing top-level id', () => {
    const { id: _id, ...noId } = base
    invalid(DecisionGridContent, noId)
  })

  it('rejects missing top-level label', () => {
    const { label: _label, ...noLabel } = base
    invalid(DecisionGridContent, noLabel)
  })

  it('rejects option missing id', () => {
    invalid(DecisionOption, { label: 'SolidJS' })
  })

  it('rejects option missing label', () => {
    invalid(DecisionOption, { id: 'solid' })
  })

  it('rejects options as plain strings', () => {
    invalid(DecisionGridContent, { ...base, options: ['solid', 'react'] })
  })
})

// ─────────────────────────────────────────────
// 14. PollContent — common mistake cases
// ─────────────────────────────────────────────

describe('PollContent', () => {
  const base = {
    type: 'poll',
    id: 'fav-color',
    label: 'Favorite color?',
    options: [
      { id: 'blue', label: 'Blue' },
      { id: 'red', label: 'Red' },
    ],
  }

  it('accepts valid data', () => {
    valid(PollContent, base)
  })

  it('accepts with optional multiple', () => {
    valid(PollContent, { ...base, multiple: true })
  })

  it('rejects missing id', () => {
    const { id: _id, ...noId } = base
    invalid(PollContent, noId)
  })

  it('rejects missing label', () => {
    const { label: _label, ...noLabel } = base
    invalid(PollContent, noLabel)
  })

  it('rejects options as plain strings instead of {id, label} objects', () => {
    invalid(PollContent, { ...base, options: ['Blue', 'Red'] })
  })

  it('rejects option missing id', () => {
    invalid(PollOption, { label: 'Blue' })
  })

  it('rejects option missing label', () => {
    invalid(PollOption, { id: 'blue' })
  })
})

// ─────────────────────────────────────────────
// 15. FormFieldsContent
// ─────────────────────────────────────────────

describe('FormFieldsContent', () => {
  it('accepts text field', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'my-form',
      fields: [{ type: 'text', id: 'name', label: 'Name' }],
    })
  })

  it('accepts number field with min/max', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'my-form',
      fields: [{ type: 'number', id: 'age', label: 'Age', min: 0, max: 120 }],
    })
  })

  it('accepts select field', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'my-form',
      fields: [
        {
          type: 'select',
          id: 'role',
          label: 'Role',
          options: [{ id: 'admin', label: 'Admin' }],
        },
      ],
    })
  })

  it('accepts checkbox field', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'my-form',
      fields: [{ type: 'checkbox', id: 'agree', label: 'I agree' }],
    })
  })

  it('accepts textarea field', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'my-form',
      fields: [{ type: 'textarea', id: 'bio', label: 'Bio', placeholder: 'Tell us...' }],
    })
  })

  it('accepts mixed field types', () => {
    valid(FormFieldsContent, {
      type: 'form-fields',
      id: 'registration',
      label: 'Register',
      fields: [
        { type: 'text', id: 'name', label: 'Name', required: true },
        { type: 'number', id: 'age', label: 'Age' },
        { type: 'checkbox', id: 'agree', label: 'Agree' },
      ],
    })
  })

  it('rejects missing id at top level', () => {
    invalid(FormFieldsContent, {
      type: 'form-fields',
      fields: [{ type: 'text', id: 'x', label: 'X' }],
    })
  })

  it('rejects unknown field type', () => {
    invalid(FormFieldsContent, {
      type: 'form-fields',
      id: 'f',
      fields: [{ type: 'date', id: 'dob', label: 'DOB' }],
    })
  })

  it('rejects field missing id', () => {
    invalid(FormFieldsContent, {
      type: 'form-fields',
      id: 'f',
      fields: [{ type: 'text', label: 'Name' }],
    })
  })
})

// ─────────────────────────────────────────────
// 16. MockupLayoutContent
// ─────────────────────────────────────────────

describe('MockupLayoutContent', () => {
  const node = { component: 'Button', children: 'Click me' }

  it('accepts valid data', () => {
    valid(MockupLayoutContent, {
      type: 'mockup-layout',
      template: 'dashboard',
      slots: { main: { children: node } },
    })
  })

  it('accepts all valid template values', () => {
    const templates = ['document-editor', 'dashboard', 'settings', 'chat', 'split', 'landing'] as const
    for (const template of templates) {
      valid(MockupLayoutContent, {
        type: 'mockup-layout',
        template,
        slots: { main: { children: node } },
      })
    }
  })

  it('accepts slot children as array of nodes', () => {
    valid(MockupLayoutContent, {
      type: 'mockup-layout',
      template: 'split',
      slots: { left: { children: [node, node] }, right: { children: node } },
    })
  })

  it('rejects invalid template value', () => {
    invalid(MockupLayoutContent, {
      type: 'mockup-layout',
      template: 'wizard',
      slots: {},
    })
  })

  it('rejects missing template', () => {
    invalid(MockupLayoutContent, { type: 'mockup-layout', slots: {} })
  })
})

// ─────────────────────────────────────────────
// 17. MockupTreeContent + MockupNode (recursive)
// ─────────────────────────────────────────────

describe('MockupTreeContent', () => {
  it('accepts a simple tree', () => {
    valid(MockupTreeContent, {
      type: 'mockup-tree',
      root: { component: 'Stack', children: 'Hello' },
    })
  })

  it('accepts nested nodes', () => {
    valid(MockupTreeContent, {
      type: 'mockup-tree',
      root: {
        component: 'Flex',
        props: { gap: 'md' },
        children: [
          { component: 'Text', children: 'Title' },
          { component: 'Button', children: 'Click' },
        ],
      },
    })
  })

  it('accepts deeply nested recursive nodes', () => {
    valid(MockupNode, {
      component: 'Stack',
      children: {
        component: 'Flex',
        children: [
          { component: 'Text', children: 'A' },
          {
            component: 'Stack',
            children: { component: 'Badge', children: 'inner' },
          },
        ],
      },
    })
  })

  it('accepts node with style and class', () => {
    valid(MockupNode, {
      component: 'Box',
      style: { padding: '8px' },
      class: 'my-class',
      children: 'content',
    })
  })

  it('rejects node missing component', () => {
    invalid(MockupNode, { children: 'Hello' })
  })

  it('rejects missing root', () => {
    invalid(MockupTreeContent, { type: 'mockup-tree' })
  })
})

// ─────────────────────────────────────────────
// 18. AppContent
// ─────────────────────────────────────────────

describe('AppContent', () => {
  it('accepts minimal valid data', () => {
    valid(AppContent, { type: 'app', code: 'export default function App() { return null }' })
  })

  it('accepts with all optional fields', () => {
    valid(AppContent, {
      type: 'app',
      code: 'export default function App() { return null }',
      title: 'My App',
      description: 'A demo',
      width: '800px',
      height: '600px',
    })
  })

  it('rejects missing code', () => {
    invalid(AppContent, { type: 'app' })
  })

  it('rejects wrong type literal', () => {
    invalid(AppContent, { type: 'application', code: 'x' })
  })
})

// ─────────────────────────────────────────────
// SectionContent — discriminated union dispatch
// ─────────────────────────────────────────────

describe('SectionContent union discrimination', () => {
  it('dispatches to summary-grid', () => {
    const result = S.decodeUnknownEither(SectionContent)({
      type: 'summary-grid',
      items: [{ icon: '✅', title: 'T', description: 'D' }],
    })
    expect(Either.isRight(result)).toBe(true)
    if (Either.isRight(result)) {
      expect(result.right.type).toBe('summary-grid')
    }
  })

  it('dispatches to table', () => {
    const result = S.decodeUnknownEither(SectionContent)({
      type: 'table',
      columns: [{ key: 'k', label: 'L' }],
      rows: [],
    })
    expect(Either.isRight(result)).toBe(true)
    if (Either.isRight(result)) {
      expect(result.right.type).toBe('table')
    }
  })

  it('dispatches to decision-grid', () => {
    const result = S.decodeUnknownEither(SectionContent)({
      type: 'decision-grid',
      id: 'my-decision',
      label: 'Choose',
      options: [{ id: 'a', label: 'Option A' }],
    })
    expect(Either.isRight(result)).toBe(true)
    if (Either.isRight(result)) {
      expect(result.right.type).toBe('decision-grid')
    }
  })

  it('dispatches to poll', () => {
    const result = S.decodeUnknownEither(SectionContent)({
      type: 'poll',
      id: 'p1',
      label: 'Vote',
      options: [{ id: 'y', label: 'Yes' }],
    })
    expect(Either.isRight(result)).toBe(true)
    if (Either.isRight(result)) {
      expect(result.right.type).toBe('poll')
    }
  })

  it('dispatches to app', () => {
    const result = S.decodeUnknownEither(SectionContent)({ type: 'app', code: 'export default () => null' })
    expect(Either.isRight(result)).toBe(true)
    if (Either.isRight(result)) {
      expect(result.right.type).toBe('app')
    }
  })

  it('rejects unknown type', () => {
    invalid(SectionContent, { type: 'unknown-widget', data: {} })
  })

  it('rejects decision-grid with missing id (common mistake)', () => {
    invalid(SectionContent, {
      type: 'decision-grid',
      label: 'Choose',
      options: [{ id: 'a', label: 'A' }],
    })
  })

  it('rejects poll with string options (common mistake)', () => {
    invalid(SectionContent, {
      type: 'poll',
      id: 'p1',
      label: 'Vote',
      options: ['yes', 'no'],
    })
  })

  it('rejects table with string columns (common mistake)', () => {
    invalid(SectionContent, {
      type: 'table',
      columns: ['name', 'age'],
      rows: [],
    })
  })

  it('rejects summary-grid item missing icon (common mistake)', () => {
    invalid(SectionContent, {
      type: 'summary-grid',
      items: [{ title: 'T', description: 'D' }],
    })
  })
})
