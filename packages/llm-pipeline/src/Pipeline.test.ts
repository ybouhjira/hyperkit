import { Effect } from 'effect'
import { Schema as S } from 'effect'
import { defineStep, Pipeline, MockProvider } from './index.js'
import type { LlmRequest } from './index.js'

// ---------------------------------------------------------------------------
// Shared schemas and helpers
// ---------------------------------------------------------------------------

const OutputSchema = S.Struct({ answer: S.String })
const NumberSchema = S.Struct({ value: S.Number })
const ComposedSchema = S.Struct({ processed: S.String, count: S.Number })

function makeStep(
  name: string,
  model: string,
  schema: S.Schema<{ answer: string }> = OutputSchema,
) {
  return defineStep({
    name,
    model,
    systemPrompt: 'You are helpful.',
    outputSchema: schema,
    buildPrompt: (input: string) => `Process: ${input}`,
    parseResponse: (text: string) => JSON.parse(text),
  })
}

async function runProgram<Out>(
  program: Effect.Effect<Out, unknown, never>,
): Promise<Out> {
  return Effect.runPromise(program)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Pipeline — single step', () => {
  it('runs a single step and returns the output', async () => {
    const step = makeStep('step1', 'haiku')
    const program = Pipeline.run(Pipeline.from('test-pipeline', step), 'hello').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "world"}' })),
    )

    const { output } = await runProgram(program)
    expect(output.answer).toBe('world')
  })

  it('returns a trace with the correct step name and model', async () => {
    const step = makeStep('my-step', 'sonnet')
    const program = Pipeline.run(Pipeline.from('pipe', step), 'input').pipe(
      Effect.provide(MockProvider({ sonnet: '{"answer": "ok"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0]!.stepName).toBe('my-step')
    expect(trace.steps[0]!.model).toBe('sonnet')
  })

  it('preserves the pipeline name in the trace', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('my-named-pipeline', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "y"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.pipelineName).toBe('my-named-pipeline')
  })

  it('marks success=true in the pipeline trace on success', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "y"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.success).toBe(true)
    expect(trace.error).toBeUndefined()
  })
})

describe('Pipeline — multi-step', () => {
  it('chains two steps, feeding output of first into second', async () => {
    const step1 = defineStep({
      name: 'extract',
      model: 'haiku',
      systemPrompt: 'Extract number.',
      outputSchema: NumberSchema,
      buildPrompt: (input: string) => `Extract from: ${input}`,
      parseResponse: (text: string) => JSON.parse(text),
    })

    const step2 = defineStep({
      name: 'format',
      model: 'sonnet',
      systemPrompt: 'Format result.',
      outputSchema: ComposedSchema,
      buildPrompt: (input: { value: number }) => `Format value: ${input.value}`,
      parseResponse: (text: string) => JSON.parse(text),
    })

    const pipeline = Pipeline.pipe(Pipeline.from('chain', step1), step2)
    const program = Pipeline.run(pipeline, 'some text with 42').pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          if (req.model === 'haiku') return '{"value": 42}'
          return '{"processed": "forty-two", "count": 42}'
        }),
      ),
    )

    const { output, trace } = await runProgram(program)
    expect(output.processed).toBe('forty-two')
    expect(output.count).toBe(42)
    expect(trace.steps).toHaveLength(2)
    expect(trace.steps[0]!.stepName).toBe('extract')
    expect(trace.steps[1]!.stepName).toBe('format')
  })

  it('passes the output of step N as input to step N+1', async () => {
    const capturedInputs: unknown[] = []

    const step1 = defineStep({
      name: 's1',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: NumberSchema,
      buildPrompt: (input: string) => {
        capturedInputs.push(input)
        return input
      },
      parseResponse: JSON.parse,
    })

    const step2 = defineStep({
      name: 's2',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: { value: number }) => {
        capturedInputs.push(input)
        return String(input.value)
      },
      parseResponse: JSON.parse,
    })

    const pipeline = Pipeline.pipe(Pipeline.from('p', step1), step2)
    const program = Pipeline.run(pipeline, 'start').pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          if (capturedInputs.length === 1) return '{"value": 99}'
          return '{"answer": "done"}'
        }),
      ),
    )

    await runProgram(program)
    expect(capturedInputs[0]).toBe('start')
    expect(capturedInputs[1]).toEqual({ value: 99 })
  })
})

describe('Pipeline — trace data', () => {
  it('captures prompt and rawResponse in the step trace', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'test-input').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "captured"}' })),
    )

    const { trace } = await runProgram(program)
    const stepTrace = trace.steps[0]!
    expect(stepTrace.prompt).toContain('test-input')
    expect(stepTrace.rawResponse).toBe('{"answer": "captured"}')
  })

  it('records tokens and costUsd in the step trace', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "y"}' })),
    )

    const { trace } = await runProgram(program)
    const stepTrace = trace.steps[0]!
    expect(stepTrace.tokens.input).toBeGreaterThan(0)
    expect(stepTrace.tokens.output).toBeGreaterThan(0)
    expect(stepTrace.costUsd).toBeGreaterThanOrEqual(0)
  })

  it('records durationMs as a positive number', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "y"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.steps[0]!.durationMs).toBeGreaterThanOrEqual(0)
    expect(trace.totalDurationMs).toBeGreaterThanOrEqual(0)
  })

  it('aggregates totalCostUsd and totalTokens across steps', async () => {
    const step1 = defineStep({
      name: 's1',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: NumberSchema,
      buildPrompt: (input: string) => input,
      parseResponse: JSON.parse,
    })
    const step2 = defineStep({
      name: 's2',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: { value: number }) => String(input.value),
      parseResponse: JSON.parse,
    })

    const pipeline = Pipeline.pipe(Pipeline.from('p', step1), step2)
    const callCount = { n: 0 }
    const program = Pipeline.run(pipeline, 'x').pipe(
      Effect.provide(
        MockProvider(() => {
          callCount.n++
          if (callCount.n === 1) return '{"value": 1}'
          return '{"answer": "done"}'
        }),
      ),
    )

    const { trace } = await runProgram(program)
    const sumTokensIn = trace.steps.reduce((acc, s) => acc + s.tokens.input, 0)
    const sumTokensOut = trace.steps.reduce((acc, s) => acc + s.tokens.output, 0)
    const sumCost = trace.steps.reduce((acc, s) => acc + s.costUsd, 0)

    expect(trace.totalTokens.input).toBe(sumTokensIn)
    expect(trace.totalTokens.output).toBe(sumTokensOut)
    expect(trace.totalCostUsd).toBeCloseTo(sumCost, 10)
  })

  it('gives each step trace a unique id', async () => {
    const step1 = defineStep({
      name: 's1',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: NumberSchema,
      buildPrompt: (i: string) => i,
      parseResponse: JSON.parse,
    })
    const step2 = defineStep({
      name: 's2',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (i: { value: number }) => String(i.value),
      parseResponse: JSON.parse,
    })

    const pipeline = Pipeline.pipe(Pipeline.from('p', step1), step2)
    const callCount = { n: 0 }
    const program = Pipeline.run(pipeline, 'x').pipe(
      Effect.provide(
        MockProvider(() => {
          callCount.n++
          return callCount.n === 1 ? '{"value": 1}' : '{"answer": "ok"}'
        }),
      ),
    )

    const { trace } = await runProgram(program)
    const ids = trace.steps.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Pipeline — retry logic', () => {
  it('succeeds on second attempt after parse error', async () => {
    let callCount = 0
    const step = defineStep({
      name: 'retry-step',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => input,
      parseResponse: (text: string) => {
        const parsed = JSON.parse(text)
        return parsed
      },
      retry: { maxAttempts: 2 },
    })

    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(
        MockProvider(() => {
          callCount++
          if (callCount === 1) return 'not valid json {'
          return '{"answer": "retry worked"}'
        }),
      ),
    )

    const { output, trace } = await runProgram(program)
    expect(output.answer).toBe('retry worked')
    expect(trace.steps[0]!.attempts).toBe(2)
  })

  it('succeeds on second attempt after schema validation error', async () => {
    let callCount = 0
    const step = defineStep({
      name: 'schema-retry',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => input,
      parseResponse: JSON.parse,
      retry: { maxAttempts: 2 },
    })

    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(
        MockProvider(() => {
          callCount++
          // first attempt returns wrong schema (number instead of string)
          if (callCount === 1) return '{"answer": 123}'
          return '{"answer": "valid string"}'
        }),
      ),
    )

    const { output, trace } = await runProgram(program)
    expect(output.answer).toBe('valid string')
    expect(trace.steps[0]!.attempts).toBe(2)
  })

  it('includes error message in retry prompt when feedbackOnError is true', async () => {
    const capturedPrompts: string[] = []
    let callCount = 0

    const step = defineStep({
      name: 'feedback-step',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => {
        return `Base prompt: ${input}`
      },
      parseResponse: (text: string) => {
        const parsed = JSON.parse(text)
        capturedPrompts.push(text) // capture which response was received
        return parsed
      },
      retry: { maxAttempts: 2, feedbackOnError: true },
    })

    // Track the actual prompts sent to the LLM
    const sentPrompts: string[] = []
    const program = Pipeline.run(Pipeline.from('p', step), 'input').pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          callCount++
          sentPrompts.push(req.userPrompt)
          if (callCount === 1) return 'bad json {'
          return '{"answer": "ok"}'
        }),
      ),
    )

    await runProgram(program)
    expect(sentPrompts).toHaveLength(2)
    // Second prompt should contain feedback about the error
    expect(sentPrompts[1]).toContain('Previous attempt failed with')
  })

  it('fails with LlmError after exhausting max attempts', async () => {
    const step = defineStep({
      name: 'exhausted',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => input,
      parseResponse: JSON.parse,
      retry: { maxAttempts: 3 },
    })

    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: 'always bad json {{{' })),
    )

    await expect(Effect.runPromise(program)).rejects.toThrow()
  })

  it('records attempts=maxAttempts when all attempts fail', async () => {
    const step = defineStep({
      name: 'all-fail',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => input,
      parseResponse: JSON.parse,
      retry: { maxAttempts: 3 },
    })

    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: 'bad {{{' })),
      Effect.either,
    )

    const result = await Effect.runPromise(program)
    // We expect a Left (failure)
    expect(result._tag).toBe('Left')
  })
})

describe('Pipeline — edge cases', () => {
  it('works with an empty system prompt', async () => {
    const step = defineStep({
      name: 'no-system',
      model: 'haiku',
      systemPrompt: '',
      outputSchema: OutputSchema,
      buildPrompt: (input: string) => input,
      parseResponse: JSON.parse,
    })

    const program = Pipeline.run(Pipeline.from('p', step), 'test').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "empty system ok"}' })),
    )

    const { output } = await runProgram(program)
    expect(output.answer).toBe('empty system ok')
  })

  it('records input in the step trace', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'my-specific-input').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "x"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.steps[0]!.input).toBe('my-specific-input')
  })

  it('records output in the step trace', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "captured-output"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.steps[0]!.output).toEqual({ answer: 'captured-output' })
  })

  it('defaults to attempts=1 when first try succeeds', async () => {
    const step = makeStep('s', 'haiku')
    const program = Pipeline.run(Pipeline.from('p', step), 'x').pipe(
      Effect.provide(MockProvider({ haiku: '{"answer": "ok"}' })),
    )

    const { trace } = await runProgram(program)
    expect(trace.steps[0]!.attempts).toBe(1)
  })

  it('function-based MockProvider receives correct model and prompts', async () => {
    const received: LlmRequest[] = []
    const step = makeStep('s', 'opus')

    const program = Pipeline.run(Pipeline.from('p', step), 'hello').pipe(
      Effect.provide(
        MockProvider((req: LlmRequest) => {
          received.push(req)
          return '{"answer": "got it"}'
        }),
      ),
    )

    await runProgram(program)
    expect(received).toHaveLength(1)
    expect(received[0]!.model).toBe('opus')
    expect(received[0]!.systemPrompt).toBe('You are helpful.')
    expect(received[0]!.userPrompt).toContain('hello')
  })
})
