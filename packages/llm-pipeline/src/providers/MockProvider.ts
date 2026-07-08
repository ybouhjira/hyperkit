import { Effect, Layer, Stream } from 'effect'
import { LlmProvider, LlmError } from '../LlmProvider.js'
import type { LlmRequest, LlmResponse } from '../LlmProvider.js'
import type { LlmStreamChunk } from '../LlmStreamChunk.js'

// Pricing per 1M tokens (input/output) — for cost estimation in mocks
const PRICING: Record<string, { input: number; output: number }> = {
  opus: { input: 15, output: 75 },
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
  gemini: { input: 0, output: 0 },
}

function estimateCost(model: string, tokens: { input: number; output: number }): number {
  const p = PRICING[model] ?? PRICING['haiku']!
  return (tokens.input * p.input + tokens.output * p.output) / 1_000_000
}

type MockResponses = Record<string, string> | ((req: LlmRequest) => string)
type MockStreamChunks = LlmStreamChunk[] | ((req: LlmRequest) => LlmStreamChunk[])

export interface MockProviderOptions {
  readonly responses: MockResponses
  readonly streamChunks?: MockStreamChunks
}

/**
 * Mock provider for testing.
 *
 * Accepts either:
 * - A record mapping model names to response strings
 * - A function that receives the request and returns a response string
 *
 * For streaming, optionally provide `streamChunks` to control exact chunk sequence.
 * If not provided, stream() synthesizes TextDelta + Done from the call() response.
 */
export function MockProvider(
  responsesOrOptions: MockResponses | MockProviderOptions,
): Layer.Layer<LlmProvider> {
  const options: MockProviderOptions =
    typeof responsesOrOptions === 'function' || !('responses' in responsesOrOptions)
      ? { responses: responsesOrOptions as MockResponses }
      : (responsesOrOptions as MockProviderOptions)

  return Layer.succeed(LlmProvider, {
    call: (request: LlmRequest): Effect.Effect<LlmResponse, LlmError> =>
      Effect.try({
        try: () => {
          const text =
            typeof options.responses === 'function'
              ? options.responses(request)
              : (options.responses[request.model] ?? 'mock response')

          const inputTokens = Math.ceil(
            (request.systemPrompt.length + request.userPrompt.length) / 4,
          )
          const outputTokens = Math.ceil(text.length / 4)

          return {
            text,
            tokens: { input: inputTokens, output: outputTokens },
            costUsd: estimateCost(request.model, { input: inputTokens, output: outputTokens }),
          }
        },
        catch: (err) => new LlmError(String(err), request.model),
      }),

    stream: (request: LlmRequest): Stream.Stream<LlmStreamChunk, LlmError> => {
      if (options.streamChunks) {
        const chunks =
          typeof options.streamChunks === 'function'
            ? options.streamChunks(request)
            : options.streamChunks
        return Stream.fromIterable(chunks)
      }

      // Synthesize stream from call() response
      const text =
        typeof options.responses === 'function'
          ? options.responses(request)
          : (options.responses[request.model] ?? 'mock response')

      const inputTokens = Math.ceil(
        (request.systemPrompt.length + request.userPrompt.length) / 4,
      )
      const outputTokens = Math.ceil(text.length / 4)

      return Stream.fromIterable<LlmStreamChunk>([
        { _tag: 'TextDelta', text },
        {
          _tag: 'Done',
          result: {
            fullText: text,
            sessionId: undefined,
            tokens: { input: inputTokens, output: outputTokens },
            costUsd: estimateCost(request.model, { input: inputTokens, output: outputTokens }),
            durationMs: 0,
          },
        },
      ])
    },
  })
}
