/** A single chunk emitted during LLM streaming */
export type LlmStreamChunk =
  | { readonly _tag: 'TextDelta'; readonly text: string }
  | { readonly _tag: 'ToolUse'; readonly id: string; readonly name: string; readonly input: string }
  | { readonly _tag: 'ToolResult'; readonly toolUseId: string; readonly content: string }
  | { readonly _tag: 'System'; readonly message: string }
  | { readonly _tag: 'Done'; readonly result: LlmStreamResult }

/** Aggregate result emitted as the final stream chunk */
export interface LlmStreamResult {
  readonly fullText: string
  readonly sessionId: string | undefined
  readonly tokens: { readonly input: number; readonly output: number }
  readonly costUsd: number
  readonly durationMs: number
}
