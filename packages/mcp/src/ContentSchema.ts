import { Schema as S } from 'effect'

// 1. summary-grid
export const SummaryGridItem = S.Struct({
  icon: S.String,
  iconColor: S.optional(S.Literal('teal', 'blue', 'purple')),
  title: S.String,
  description: S.String,
})

export const SummaryGridContent = S.Struct({
  type: S.Literal('summary-grid'),
  items: S.Array(SummaryGridItem),
})

// 2. table
export const TableColumn = S.Struct({
  key: S.String,
  label: S.String,
})

export const TableContent = S.Struct({
  type: S.Literal('table'),
  columns: S.Array(TableColumn),
  rows: S.Array(S.Record({ key: S.String, value: S.String })),
})

// 3. code
export const CodeContent = S.Struct({
  type: S.Literal('code'),
  code: S.String,
  language: S.optional(S.String),
  label: S.optional(S.String),
})

// 4. flow-diagram
export const FlowLayer = S.Struct({
  id: S.String,
  title: S.String,
  packages: S.optional(S.String),
  subtitle: S.optional(S.String),
  color: S.Literal('app', 'adapter', 'core'),
})

export const FlowDiagramContent = S.Struct({
  type: S.Literal('flow-diagram'),
  title: S.optional(S.String),
  layers: S.Array(FlowLayer),
})

// 5. layer-stack
export const LayerStackLayer = S.Struct({
  label: S.String,
  name: S.String,
  info: S.String,
  color: S.Literal('purple', 'blue', 'teal', 'green'),
})

export const LayerStackContent = S.Struct({
  type: S.Literal('layer-stack'),
  layers: S.Array(LayerStackLayer),
})

// 6. gap-analysis
export const GapRow = S.Struct({
  tag: S.Literal('problem', 'solution', 'precedent'),
  text: S.String,
})

export const GapItem = S.Struct({
  id: S.String,
  title: S.String,
  severity: S.Literal('critical', 'important', 'nice'),
  rows: S.optional(S.Array(GapRow)),
})

export const GapAnalysisContent = S.Struct({
  type: S.Literal('gap-analysis'),
  title: S.optional(S.String),
  gaps: S.Array(GapItem),
})

// 7. timeline
export const TimelineStep = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  status: S.optional(S.Literal('completed', 'active', 'pending')),
  meta: S.optional(S.String),
})

export const TimelineContent = S.Struct({
  type: S.Literal('timeline'),
  steps: S.Array(TimelineStep),
})

// 8. package-tree
export const PackageChip = S.Struct({
  label: S.String,
  detail: S.optional(S.String),
})

export const PackageBox = S.Struct({
  name: S.String,
  note: S.optional(S.String),
  items: S.optional(S.Array(S.String)),
  chips: S.optional(S.Array(PackageChip)),
})

export const PackageTreeContent = S.Struct({
  type: S.Literal('package-tree'),
  boxes: S.Array(PackageBox),
})

// 9. preset-grid
export const Preset = S.Struct({
  name: S.String,
  description: S.String,
  gradient: S.String,
})

export const PresetGridContent = S.Struct({
  type: S.Literal('preset-grid'),
  presets: S.Array(Preset),
})

// 10. source-list
export const Source = S.Struct({
  url: S.String,
  label: S.String,
  description: S.optional(S.String),
})

export const SourceGroup = S.Struct({
  title: S.String,
  sources: S.Array(Source),
})

export const SourceListContent = S.Struct({
  type: S.Literal('source-list'),
  groups: S.Array(SourceGroup),
})

// 11. text
export const TextContent = S.Struct({
  type: S.Literal('text'),
  content: S.String,
  html: S.optional(S.Boolean),
})

// 12. issue-list
export const IssueItem = S.Struct({
  icon: S.String,
  title: S.String,
  description: S.String,
})

export const IssueListContent = S.Struct({
  type: S.Literal('issue-list'),
  issues: S.Array(IssueItem),
})

// 13. decision-grid (INTERACTIVE)
export const DecisionOption = S.Struct({
  id: S.String,
  label: S.String,
  description: S.optional(S.String),
  icon: S.optional(S.String),
  tags: S.optional(S.Array(S.String)),
})

export const DecisionGridContent = S.Struct({
  type: S.Literal('decision-grid'),
  id: S.String,
  label: S.String,
  description: S.optional(S.String),
  multiple: S.optional(S.Boolean),
  options: S.Array(DecisionOption),
})

// 14. poll (INTERACTIVE)
export const PollOption = S.Struct({
  id: S.String,
  label: S.String,
})

export const PollContent = S.Struct({
  type: S.Literal('poll'),
  id: S.String,
  label: S.String,
  multiple: S.optional(S.Boolean),
  options: S.Array(PollOption),
})

// 15. form-fields (INTERACTIVE)
export const TextField = S.Struct({
  type: S.Literal('text'),
  id: S.String,
  label: S.String,
  placeholder: S.optional(S.String),
  required: S.optional(S.Boolean),
})

export const NumberField = S.Struct({
  type: S.Literal('number'),
  id: S.String,
  label: S.String,
  min: S.optional(S.Number),
  max: S.optional(S.Number),
  required: S.optional(S.Boolean),
})

export const SelectFieldOption = S.Struct({
  id: S.String,
  label: S.String,
})

export const SelectField = S.Struct({
  type: S.Literal('select'),
  id: S.String,
  label: S.String,
  options: S.Array(SelectFieldOption),
  required: S.optional(S.Boolean),
})

export const CheckboxField = S.Struct({
  type: S.Literal('checkbox'),
  id: S.String,
  label: S.String,
})

export const TextareaField = S.Struct({
  type: S.Literal('textarea'),
  id: S.String,
  label: S.String,
  placeholder: S.optional(S.String),
  required: S.optional(S.Boolean),
})

export const FormFieldDef = S.Union(
  TextField,
  NumberField,
  SelectField,
  CheckboxField,
  TextareaField
)

export const FormFieldsContent = S.Struct({
  type: S.Literal('form-fields'),
  id: S.String,
  label: S.optional(S.String),
  fields: S.Array(FormFieldDef),
})

// 16. mockup-layout
// MockupNode is recursive — use S.suspend
export interface MockupNodeEncoded {
  readonly component: string
  readonly props?: Record<string, unknown>
  readonly children?: string | MockupNodeEncoded | readonly (string | MockupNodeEncoded)[]
  readonly style?: Record<string, string>
  readonly class?: string
}

export const MockupNode: S.Schema<MockupNodeEncoded> = S.suspend(() =>
  S.Struct({
    component: S.String,
    props: S.optional(S.Record({ key: S.String, value: S.Unknown })),
    children: S.optional(
      S.Union(S.String, MockupNode, S.Array(S.Union(S.String, MockupNode)))
    ),
    style: S.optional(S.Record({ key: S.String, value: S.String })),
    class: S.optional(S.String),
  })
).annotations({ identifier: 'MockupNode' })

export const MockupLayoutContent = S.Struct({
  type: S.Literal('mockup-layout'),
  template: S.Literal('document-editor', 'dashboard', 'settings', 'chat', 'split', 'landing'),
  title: S.optional(S.String),
  description: S.optional(S.String),
  theme: S.optional(S.Literal('light', 'dark')),
  width: S.optional(S.String),
  height: S.optional(S.String),
  slots: S.Record({
    key: S.String,
    value: S.Struct({
      children: S.Union(MockupNode, S.Array(MockupNode)),
    }),
  }),
})

// 17. mockup-tree
export const MockupTreeContent = S.Struct({
  type: S.Literal('mockup-tree'),
  title: S.optional(S.String),
  description: S.optional(S.String),
  theme: S.optional(S.Literal('light', 'dark')),
  width: S.optional(S.String),
  height: S.optional(S.String),
  root: MockupNode,
})

// 18. app
export const AppContent = S.Struct({
  type: S.Literal('app'),
  code: S.String,
  title: S.optional(S.String),
  description: S.optional(S.String),
  width: S.optional(S.String),
  height: S.optional(S.String),
})

// The discriminated union of ALL content types
export const SectionContent = S.Union(
  SummaryGridContent,
  TableContent,
  CodeContent,
  FlowDiagramContent,
  LayerStackContent,
  GapAnalysisContent,
  TimelineContent,
  PackageTreeContent,
  PresetGridContent,
  SourceListContent,
  TextContent,
  IssueListContent,
  DecisionGridContent,
  PollContent,
  FormFieldsContent,
  MockupLayoutContent,
  MockupTreeContent,
  AppContent
)

// Inferred types
export type SectionContent = S.Schema.Type<typeof SectionContent>
