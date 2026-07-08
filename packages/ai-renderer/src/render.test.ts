import { Effect } from 'effect'
import { MockProvider } from '@ybouhjira/hyperkit-llm-pipeline'
import type { LlmRequest } from '@ybouhjira/hyperkit-llm-pipeline'
import { CONTENT_TYPE_CATALOG, extractJson, renderData, rendererStep } from './index.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function run<Out>(
  program: Effect.Effect<Out, unknown, never>,
): Promise<Out> {
  return Effect.runPromise(program)
}

const SUMMARY_GRID_RESPONSE = JSON.stringify([
  {
    type: 'summary-grid',
    items: [
      { icon: '💻', title: 'CPU', description: '80% usage', iconColor: 'teal' },
      { icon: '🧠', title: 'Memory', description: '60% usage', iconColor: 'blue' },
      { icon: '💾', title: 'Disk', description: '45% usage', iconColor: 'purple' },
    ],
  },
])

const TABLE_RESPONSE = JSON.stringify([
  {
    type: 'table',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      { name: 'Service A', status: 'Running' },
      { name: 'Service B', status: 'Stopped' },
    ],
  },
])

const TIMELINE_RESPONSE = JSON.stringify([
  {
    type: 'timeline',
    steps: [
      { title: 'Planning', description: 'Requirements gathered', status: 'completed' },
      { title: 'Development', description: 'In progress', status: 'active' },
      { title: 'Deployment', status: 'pending' },
    ],
  },
])

// ---------------------------------------------------------------------------
// extractJson — unit tests
// ---------------------------------------------------------------------------

describe('extractJson', () => {
  it('parses a raw JSON array string', () => {
    const input = '[{"type":"text","content":"hello"}]'
    expect(extractJson(input)).toEqual([{ type: 'text', content: 'hello' }])
  })

  it('extracts JSON from a ```json code block', () => {
    const input = '```json\n[{"type":"text","content":"hi"}]\n```'
    expect(extractJson(input)).toEqual([{ type: 'text', content: 'hi' }])
  })

  it('extracts JSON from a ``` code block without language tag', () => {
    const input = '```\n[{"type":"code","code":"console.log()"}]\n```'
    expect(extractJson(input)).toEqual([{ type: 'code', code: 'console.log()' }])
  })

  it('throws SyntaxError on completely invalid JSON', () => {
    expect(() => extractJson('not json at all')).toThrow(SyntaxError)
  })

  it('throws SyntaxError on malformed JSON inside code block', () => {
    expect(() => extractJson('```json\n{broken\n```')).toThrow(SyntaxError)
  })

  it('handles JSON with leading/trailing whitespace', () => {
    const input = '  [{"type":"text","content":"ok"}]  '
    expect(extractJson(input)).toEqual([{ type: 'text', content: 'ok' }])
  })
})

// ---------------------------------------------------------------------------
// rendererStep — unit tests
// ---------------------------------------------------------------------------

describe('rendererStep', () => {
  it('creates a step with the default model "haiku"', () => {
    const step = rendererStep()
    expect(step.config.model).toBe('haiku')
  })

  it('creates a step with a custom model', () => {
    const step = rendererStep({ model: 'sonnet' })
    expect(step.config.model).toBe('sonnet')
  })

  it('uses the catalog as the base system prompt', () => {
    const step = rendererStep()
    expect(step.config.systemPrompt).toContain('summary-grid')
    expect(step.config.systemPrompt).toContain('table')
    expect(step.config.systemPrompt).toContain('timeline')
  })

  it('appends additional context to the system prompt', () => {
    const step = rendererStep({ additionalContext: 'Focus on security metrics.' })
    expect(step.config.systemPrompt).toContain('Focus on security metrics.')
    expect(step.config.systemPrompt).toContain('ADDITIONAL CONTEXT:')
    // Catalog content is still present
    expect(step.config.systemPrompt).toContain('summary-grid')
  })

  it('does not include ADDITIONAL CONTEXT section when omitted', () => {
    const step = rendererStep()
    expect(step.config.systemPrompt).not.toContain('ADDITIONAL CONTEXT:')
  })

  it('sets custom maxAttempts in the retry config', () => {
    const step = rendererStep({ maxAttempts: 5 })
    expect(step.config.retry?.maxAttempts).toBe(5)
  })

  it('defaults to maxAttempts: 2', () => {
    const step = rendererStep()
    expect(step.config.retry?.maxAttempts).toBe(2)
  })

  it('enables feedbackOnError by default', () => {
    const step = rendererStep()
    expect(step.config.retry?.feedbackOnError).toBe(true)
  })

  it('names the step "ui-renderer"', () => {
    const step = rendererStep()
    expect(step.config.name).toBe('ui-renderer')
  })

  it('builds a prompt that includes the intent', () => {
    const step = rendererStep()
    const prompt = step.config.buildPrompt('show CPU metrics')
    expect(prompt).toContain('show CPU metrics')
  })
})

// ---------------------------------------------------------------------------
// renderData — integration tests with MockProvider
// ---------------------------------------------------------------------------

describe('renderData — integration', () => {
  it('renders a summary-grid from metrics intent', async () => {
    const program = renderData('CPU 80%, Memory 60%, Disk 45%').pipe(
      Effect.provide(MockProvider({ haiku: SUMMARY_GRID_RESPONSE })),
    )

    const { content } = await run(program)
    expect(content).toHaveLength(1)
    expect(content[0]!.type).toBe('summary-grid')
  })

  it('renders a table from tabular data intent', async () => {
    const program = renderData('List of services with their statuses').pipe(
      Effect.provide(MockProvider({ haiku: TABLE_RESPONSE })),
    )

    const { content } = await run(program)
    expect(content).toHaveLength(1)
    expect(content[0]!.type).toBe('table')
  })

  it('renders a timeline from progress intent', async () => {
    const program = renderData('Project phases: planning done, development in progress, deployment pending').pipe(
      Effect.provide(MockProvider({ haiku: TIMELINE_RESPONSE })),
    )

    const { content } = await run(program)
    expect(content).toHaveLength(1)
    expect(content[0]!.type).toBe('timeline')
  })

  it('returns a valid PipelineTrace with timing and cost data', async () => {
    const program = renderData('test intent').pipe(
      Effect.provide(MockProvider({ haiku: SUMMARY_GRID_RESPONSE })),
    )

    const { trace } = await run(program)
    expect(trace.pipelineName).toBe('ai-renderer')
    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0]!.stepName).toBe('ui-renderer')
    expect(trace.totalDurationMs).toBeGreaterThanOrEqual(0)
    expect(trace.totalTokens.input).toBeGreaterThan(0)
    expect(trace.totalTokens.output).toBeGreaterThan(0)
    expect(trace.totalCostUsd).toBeGreaterThanOrEqual(0)
  })

  it('handles LLM returning markdown-wrapped JSON', async () => {
    const markdownWrapped = `\`\`\`json\n${SUMMARY_GRID_RESPONSE}\n\`\`\``

    const program = renderData('metrics').pipe(
      Effect.provide(MockProvider({ haiku: markdownWrapped })),
    )

    const { content } = await run(program)
    expect(content).toHaveLength(1)
    expect(content[0]!.type).toBe('summary-grid')
  })

  it('handles markdown-wrapped JSON without language tag', async () => {
    const markdownWrapped = `\`\`\`\n${SUMMARY_GRID_RESPONSE}\n\`\`\``

    const program = renderData('metrics').pipe(
      Effect.provide(MockProvider({ haiku: markdownWrapped })),
    )

    const { content } = await run(program)
    expect(content[0]!.type).toBe('summary-grid')
  })

  it('fails with LlmError when LLM returns invalid JSON after all retries', async () => {
    const program = renderData('test', { maxAttempts: 2 }).pipe(
      Effect.provide(MockProvider({ haiku: 'this is not json {{{' })),
    )

    await expect(Effect.runPromise(program)).rejects.toThrow()
  })

  it('succeeds on retry after first attempt returns bad JSON', async () => {
    let callCount = 0

    const program = renderData('metrics', { maxAttempts: 2 }).pipe(
      Effect.provide(
        MockProvider(() => {
          callCount++
          if (callCount === 1) return 'bad json {{{'
          return SUMMARY_GRID_RESPONSE
        }),
      ),
    )

    const { content, trace } = await run(program)
    expect(content[0]!.type).toBe('summary-grid')
    expect(trace.steps[0]!.attempts).toBe(2)
  })

  it('passes intent text to the LLM prompt', async () => {
    const capturedRequests: LlmRequest[] = []
    const intent = 'show disk usage for server-01'

    const program = renderData(intent).pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          capturedRequests.push(req)
          return SUMMARY_GRID_RESPONSE
        }),
      ),
    )

    await run(program)
    expect(capturedRequests[0]!.userPrompt).toContain(intent)
  })

  it('uses the system prompt from the catalog', async () => {
    const capturedRequests: LlmRequest[] = []

    const program = renderData('test').pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          capturedRequests.push(req)
          return SUMMARY_GRID_RESPONSE
        }),
      ),
    )

    await run(program)
    expect(capturedRequests[0]!.systemPrompt).toContain('summary-grid')
  })

  it('uses a custom model when specified', async () => {
    const capturedRequests: LlmRequest[] = []

    const program = renderData('test', { model: 'sonnet' }).pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          capturedRequests.push(req)
          return SUMMARY_GRID_RESPONSE
        }),
      ),
    )

    await run(program)
    expect(capturedRequests[0]!.model).toBe('sonnet')
  })

  it('includes additionalContext in the system prompt sent to the LLM', async () => {
    const capturedRequests: LlmRequest[] = []

    const program = renderData('test', { additionalContext: 'Focus on reliability.' }).pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          capturedRequests.push(req)
          return SUMMARY_GRID_RESPONSE
        }),
      ),
    )

    await run(program)
    expect(capturedRequests[0]!.systemPrompt).toContain('Focus on reliability.')
  })

  it('renders multiple content blocks in one response', async () => {
    const multiResponse = JSON.stringify([
      {
        type: 'text',
        content: 'Overview of the system',
      },
      {
        type: 'summary-grid',
        items: [{ icon: '✅', title: 'All good', description: 'No issues' }],
      },
    ])

    const program = renderData('system overview').pipe(
      Effect.provide(MockProvider({ haiku: multiResponse })),
    )

    const { content } = await run(program)
    expect(content).toHaveLength(2)
    expect(content[0]!.type).toBe('text')
    expect(content[1]!.type).toBe('summary-grid')
  })

  it('marks the pipeline trace as successful on success', async () => {
    const program = renderData('test').pipe(
      Effect.provide(MockProvider({ haiku: SUMMARY_GRID_RESPONSE })),
    )

    const { trace } = await run(program)
    expect(trace.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CONTENT_TYPE_CATALOG — sanity checks
// ---------------------------------------------------------------------------

describe('CONTENT_TYPE_CATALOG', () => {
  const ALL_TYPES = [
    'summary-grid',
    'table',
    'code',
    'flow-diagram',
    'layer-stack',
    'gap-analysis',
    'timeline',
    'package-tree',
    'preset-grid',
    'source-list',
    'text',
    'issue-list',
    'decision-grid',
    'poll',
    'form-fields',
    'mockup-layout',
    'mockup-tree',
    'app',
  ]

  it('is a non-empty string', () => {
    expect(typeof CONTENT_TYPE_CATALOG).toBe('string')
    expect(CONTENT_TYPE_CATALOG.length).toBeGreaterThan(0)
  })

  it.each(ALL_TYPES)('contains content type "%s"', (typeName) => {
    expect(CONTENT_TYPE_CATALOG).toContain(typeName)
  })

  it('contains exactly 18 content type definitions', () => {
    const count = ALL_TYPES.filter((t) => CONTENT_TYPE_CATALOG.includes(t)).length
    expect(count).toBe(18)
  })

  it('contains a SELECTION GUIDE section', () => {
    expect(CONTENT_TYPE_CATALOG).toContain('SELECTION GUIDE')
  })

  it('contains RULES section', () => {
    expect(CONTENT_TYPE_CATALOG).toContain('RULES:')
  })
})
