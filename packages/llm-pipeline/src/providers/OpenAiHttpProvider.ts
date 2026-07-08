import { Effect, Layer, Stream } from 'effect'
import { LlmProvider, LlmError } from '../LlmProvider.js'
import type { LlmRequest, LlmResponse } from '../LlmProvider.js'
import type { LlmStreamChunk } from '../LlmStreamChunk.js'

const DEFAULT_BASE_URL = 'http://localhost:5050'

function getBaseUrl(request: LlmRequest): string {
  return (request.providerOptions?.baseUrl as string) ?? DEFAULT_BASE_URL
}

function getModel(request: LlmRequest): string {
  return (request.providerOptions?.openaiModel as string) ?? request.model
}

export function streamOpenAi(request: LlmRequest): Stream.Stream<LlmStreamChunk, LlmError> {
  return Stream.async<LlmStreamChunk, LlmError>((emit) => {
    const controller = new AbortController()
    const startTime = Date.now()
    let fullText = ''

    const messages: Array<{ role: string; content: string }> = []
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt })
    }
    messages.push({ role: 'user', content: request.userPrompt })

    const baseUrl = getBaseUrl(request)
    const model = getModel(request)

    fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: (request.providerOptions?.maxTokens as number) ?? 2048,
        temperature: (request.providerOptions?.temperature as number) ?? 0.8,
      }),
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
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                fullText += delta
                void emit.single({ _tag: 'TextDelta' as const, text: delta })
              }
            } catch {
              // Skip unparseable SSE lines
            }
          }
        }

        void emit.single({
          _tag: 'Done' as const,
          result: {
            fullText,
            sessionId: undefined,
            tokens: { input: 0, output: 0 },
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

export function callOpenAi(request: LlmRequest): Effect.Effect<LlmResponse, LlmError> {
  return streamOpenAi(request).pipe(
    Stream.runFold(
      { text: '', tokens: { input: 0, output: 0 }, costUsd: 0 } as LlmResponse,
      (acc, chunk) => {
        if (chunk._tag === 'Done') {
          return {
            text: chunk.result.fullText,
            tokens: chunk.result.tokens,
            costUsd: 0,
          }
        }
        return acc
      },
    ),
  )
}

export function makeOpenAiProvider(baseUrl?: string): Layer.Layer<LlmProvider> {
  return Layer.succeed(LlmProvider, {
    call: (req) =>
      callOpenAi(
        baseUrl ? { ...req, providerOptions: { ...req.providerOptions, baseUrl } } : req,
      ),
    stream: (req) =>
      streamOpenAi(
        baseUrl ? { ...req, providerOptions: { ...req.providerOptions, baseUrl } } : req,
      ),
  })
}

export const OpenAiHttpProvider: Layer.Layer<LlmProvider> = makeOpenAiProvider()
