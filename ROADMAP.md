# HyperKit Roadmap

HyperKit's goal is bigger than a SolidJS component library: **one component API, rendered natively on every platform, backed by a full-stack service layer.**

## The vision: one API, many renderers

```
┌─────────────────────────────────────────────────────────────┐
│                  HyperKit Component API                      │
│   <Button>, <Stack>, <Tabs>, <Diagram>, <Panel>, …          │
│   One API. Same props. Same tokens. Same behavior.          │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ sk-solid │ sk-react │ sk-qml   │ sk-swift │ sk-gtk / compose│
│ SolidJS  │ React    │ Qt/QML   │ SwiftUI  │ GTK4 / Android  │
│ SHIPPED  │ NEXT     │ EXPLORED │ FUTURE   │ FUTURE          │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

Every renderer shares the component API contract (props, events, slots), the `--sk-*` design tokens, the theme system, and accessibility semantics. Not WebView wrappers, not bridges — native idioms per platform behind one contract.

The groundwork is already in this repo: [`diagram-core`](packages/diagram-core) is fully framework-agnostic (the SolidJS bindings are a separate package), the theme system is pure CSS custom properties, and behavior-level tests are renderer-independent.

### React adapter (`sk-react`) — next major milestone

- Same components, same `--sk-*` tokens, same themes — zero visual divergence
- Accessibility: Kobalte patterns mapped to Radix primitives
- Reactivity: signals → hooks, stores → context
- Shared across renderers: CSS, tokens, themes, stories, behavior tests
- First target: the diagram library, then the core primitives

## The platform: full-stack layer

The UI layer is one slice of the target architecture. Planned/in-progress platform packages:

| Package                    | Purpose                                                                                      | Status                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Effect services            | Service framework with DI and lifecycle (Logging, WebSocket, Session, FileSystem, Clipboard) | **Shipped** (in core)                                                                                          |
| MCP server framework       | Effect-based Model Context Protocol servers                                                  | **Shipped** ([`packages/mcp`](packages/mcp))                                                                   |
| AI renderer / LLM pipeline | Intent → validated UI schemas; multi-LLM orchestration                                       | **Shipped** ([`packages/ai-renderer`](packages/ai-renderer), [`packages/llm-pipeline`](packages/llm-pipeline)) |
| DAG engine                 | Node-based workflow execution on top of diagram-core                                         | Planned                                                                                                        |
| Realtime                   | WebSocket + SSE primitives for live apps                                                     | Planned (WebSocketService shipped; higher-level primitives next)                                               |
| Persist                    | Storage abstraction (SQLite, IndexedDB)                                                      | Planned                                                                                                        |
| Desktop                    | Tauri 2 integration for native desktop apps                                                  | Planned (adapter layer shipped in `src/desktop/`)                                                              |
| WASM runtime               | Rust→WASM pipeline for compute-heavy components                                              | Planned                                                                                                        |
| Plugin SDK                 | Manifest, lifecycle, registration                                                            | Planned                                                                                                        |
| CLI                        | `create-hyperkit-app`, generators                                                            | Partial (theme tooling shipped in [`cli/`](cli))                                                               |

## Near-term (next releases)

- [ ] Publish all public packages to npm
- [ ] React adapter for the diagram library
- [ ] React adapter for core primitives
- [ ] DAG execution engine on diagram-core
- [ ] Explorer: shareable story links, visual regression baselines
- [ ] More docs: per-system deep dives, live examples

## Contributing

The renderer contract work (React adapter especially) is a great place to contribute — the behavior tests and token system already define what "correct" means. See [CONTRIBUTING.md](CONTRIBUTING.md).
