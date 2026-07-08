# Engineering Philosophy (CRITICAL — Applies to ALL Code)

## Core Principle: No Compromise Architecture

Youssef is an experienced software engineer who values learning. Never dumb things down, never simplify for "ease", never choose the average path. Every line of code should reflect the best possible engineering.

## The Perfectionist Mandate

**Code is cheap now. AI writes it. The differentiator is TASTE.**

- UX so good other people can't compete with us. That's the bar for every project.
- Since AI makes code nearly free to produce, there is zero excuse for anything less than perfectionist-level quality in every detail — UI polish, micro-interactions, layout precision, error handling, edge cases.
- Spend the extra time on the 20% that makes software feel magical: animations, transitions, loading states, empty states, keyboard shortcuts, contextual hints, undo/redo, responsive layouts at every breakpoint.
- If a competitor could match your feature set but not your UX — you win. Design and polish are the moat.
- This applies to ALL projects, not just user-facing ones. CLI tools should have beautiful output. APIs should have perfect error messages. Libraries should have flawless DX.

## The Three Pillars

### 1. Performance First

- Always choose the structurally correct solution, not the quick patch
- O(N) matters. Memory allocation in hot paths matters. Re-render cost matters.
- Batch operations. RAF-throttle UI updates. Use Web Workers for heavy compute.
- Measure before/after. If you can't measure it, you can't claim it's fast.
- No half-measures: if a fix will need revisiting, do the full fix now.

### 2. Cleanest Possible Code

- Idiomatic usage of every framework — SolidJS stores not manual signals, Effect layers not try/catch
- One responsibility per module. If a file grows past 300 lines, it's doing too much.
- Name things precisely. A function named `update()` is a code smell — update WHAT?
- No dead code, no commented-out code, no TODOs that linger. Fix it or delete it.
- Types should make illegal states unrepresentable. Use branded types, discriminated unions, Effect schemas.

### 3. Best User Experience

- 60fps or bust. If the UI stutters, the architecture is wrong.
- Perceived performance > actual performance. Show something immediately, load the rest.
- Lazy load everything optional. Prefetch everything predictable.
- Animations should feel physical — easing curves, not linear transitions.
- Error states are features, not afterthoughts.

## Anti-Patterns to REJECT

| Anti-Pattern                                       | What to Do Instead                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| "Works for now" hack                               | Do the structural fix once                                           |
| Half-measures that need revisiting                 | Full solution, benefit forever                                       |
| Choosing the "easier" approach                     | Choose the architecturally correct approach                          |
| Avoiding complexity to "keep it simple"            | Embrace necessary complexity, reject accidental complexity           |
| Copying patterns without understanding             | Understand the pattern, then adapt it to the specific case           |
| Defaulting to the most common/popular solution     | Evaluate all options, pick the best fit                              |
| Wrapping things in try/catch and swallowing errors | Model errors in the type system (Effect, Result types)               |
| `any` types to make the compiler shut up           | Fix the type, even if it's harder                                    |
| Giant components/files                             | Extract when responsibility splits, not when line count is arbitrary |

## Decision Framework

When facing any technical choice:

1. **What's the structurally correct solution?** — The one that makes future changes easier
2. **What do the best codebases in the world do?** — Study patterns from Effect, SolidJS, Rust std, Linux kernel
3. **Will this need revisiting?** — If yes, do the full version now
4. **Does this teach something?** — Youssef wants to learn from every implementation choice

## Code Quality Bar

- Strict TypeScript everywhere. `noUncheckedIndexedAccess`, branded types, exhaustive switches.
- Effect for error handling and service composition. No raw try/catch in business logic.
- SolidJS reactivity used idiomatically — stores for nested state, memos for derived values, effects only for side effects.
- CSS via design tokens. No hardcoded values. Theme-switchable.
- Tests that verify behavior, not implementation. Integration > unit for complex flows.

## Testing Philosophy: 100% Coverage, Zero Tolerance

**AI writes the tests — so there is ZERO excuse for anything less than 100% coverage.**

- Every feature must have tests that verify the FULL user-visible flow, not just backend operations.
- If a document should render, the test MUST verify the document actually rendered (canvas pixels, DOM elements, page content).
- Tests must use real data at realistic scale — large documents, many pages, real PDFs — not toy fixtures.
- Performance tests with large documents are mandatory to identify where progress indicators are needed.
- Never write tests that pass but don't actually prove anything (e.g., testing IPC without verifying the UI updated).
- 100% means 100%. Not 99.9%. AI makes tests cheap to write — the bar is total coverage with no gaps.
- **If it doesn't have a real test, it's not working and it's not finished.** Every single tiny detail — button states, hover effects, error messages, loading spinners, edge cases — must be tested. A feature without tests is an unfinished feature, period.

## What "Enterprise Grade" Means Here

Not "corporate bureaucracy". It means:

- A new developer can read any file and understand what it does in 30 seconds
- Any component can be replaced without touching its siblings
- The system degrades gracefully under load, not catastrophically
- Every public API has a clear contract that the type system enforces
- Performance budgets are enforced in CI, not hoped for in production
