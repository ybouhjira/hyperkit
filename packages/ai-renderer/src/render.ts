import { Effect } from 'effect'
import { Schema as S } from 'effect'
import { Pipeline } from '@ybouhjira/hyperkit-llm-pipeline'
import type { LlmProvider, PipelineTrace } from '@ybouhjira/hyperkit-llm-pipeline'
import { LlmError } from '@ybouhjira/hyperkit-llm-pipeline'
import { SectionContent } from '@ybouhjira/hyperkit-mcp'
import { rendererStep } from './renderer-step.js'
import type { RendererStepOptions } from './renderer-step.js'

/** Result of rendering data into UI */
export interface RenderResult {
  readonly content: readonly S.Schema.Type<typeof SectionContent>[]
  readonly trace: PipelineTrace
}

/** Options for renderData */
export type RenderDataOptions = RendererStepOptions

/**
 * Transform raw data/intent into validated SolidKit content blocks.
 *
 * Usage:
 * ```ts
 * const result = renderData("Show me a summary of these metrics: CPU 80%, Memory 60%, Disk 45%")
 * // Provide LlmProvider via Effect.provide
 * const { content, trace } = await Effect.runPromise(Effect.provide(result, MockProvider(...)))
 * ```
 */
export function renderData(
  intent: string,
  options?: RenderDataOptions,
): Effect.Effect<RenderResult, LlmError, LlmProvider> {
  const step = rendererStep(options)
  const pipeline = Pipeline.from('ai-renderer', step)

  return Effect.map(
    Pipeline.run(pipeline, intent),
    ({ output, trace }) => ({ content: output, trace }),
  )
}
