# HyperKit Skills

> UX, architecture, and design prescriptions bound to the HyperKit component vocabulary.
> Load these before writing any UI, diagram, or feature that touches HyperKit.

## Why skills live here

A skill like "use `MetricCard` for single KPIs" only works if `MetricCard` actually exists in the framework it's prescribing. Skills + framework ship together — that binding is what makes the advice load-bearing instead of generic.

- **Rule of thumb for AI agents:** before answering any UI/design question, `cat` the relevant skill here. These override generic AI design training.
- **Rule of thumb for humans:** if you find yourself repeating the same correction to an AI ("no, use `Card` not a div"), that's a missing line in one of these skills — add it.

## Index

| Skill                                                      | When to load                                                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`hyperkit-first.md`](./hyperkit-first.md)                 | **Always first.** Before writing any UI code — enforces "search HyperKit before building custom."                                      |
| [`premium-ui-design.md`](./premium-ui-design.md)           | Any UI/layout work — the 10 Laws, component specs, anti-patterns, pre-ship checklist.                                                  |
| [`premium-diagram-design.md`](./premium-diagram-design.md) | Any diagram work (flowcharts, architecture, ER, state machines, etc.) — 15 archetypes, layout algorithm decision tree, color palettes. |
| [`engineering-philosophy.md`](./engineering-philosophy.md) | Applies to ALL code in HyperKit-consuming apps — no compromise, taste over speed, 100% test coverage.                                  |

## How to use

### Humans

Read [`hyperkit-first.md`](./hyperkit-first.md) and skim the rest once. The per-topic skills are reference material — consult when you're about to ship something that falls under them.

### AI agents (Claude Code, Cursor, Gemini, etc.)

When invoked inside a HyperKit-consuming repo, load these skills before producing any UI/design/diagram output. Priority:

1. `hyperkit-first.md` — always
2. Topic-specific skill (UI / diagram / philosophy) — based on the task
3. Main `CLAUDE.md` at the repo root — for the component catalog

### MCP (future)

A forthcoming `search_skills` tool in `@ybouhjira/hyperkit-mcp` will let agents retrieve the right skill by keyword without reading all files. Until then, use filesystem or glob.

## What's missing (known gaps)

- **`data-shape-to-component.md`** — the real UX craft. Given a data shape (single value, time series, list, graph, 2D matrix, hierarchy…), which HyperKit component(s) render it best? Currently absent; fill via dogfood loop.
- **`empty-state-playbook.md`** — composition rules for the "nothing to show" moment across all app types.
- **`dense-table-vs-card-grid.md`** — when to pick `Table` vs `Grid<Card>` vs `KanbanBoard` vs `DashboardContainer`.

Adding to this list > fixing ad-hoc. If you catch yourself coaching an AI on the same tradeoff repeatedly, that's a skill gap.

## Contributing

- Keep skills self-contained. An LLM should be able to load ONE skill and produce correct output — no "see premium-ui-design.md for details" chains.
- Cite the HyperKit components the skill prescribes BY NAME — vague skills rot fast.
- Pair every rule with a **Why:** line. Agents need the reason to judge edge cases.
- Date every significant change. Skills evolve; a 2-year-old rule may reference a component that's since moved.

## Versioning

Skills version with the HyperKit package. When a component is renamed, removed, or its semantics change, the skill MUST be updated in the same commit. CI should flag skill drift (component names mentioned in skills that don't resolve) — not yet automated.

## Pricing tier (future)

Per `project_skills_as_saas.md`:

- **Free tier:** this directory, public to drive adoption.
- **Pro/Business/Server/Enterprise:** private skills (data-shape-to-component, design-system adapters, domain-specific playbooks) gated behind the commercial license. Marketing surface ≠ moat.

The universal pricing rule (`feedback_pricing_by_customer_size.md`) applies — no exceptions.
