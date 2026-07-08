import { Schema as S } from 'effect'

/** Configuration for a single pipeline step */
export interface StepConfig<In, Out> {
  /** Unique step name for tracing */
  readonly name: string
  /** Which LLM model to use */
  readonly model: string
  /** System prompt providing specialized context to the LLM */
  readonly systemPrompt: string
  /** Schema to validate step output */
  readonly outputSchema: S.Schema<Out>
  /** Transform raw input into the prompt string sent to the LLM */
  readonly buildPrompt: (input: In) => string
  /**
   * Derive absolute file paths (images, PDFs) to attach to the LLM call.
   * Only honored by providers that support multimodal input (e.g. Gemini CLI).
   * Optional — omit for text-only steps.
   */
  readonly buildImages?: (input: In) => readonly string[]
  /** Extract structured data from LLM response text */
  readonly parseResponse: (response: string) => unknown
  /** Retry config */
  readonly retry?: {
    readonly maxAttempts?: number // default: 1 (no retry)
    readonly feedbackOnError?: boolean // send parse error back to LLM for self-correction
  }
}

/** A defined step ready to be added to a pipeline */
export interface Step<In, Out> {
  readonly _tag: 'Step'
  readonly config: StepConfig<In, Out>
}

/** Create a pipeline step */
export function defineStep<In, Out>(config: StepConfig<In, Out>): Step<In, Out> {
  return { _tag: 'Step', config }
}
