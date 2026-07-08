import { Effect } from 'effect'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { ResolvedTool } from './Tool.js'

export interface McpServerConfig {
  readonly name: string
  readonly version?: string
  readonly tools: ReadonlyArray<ResolvedTool>
}

export function makeServer(config: McpServerConfig): Effect.Effect<Server> {
  return Effect.sync(() => {
    const server = new Server(
      { name: config.name, version: config.version ?? '1.0.0' },
      { capabilities: { tools: {} } }
    )

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: config.tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    }))

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name
      const tool = config.tools.find((t) => t.name === toolName)

      if (!tool) {
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }],
          isError: true,
        } as Record<string, unknown>
      }

      const result = await Effect.runPromise(
        tool.handle(request.params.arguments ?? {}).pipe(
          Effect.catchAll((err) =>
            Effect.succeed({
              content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
            } as Record<string, unknown>)
          ),
        ),
      )

      return result as Record<string, unknown>
    })

    return server
  })
}
