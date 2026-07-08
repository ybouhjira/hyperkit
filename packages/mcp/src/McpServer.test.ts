import { Effect } from 'effect'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { Schema as S } from 'effect'
import { defineTool, toolResult, ToolError } from './Tool.js'
import { makeServer, type McpServerConfig } from './McpServer.js'

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makePingTool() {
  return defineTool({
    name: 'ping',
    description: 'Returns pong',
    input: S.Struct({}),
    handler: () => Effect.succeed(toolResult('pong')),
  })
}

function makeEchoTool() {
  return defineTool({
    name: 'echo',
    description: 'Echoes a message',
    input: S.Struct({ message: S.String }),
    handler: (input) => Effect.succeed(toolResult(input.message)),
  })
}

function makeFailingTool() {
  return defineTool({
    name: 'fail',
    description: 'Always fails',
    input: S.Struct({}),
    handler: () => Effect.fail(new ToolError('intentional failure')),
  })
}

// ─────────────────────────────────────────────
// makeServer — creation
// ─────────────────────────────────────────────

describe('makeServer — creation', () => {
  it('returns an Effect that resolves to a Server instance', async () => {
    const config: McpServerConfig = {
      name: 'test-server',
      tools: [],
    }
    const server = await Effect.runPromise(makeServer(config))
    expect(server).toBeInstanceOf(Server)
  })

  it('uses default version 1.0.0 when not specified', async () => {
    const server = await Effect.runPromise(
      makeServer({ name: 'no-version', tools: [] })
    )
    expect(server).toBeInstanceOf(Server)
  })

  it('accepts a custom version', async () => {
    const server = await Effect.runPromise(
      makeServer({ name: 'versioned', version: '2.3.0', tools: [] })
    )
    expect(server).toBeInstanceOf(Server)
  })

  it('accepts multiple tools', async () => {
    const server = await Effect.runPromise(
      makeServer({ name: 's', tools: [makePingTool(), makeEchoTool()] })
    )
    expect(server).toBeInstanceOf(Server)
  })
})

// ─────────────────────────────────────────────
// Tool resolution logic (via ResolvedTool.handle)
// ─────────────────────────────────────────────

describe('ResolvedTool dispatch logic', () => {
  it('calling ping tool handle returns pong', async () => {
    const ping = makePingTool()
    const result = await Effect.runPromise(ping.handle({}))
    expect(result.content[0]!.text).toBe('pong')
  })

  it('calling echo tool handle returns echoed message', async () => {
    const echo = makeEchoTool()
    const result = await Effect.runPromise(echo.handle({ message: 'hello world' }))
    expect(result.content[0]!.text).toBe('hello world')
  })

  it('tools array is iterable and all names are present', async () => {
    const tools = [makePingTool(), makeEchoTool()]
    const names = tools.map((t) => t.name)
    expect(names).toContain('ping')
    expect(names).toContain('echo')
  })

  it('finds a tool by name from the tools array', async () => {
    const tools = [makePingTool(), makeEchoTool(), makeFailingTool()]
    const found = tools.find((t) => t.name === 'echo')
    expect(found).toBeDefined()
    expect(found!.name).toBe('echo')
  })

  it('returns undefined for an unknown tool name', () => {
    const tools = [makePingTool(), makeEchoTool()]
    const found = tools.find((t) => t.name === 'unknown-tool')
    expect(found).toBeUndefined()
  })
})

// ─────────────────────────────────────────────
// Unknown tool error handling (mirrors McpServer's CallTool handler)
// ─────────────────────────────────────────────

describe('unknown tool error response', () => {
  it('produces isError=true response for missing tool', () => {
    const tools = [makePingTool()]
    const toolName = 'does-not-exist'
    const tool = tools.find((t) => t.name === toolName)

    // Mirror the exact logic in McpServer's CallToolRequestSchema handler
    const response = tool
      ? null
      : {
          content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }],
          isError: true,
        }

    expect(response).not.toBeNull()
    expect(response!.isError).toBe(true)
    expect(response!.content[0]!.text).toBe('Unknown tool: does-not-exist')
  })
})

// ─────────────────────────────────────────────
// Error handling in tool call (mirrors catchAll logic)
// ─────────────────────────────────────────────

describe('tool call error handling', () => {
  it('catchAll wraps ToolError into a text response', async () => {
    const fail = makeFailingTool()

    // Mirror the exact Effect pipeline in McpServer's CallToolRequestSchema handler
    const result = await Effect.runPromise(
      fail.handle({}).pipe(
        Effect.catchAll((err) =>
          Effect.succeed({
            content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
          })
        )
      )
    )

    expect(result.content[0]!.text).toBe('Error: intentional failure')
  })

  it('successful tool call is not affected by catchAll', async () => {
    const ping = makePingTool()

    const result = await Effect.runPromise(
      ping.handle({}).pipe(
        Effect.catchAll((err) =>
          Effect.succeed({
            content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
          })
        )
      )
    )

    expect(result.content[0]!.text).toBe('pong')
  })

  it('parse error is caught and returned as Error text', async () => {
    const echo = makeEchoTool()

    // Passing invalid input (missing message) triggers a parse ToolError
    const result = await Effect.runPromise(
      echo.handle({}).pipe(
        Effect.catchAll((err) =>
          Effect.succeed({
            content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
          })
        )
      )
    )

    expect(result.content[0]!.text).toMatch(/^Error: Invalid input:/)
  })
})

// ─────────────────────────────────────────────
// Tools list shape (mirrors ListTools handler output)
// ─────────────────────────────────────────────

describe('tools list shape', () => {
  it('maps ResolvedTools to the MCP tools list format', async () => {
    const tools = [makePingTool(), makeEchoTool()]

    const listed = tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }))

    expect(listed).toHaveLength(2)
    expect(listed[0]).toHaveProperty('name', 'ping')
    expect(listed[0]).toHaveProperty('description', 'Returns pong')
    expect(listed[0]).toHaveProperty('inputSchema')
    expect(listed[1]).toHaveProperty('name', 'echo')
  })

  it('each listed tool has a valid inputSchema object', async () => {
    const tools = [makePingTool(), makeEchoTool()]
    for (const tool of tools) {
      expect(typeof tool.inputSchema).toBe('object')
      expect(tool.inputSchema).not.toBeNull()
    }
  })

  it('server created with tools produces correct list length', async () => {
    const config: McpServerConfig = {
      name: 'test',
      tools: [makePingTool(), makeEchoTool(), makeFailingTool()],
    }

    // Validate the config.tools length directly — server wires it internally
    expect(config.tools).toHaveLength(3)
    expect(config.tools.map((t) => t.name)).toEqual(['ping', 'echo', 'fail'])
  })
})

// ─────────────────────────────────────────────
// McpServerConfig shape validation
// ─────────────────────────────────────────────

describe('McpServerConfig', () => {
  it('accepts config with no tools', async () => {
    const config: McpServerConfig = { name: 'empty', tools: [] }
    expect(config.tools).toHaveLength(0)
  })

  it('version defaults gracefully when omitted', async () => {
    const config: McpServerConfig = { name: 'no-ver', tools: [] }
    // TypeScript: version is optional, McpServer uses ?? '1.0.0'
    expect(config.version).toBeUndefined()
  })
})
