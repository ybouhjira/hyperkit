import { Effect, Layer, Stream } from 'effect'
import { spawn } from 'child_process'
import { LlmProvider, LlmError } from '../LlmProvider.js'
import type { LlmRequest, LlmResponse } from '../LlmProvider.js'
import type { LlmStreamChunk } from '../LlmStreamChunk.js'
import { parseNdjsonLine, mapEventToChunks, type StreamAccumulator } from './NdjsonParser.js'

// Pricing per 1M tokens (input/output)
const PRICING: Record<string, { readonly input: number; readonly output: number }> = {
  opus: { input: 15, output: 75 },
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
}

function estimateCost(model: string, tokens: { readonly input: number; readonly output: number }): number {
  const key = Object.keys(PRICING).find((k) => model.includes(k)) ?? 'haiku'
  const p = PRICING[key]!
  return (tokens.input * p.input + tokens.output * p.output) / 1_000_000
}

function buildClaudeArgs(request: LlmRequest, format: 'stream-json' | 'json'): string[] {
  const args = [
    '--output-format', format,
    '--model', request.model,
    '--max-turns', String(request.maxTurns ?? 1),
    '-p', request.userPrompt,
  ]

  if (format === 'stream-json') {
    args.push('--verbose')
  }

  if (request.systemPrompt) {
    args.push('--system-prompt', request.systemPrompt)
  }

  if (request.resumeSessionId) {
    args.push('--resume', request.resumeSessionId)
  }

  const opts = request.providerOptions as {
    readonly dangerouslySkipPermissions?: boolean
    readonly permissionMode?: string
  } | undefined

  if (opts?.dangerouslySkipPermissions) {
    args.push('--dangerously-skip-permissions')
  } else if (opts?.permissionMode) {
    args.push('--permission-mode', opts.permissionMode)
  }

  return args
}

export function streamClaude(request: LlmRequest): Stream.Stream<LlmStreamChunk, LlmError> {
  return Stream.async<LlmStreamChunk, LlmError>((emit) => {
    const args = buildClaudeArgs(request, 'stream-json')
    const proc = spawn('claude', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
      cwd: request.cwd,
    })

    const acc: StreamAccumulator = {
      fullText: '',
      sessionId: undefined,
      inputTokens: 0,
      outputTokens: 0,
    }
    let buffer = ''

    proc.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        const event = parseNdjsonLine(line)
        if (!event) continue

        if (event.type === 'error') {
          void emit.fail(new LlmError(event.error?.message ?? 'Unknown error', request.model))
          return
        }

        const chunks = mapEventToChunks(event, acc)
        for (const chunk of chunks) {
          void emit.single(chunk)
        }
      }
    })

    proc.stderr?.on('data', (data: Buffer) => {
      const text = data.toString().trim()
      if (text) {
        void emit.single({ _tag: 'System' as const, message: text })
      }
    })

    proc.on('close', (code) => {
      // Process remaining buffer
      if (buffer.trim()) {
        const event = parseNdjsonLine(buffer)
        if (event && event.type !== 'error') {
          const chunks = mapEventToChunks(event, acc)
          for (const chunk of chunks) {
            void emit.single(chunk)
          }
        }
      }

      if (code !== 0 && code !== null) {
        void emit.fail(new LlmError(`Claude process exited with code ${code}`, request.model))
      } else {
        void emit.end()
      }
    })

    proc.on('error', (err) => {
      void emit.fail(new LlmError(err.message, request.model))
    })

    // Cleanup: kill process on fiber interruption
    return Effect.sync(() => {
      if (!proc.killed) proc.kill('SIGTERM')
    })
  })
}

export function callClaude(request: LlmRequest): Effect.Effect<LlmResponse, LlmError> {
  return streamClaude(request).pipe(
    Stream.runFold(
      { text: '', tokens: { input: 0, output: 0 }, costUsd: 0 } as LlmResponse,
      (acc, chunk) => {
        if (chunk._tag === 'Done') {
          return {
            text: chunk.result.fullText,
            tokens: chunk.result.tokens,
            costUsd: chunk.result.costUsd || estimateCost(request.model, chunk.result.tokens),
          }
        }
        return acc
      },
    ),
  )
}

/** Claude CLI provider — supports all Claude models via `claude` CLI binary */
export const ClaudeCliProvider: Layer.Layer<LlmProvider> = Layer.succeed(LlmProvider, {
  call: callClaude,
  stream: streamClaude,
})
