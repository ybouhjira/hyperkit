# Premium Diagram Design System v1 (Billion-Dollar Product Quality)

> Distilled from studying JointJS, GoJS, React Flow, Excalidraw, tldraw, Mermaid, D2, Obsidian Canvas, Figma FigJam, Linear, and the theoretical foundations from Tufte, Bertin, and Gestalt psychology.
> Applies to ALL diagrams in HyperKit apps, docs, reports, and dashboards. This is a reusable skill — not project-specific.

## The North Star

**If a user can't tell this was made by an indie dev, you've succeeded.**

Diagrams are where information design meets UI design. A cheap-looking diagram in an otherwise premium app is immediately disqualifying — users infer the quality of the underlying thinking from the quality of the picture.

The billion-dollar products don't share a look — they share a **discipline**. Every node earns its shape. Every color carries meaning. Every edge is deliberate. If a diagram has 12 colors, it's a ransom note. If it has 40 nodes and no grouping, it's an untestable hypothesis about human working memory.

This document is the discipline.

---

## PART 1: THE 10 LAWS

Six come from cross-tool convergence (every premium tool does this). Four come from information-design theory (the _why_ behind the convergence).

### 1. DOT GRID, NOT LINE GRID

_Source: React Flow, Obsidian Canvas, FigJam, tldraw, Excalidraw all default to dots. Line grids signal "wireframe tool"; dots signal "infinite canvas"._

- **Grid variant:** dots, gap `20px`, dot size `1.5px`, color `#e5e7eb` (light) / `#2a2d35` (dark) — ~10–15% opacity over canvas
- **Canvas background:** `#ffffff` (light) / `#0f1115` (dark) — never pure `#000000`
- **Pad the bounding box:** fit-to-view with 5–10% padding around the graph bounds. Never have nodes kiss the edge.

### 2. SMALL RADIUS, NEVER LARGE

_Source: React Flow 3px, Mermaid 5px, D2 5px, FigJam ~4px, tldraw ~8px. Rounding over 12px looks consumer/toy._

- **Node border-radius:** `6px` (between React Flow's 3 and tldraw's 8 — the sweet spot)
- **Group/cluster radius:** `8px` — slightly softer than nodes
- **Pill terminals** (start/end): `9999px` (full pill) is fine as a shape _signal_, not a style choice
- **Excalidraw is the exception** — hand-drawn roughness replaces radius entirely

### 3. TINTED FILL + SATURATED STROKE FROM ONE HUE

_Source: Excalidraw 5-step ramps, D2 B1–B6 pairs, Mermaid event-model colors. Every premium tool that does color does it this way._

- **Never** use "colored header band" (GoJS-style) in modern docs — it aged badly
- **Never** use full-saturation fills — looks like a 2008 UML book
- **The pattern:** light tint background (L ≈ 93–97%) + saturated stroke of the same hue (L ≈ 45–55%)
- **Excalidraw's proven 8-color palette** (index-1 bg + index-4 stroke) is the recommended default — see PART 2

### 4. 6–8 COLORS MAX, NEVER MORE

_Source: Bertin — humans can't distinguish more than ~8 hues as categories. Beyond 8, color stops being information and becomes noise._

- **≤8 semantic colors per diagram.** If you need more categories, introduce shape, icon, or grouping as a second channel
- **90% monochrome + 10% accent.** The diagram should be mostly gray/neutral; color is reserved for what matters
- **Color earns attention by being rare.** A diagram where everything is colored is a diagram where nothing is emphasized
- **Shape and hue are both nominal** — use them for category (not magnitude). Use position and size for magnitude.

### 5. EDGES ARE DARKER THAN NODES, 1–2PX, FILLED TRIANGLE ARROW

_Source: Universal across React Flow (#b1b1b7), Mermaid (#666), D2 (N1 #170206). No exceptions._

- **Edge stroke:** `#9ca3af` (light) / `#6b7280` (dark) — darker than node strokes, lighter than text
- **Edge width:** `1.5px` default; `2px` for dashed/dotted (visibility); `2.5px` on dense layouts
- **Arrowhead:** filled triangle, 8–12px; `vee` (open) or `diamond` (aggregation) only when the semantic demands it
- **Dashed = async/optional.** Dotted = uncertain/planned. Solid = actual/synchronous. Commit to this vocabulary.
- **Curvature:** bezier for freeform graphs (dependency, network); orthogonal for org charts, flowcharts, ER; straight only for sequence diagrams

### 6. NO DROP SHADOWS ON NODES (EXCEPT ON SELECTION)

_Source: React Flow, Mermaid, D2, Obsidian Canvas all default to zero shadow. Shadows appear only on floating UI (toolbars, minimap) or selected-state lift. FigJam is the consumer-tool exception._

- **Resting state:** `shadow: none`
- **Selected state:** `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)`
- **Hover state:** same as selected, or no change — never both hover and selection with shadow (indistinguishable)
- **Toolbars, minimap, floating controls:** subtle shadow `0 0 2px 1px rgba(0,0,0,0.08)` — OK here, these are UI chrome, not data

### 7. DATA-INK DISCIPLINE (TUFTE)

_Source: Tufte's "maximize data-ink ratio." Every pixel must encode information._

- **Erase chartjunk:** no gradient fills, no 3D effects, no decorative frames, no redundant legends
- **Double-encoding is waste:** if node shape says "database", don't also color it blue-for-database. Pick one channel.
- **Layering:** push scaffolding (grid, container boxes, axes) to low contrast (~15% opacity). Foreground data uses full contrast range. This creates depth without shadows.
- **Macro and micro:** the diagram must communicate its overall shape at thumbnail size AND reward zoom-in with detail. Squint-test it.

### 8. GESTALT GROUPING BEFORE BOXES

_Source: Proximity, similarity, closure. The brain groups what's close before it groups what's boxed._

- **Proximity before borders:** tighten spacing within a cluster, expand between clusters — the grouping emerges without any container drawn
- **Similarity for types:** same-category nodes get the same shape+color. No need to label them.
- **Closure for frames:** dashed/light-stroked containers do the same job as heavy boxes with less visual weight
- **Continuity for flow:** smooth curves read as single paths; sharp breaks signal a semantic change (routing through a checkpoint)

### 9. POSITION FOR MAGNITUDE, HUE FOR CATEGORY

_Source: Bertin's ranking of visual variables. Position encodes quantity best. Hue encodes category best. Don't swap them._

| Variable           | Best for               |
| ------------------ | ---------------------- |
| Position (x,y)     | Quantitative + Ordered |
| Size (length/area) | Quantitative           |
| Value (lightness)  | Ordered                |
| Hue                | **Categorical only**   |
| Shape              | Categorical            |
| Orientation        | Categorical            |

- **Never use rainbow/HSL palettes for ordered data** — green and yellow collapse for colorblind viewers; hue has no perceptual order
- **For ordered magnitude:** use Viridis, Cividis, or sequential tints of one hue
- **For categories:** use Okabe-Ito or Excalidraw-index-1/4 pairs

### 10. READABILITY IS NON-NEGOTIABLE

_Source: WCAG 2.1, Tufte's small multiples, accessibility research._

- **Contrast:** body text on node fill ≥4.5:1; edge strokes ≥3:1 against canvas; focus states ≥3:1 against unfocused
- **Minimum label size:** 12px — never smaller, even at thumbnail
- **Fit-to-view on load** — always. If the user has to pan/zoom before they can read it, the diagram has failed
- **Respect `prefers-reduced-motion`** — layout animations disabled, instant snap

---

## PART 2: TOKENS (CALIBRATED DEFAULTS)

Drop these into any HyperKit diagram preset. Values calibrated from convergence across React Flow, Mermaid, D2, Excalidraw, tldraw.

### Canvas

```css
--diagram-bg-light: #ffffff;
--diagram-bg-dark: #0f1115; /* never pure #000 */
--diagram-dot-light: #e5e7eb; /* gray-200 */
--diagram-dot-dark: #2a2d35;
--diagram-dot-size: 1.5px;
--diagram-dot-gap: 20px;
--diagram-padding: 24px; /* around bounding box on fit-to-view */
```

### Node

```css
--node-radius: 6px;
--node-stroke-width: 1.5px;
--node-padding-x: 12px;
--node-padding-y: 8px;
--node-min-width: 160px;
--node-min-height: 56px;
--node-font-size: 13px;
--node-font-weight: 500;
--node-title-tracking: -0.01em;
--node-subtitle-size: 11px;
--node-subtitle-color: var(--sk-text-muted);
--node-meta-font: ui-monospace, 'JetBrains Mono', monospace;
--node-shadow: none;
--node-shadow-selected: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06);
```

### Edge

```css
--edge-stroke-light: #9ca3af; /* between RF #b1b1b7 and Mermaid #666 */
--edge-stroke-dark: #6b7280;
--edge-width: 1.5px;
--edge-width-dashed: 2px; /* dashed needs thicker for visibility */
--edge-arrow-size: 10px;
--edge-dash-async: 4 4;
--edge-dash-planned: 2 3;
--edge-label-bg: rgba(255, 255, 255, 0.95);
--edge-label-padding: 2px 6px;
--edge-label-radius: 3px;
--edge-label-font-size: 11px;
--edge-label-font-weight: 500;
```

### Selection / Hover

```css
--selection-stroke: rgba(0, 89, 220, 0.8);
--selection-fill: rgba(0, 89, 220, 0.08);
--selection-style: 1px dotted;
--focus-outline: 2px solid var(--sk-accent);
```

### Group / Swimlane / Cluster

```css
--group-fill: rgba(240, 240, 240, 0.4);
--group-stroke: var(--sk-border);
--group-stroke-style: dashed; /* closure without weight */
--group-stroke-width: 1px;
--group-radius: 8px;
--group-label-size: 11px;
--group-label-weight: 600;
--group-label-transform: uppercase;
--group-label-tracking: 0.06em;
--group-label-color: var(--sk-text-muted);
```

### 8-Color Semantic Palette (Excalidraw index-1 + index-4)

Proven across 10k+ production diagrams. Colorblind-safe when paired with shape/icon.

| Name       | Background | Stroke    | Use                  |
| ---------- | ---------- | --------- | -------------------- |
| **gray**   | `#e9ecef`  | `#343a40` | Default / neutral    |
| **blue**   | `#a5d8ff`  | `#1971c2` | Primary / happy-path |
| **green**  | `#b2f2bb`  | `#2f9e44` | Success / complete   |
| **red**    | `#ffc9c9`  | `#e03131` | Error / blocked      |
| **yellow** | `#ffec99`  | `#f08c00` | Warning / pending    |
| **violet** | `#d0bfff`  | `#6741d9` | Category A           |
| **teal**   | `#96f2d7`  | `#099268` | Category B           |
| **orange** | `#ffd8a8`  | `#e8590c` | Category C           |

### Colorblind-Safe Alternatives

When accessibility is paramount (WCAG AAA, enterprise), use **Okabe-Ito** (8 categorical, grayscale-safe):

```
#E69F00  Orange       #56B4E9  Sky Blue
#009E73  Bluish Green #F0E442  Yellow
#0072B2  Blue         #D55E00  Vermillion
#CC79A7  Reddish Purple #000000 Black
```

For **ordered/quantitative** data (heatmaps, severity scales), use **Viridis** or **Cividis** — never rainbow.

---

## PART 3: DIAGRAM ARCHETYPES

15 recurring patterns in technical/business communication. Each is a tested recipe — not every rule always applies, but deviations should be intentional.

### 1. Organizational Chart

- **When:** strict hierarchical reporting, taxonomy with one parent per node
- **Layout:** `dagre TB`, `nodesep: 40, ranksep: 60`
- **Scale:** 5–30 nodes (collapse below 30)
- **Node:** 160–200px rect, radius 4–6px, optional 32px avatar top-left, name semibold base + role muted sm
- **Edge:** orthogonal, **no arrowheads** (structural, not directional), 1px solid `--sk-border`, dashed for dotted-line/matrix reports
- **Color:** monochrome with one accent on CEO/root; optional very-muted per-department tint (6–10% opacity)
- **Grouping:** tinted bands per division, or collapsible subtrees with `+N` badge
- **Anti-patterns:** shape variation for rank, mixing reporting with collaboration lines, line crossings (reorder siblings to fix)

### 2. Layered Architecture

- **When:** stack where each layer depends only on the one below (OSI, cloud, hexagonal arch)
- **Layout:** `manual` vertical stack, or `dagre TB` with same-rank constraints
- **Scale:** 3–7 layers × 2–8 items each (10–40 total)
- **Node:** layer = full-width rounded rect 64–80px tall; layer name uppercase semibold xs tracked 0.06em left-aligned; child chips = pills 28px with monospace xs tech names
- **Edge:** usually **none** — adjacency implies dependency; cross-layer arrows dashed bezier with labels
- **Color:** gradient of one hue darkening downward, OR monochrome + accent on the focal layer. Never rainbow-per-layer.
- **Grouping:** the layer IS the grouping; optional right-bracket for meta-groups ("Managed by X")
- **Anti-patterns:** variable-height layers, arrows everywhere (then it's a dependency graph), cross-cutting concerns inside layers (should be side-bands)

### 3. Component / Dependency Graph

- **When:** many-to-many relationships without clear hierarchy
- **Layout:** `dagre LR` for DAG-ish; `fcose` or `d3-force` for truly cyclic/clustered
- **Scale:** 10–50 (above 50: cluster or filter)
- **Node:** 140–180px rect, monospace name, optional type badge pill (service/lib/ui)
- **Edge:** bezier (dense) or orthogonal (sparse), arrowheads always, 1px default + 2px accent for focused node's neighborhood on hover
- **Color:** per-category tint (service=blue, lib=gray, ui=green), muted fills + full-saturation borders
- **Grouping:** tinted bounding boxes per cluster, uppercase tracked label top-left
- **Anti-patterns:** 200+ nodes unfiltered, force-layout jitter on load (set `alpha=0.3, alphaDecay=0.05`), no focus mode

### 4. Data Pipeline / ETL Flow

- **When:** sequential data transformation, source→sink
- **Layout:** `dagre LR` (reading direction); vertical only if shallow and horizontally constrained
- **Scale:** 5–20 stages
- **Node:** 140–160px rect, 16–20px icon left + stage name semibold sm + metric subtitle muted xs monospace ("1.2M rows/day", "p99 320ms")
- **Edge:** bezier or orthogonal with arrowheads; thicker (2–3px) for high-volume; edge labels show throughput/schema on rounded white chip
- **Color:** monochrome + one accent on happy path; red dashed for error/dead-letter; retry loops as curved arrows with "retry" badge
- **Grouping:** tinted full-height bands for phases ("extract / transform / load")
- **Anti-patterns:** mixing data flow with control/orchestration signals, no volume annotations, right-to-left flow

### 5. State Machine

- **When:** discrete states + event-driven transitions
- **Layout:** `dagre LR`/`TB` for linear; `force` or `manual` for dense machines with self-loops
- **Scale:** 3–15 (above 15: hierarchical states)
- **Node:** circles OR rounded rects (pick one and commit); 60–80px min; **initial** = small filled dot + arrow in; **accepting** = double border (2px gap ring)
- **Edge:** bezier always (straight looks wrong between circles); arrowheads mandatory; **self-loops** as small arcs above node; labels = `event / action` format on background chips
- **Color:** monochrome + green border for accepting, red fill for error-terminal; one accent for currently-active state in runtime views
- **Grouping:** hierarchical/nested states as rounded tinted containers with dashed border
- **Anti-patterns:** no initial-state indicator, unlabeled transitions, mixing state (nouns) with flowchart (verbs)

### 6. Sequence Diagram

- **When:** temporal order of messages between actors/components
- **Layout:** `manual` grid — actors on X-axis (columns), time on Y-axis (rows); no graph layout applies
- **Scale:** 3–8 lifelines, 10–40 messages
- **Node:** actor head = 120–160px rect (services) or stick figure (humans); name semibold sm + type subtitle muted xs; lifeline = vertical dashed line; activation box = thin filled rect on lifeline
- **Edge:** solid+filled head = sync call; solid+open head = async; dashed = return; self-call = small rectangular detour; labels monospace xs above line
- **Color:** monochrome; one accent for highlighted flow; red for error paths; never per-actor colors
- **Grouping:** `alt/opt/loop` frames = rounded rects with label tab top-left (UML standard)
- **Anti-patterns:** crossing messages (reorder lifelines), missing return arrows for sync calls, >40 messages in one diagram (split)

### 7. Flowchart with Decisions

- **When:** procedural logic with branching — algorithms, business processes, troubleshooting
- **Layout:** `dagre TB` primarily (decisions feel natural top-down); `LR` for wide processes
- **Scale:** 5–25 (above 25: decompose into sub-flowcharts)
- **Node:** rounded rect (140×40) = process; **diamond** (120×80 tall) = decision; pill/stadium (100×36) = start/end terminal; parallelogram = I/O (only if semantic)
- **Edge:** **orthogonal almost always** — flowcharts feel correct with right angles; arrowheads mandatory; decision outputs **always labeled** Yes/No on chip near diamond
- **Color:** monochrome + green success terminal + red failure terminal; muted per-lane tint if using swimlanes
- **Grouping:** optional swimlanes for multi-actor flows
- **Anti-patterns:** diamonds for non-decisions, unlabeled branches, diagonal connectors

### 8. Swimlane / Pool Diagram

- **When:** process spanning multiple actors/departments — responsibility boundaries matter
- **Layout:** `manual` with lane constraints; nodes within lane laid out LR by time
- **Scale:** 3–6 lanes × 10–30 total steps
- **Node:** lane header = 40px-wide vertical strip, uppercase semibold xs; steps = smaller flowchart shapes (120×36)
- **Edge:** orthogonal; **cross-lane edges slightly thicker (1.5px) or accent-tinted** — these are the handoffs the diagram exists to show
- **Color:** muted lane-bg tints (6–8% opacity), **different tints of same hue** (not different hues); steps remain monochrome
- **Grouping:** lanes ARE the grouping; optional vertical phase dividers for time periods
- **Anti-patterns:** >6 lanes (split or combine), steps in wrong lane (defeats the point), no visual distinction for handoffs

### 9. ER / Data Model

- **When:** database entities + attributes + cardinality
- **Layout:** `dagre LR` for most; `force` for large schemas where clustering reveals domain; manual for <10
- **Scale:** 5–50 entities (above 50: cluster by domain)
- **Node:** card 200–260px wide; **header band** (entity name semibold sm uppercase, accent-muted bg); **body** = attribute rows 28px tall (name left, type right in monospace xs); PK/FK badges; separator between PK section and rest
- **Edge:** orthogonal from edge to edge (never through nodes); **crow's-foot cardinality**: `—||` one-and-only, `—o|` zero-or-one, `—|<` one-or-many, `—o<` zero-or-many; no arrowheads (relationships bidirectional); label middle with verb ("owns", "references")
- **Color:** monochrome + accent header; optional per-domain tint on header (auth=blue, billing=green)
- **Grouping:** tinted domain containers with top-left label
- **Anti-patterns:** showing every attribute on high-level diagram (show PK/FK + business fields only), no cardinality, lines crossing through entity bodies

### 10. Mindmap

- **When:** brainstorm/explore a central concept outward — ideation, not specification
- **Layout:** `radial` (tree laid out 360° around root); d3-hierarchy `tree` with radial transform
- **Scale:** 15–60 (radial breaks past ~80)
- **Node:** center = 160–200px accent pill bold base; level 1 = 120–160px semibold sm in distinct category tints; leaves = small pills or text-with-underline regular sm muted
- **Edge:** bezier curves radiating from center; thicker near center (2–3px) tapering to 1px; no arrowheads; smooth hand-drawn feel acceptable (unlike technical diagrams)
- **Color:** **per-category** — each top-level branch gets distinct hue, subtree inherits muted tints of that hue (one of the few diagrams where multiple colors help)
- **Grouping:** radial structure IS the grouping
- **Anti-patterns:** forcing mindmap for hierarchical data with real structure (use tree), >3 depth levels, uniform color (loses branch distinction)

### 11. Gantt / Timeline

- **When:** tasks/events over time, durations, optional dependencies
- **Layout:** `manual` — X=time continuous, Y=tasks discrete rows; not a graph layout at all
- **Scale:** 10–50 tasks
- **Node:** horizontal bar 24–28px tall, radius 3–4px; name semibold sm inside bar if wide enough else right of bar; **milestones** as diamond markers (no duration); **progress fill** = darker inner % complete
- **Edge:** dependency arrows = thin orthogonal predecessor-end → successor-start; arrowheads; often hidden unless "show dependencies" requested
- **Color:** per-category (team/phase/status); muted fills + stronger borders; red overdue, green complete, gray not-started; weekends/holidays as subtle vertical band
- **Grouping:** parent "phase" row spans min-to-max of children; indented task names within
- **Anti-patterns:** no "today" indicator (the most useful single line), wrong time axis granularity, dependency spaghetti (filter to critical path)

### 12. Kanban / Board

- **When:** items flowing through discrete workflow states — status viz, not process doc
- **Layout:** `manual` grid — columns fixed, cards stack vertically
- **Scale:** 3–6 columns × 5–40 cards (WIP limits should keep per-column low)
- **Node:** column header = name semibold sm + count badge monospace xs + optional WIP limit; **card** = rounded rect 8px radius full-column-width auto-height; title semibold sm + tag pills + 24px avatar + metadata row muted xs
- **Edge:** **none** — flow is implied by column order LR
- **Color:** card bg = `--sk-bg-secondary` neutral; **label pills carry the color** (red=blocker, yellow=review, green=ready); one accent for focused card
- **Grouping:** columns; optional priority swim-rows across columns (rare)
- **Anti-patterns:** non-mutually-exclusive columns ("In Progress" + "Blocked"), over-packed cards (>3 metadata items), no WIP limits

### 13. User Flow / Wireflow

- **When:** user journey through screens with transitions triggered by actions
- **Layout:** `dagre LR` — user flows read LR by convention
- **Scale:** 5–30 screens
- **Node:** screen = 200×140px thumbnail (4:3 or 16:9), radius 6px, 1px border; below thumbnail: screen name semibold sm + route monospace muted xs; low-fidelity wireframe inside (gray boxes + accent CTA); alternative: labeled rects with name only
- **Edge:** bezier or orthogonal with arrowheads; labels = triggering action (click, submit, swipe) on chip; dashed for optional, solid for happy path
- **Color:** monochrome screens (they're wireframes); accent on CTA in each screen makes happy-path visually traceable; red dashed for error/exit
- **Grouping:** tinted phase bands as vertical strips ("Onboarding", "Main App", "Checkout")
- **Anti-patterns:** hi-fi screenshots (outdated instantly), unlabeled edges, mixing user actions with system actions

### 14. Venn / Set Diagram

- **When:** overlaps between 2–4 sets (comparison, not flow)
- **Layout:** `manual`; 2 circles = ~40% overlap; 3 circles = equilateral with center triple-intersection; 4+ = ellipses/Euler (different math)
- **Scale:** 2–4 sets (above 4: UpSet plot or comparison table)
- **Node:** circles with semi-transparent fills (30–40% opacity) so overlaps mix visibly; set labels OUTSIDE on non-overlapping side, semibold base; content labels in regions = multi-line lists regular sm (≤5 items per region or count badge "+12 more")
- **Edge:** none
- **Color:** one distinct hue per set — **mandatory multiple colors**; pick complementary hues so overlaps produce distinguishable third color (blue + yellow → green)
- **Grouping:** overlaps ARE the grouping
- **Anti-patterns:** Venn for non-overlapping sets (it's just a list), unreadable labels in mixed overlaps (use white chips or leader lines), proportional Venns (use bar chart)

### 15. C4 Diagram Levels

- **When:** document software architecture at multiple zoom levels — Context / Container / Component / (Code rarely)
- **Layout:** manual or `dagre TB`/`LR` depending on level; Context/Container usually manual; Component benefits from dagre
- **Scale:** Context 3–10 • Container 5–15 • Component 10–30 • Code (skip — IDE tools do this better)
- **Node:** consistent across levels: **Person** = stick figure + name + role subtitle; **System/Container/Component** = rounded rect 200×120 min with top line = name semibold sm, middle = `[Type: tech]` brackets muted xs, bottom = 1-sentence description regular sm 2–3 lines
- **Edge:** straight or bezier with arrowheads; **every edge MUST be labeled** with interaction + protocol ("Reads/writes [JDBC]", "Sends email [SMTP]") on white chip regular xs
- **Color:** standard C4 — one accent (typically blue) for focal element at each zoom; darker variant for the in-focus element; muted gray for external
- **Grouping:** Context = your-system dashed-border container, externals outside; Container = optional deployment-boundary groups ("AWS Account", "Browser"); Component = parent container drawn as outer boundary
- **Anti-patterns:** mixing levels in one diagram, unlabeled edges (C4 mandates labels), going to Code level

---

## PART 4: LAYOUT ALGORITHM DECISION TREE

### Comparison

| Algorithm                        | Best Shape                                              | Key Params                                                                                                                    | Runtime                       | Pitfalls                                                                                          |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **Dagre** (Sugiyama layered)     | DAGs, flowcharts, state machines (<500 nodes)           | `rankdir`, `ranksep`, `nodesep`, `edgesep`, `ranker`                                                                          | Fast O(V·E)                   | Spaghetti on high-degree hubs; jumps when adding nodes; project largely unmaintained              |
| **ELK Layered**                  | Complex nested graphs, schematics with port constraints | `elk.direction`, `elk.spacing.*`, `elk.portConstraints`, `elk.edgeRouting`                                                    | Medium–Slow O(N²) past ~1k    | 140+ options; large bundle (~2MB); slower than dagre                                              |
| **D3-force**                     | General undirected, sparse clusters, organic networks   | `forceLink.distance/strength`, `forceManyBody.strength` (charge), `forceCollide.radius`, `alpha`/`alphaDecay`/`velocityDecay` | Medium O(n log n) per tick    | Non-deterministic (seed it); jitter; overlaps without collide; "explosions" without alpha warming |
| **fcose** (Cytoscape)            | Compound/nested general graphs up to thousands          | `nodeRepulsion`, `idealEdgeLength`, `gravity`, `quality`, `randomize`                                                         | Fast (spectral + incremental) | Poor on extreme aspect ratios; high repulsion without gravity → explosion                         |
| **Mermaid (dagre↔elk toggle)**   | Flowcharts / sequence / class / ER                      | `layout: elk`, `flowchart.nodeSpacing`, `flowchart.rankSpacing`, `curve`                                                      | Dagre fast, ELK medium        | Dagre can't do orthogonal routing well; ELK has parser quirks                                     |
| **Reingold–Tilford** (tidy tree) | Strict trees/forests (parent→child only)                | `nodeSize`, `separation(a,b)`, orientation                                                                                    | Very Fast O(n)                | Fails on DAGs with multi-parent or cycles; wide trees overflow without zoom                       |
| **Radial tree**                  | Centralized hierarchies, deep trees                     | Radius scaling, angle range, root                                                                                             | Very Fast O(n)                | Labels rotate awkwardly at 6 o'clock; outer-ring crowding; strict-tree only                       |

### Decision Tree

```
Is it a strict tree (one parent per node)?
├── YES → deep (few wide levels)?  → Radial tree
│         wide (many levels)?       → Reingold–Tilford
└── NO
    └── Is it a DAG (directed, no cycles)?
        ├── YES → small, no nesting?     → Dagre
        │        large or port-aware?    → ELK Layered
        └── NO (general graph)
            └── Has compound/nested groups?
                ├── YES                  → fcose
                └── NO → dense?          → fcose (quality=proof)
                         sparse/organic? → d3-force
```

### Default Tuning Knobs

- **Dagre TB/LR:** `nodesep: 40`, `ranksep: 70`, `edgesep: 20`, `ranker: 'network-simplex'`
- **ELK Layered:** `elk.direction: 'RIGHT'`, `elk.layered.spacing.nodeNodeBetweenLayers: 80`, `elk.spacing.nodeNode: 40`, `elk.edgeRouting: 'ORTHOGONAL'`
- **d3-force:** `forceLink.distance(80)`, `forceManyBody.strength(-300)`, `forceCollide.radius(nodeR+8)`, `alphaDecay(0.02)`, then stop when `alpha < 0.01`

---

## PART 5: INFORMATION DESIGN THEORY (The Why)

### Tufte — Data-Ink Discipline

1. **Maximize data-ink ratio.** Every pixel encodes information. Remove grid lines, background shading, 3D effects, redundant legends.
2. **Erase non-data-ink, then redundant data-ink.** Double-encoding is waste.
3. **Small multiples for comparison.** N smaller diagrams side-by-side beat one diagram with toggles.
4. **Layering and separation.** Scaffolding to low contrast (~15% opacity), foreground data full contrast. Depth without shadows.
5. **Macro AND micro readings.** Squint-test at thumbnail size — structure must survive.

### Bertin — Visual Variables

Humans decode visual variables with different strengths:

| Variable           | Quantitative | Ordered | Categorical |
| ------------------ | ------------ | ------- | ----------- |
| Position (x,y)     | Best         | Best    | Fine        |
| Size (length/area) | Best         | Good    | Poor        |
| Value (lightness)  | Good         | Best    | Poor        |
| Texture (density)  | OK           | Good    | Fine        |
| Color hue          | Poor         | Poor    | **Best**    |
| Orientation        | Poor         | Poor    | Good        |
| Shape              | Poor         | Poor    | **Best**    |

**Rule:** Position for the most important numeric axis. Hue for category only (≤8). Lightness for ordered data (severity, time, magnitude). Never hue for quantity — color ordering isn't perceptually monotonic.

### Gestalt — How Humans Group

1. **Proximity** — close together reads as group. Tighten within, expand between. Cheaper ink than boxes.
2. **Similarity** — same color/shape/size = same type. Enables legend-less diagrams.
3. **Closure** — brain completes partial shapes. Dashed frame = solid frame, less weight.
4. **Continuity** — smooth curves read as single paths. Sharp angles signal semantic breaks.
5. **Common fate** — elements animating together = one group. Exploit in filter transitions.

### Color Theory for Diagrams

1. **Categorical ≠ Sequential ≠ Diverging** — pick the right palette type
   - Categorical: Okabe-Ito (8 safe colors)
   - Sequential (ordered magnitude): Viridis, Cividis, Inferno, Magma
   - Diverging (±zero): blue↔orange (Okabe-Ito safe) or red↔blue with neutral midpoint
2. **Never rainbow/HSL for ordered data** — green and yellow collapse for colorblind viewers
3. **Luminance > hue** when accessibility matters — categories should also differ in lightness (Okabe-Ito does)
4. **Semantic colors stay semantic** — red=error, green=success, yellow=warning. Don't reuse for anything else in the same diagram.
5. **Accent sparsely** — 90% monochrome, 10% accent. Color earns attention by being rare.

---

## PART 6: ACCESSIBILITY & READABILITY CHECKLIST

### Contrast (WCAG 2.1)

- [ ] Body text on node fill ≥ **4.5:1**
- [ ] Large text (≥18pt or ≥14pt bold) ≥ **3:1**
- [ ] Edge strokes and node borders (non-text UI) ≥ **3:1** against canvas
- [ ] Focused/selected state ≥ 3:1 vs unfocused, with visible outline ≥ 2px
- [ ] Never rely on color alone — color-encoded categories MUST also differ in shape, icon, label, or pattern

### Stroke & Typography Minimums

- [ ] Edge stroke width ≥ 1.5px at 1× zoom; 2px for dashed; 2.5px on dense layouts
- [ ] Node border width ≥ 1px; 1.5px when carrying semantic weight
- [ ] Label font size ≥ **12px** (never smaller, even at thumbnail)
- [ ] Secondary metadata in monospace 11px is OK (timestamps, counts)
- [ ] Line height 1.2–1.4 for multi-line labels
- [ ] Font: system-ui or Inter for labels; monospace only for IDs/data

### Pan / Zoom UX

- [ ] **Fit-to-view on load** with 5–10% padding — non-negotiable
- [ ] Zoom range 0.1× min, 4–8× max (more than 8× = user is lost)
- [ ] "Reset view" / "Fit" button visible in controls
- [ ] Scroll-wheel zoom **requires Ctrl/Cmd** when embedded in a page (avoids scroll-jacking); unmodified wheel OK on dedicated full-screen canvases
- [ ] Pinch-zoom on touch always enabled
- [ ] Zoom centers on cursor/pinch point, not canvas center
- [ ] Smooth interpolated zoom 150–200ms ease-out, not stepped
- [ ] Keyboard: `+`/`-` zoom, arrows pan, `0` or `F` fit-to-view, `Esc` deselect

### Label Placement

- [ ] Always-on labels for primary nodes
- [ ] Hover-reveal for secondary metadata (edge weights, timestamps, counts) — tooltip, not floating text
- [ ] Collision avoidance: hide lowest-priority labels on overlap
- [ ] Leader lines (1px, 50% opacity, curved) when labels must offset from dense clusters
- [ ] Label background: semi-transparent fill (bg at 85–90% opacity) or 1–2px halo in bg color — survives edge crossings
- [ ] Consistent anchor per node type (always-right for terminals, below for hubs)
- [ ] Truncate long labels with ellipsis, full label on hover; never wrap labels inside a diagram

### Motion & Interaction

- [ ] Respect `prefers-reduced-motion` — disable layout animations, instant snap
- [ ] Focus indicators on keyboard nav (`:focus-visible`, 2px outline, ≥3:1)
- [ ] All interactive actions keyboard-reachable (Tab to node, Enter to select, arrows to navigate neighbors)
- [ ] ARIA: root SVG has `role="img"` + `aria-label` summarizing; complex diagrams expose text alternative (`<desc>` or linked table)

### Touch / Mobile

- [ ] Touch targets ≥44×44 CSS px for interactive nodes/handles
- [ ] No hover-only interactions
- [ ] Pinch/pan default gestures; no scroll-jacking

---

## PART 7: ANTI-PATTERNS

| Kill                                          | Replace with                                      |
| --------------------------------------------- | ------------------------------------------------- |
| Rainbow per-node colors                       | 90% monochrome + 1–2 accent nodes                 |
| >8 category colors                            | Combine or introduce shape/icon as second channel |
| Hue for ordered data (rainbow severity)       | Viridis/Cividis or tints of one hue               |
| Drop shadow on every node                     | No shadow; shadow only on selected state          |
| Gradient fills                                | Flat tinted fill + saturated stroke of same hue   |
| Large border-radius (>12px)                   | 6px nodes, 8px groups                             |
| Line grid                                     | Dot grid, 20px gap, 1.5px dots                    |
| Pure #000000 dark canvas                      | `#0f1115` or theme-derived dark                   |
| Colored header band (GoJS-style)              | Accent left-stripe (3px) or tinted fill           |
| Default fit-to-view OFF                       | Fit-to-view on load, always                       |
| Scroll-wheel zoom without modifier (embedded) | Require Ctrl/Cmd for wheel zoom                   |
| Labels at 10px or smaller                     | 12px minimum, 14px for body labels                |
| Unlabeled edges in flowcharts/C4              | Every edge has a labeled action/interaction       |
| Crossing edges through nodes                  | Orthogonal routing around nodes                   |
| Diagonal connectors in flowcharts             | Orthogonal (right-angle)                          |
| Mixing diagram types in one view              | Separate into distinct diagrams                   |
| >40 nodes with no grouping                    | Cluster, collapse, or filter                      |
| Static 3D effects                             | 2D only — 3D is chartjunk                         |
| `alphaDecay: 0.2` (force jitter)              | `alphaDecay: 0.02`, seed initial positions        |
| Force-directed for DAGs                       | Dagre — DAGs have direction, use it               |

---

## PART 8: PRE-SHIP CHECKLIST

### Visual

- [ ] ≤8 colors total, 90% monochrome
- [ ] Dot grid (not line), 20px gap
- [ ] Node radius 6px (or 8px for groups)
- [ ] No shadows except on selected state
- [ ] Tinted fill + saturated stroke from same hue (never colored header band)
- [ ] Edges darker than nodes, 1.5px, filled triangle arrow
- [ ] Dashed edges for async/optional, solid for actual

### Structure

- [ ] Diagram matches one of the 15 archetypes (or a deliberate hybrid)
- [ ] Right layout algorithm for the graph shape (decision tree in Part 4)
- [ ] Grouping present when >8 nodes (proximity, tinted band, or dashed frame)
- [ ] Every edge has a direction when direction matters (arrowhead)
- [ ] No line crossings through nodes (orthogonal routes around)

### Readability

- [ ] Fit-to-view on load, 5–10% padding
- [ ] Contrast ≥4.5:1 body, ≥3:1 borders
- [ ] Label size ≥12px, never smaller
- [ ] Title + subtitle + metadata typography hierarchy clear
- [ ] Monospace only for code/IDs/numbers (not labels)
- [ ] Colors also differ in shape/icon/label (not color-alone encoding)
- [ ] Squint-test passes (macro structure readable at thumbnail)

### Interaction

- [ ] Keyboard navigation works (Tab, arrows, Enter, 0, F, Esc)
- [ ] `prefers-reduced-motion` respected
- [ ] Hover reveals secondary metadata (not always-on clutter)
- [ ] Focus state visible ≥3:1 contrast, ≥2px outline
- [ ] Touch targets ≥44×44 on mobile
- [ ] No scroll-jacking when embedded (require Ctrl+wheel)

### HyperKit-specific

- [ ] Uses `@ybouhjira/diagram-core` + `@ybouhjira/diagram-solid` + `@ybouhjira/diagram-svg`
- [ ] Preset authored as a `DiagramPreset` object (see `diagram-svg/src/renderer-presets.ts`)
- [ ] `DiagramProvider` receives `initialGroups` + `layoutOptions` at mount (no onMount flicker)
- [ ] Layer bands via `NodeGroups` (first-class), not via swim-lanes
- [ ] Colors sourced from `--sk-*` tokens where possible, with hardcoded fallbacks for canvas/dot-grid
- [ ] Custom node renderer registered in `diagram-core/renderers/` if stock `card`/`shape`/`sketch` insufficient
- [ ] After layout completes, `fitView()` called (wire via `onLayoutComplete` or expose `autoFit` on the wrapper)

---

## VERSION HISTORY

- **v1** (2026-04-13): Initial draft. Distilled from research across 10+ premium diagramming tools + Tufte/Bertin/Gestalt theory. 10 Laws, 8-color palette, 15 archetypes, layout algorithm decision tree, accessibility checklist, HyperKit-specific integration notes.

---

## SOURCES

**Tool source analysis:**

- Mermaid themes: `packages/mermaid/src/themes/theme-{neutral,dark,forest}.js`
- React Flow base.css + Pro Tailwind examples + Background API docs
- Excalidraw `packages/excalidraw/colors.ts` (verified hex)
- D2 `terrastruct/d2/d2themes` Go package (N1–N7 neutral ramps)
- tldraw `DefaultColorThemePalette` + size scale
- Obsidian Canvas CSS variables reference

**Theoretical foundations:**

- Tufte, _The Visual Display of Quantitative Information_ (data-ink, chartjunk, small multiples, layering)
- Bertin, _Semiology of Graphics_ (7 visual variables, position/size/value/hue/shape/texture/orientation)
- Gestalt school (proximity, similarity, closure, continuity, common fate)

**Accessibility:**

- WCAG 2.1 contrast requirements (4.5:1 body, 3:1 UI)
- Okabe-Ito colorblind-safe 8-color palette
- Viridis / Cividis perceptually-uniform sequential scales

**Layout algorithms:**

- Dagre wiki — Sugiyama framework
- ELK (Eclipse Layout Kernel) docs
- D3-force + fcose (Cytoscape) docs
- Reingold–Tilford tidy tree algorithm
