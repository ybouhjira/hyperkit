import { Effect, Layer, Stream } from 'effect'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LlmProvider } from '../LlmProvider.js'
import { OllamaProvider, makeOllamaProvider, callOllama, streamOllama } from './OllamaProvider.js'
import type { LlmRequest } from '../LlmProvider.js'

const baseRequest: LlmRequest = {
  model: 'llama3.1:8b',
  systemPrompt: 'You are helpful.',
  userPrompt: 'Say hi.',
}

describe('OllamaProvider — callOllama', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sends system+prompt and parses the non-streaming response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ response: 'hi there', prompt_eval_count: 7, eval_count: 3 }),
        { status: 200 },
      ),
    )

    const result = await Effect.runPromise(callOllama(baseRequest))

    expect(result.text).toBe('hi there')
    expect(result.tokens).toEqual({ input: 7, output: 3 })
    expect(result.costUsd).toBe(0)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:11434/api/generate')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      model: 'llama3.1:8b',
      system: 'You are helpful.',
      prompt: 'Say hi.',
      stream: false,
    })
  })

  it('passes providerOptions.format to Ollama (for JSON mode)', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: '{}' }), { status: 200 }),
    )

    await Effect.runPromise(
      callOllama({ ...baseRequest, providerOptions: { format: 'json' } }),
    )

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string)
    expect(body.format).toBe('json')
  })

  it('honors providerOptions.baseUrl override', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: 'x' }), { status: 200 }),
    )

    await Effect.runPromise(
      callOllama({ ...baseRequest, providerOptions: { baseUrl: 'http://gpu:11434' } }),
    )

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://gpu:11434/api/generate')
  })

  it('fails with LlmError on non-2xx response', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 }))

    const exit = await Effect.runPromiseExit(callOllama(baseRequest))
    expect(exit._tag).toBe('Failure')
  })
})

describe('OllamaProvider — streamOllama', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('emits TextDelta chunks then a Done chunk with aggregated result', async () => {
    const ndjson =
      JSON.stringify({ response: 'Hel' }) +
      '\n' +
      JSON.stringify({ response: 'lo' }) +
      '\n' +
      JSON.stringify({ response: '', done: true, prompt_eval_count: 4, eval_count: 2 }) +
      '\n'
    fetchMock.mockResolvedValueOnce(new Response(ndjson, { status: 200 }))

    const chunks = await Effect.runPromise(Stream.runCollect(streamOllama(baseRequest)))
    const arr = Array.from(chunks)

    const deltas = arr.filter((c) => c._tag === 'TextDelta').map((c) => (c as { text: string }).text)
    expect(deltas).toEqual(['Hel', 'lo'])

    const done = arr.find((c) => c._tag === 'Done')
    expect(done).toBeDefined()
    if (done?._tag === 'Done') {
      expect(done.result.fullText).toBe('Hello')
      expect(done.result.tokens).toEqual({ input: 4, output: 2 })
    }
  })
})

describe('OllamaProvider — Layer integration', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('resolves LlmProvider from the default layer and calls Ollama', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: 'ok' }), { status: 200 }),
    )

    const program = Effect.gen(function* () {
      const provider = yield* LlmProvider
      return yield* provider.call(baseRequest)
    }).pipe(Effect.provide(OllamaProvider))

    const result = await Effect.runPromise(program)
    expect(result.text).toBe('ok')
  })

  it('makeOllamaProvider baseUrl applies when request has no override', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: 'ok' }), { status: 200 }),
    )

    const layer: Layer.Layer<LlmProvider> = makeOllamaProvider('http://custom:11434')
    const program = Effect.gen(function* () {
      const provider = yield* LlmProvider
      return yield* provider.call(baseRequest)
    }).pipe(Effect.provide(layer))

    await Effect.runPromise(program)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://custom:11434/api/generate')
  })
})
