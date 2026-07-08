import { Schema as S, JSONSchema, Effect, Either } from 'effect'
import { defineTool, toolResult, ToolError, type ToolResult } from './Tool.js'

// ─────────────────────────────────────────────
// toolResult helper
// ─────────────────────────────────────────────

describe('toolResult', () => {
  it('returns content array with a single text entry', () => {
    const result = toolResult('hello')
    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({ type: 'text', text: 'hello' })
  })

  it('preserves the exact text string', () => {
    const text = 'some JSON: {"key": "value"}'
    const result = toolResult(text)
    expect(result.content[0]!.text).toBe(text)
  })

  it('satisfies the ToolResult shape', () => {
    const result: ToolResult = toolResult('ok')
    expect(result).toHaveProperty('content')
  })
})

// ─────────────────────────────────────────────
// ToolError
// ─────────────────────────────────────────────

describe('ToolError', () => {
  it('has _tag = ToolError', () => {
    const err = new ToolError('bad input')
    expect(err._tag).toBe('ToolError')
  })

  it('extends Error', () => {
    const err = new ToolError('something failed')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('something failed')
  })
})

// ─────────────────────────────────────────────
// defineTool — JSON Schema generation
// ─────────────────────────────────────────────

describe('defineTool — JSON Schema generation', () => {
  it('generates a valid JSON schema object', () => {
    const tool = defineTool({
      name: 'greet',
      description: 'Greets someone',
      input: S.Struct({ name: S.String }),
      handler: (input) => Effect.succeed(toolResult(`Hello ${input.name}`)),
    })

    expect(tool.inputSchema).toBeDefined()
    expect(typeof tool.inputSchema).toBe('object')
  })

  it('includes required fields in the schema', () => {
    const tool = defineTool({
      name: 'greet',
      description: 'Greets someone',
      input: S.Struct({ name: S.String, age: S.Number }),
      handler: (input) => Effect.succeed(toolResult(`${input.name} is ${input.age}`)),
    })

    const schema = tool.inputSchema as Record<string, unknown>
    const properties = schema['properties'] as Record<string, unknown>
    expect(properties).toHaveProperty('name')
    expect(properties).toHaveProperty('age')
  })

  it('marks required fields correctly', () => {
    const tool = defineTool({
      name: 'test',
      description: '',
      input: S.Struct({ required: S.String, optional: S.optional(S.String) }),
      handler: () => Effect.succeed(toolResult('ok')),
    })

    const schema = tool.inputSchema as Record<string, unknown>
    const required = schema['required'] as string[]
    expect(required).toContain('required')
    expect(required).not.toContain('optional')
  })

  it('generates schema matching JSONSchema.make output', () => {
    const inputSchema = S.Struct({ x: S.Number })
    const tool = defineTool({
      name: 'compute',
      description: '',
      input: inputSchema,
      handler: () => Effect.succeed(toolResult('ok')),
    })

    const expected = JSONSchema.make(inputSchema)
    expect(JSON.stringify(tool.inputSchema)).toBe(JSON.stringify(expected))
  })

  it('exposes name and description', () => {
    const tool = defineTool({
      name: 'my-tool',
      description: 'Does something useful',
      input: S.Struct({}),
      handler: () => Effect.succeed(toolResult('ok')),
    })

    expect(tool.name).toBe('my-tool')
    expect(tool.description).toBe('Does something useful')
  })
})

// ─────────────────────────────────────────────
// defineTool — handle: valid input
// ─────────────────────────────────────────────

describe('defineTool — handle with valid input', () => {
  it('parses input and passes it to handler', async () => {
    const received: string[] = []
    const tool = defineTool({
      name: 'echo',
      description: '',
      input: S.Struct({ message: S.String }),
      handler: (input) => {
        received.push(input.message)
        return Effect.succeed(toolResult(`echo: ${input.message}`))
      },
    })

    const result = await Effect.runPromise(tool.handle({ message: 'hello' }))
    expect(received).toEqual(['hello'])
    expect(result.content[0]!.text).toBe('echo: hello')
  })

  it('coerces compatible types through schema decode', async () => {
    const tool = defineTool({
      name: 'add',
      description: '',
      input: S.Struct({ a: S.Number, b: S.Number }),
      handler: (input) => Effect.succeed(toolResult(String(input.a + input.b))),
    })

    const result = await Effect.runPromise(tool.handle({ a: 3, b: 4 }))
    expect(result.content[0]!.text).toBe('7')
  })

  it('handler return value is passed through unchanged', async () => {
    const tool = defineTool({
      name: 'ping',
      description: '',
      input: S.Struct({}),
      handler: () =>
        Effect.succeed({
          content: [{ type: 'text' as const, text: 'pong' }],
          extra: 'metadata',
        }),
    })

    const result = await Effect.runPromise(tool.handle({}))
    expect((result as Record<string, unknown>)['extra']).toBe('metadata')
  })
})

// ─────────────────────────────────────────────
// defineTool — handle: invalid input → ToolError
// ─────────────────────────────────────────────

describe('defineTool — handle with invalid input', () => {
  it('returns ToolError when required field is missing', async () => {
    const tool = defineTool({
      name: 'greet',
      description: '',
      input: S.Struct({ name: S.String }),
      handler: (input) => Effect.succeed(toolResult(`Hello ${input.name}`)),
    })

    const result = await Effect.runPromise(
      tool.handle({}).pipe(Effect.either)
    )

    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ToolError)
      expect(result.left._tag).toBe('ToolError')
      expect(result.left.message).toMatch(/Invalid input/)
    }
  })

  it('returns ToolError when field has wrong type', async () => {
    const tool = defineTool({
      name: 'square',
      description: '',
      input: S.Struct({ n: S.Number }),
      handler: (input) => Effect.succeed(toolResult(String(input.n * input.n))),
    })

    const result = await Effect.runPromise(
      tool.handle({ n: 'not-a-number' }).pipe(Effect.either)
    )

    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ToolError)
    }
  })

  it('returns ToolError when input is null', async () => {
    const tool = defineTool({
      name: 'test',
      description: '',
      input: S.Struct({ x: S.String }),
      handler: () => Effect.succeed(toolResult('ok')),
    })

    const result = await Effect.runPromise(
      tool.handle(null).pipe(Effect.either)
    )

    expect(Either.isLeft(result)).toBe(true)
  })

  it('wraps parse error message with "Invalid input:" prefix', async () => {
    const tool = defineTool({
      name: 'test',
      description: '',
      input: S.Struct({ value: S.Literal('a', 'b') }),
      handler: () => Effect.succeed(toolResult('ok')),
    })

    const result = await Effect.runPromise(
      tool.handle({ value: 'c' }).pipe(Effect.either)
    )

    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left.message).toMatch(/^Invalid input:/)
    }
  })

  it('does NOT call handler when input is invalid', async () => {
    let handlerCalled = false
    const tool = defineTool({
      name: 'test',
      description: '',
      input: S.Struct({ name: S.String }),
      handler: () => {
        handlerCalled = true
        return Effect.succeed(toolResult('ok'))
      },
    })

    await Effect.runPromise(tool.handle({ name: 42 }).pipe(Effect.either))
    expect(handlerCalled).toBe(false)
  })
})

// ─────────────────────────────────────────────
// defineTool — handle: handler errors
// ─────────────────────────────────────────────

describe('defineTool — handle propagates handler ToolErrors', () => {
  it('propagates ToolError thrown by handler', async () => {
    const tool = defineTool({
      name: 'failing',
      description: '',
      input: S.Struct({ x: S.String }),
      handler: () => Effect.fail(new ToolError('handler exploded')),
    })

    const result = await Effect.runPromise(
      tool.handle({ x: 'ok' }).pipe(Effect.either)
    )

    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left.message).toBe('handler exploded')
    }
  })
})
