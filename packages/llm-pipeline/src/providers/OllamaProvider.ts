import { Effect, Layer, Stream } from 'effect'
import { LlmProvider, LlmError } from '../LlmProvider.js'
import type { LlmRequest, LlmResponse } from '../LlmProvider.js'
import type { LlmStreamChunk } from '../LlmStreamChunk.js'

const DEFAULT_BASE_URL = 'http://localhost:11434'

function getBaseUrl(request: LlmRequest): string {
  return (request.providerOptions?.baseUrl as string) ?? DEFAULT_BASE_URL
}

function buildRequestBody(request: LlmRequest, stream: boolean): Record<string, unknown> {
  const opts = request.providerOptions ?? {}
  const body: Record<string, unknown> = {
    model: request.model,
    prompt: request.userPrompt,
    stream,
    options: {
      temperature: (opts.temperature as number) ?? 0,
      num_ctx: (opts.numCtx as number) ?? 4096,
      ...((opts.options as Record<string, unknown>) ?? {}),
    },
  }
  if (request.systemPrompt) body.system = request.systemPrompt
  if (opts.format) body.format = opts.format
  return body
}

export function streamOllama(request: LlmRequest): Stream.Stream<LlmStreamChunk, LlmError> {
  return Stream.async<LlmStreamChunk, LlmError>((emit) => {
    const controller = new AbortController()
    const startTime = Date.now()
    let fullText = ''
    let inputTokens = 0
    let outputTokens = 0

    fetch(`${getBaseUrl(request)}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRequestBody(request, true)),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          void emit.fail(new LlmError(`HTTP ${res.status}: ${text}`, request.model))
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          void emit.fail(new LlmError('No response body', request.model))
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            try {
              const parsed = JSON.parse(trimmed) as {
                response?: string
                done?: boolean
                prompt_eval_count?: number
                eval_count?: number
              }
              if (parsed.response) {
                fullText += parsed.response
                void emit.single({ _tag: 'TextDelta' as const, text: parsed.response })
              }
              if (parsed.done) {
                inputTokens = parsed.prompt_eval_count ?? 0
                outputTokens = parsed.eval_count ?? 0
              }
            } catch {
              // Skip unparseable NDJSON lines
            }
          }
        }

        void emit.single({
          _tag: 'Done' as const,
          result: {
            fullText,
            sessionId: undefined,
            tokens: { input: inputTokens, output: outputTokens },
            costUsd: 0,
            durationMs: Date.now() - startTime,
          },
        })
        void emit.end()
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          void emit.fail(new LlmError(String(err), request.model))
        }
      })

    return Effect.sync(() => {
      controller.abort()
    })
  })
}

export function callOllama(request: LlmRequest): Effect.Effect<LlmResponse, LlmError> {
  return Effect.tryPromise({
    try: async () => {
      const res = await fetch(`${getBaseUrl(request)}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody(request, false)),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new LlmError(`HTTP ${res.status}: ${text}`, request.model)
      }
      const json = (await res.json()) as {
        response: string
        prompt_eval_count?: number
        eval_count?: number
      }
      return {
        text: json.response,
        tokens: { input: json.prompt_eval_count ?? 0, output: json.eval_count ?? 0 },
        costUsd: 0,
      } satisfies LlmResponse
    },
    catch: (err) => (err instanceof LlmError ? err : new LlmError(String(err), request.model)),
  })
}

export function makeOllamaProvider(baseUrl?: string): Layer.Layer<LlmProvider> {
  const withBase = (req: LlmRequest): LlmRequest =>
    baseUrl ? { ...req, providerOptions: { ...req.providerOptions, baseUrl } } : req
  return Layer.succeed(LlmProvider, {
    call: (req) => callOllama(withBase(req)),
    stream: (req) => streamOllama(withBase(req)),
  })
}

export const OllamaProvider: Layer.Layer<LlmProvider> = makeOllamaProvider()
