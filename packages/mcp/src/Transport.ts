import { Effect } from 'effect'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

export function connectStdio(server: Server): Effect.Effect<void> {
  return Effect.promise(async () => {
    const transport = new StdioServerTransport()
    await server.connect(transport)
  })
}
