import { Schema as S } from 'effect'
import { defineStep } from '@ybouhjira/hyperkit-llm-pipeline'
import type { Step } from '@ybouhjira/hyperkit-llm-pipeline'
import { SectionContent } from '@ybouhjira/hyperkit-mcp'
import { CONTENT_TYPE_CATALOG } from './catalog.js'

/** Options for creating a renderer step */
export interface RendererStepOptions {
  /** LLM model to use (default: "haiku") */
  readonly model?: string
  /** Additional system prompt context appended to the catalog */
  readonly additionalContext?: string
  /** Max retry attempts (default: 2) */
  readonly maxAttempts?: number
}

/** Extract JSON array from LLM response (handles markdown code blocks) */
export function extractJson(response: string): unknown {
  // Try to extract from markdown code block first
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  const jsonStr = codeBlockMatch ? codeBlockMatch[1]!.trim() : response.trim()
  return JSON.parse(jsonStr)
}

/** Create a renderer step that transforms raw data/intent into SectionContent[] */
export function rendererStep(
  options?: RendererStepOptions,
): Step<string, readonly S.Schema.Type<typeof SectionContent>[]> {
  const model = options?.model ?? 'haiku'
  const maxAttempts = options?.maxAttempts ?? 2

  let systemPrompt = CONTENT_TYPE_CATALOG
  if (options?.additionalContext) {
    systemPrompt += `\n\nADDITIONAL CONTEXT:\n${options.additionalContext}`
  }

  return defineStep({
    name: 'ui-renderer',
    model,
    systemPrompt,
    outputSchema: S.Array(SectionContent),
    buildPrompt: (intent: string) =>
      `Transform this data/intent into a JSON array of SolidKit content blocks:\n\n${intent}`,
    parseResponse: extractJson,
    retry: {
      maxAttempts,
      feedbackOnError: true,
    },
  })
}
