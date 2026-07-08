import { Schema as S, JSONSchema, Effect } from 'effect'
import type { JsonSchema7Root } from 'effect/JSONSchema'

export interface ToolDefinition<A, I> {
  readonly name: string
  readonly description: string
  readonly input: S.Schema<A, I>
  readonly handler: (input: A) => Effect.Effect<ToolResult, ToolError>
}

export interface ToolResult {
  readonly content: ReadonlyArray<{ readonly type: 'text'; readonly text: string }>
  readonly [key: string]: unknown
}

export class ToolError extends Error {
  readonly _tag = 'ToolError'
  constructor(message: string) {
    super(message)
  }
}

export interface ResolvedTool {
  readonly name: string
  readonly description: string
  readonly inputSchema: JsonSchema7Root
  readonly handle: (rawInput: unknown) => Effect.Effect<ToolResult, ToolError>
}

export function defineTool<A, I>(def: ToolDefinition<A, I>): ResolvedTool {
  const inputSchema = JSONSchema.make(def.input)

  return {
    name: def.name,
    description: def.description,
    inputSchema,
    handle: (rawInput: unknown) =>
      Effect.gen(function* () {
        const parsed = yield* S.decodeUnknown(def.input)(rawInput).pipe(
          Effect.mapError((parseError) => new ToolError(`Invalid input: ${parseError.message}`)),
        )
        return yield* def.handler(parsed)
      }),
  }
}

export function toolResult(text: string): ToolResult {
  return { content: [{ type: 'text', text }] }
}
