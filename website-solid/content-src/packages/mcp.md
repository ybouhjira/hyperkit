---
title: MCP
sidebar_position: 7
description: Effect-TS framework for building Model Context Protocol servers.
---

# `@ybouhjira/hyperkit-mcp`

An Effect-TS framework for building [Model Context Protocol](https://modelcontextprotocol.io/) servers: define tools with Effect Schema input validation, wire them into a server, and connect over stdio. It also ships the UI content schemas that power schema-driven rendering across HyperKit.

## Installation

```bash
npm install @ybouhjira/hyperkit-mcp effect @modelcontextprotocol/sdk
```

## Defining Tools

`defineTool` pairs a JSON-schema-visible input definition with an Effect handler. Input is validated with Effect Schema before your handler runs:

```ts
import { Schema as S } from 'effect';
import { Effect } from 'effect';
import { defineTool, makeServer, connectStdio } from '@ybouhjira/hyperkit-mcp';

const searchDocs = defineTool({
  name: 'search_docs',
  description: 'Search the documentation by keyword',
  inputSchema: S.Struct({
    query: S.String,
    limit: S.optional(S.Number),
  }),
  handler: ({ query, limit }) =>
    Effect.succeed({
      content: [{ type: 'text', text: runSearch(query, limit ?? 10) }],
    }),
});

const server = makeServer({
  name: 'docs-server',
  version: '1.0.0',
  tools: [searchDocs],
});

await connectStdio(server);
```

Invalid input never reaches your handler — the framework returns a structured validation error to the client.

## Content Schemas

`ContentSchema.ts` exports Effect Schemas for all 18 HyperKit UI content types (`summary-grid`, `table`, `code`, `flow-diagram`, `timeline`, `gap-analysis`, and more) under the `SectionContent` union. These are the contract used by the [AI Renderer](./ai-renderer.md) to validate LLM-generated UI.

```ts
import { SectionContent } from '@ybouhjira/hyperkit-mcp';
import { Schema as S } from 'effect';

const decoded = S.decodeUnknownSync(S.Array(SectionContent))(llmOutput);
```

`ReportSchema.ts` additionally defines the full structured report schema consumed by the `Report` component.

## Relationship to the HyperKit MCP Server

The main HyperKit repository uses this framework for its own documentation server (`mcp-server.js`), which exposes `search_components` and `get_component` tools plus the `llms.txt` / `llms-full.txt` resources to MCP-compatible editors.
