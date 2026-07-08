import { Schema as S, Effect } from 'effect'
import type { Step } from './Step.js'
import { LlmProvider, LlmError } from './LlmProvider.js'
import { createPipelineTrace } from './Trace.js'
import type { StepTrace, PipelineTrace } from './Trace.js'

/** A composed pipeline of steps */
export interface Pipeline<In, Out> {
  readonly _tag: 'Pipeline'
  readonly name: string
  readonly steps: ReadonlyArray<Step<unknown, unknown>>
}

/** Create a pipeline from an initial step */
function from<In, Out>(name: string, step: Step<In, Out>): Pipeline<In, Out> {
  return { _tag: 'Pipeline', name, steps: [step as Step<unknown, unknown>] }
}

/** Add a step to the pipeline (output of previous becomes input of next) */
function pipe<In, Mid, Out>(
  pipeline: Pipeline<In, Mid>,
  step: Step<Mid, Out>,
): Pipeline<In, Out> {
  return {
    _tag: 'Pipeline',
    name: pipeline.name,
    steps: [...pipeline.steps, step as Step<unknown, unknown>],
  }
}

/** Execute a single step with retry support, building trace at the end */
function executeStep<In, Out>(
  step: Step<In, Out>,
  input: In,
): Effect.Effect<{ output: Out; trace: StepTrace }, LlmError, LlmProvider> {
  const config = step.config
  const maxAttempts = config.retry?.maxAttempts ?? 1
  const feedbackOnError = config.retry?.feedbackOnError ?? false

  return Effect.gen(function* () {
    const provider = yield* LlmProvider
    const stepId = crypto.randomUUID()
    const stepStartedAt = Date.now()

    // Accumulated trace data
    let lastPrompt = ''
    let lastRawResponse = ''
    let lastTokens = { input: 0, output: 0 }
    let lastCostUsd = 0
    let lastError: string | undefined
    let attempts = 0
    let successOutput: Out | undefined
    let succeeded = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      attempts++

      // Build prompt, optionally including previous error feedback
      let prompt = config.buildPrompt(input)
      if (lastError && feedbackOnError) {
        prompt += `\n\nPrevious attempt failed with: ${lastError}\nPlease fix the output.`
      }

      lastPrompt = prompt

      let response: { text: string; tokens: { input: number; output: number }; costUsd: number }
      try {
        const images = config.buildImages?.(input)
        response = yield* provider.call({
          model: config.model,
          systemPrompt: config.systemPrompt,
          userPrompt: prompt,
          ...(images && images.length > 0 ? { images } : {}),
        })
      } catch (err) {
        lastError = String(err)
        continue
      }

      lastRawResponse = response.text
      lastTokens = response.tokens
      lastCostUsd = response.costUsd

      // Parse response
      let parsed: unknown
      try {
        parsed = config.parseResponse(response.text)
      } catch (err) {
        lastError = `Parse error: ${String(err)}`
        continue
      }

      // Validate with output schema
      const decoded = S.decodeUnknownEither(config.outputSchema)(parsed)
      if (decoded._tag === 'Left') {
        lastError = `Schema validation: ${String(decoded.left)}`
        continue
      }

      // Success — record output and break
      successOutput = decoded.right
      succeeded = true
      lastError = undefined
      break
    }

    const stepCompletedAt = Date.now()

    const trace: StepTrace = {
      id: stepId,
      stepName: config.name,
      model: config.model,
      input: input as unknown,
      prompt: lastPrompt,
      rawResponse: lastRawResponse,
      output: successOutput as unknown,
      startedAt: stepStartedAt,
      completedAt: stepCompletedAt,
      durationMs: stepCompletedAt - stepStartedAt,
      tokens: lastTokens,
      costUsd: lastCostUsd,
      attempts,
      ...(lastError !== undefined ? { error: lastError } : {}),
    }

    if (!succeeded) {
      return yield* Effect.fail(
        new LlmError(lastError ?? 'All attempts exhausted', config.model),
      )
    }

    return { output: successOutput as Out, trace }
  })
}

/** Run a pipeline end-to-end, returning output + full trace */
function run<In, Out>(
  pipeline: Pipeline<In, Out>,
  input: In,
): Effect.Effect<{ output: Out; trace: PipelineTrace }, LlmError, LlmProvider> {
  return Effect.gen(function* () {
    const startedAt = Date.now()
    const stepTraces: StepTrace[] = []
    let current: unknown = input

    for (const step of pipeline.steps) {
      const { output, trace } = yield* executeStep(step, current)
      stepTraces.push(trace)
      current = output
    }

    const pipelineTrace = createPipelineTrace(pipeline.name, stepTraces, startedAt)
    return { output: current as Out, trace: pipelineTrace }
  })
}

export const Pipeline = { from, pipe, run }
