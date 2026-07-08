# @ybouhjira/hyperkit-llm-pipeline

Multi-LLM orchestration framework built with [Effect-TS](https://effect.website). Define typed pipeline steps, chain models together, and get full observability over every call — prompt, response, token usage, cost, and duration.

Part of the [HyperKit](https://github.com/ybouhjira/hyperkit) monorepo. Used by `@ybouhjira/hyperkit-ai-renderer` to drive data-to-UI rendering pipelines.

---

## Installation

```bash
npm install @ybouhjira/hyperkit-llm-pipeline
```

Peer dependency:

```bash
npm install effect@^3.0.0
```

---

## Quick Start

```typescript
import { Effect } from 'effect';
import { Schema as S } from 'effect';
import { defineStep, Pipeline, CliProvider } from '@ybouhjira/hyperkit-llm-pipeline';

// 1. Define the output schema for type-safe validation
const SummarySchema = S.Struct({ summary: S.String, bullets: S.Array(S.String) });

// 2. Define a step
const summarizeStep = defineStep({
  name: 'summarize',
  model: 'haiku',
  systemPrompt: 'You are a concise summarizer. Return valid JSON only.',
  outputSchema: SummarySchema,
  buildPrompt: (text: string) => `Summarize this text:\n\n${text}`,
  parseResponse: (response: string) => JSON.parse(response),
});

// 3. Build and run the pipeline
const pipeline = Pipeline.from('summarize-pipeline', summarizeStep);

const program = Pipeline.run(pipeline, 'Your long article text here...').pipe(
  Effect.provide(CliProvider)
);

const { output, trace } = await Effect.runPromise(program);
console.log(output.summary);
console.log(`Cost: $${trace.totalCostUsd.toFixed(6)}`);
```

---

## Core Concepts

### LlmProvider — the service interface

All LLM access goes through the `LlmProvider` Effect service. Steps declare a dependency on it; providers satisfy it at runtime via `Effect.provide`.

```typescript
interface LlmRequest {
  readonly model: string;
  readonly systemPrompt: string;
  readonly userPrompt: string;
}

interface LlmResponse {
  readonly text: string;
  readonly tokens: { readonly input: number; readonly output: number };
  readonly costUsd: number;
}

class LlmProvider extends Context.Tag('LlmProvider')<
  LlmProvider,
  { readonly call: (request: LlmRequest) => Effect.Effect<LlmResponse, LlmError> }
>() {}
```

### Steps

A step is the smallest unit of work: it receives typed input, builds a prompt, calls the LLM, parses the response, and validates the output against a schema.

```typescript
interface StepConfig<In, Out> {
  name: string;
  model: string;
  systemPrompt: string;
  outputSchema: Schema<Out>;
  buildPrompt: (input: In) => string;
  parseResponse: (response: string) => unknown;
  retry?: {
    maxAttempts?: number; // default: 1 (no retry)
    feedbackOnError?: boolean; // append the parse/validation error to the next attempt's prompt
  };
}
```

### Pipelines

A pipeline is an ordered sequence of steps where the output of step N becomes the input of step N+1. The type system enforces this chain at compile time.

```typescript
// Single step
const p = Pipeline.from('my-pipeline', step);

// Chained steps
const p2 = Pipeline.pipe(p, nextStep);

// Run
const { output, trace } = await Effect.runPromise(
  Pipeline.run(p2, initialInput).pipe(Effect.provide(CliProvider))
);
```

---

## API Reference

### `defineStep<In, Out>(config: StepConfig<In, Out>): Step<In, Out>`

Creates a pipeline step. The generic types `In` and `Out` are inferred from `buildPrompt` and `outputSchema`.

### `Pipeline.from(name: string, step: Step<In, Out>): Pipeline<In, Out>`

Creates a new pipeline from a single step.

### `Pipeline.pipe(pipeline: Pipeline<In, Mid>, step: Step<Mid, Out>): Pipeline<In, Out>`

Appends a step to a pipeline. The output type of the pipeline must match the input type of the step.

### `Pipeline.run(pipeline, input): Effect<{ output, trace }, LlmError, LlmProvider>`

Executes the pipeline. Returns an Effect that requires `LlmProvider` in its context. Provide it with `Effect.provide(CliProvider)` or a custom layer.

### `LlmProvider`

Effect `Context.Tag` representing the LLM service. Implement it with any `Layer<LlmProvider>`.

### `LlmError`

Tagged error class (`_tag: 'LlmError'`) thrown when a provider call fails or all retry attempts are exhausted. Carries the `model` field.

---

## Providers

### CliProvider

The production provider. Routes calls to the Claude CLI or Gemini CLI based on the model name.

```typescript
import { CliProvider } from '@ybouhjira/hyperkit-llm-pipeline';

const program = Pipeline.run(pipeline, input).pipe(Effect.provide(CliProvider));
```

**Model routing:**

- `model === 'gemini'` → `gemini -p <prompt>` (free, $0 cost)
- anything else → `claude --model <model> --print -p <prompt>`

**Supported Claude models and estimated pricing (per 1M tokens):**

| Model    | Input | Output |
| -------- | ----- | ------ |
| `opus`   | $15   | $75    |
| `sonnet` | $3    | $15    |
| `haiku`  | $0.25 | $1.25  |
| `gemini` | $0    | $0     |

Unknown models fall back to `haiku` pricing.

**Important:** `CliProvider` uses synchronous `execFileSync` internally. It is designed for batch pipeline steps, not for interactive chat or streaming use cases.

**Prerequisites:** `claude` CLI and/or `gemini` CLI must be installed and authenticated in the system PATH.

### MockProvider

Factory for deterministic test providers. Accepts either a response map or a callback function.

```typescript
import { MockProvider } from '@ybouhjira/hyperkit-llm-pipeline';

// Map responses by model name
const provider = MockProvider({
  haiku: '{"summary": "short text", "bullets": ["point one"]}',
  sonnet: '{"result": "ok"}',
});

// Function form — inspect the full request
const provider = MockProvider((req: LlmRequest) => {
  if (req.model === 'haiku') return '{"value": 42}';
  return '{"answer": "default"}';
});
```

The function form receives the complete `LlmRequest` object (model, systemPrompt, userPrompt), making it suitable for testing prompt construction logic.

### Custom Providers

Implement `Layer<LlmProvider>` to integrate any LLM backend:

```typescript
import { Layer, Effect } from 'effect';
import { LlmProvider, LlmError } from '@ybouhjira/hyperkit-llm-pipeline';

const MyProvider = Layer.succeed(LlmProvider, {
  call: (request) =>
    Effect.tryPromise({
      try: async () => {
        const response = await myApiClient.complete(request);
        return {
          text: response.content,
          tokens: { input: response.usage.input, output: response.usage.output },
          costUsd: 0,
        };
      },
      catch: (err) => new LlmError(String(err), request.model),
    }),
});
```

---

## Pipeline Composition Example

A two-step pipeline: extract structured data with a cheap model, then enrich it with a more capable one.

```typescript
import { Effect } from 'effect';
import { Schema as S } from 'effect';
import { defineStep, Pipeline, CliProvider } from '@ybouhjira/hyperkit-llm-pipeline';

const ExtractedSchema = S.Struct({ topics: S.Array(S.String), sentiment: S.String });
const EnrichedSchema = S.Struct({
  topics: S.Array(S.String),
  sentiment: S.String,
  insight: S.String,
});

const extractStep = defineStep({
  name: 'extract',
  model: 'haiku',
  systemPrompt: 'Extract topics and sentiment as JSON. Return only JSON, no markdown.',
  outputSchema: ExtractedSchema,
  buildPrompt: (text: string) => `Analyze:\n\n${text}`,
  parseResponse: JSON.parse,
  retry: { maxAttempts: 3, feedbackOnError: true },
});

const enrichStep = defineStep({
  name: 'enrich',
  model: 'sonnet',
  systemPrompt: 'Add a one-sentence insight. Return only JSON, no markdown.',
  outputSchema: EnrichedSchema,
  buildPrompt: (extracted) => `Add insight to:\n\n${JSON.stringify(extracted)}`,
  parseResponse: JSON.parse,
});

const pipeline = Pipeline.pipe(Pipeline.from('analyze', extractStep), enrichStep);

const { output, trace } = await Effect.runPromise(
  Pipeline.run(pipeline, articleText).pipe(Effect.provide(CliProvider))
);

console.log(output.insight);
console.log(`Steps: ${trace.steps.length}, Total: $${trace.totalCostUsd.toFixed(6)}`);
```

---

## Retry and Error Recovery

Configure `retry` on any step to handle transient parse errors or schema mismatches:

```typescript
defineStep({
  // ...
  retry: {
    maxAttempts: 3, // Try up to 3 times before failing with LlmError
    feedbackOnError: true, // Append the error message to the next attempt's prompt
  },
});
```

When `feedbackOnError` is enabled, the second attempt's prompt becomes:

```
<original prompt>

Previous attempt failed with: Parse error: Unexpected token ...
Please fix the output.
```

This gives the LLM the chance to self-correct without requiring a separate validation step.

---

## Observability and Tracing

Every `Pipeline.run` call returns a `PipelineTrace` alongside the output.

### StepTrace

Each step in `trace.steps` contains:

| Field           | Type      | Description                                       |
| --------------- | --------- | ------------------------------------------------- |
| `id`            | `string`  | Unique UUID for this execution                    |
| `stepName`      | `string`  | Name from `StepConfig`                            |
| `model`         | `string`  | Model used                                        |
| `input`         | `unknown` | Input received by the step                        |
| `prompt`        | `string`  | Final prompt sent to the LLM                      |
| `rawResponse`   | `string`  | Raw text returned by the LLM                      |
| `output`        | `unknown` | Parsed and validated output                       |
| `startedAt`     | `number`  | Unix timestamp (ms)                               |
| `completedAt`   | `number`  | Unix timestamp (ms)                               |
| `durationMs`    | `number`  | Wall-clock execution time                         |
| `tokens.input`  | `number`  | Estimated input tokens                            |
| `tokens.output` | `number`  | Estimated output tokens                           |
| `costUsd`       | `number`  | Estimated cost in USD                             |
| `attempts`      | `number`  | Number of attempts made (1 = first try succeeded) |
| `error`         | `string?` | Error message if the step failed                  |

### PipelineTrace

Aggregated totals for the entire pipeline run:

| Field             | Type                       | Description                                 |
| ----------------- | -------------------------- | ------------------------------------------- |
| `pipelineName`    | `string`                   | Pipeline name                               |
| `steps`           | `ReadonlyArray<StepTrace>` | Per-step traces                             |
| `startedAt`       | `number`                   | Unix timestamp (ms)                         |
| `completedAt`     | `number`                   | Unix timestamp (ms)                         |
| `totalDurationMs` | `number`                   | Total wall-clock time                       |
| `totalCostUsd`    | `number`                   | Sum of all step costs                       |
| `totalTokens`     | `{ input, output }`        | Sum of all step token usage                 |
| `success`         | `boolean`                  | `true` if all steps completed without error |
| `error`           | `string?`                  | Error message from the last failing step    |

---

## Testing

Use `MockProvider` to write fast, deterministic tests without any LLM calls:

```typescript
import { Effect } from 'effect';
import { defineStep, Pipeline, MockProvider } from '@ybouhjira/hyperkit-llm-pipeline';

it('extracts the answer field', async () => {
  const step = defineStep({
    /* ... */
  });
  const program = Pipeline.run(Pipeline.from('test', step), 'input').pipe(
    Effect.provide(MockProvider({ haiku: '{"answer": "42"}' }))
  );

  const { output, trace } = await Effect.runPromise(program);
  expect(output.answer).toBe('42');
  expect(trace.success).toBe(true);
});
```

---

## Roadmap

- **Streaming support** — `call()` currently returns a complete response. A `stream()` method is planned for interactive use cases.
- **OpenAI provider** — `Layer<LlmProvider>` wrapping the OpenAI API.
- **Ollama provider** — Local model support via the Ollama REST API.
- **Cost estimation API** — Pre-flight cost estimates based on prompt length and model pricing before making calls.
- **DAG pipelines** — Parallel step execution for steps that do not depend on each other (the `parentStepId` field on `StepTrace` is reserved for this).

---

## License

ISC
