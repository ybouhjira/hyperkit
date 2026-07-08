import type { LlmStreamChunk } from '../LlmStreamChunk.js'

/** Raw NDJSON event from Claude/Gemini CLI --output-format stream-json */
export interface CliStreamEvent {
  readonly type: 'system' | 'assistant' | 'message' | 'tool_result' | 'result' | 'init' | 'error'
  readonly message?: {
    readonly content?: ReadonlyArray<
      | { readonly type: 'text'; readonly text: string }
      | { readonly type: 'tool_use'; readonly id: string; readonly name: string; readonly input: unknown }
    >
  }
  readonly content_block?: { readonly type: 'text'; readonly text: string }
  /** Claude: tool_result text. Gemini: assistant/user delta text. */
  readonly content?: string
  /** Gemini `message` event: "user" | "assistant". */
  readonly role?: string
  /** Gemini streams assistant text as delta:true chunks. */
  readonly delta?: boolean
  readonly total_cost_usd?: number
  readonly duration_ms?: number
  readonly result?: string
  readonly session_id?: string
  readonly usage?: { readonly input_tokens?: number; readonly output_tokens?: number }
  /** Gemini `result` event usage shape. */
  readonly stats?: {
    readonly input_tokens?: number
    readonly output_tokens?: number
    readonly total_tokens?: number
    readonly duration_ms?: number
  }
  readonly error?: { readonly message: string }
  readonly [key: string]: unknown
}

/** Parse a single NDJSON line into a CliStreamEvent */
export function parseNdjsonLine(line: string): CliStreamEvent | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed) as CliStreamEvent
  } catch {
    return null
  }
}

/**
 * Map a CliStreamEvent to LlmStreamChunk(s).
 * Returns an array because a single assistant event can contain multiple content blocks.
 * Also tracks and mutates the accumulator for fullText, sessionId, and tokens.
 */
export interface StreamAccumulator {
  fullText: string
  sessionId: string | undefined
  inputTokens: number
  outputTokens: number
}

export function mapEventToChunks(
  event: CliStreamEvent,
  acc: StreamAccumulator,
): LlmStreamChunk[] {
  if (event.session_id) {
    acc.sessionId = event.session_id as string
  }

  const chunks: LlmStreamChunk[] = []

  switch (event.type) {
    case 'assistant': {
      if (event.message?.content) {
        for (const block of event.message.content) {
          if (block.type === 'text') {
            acc.fullText += block.text
            chunks.push({ _tag: 'TextDelta', text: block.text })
          } else if (block.type === 'tool_use') {
            chunks.push({
              _tag: 'ToolUse',
              id: block.id,
              name: block.name,
              input: JSON.stringify(block.input),
            })
          }
        }
      }
      if (event.content_block?.type === 'text') {
        acc.fullText += event.content_block.text
        chunks.push({ _tag: 'TextDelta', text: event.content_block.text })
      }
      break
    }
    case 'message': {
      // Gemini CLI emits assistant text as `{type:"message", role:"assistant", content:"…", delta:true}`.
      // Ignore user-role echoes of the prompt.
      if (event.role === 'assistant' && typeof event.content === 'string') {
        acc.fullText += event.content
        chunks.push({ _tag: 'TextDelta', text: event.content })
      }
      break
    }
    case 'tool_result': {
      chunks.push({ _tag: 'ToolResult', toolUseId: '', content: event.content ?? '' })
      break
    }
    case 'result': {
      if (event.result != null) {
        acc.fullText = typeof event.result === 'string'
          ? event.result
          : JSON.stringify(event.result)
      }
      if (event.usage) {
        acc.inputTokens = event.usage.input_tokens ?? 0
        acc.outputTokens = event.usage.output_tokens ?? 0
      } else if (event.stats) {
        // Gemini result event uses `stats` instead of `usage`.
        acc.inputTokens = event.stats.input_tokens ?? 0
        acc.outputTokens = event.stats.output_tokens ?? 0
      }
      chunks.push({
        _tag: 'Done',
        result: {
          fullText: acc.fullText,
          sessionId: acc.sessionId,
          tokens: { input: acc.inputTokens, output: acc.outputTokens },
          costUsd: event.total_cost_usd ?? 0,
          durationMs: event.duration_ms ?? event.stats?.duration_ms ?? 0,
        },
      })
      break
    }
    case 'system':
      chunks.push({ _tag: 'System', message: String(event.message ?? '') })
      break
    case 'error':
      // Errors are handled by the provider via emit.fail, not as chunks
      break
  }

  return chunks
}
