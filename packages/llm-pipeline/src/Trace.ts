/** Result of a single step execution */
export interface StepTrace {
  readonly stepName: string
  readonly model: string
  /** Input data the step received */
  readonly input: unknown
  /** The prompt sent to the LLM */
  readonly prompt: string
  /** Raw LLM response text */
  readonly rawResponse: string
  /** Parsed and validated output */
  readonly output: unknown
  /** Timing */
  readonly startedAt: number
  readonly completedAt: number
  readonly durationMs: number
  /** Token usage */
  readonly tokens: {
    readonly input: number
    readonly output: number
  }
  /** Estimated cost in USD */
  readonly costUsd: number
  /** Number of attempts (1 = first try succeeded) */
  readonly attempts: number
  /** Error if step failed */
  readonly error?: string
  /** Parent step ID for future DAG support */
  readonly parentStepId?: string
  /** Unique step execution ID */
  readonly id: string
}

/** Complete pipeline execution trace */
export interface PipelineTrace {
  readonly pipelineName: string
  readonly steps: ReadonlyArray<StepTrace>
  readonly startedAt: number
  readonly completedAt: number
  readonly totalDurationMs: number
  readonly totalCostUsd: number
  readonly totalTokens: {
    readonly input: number
    readonly output: number
  }
  readonly success: boolean
  readonly error?: string
}

/** Create a pipeline trace from completed step traces */
export function createPipelineTrace(
  name: string,
  steps: ReadonlyArray<StepTrace>,
  startedAt: number,
): PipelineTrace {
  const completedAt = Date.now()
  const totalTokens = steps.reduce(
    (acc, s) => ({ input: acc.input + s.tokens.input, output: acc.output + s.tokens.output }),
    { input: 0, output: 0 },
  )
  const totalCostUsd = steps.reduce((acc, s) => acc + s.costUsd, 0)
  const lastError = steps.findLast((s) => s.error)?.error

  return {
    pipelineName: name,
    steps,
    startedAt,
    completedAt,
    totalDurationMs: completedAt - startedAt,
    totalCostUsd,
    totalTokens,
    success: !lastError,
    error: lastError,
  }
}
