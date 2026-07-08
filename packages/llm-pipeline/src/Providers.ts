import { Layer } from 'effect'
import { LlmProvider } from './LlmProvider.js'
import type { LlmRequest } from './LlmProvider.js'
import { callClaude, streamClaude } from './providers/ClaudeCliProvider.js'
import { callGemini, streamGemini } from './providers/GeminiCliProvider.js'

// Re-export new MockProvider as the primary
export { MockProvider } from './providers/MockProvider.js'

/**
 * @deprecated Use `ClaudeCliProvider` or `GeminiCliProvider` from `./providers/` instead.
 *
 * Legacy provider that routes to Claude or Gemini based on model name.
 * Kept for backward compatibility with existing Pipeline consumers.
 */
export const CliProvider = Layer.succeed(LlmProvider, {
  call: (request: LlmRequest) => {
    if (request.model === 'gemini') {
      return callGemini(request)
    }
    return callClaude(request)
  },
  stream: (request: LlmRequest) => {
    if (request.model === 'gemini') {
      return streamGemini(request)
    }
    return streamClaude(request)
  },
})
