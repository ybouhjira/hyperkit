import { Effect, Layer, Stream } from 'effect'
import { spawn } from 'child_process'
import { LlmProvider, LlmError } from '../LlmProvider.js'
import type { LlmRequest, LlmResponse } from '../LlmProvider.js'
import type { LlmStreamChunk } from '../LlmStreamChunk.js'
import { parseNdjsonLine, mapEventToChunks, type StreamAccumulator } from './NdjsonParser.js'

function buildGeminiArgs(request: LlmRequest, format: 'stream-json' | 'text'): string[] {
  const basePrompt = request.systemPrompt
    ? `${request.systemPrompt}\n\n${request.userPrompt}`
    : request.userPrompt

  // Gemini CLI consumes file attachments via `@path` tokens embedded in the
  // prompt. Absolute paths are required so the working-directory sandbox
  // resolves them regardless of `cwd`.
  const imageTokens = request.images?.map((p) => `@${p}`).join(' ') ?? ''
  const prompt = imageTokens ? `${imageTokens}\n\n${basePrompt}` : basePrompt

  const args = ['--output-format', format, '-p', prompt]

  if (request.resumeSessionId) {
    args.push('--resume', request.resumeSessionId)
  }

  return args
}

export function streamGemini(request: LlmRequest): Stream.Stream<LlmStreamChunk, LlmError> {
  return Stream.async<LlmStreamChunk, LlmError>((emit) => {
    const args = buildGeminiArgs(request, 'stream-json')
    const proc = spawn('gemini', args, {
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
          void emit.fail(new LlmError(event.error?.message ?? 'Unknown error', 'gemini'))
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
        void emit.fail(new LlmError(`Gemini process exited with code ${code}`, 'gemini'))
      } else {
        void emit.end()
      }
    })

    proc.on('error', (err) => {
      void emit.fail(new LlmError(err.message, 'gemini'))
    })

    return Effect.sync(() => {
      if (!proc.killed) proc.kill('SIGTERM')
    })
  })
}

export function callGemini(request: LlmRequest): Effect.Effect<LlmResponse, LlmError> {
  return streamGemini(request).pipe(
    Stream.runFold(
      { text: '', tokens: { input: 0, output: 0 }, costUsd: 0 } as LlmResponse,
      (acc, chunk) => {
        if (chunk._tag === 'Done') {
          return {
            text: chunk.result.fullText,
            tokens: chunk.result.tokens,
            costUsd: 0, // Gemini CLI is free
          }
        }
        return acc
      },
    ),
  )
}

/** Gemini CLI provider — uses `gemini` CLI binary (free) */
export const GeminiCliProvider: Layer.Layer<LlmProvider> = Layer.succeed(LlmProvider, {
  call: callGemini,
  stream: streamGemini,
})
