---
title: Packages
sidebar_position: 0
description: The HyperKit monorepo packages beyond the core component library.
---

# Packages

Beyond the core `@ybouhjira/hyperkit` component library, the monorepo publishes focused packages you can adopt independently. All Effect-based packages declare `effect ^3.0.0` as a peer dependency.

## Diagrams

| Package | Description |
| ------- | ----------- |
| [`@ybouhjira/diagram-core`](./diagram-core.md) | Framework-agnostic graph engine: model, layout algorithms, edge routing, serialization |
| [`@ybouhjira/diagram-svg`](./diagram-svg.md) | Vanilla SVG renderer with pan/zoom, themes, and arrow markers |
| [`@ybouhjira/diagram-solid`](./diagram-solid.md) | SolidJS bindings: `DiagramProvider`, `Diagram`, `Controls`, `MiniMap`, 13 hooks |

## Tooling

| Package | Description |
| ------- | ----------- |
| [`@ybouhjira/hyperkit-devtools`](./devtools.md) | CSS inspector and component tree panel (production-safe) |
| [`@ybouhjira/explorer`](./explorer.md) | SolidJS-native component workbench (Storybook alternative) |
| [`@ybouhjira/eslint-plugin-hyperkit`](./eslint-plugin.md) | Six lint rules enforcing token-first styling |

## AI & Schema

| Package | Description |
| ------- | ----------- |
| [`@ybouhjira/hyperkit-mcp`](./mcp.md) | Effect-TS MCP server framework with typed tool definitions |
| [`@ybouhjira/hyperkit-llm-pipeline`](./llm-pipeline.md) | Multi-LLM orchestration with typed steps and cost tracing |
| [`@ybouhjira/hyperkit-ai-renderer`](./ai-renderer.md) | Data + intent → validated HyperKit UI schemas via a cheap LLM |
| [`@ybouhjira/hyperkit-views`](./views.md) | Schema-driven view generation from Effect Schema annotations |
