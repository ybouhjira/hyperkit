import { Schema as S, Effect } from 'effect'
import { defineTool, toolResult, ToolError } from './Tool.js'

const OLLAMA_URL = 'http://localhost:11434'

function ollamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  format?: 'json',
): Effect.Effect<string, Error> {
  return Effect.tryPromise({
    try: async () => {
      const body: Record<string, unknown> = {
        model,
        messages,
        stream: false,
      }
      if (format) body['format'] = format

      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`)

      const data = (await res.json()) as { message: { content: string } }
      return data.message.content
    },
    catch: (e) => new Error(`Ollama request failed: ${e}`),
  })
}

export const localLlmTool = defineTool({
  name: 'local_llm',
  description:
    'Send a prompt to the local Ollama LLM (Llama 3.2 3B, runs on GPU, free & fast). Use for: simple questions, text formatting, summarization, data extraction, code generation for simple tasks. Responds in 1-3 seconds. Saves API credits by delegating cheap work locally.',
  input: S.Struct({
    prompt: S.String.annotations({ description: 'The prompt to send to the local LLM' }),
    system: S.optional(
      S.String.annotations({ description: 'Optional system prompt to set context' }),
    ),
    model: S.optional(
      S.String.annotations({ description: 'Ollama model name. Default: llama3.2:3b' }),
    ),
    json_mode: S.optional(
      S.Boolean.annotations({ description: 'If true, force JSON output format' }),
    ),
  }),
  handler: (input) =>
    Effect.gen(function* () {
      const model = input.model ?? 'llama3.2:3b'
      const messages: Array<{ role: string; content: string }> = []

      if (input.system) {
        messages.push({ role: 'system', content: input.system })
      }
      messages.push({ role: 'user', content: input.prompt })

      const response = yield* ollamaChat(model, messages, input.json_mode ? 'json' : undefined).pipe(
        Effect.mapError((e) => new ToolError(e.message)),
      )
      return toolResult(response)
    }),
})

export const appControlTool = defineTool({
  name: 'app_control',
  description:
    'Convert a natural language command into an MCP function call using the local LLM. Send commands like "switch to planning mode", "open the chat panel", "show dashboard" and get back structured function calls. The local LLM maps your intent to the correct IDE action. Free & instant (~1-2 seconds).',
  input: S.Struct({
    command: S.String.annotations({
      description:
        'Natural language command to control the app, e.g. "switch to developer mode", "open terminal panel"',
    }),
    available_tools: S.optional(
      S.String.annotations({
        description:
          'JSON string of available tool schemas. If not provided, uses default HyperKit IDE tools.',
      }),
    ),
  }),
  handler: (input) =>
    Effect.gen(function* () {
      const defaultTools = `Available functions:
- switch_mode(modeId: string) - Switch IDE workspace mode. Options: "developer", "dashboard", "planning", "command-center", "claude-house", "ai-agents", "settings", "focus"
- open_panel(panelId: string) - Open a panel. Options: "chat-window", "terminal", "file-explorer", "cost-tracker", "cli-session-list", "reports-list", "perf-dashboard", "runtime-diagnostics", "rules-editor", "navigable-inspector"
- close_panel(panelId: string) - Close a panel by ID
- create_session(name: string, workingDirectory: string) - Create a new Claude chat session
- navigate(path: string) - Navigate to a file or directory`

      const toolSchema = input.available_tools ?? defaultTools

      const systemPrompt = `You are an app controller. Given a user command, output a JSON function call.

${toolSchema}

Rules:
- Output ONLY valid JSON: {"function": "name", "args": {"key": "value"}}
- Pick the most appropriate function for the command
- If the command doesn't match any function, output: {"function": "unknown", "args": {"original": "the command"}}
- Never output anything except the JSON object`

      const response = yield* ollamaChat(
        'llama3.2:3b',
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.command },
        ],
        'json',
      ).pipe(Effect.mapError((e) => new ToolError(e.message)))

      return toolResult(response)
    }),
})
