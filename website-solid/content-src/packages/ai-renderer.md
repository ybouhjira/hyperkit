---
title: AI Renderer
sidebar_position: 9
description: Turn raw data and intent into validated HyperKit UI schemas via a cheap LLM.
---

# `@ybouhjira/hyperkit-ai-renderer`

Transforms raw data and intent strings into validated HyperKit UI schemas using a cheap LLM (Haiku or Gemini Flash by default).

## The Problem It Solves

When a smart model like Opus generates a response, it knows what information to present but should not be burdened with memorizing 18 content type schemas, their exact JSON shapes, and the selection rules for when each is appropriate. Making the main model output UI schemas directly is wasteful and error-prone.

This package implements the **2-LLM architecture**:

```
Smart model (Opus)          Renderer model (Haiku)
─────────────────           ──────────────────────
"Here are the metrics:  →   [Receives catalog of 18
 CPU 80%, RAM 60%..."        content types + intent]
                          →   Outputs validated JSON array
                          →   Schema-validated by Effect
```

The renderer step is cheap, focused, and runs with a compressed system prompt (`CONTENT_TYPE_CATALOG`) that gives it everything it needs. The main model stays context-clean.

## Architecture

```
renderData(intent, options?)
  │
  ├── rendererStep(options)         ← creates a Step<string, SectionContent[]>
  │     ├── systemPrompt = CONTENT_TYPE_CATALOG + additionalContext?
  │     ├── model = "haiku" (default)
  │     ├── parseResponse = extractJson()   ← strips markdown fences
  │     └── outputSchema = S.Array(SectionContent)  ← Effect Schema validation
  │
  └── Pipeline.run(pipeline, intent)
        └── Returns { content: SectionContent[], trace: PipelineTrace }
```

`LlmProvider` is injected via Effect's dependency injection — the renderer itself has no direct dependency on any specific LLM SDK.

## Installation

```bash
npm install @ybouhjira/hyperkit-ai-renderer
```

Peer dependencies:

```bash
npm install effect @ybouhjira/hyperkit-llm-pipeline @ybouhjira/hyperkit-mcp
```

## Quick Start

```ts
import { Effect } from 'effect';
import { renderData } from '@ybouhjira/hyperkit-ai-renderer';
import { CliProvider } from '@ybouhjira/hyperkit-llm-pipeline';

const program = renderData('Show a summary of these server metrics: CPU 80%, Memory 60%, Disk 45%');

const { content, trace } = await Effect.runPromise(program.pipe(Effect.provide(CliProvider())));

console.log(content);
// [{ type: 'summary-grid', items: [{ icon: '💻', title: 'CPU', ... }] }]

console.log(`Rendered in ${trace.totalDurationMs}ms, cost $${trace.totalCostUsd.toFixed(5)}`);
```

## How the Catalog Works

`CONTENT_TYPE_CATALOG` is a compressed system prompt embedded in this package. It is sent to the renderer LLM on every call and contains:

- **18 content type definitions** with their exact JSON schemas and examples
- **A RULES section** requiring JSON-only output (no markdown, no explanation)
- **A SELECTION GUIDE** mapping common data patterns to appropriate content types

The catalog is compact by design — it fits comfortably in Haiku's context window with room for the intent and any additional context you provide.

```ts
import { CONTENT_TYPE_CATALOG } from '@ybouhjira/hyperkit-ai-renderer';

// Inspect what the renderer LLM receives as its system prompt
console.log(CONTENT_TYPE_CATALOG);
```

## The 18 Content Types

| Type            | Use For                                      |
| --------------- | -------------------------------------------- |
| `summary-grid`  | Key metrics, KPI cards with icons            |
| `table`         | Structured tabular data                      |
| `code`          | Code snippets with syntax highlighting       |
| `flow-diagram`  | Architecture layers                          |
| `layer-stack`   | Labeled layer visualization                  |
| `gap-analysis`  | Issues with critical/important/nice severity |
| `timeline`      | Step-by-step progress with status            |
| `package-tree`  | Package/module overviews                     |
| `preset-grid`   | Option cards with gradients                  |
| `source-list`   | Grouped reference links                      |
| `text`          | Rich or plain text blocks                    |
| `issue-list`    | Bug/issue cards with icons                   |
| `decision-grid` | Interactive option selection                 |
| `poll`          | Interactive quick vote                       |
| `form-fields`   | Interactive form inputs                      |
| `mockup-layout` | Template-based UI mockups                    |
| `mockup-tree`   | Free-form component trees                    |
| `app`           | Live SolidJS applications                    |

## API Reference

### `renderData(intent, options?)`

Main entry point. Returns an `Effect` requiring `LlmProvider` in context.

```ts
function renderData(
  intent: string,
  options?: RenderDataOptions
): Effect.Effect<RenderResult, LlmError, LlmProvider>;
```

**Parameters:**

- `intent` — the raw data or description of what to render
- `options.model` — LLM model alias (default: `"haiku"`)
- `options.additionalContext` — extra instructions appended to the catalog system prompt
- `options.maxAttempts` — retry budget for malformed JSON responses (default: `2`)

**Returns:**

```ts
interface RenderResult {
  readonly content: readonly SectionContent[]; // validated UI blocks
  readonly trace: PipelineTrace; // timing, tokens, cost, attempts
}
```

---

### `rendererStep(options?)`

Creates a `Step<string, SectionContent[]>` for use in a custom pipeline. Use this when you need to compose the renderer with other steps.

```ts
function rendererStep(options?: RendererStepOptions): Step<string, readonly SectionContent[]>;
```

```ts
import { rendererStep } from '@ybouhjira/hyperkit-ai-renderer';
import { Pipeline } from '@ybouhjira/hyperkit-llm-pipeline';

const step = rendererStep({ model: 'gemini-flash', additionalContext: 'Focus on security.' });
const pipeline = Pipeline.from('my-pipeline', step);
```

---

### `extractJson(response)`

Strips markdown code fences from an LLM response and parses JSON. Used internally by `rendererStep` but exported for use in custom steps.

```ts
function extractJson(response: string): unknown;
```

Handles:

- Raw JSON strings
- ` ```json ... ``` ` code blocks
- ` ``` ... ``` ` blocks without a language tag

Throws `SyntaxError` on malformed JSON.

---

### `CONTENT_TYPE_CATALOG`

The system prompt string given to the renderer LLM. Export it directly if you need to inspect or extend it.

```ts
const CONTENT_TYPE_CATALOG: string;
```

## Custom Model and Provider

Override the model per call:

```ts
const { content } = await Effect.runPromise(
  renderData('intent', { model: 'gemini-flash' }).pipe(Effect.provide(GeminiProvider()))
);
```

Add domain-specific instructions:

```ts
const { content } = await Effect.runPromise(
  renderData('AWS cost report for Q1', {
    additionalContext: 'Prefer table and summary-grid. Use USD for all cost values.',
  }).pipe(Effect.provide(CliProvider()))
);
```

## Testing with MockProvider

`MockProvider` from `@ybouhjira/hyperkit-llm-pipeline` intercepts LLM calls without hitting any real API. Pass a fixed response string keyed by model name, or a function that receives the full `LlmRequest`.

```ts
import { Effect } from 'effect';
import { MockProvider } from '@ybouhjira/hyperkit-llm-pipeline';
import { renderData } from '@ybouhjira/hyperkit-ai-renderer';

it('renders a summary-grid from metrics', async () => {
  const mockResponse = JSON.stringify([
    {
      type: 'summary-grid',
      items: [{ icon: '💻', title: 'CPU', description: '80% usage', iconColor: 'teal' }],
    },
  ]);

  const program = renderData('CPU usage is 80%').pipe(
    Effect.provide(MockProvider({ haiku: mockResponse }))
  );

  const { content } = await Effect.runPromise(program);
  expect(content[0].type).toBe('summary-grid');
});
```

Inspect the actual request sent to the LLM:

```ts
import type { LlmRequest } from '@ybouhjira/hyperkit-llm-pipeline';

it('includes the intent in the user prompt', async () => {
  const captured: LlmRequest[] = [];

  const program = renderData('show disk usage').pipe(
    Effect.provide(
      MockProvider((req: LlmRequest) => {
        captured.push(req);
        return mockResponse;
      })
    )
  );

  await Effect.runPromise(program);
  expect(captured[0].userPrompt).toContain('show disk usage');
  expect(captured[0].systemPrompt).toContain('summary-grid');
});
```

Test retry behavior:

```ts
it('succeeds on retry after first attempt fails', async () => {
  let calls = 0;

  const program = renderData('metrics', { maxAttempts: 2 }).pipe(
    Effect.provide(
      MockProvider(() => {
        calls++;
        return calls === 1 ? 'bad json {{{' : validResponse;
      })
    )
  );

  const { trace } = await Effect.runPromise(program);
  expect(trace.steps[0].attempts).toBe(2);
});
```

## Dependencies

| Package                            | Role                                                               |
| ---------------------------------- | ------------------------------------------------------------------ |
| `@ybouhjira/hyperkit-llm-pipeline` | `Step`, `Pipeline`, `LlmProvider`, `PipelineTrace`, `MockProvider` |
| `@ybouhjira/hyperkit-mcp`          | `SectionContent` Effect Schema (the 18 UI content types)           |
| `effect` (peer)                    | Schema validation, dependency injection, `Effect.Effect` type      |
