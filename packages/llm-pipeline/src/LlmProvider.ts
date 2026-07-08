import { Effect, Context, Stream } from 'effect'
import type { LlmStreamChunk } from './LlmStreamChunk.js'

/** Request to call an LLM */
export interface LlmRequest {
  readonly model: string
  readonly systemPrompt: string
  readonly userPrompt: string
  readonly resumeSessionId?: string
  readonly maxTurns?: number
  readonly cwd?: string
  readonly providerOptions?: Record<string, unknown>
  /** Absolute file paths for multimodal input (images, PDFs). Provider-dependent support. */
  readonly images?: readonly string[]
}

/** Response from an LLM call */
export interface LlmResponse {
  readonly text: string
  readonly tokens: {
    readonly input: number
    readonly output: number
  }
  readonly costUsd: number
}

/** Error calling LLM */
export class LlmError extends Error {
  readonly _tag = 'LlmError'
  constructor(
    message: string,
    readonly model: string,
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

/** Service interface for calling LLMs */
export class LlmProvider extends Context.Tag('LlmProvider')<
  LlmProvider,
  {
    readonly call: (request: LlmRequest) => Effect.Effect<LlmResponse, LlmError>
    readonly stream: (request: LlmRequest) => Stream.Stream<LlmStreamChunk, LlmError>
  }
>() {}
