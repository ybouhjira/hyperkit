---
title: Views
sidebar_position: 1
description: Schema-driven view generation — annotate an Effect Schema, get list, card, and detail views.
---

# `@ybouhjira/hyperkit-views`

Schema-driven view generation: annotate an Effect Schema with UI metadata (a **blueprint**) and render it as a detail page, card, row, or pin — without writing per-view components. Field visibility, formatting, inline editing, drag-and-drop, FLIP animations, and skeleton states are all derived from the schema.

## Installation

```bash
npm install @ybouhjira/hyperkit-views effect solid-js
```

## Blueprints

Annotate each field with a semantic `kind` and a `priority` using the `ui` helper:

```ts
import { Schema as S } from 'effect';
import { ui } from '@ybouhjira/hyperkit-views';

export const Issue = S.Struct({
  title: S.String.pipe(ui('title', 1, { label: 'Title' })),
  status: S.Literal('open', 'closed', 'in_progress').pipe(ui('status', 1)),
  number: S.Number.pipe(ui('id', 2)),
  labels: S.Array(Label).pipe(ui('tags', 2)),
  assignee: User.pipe(ui('person', 3)),
  updatedAt: S.Date.pipe(ui('timestamp', 3)),
  body: S.String.pipe(ui('prose', 4)),
});
```

Priority controls which fields appear in which **shape**:

| Shape    | Fields shown       |
| -------- | ------------------ |
| `detail` | priority ≤ 4 (all) |
| `card`   | priority ≤ 3       |
| `row`    | priority ≤ 2       |
| `pin`    | priority ≤ 1       |

## Rendering

The **slot map** resolves each `kind` × `shape` combination to a renderer. `defaultViewKit` covers all 15 kinds; extend it with `createViewKit` / `extendSlotMap`:

```tsx
import { ViewsProvider, defaultViewKit } from '@ybouhjira/hyperkit-views';

<ViewsProvider kit={defaultViewKit}>
  <IssueCard issue={issue} />
</ViewsProvider>;
```

## Key Exports

| Area        | Exports                                                              |
| ----------- | -------------------------------------------------------------------- |
| Annotation  | `ui`, `extractBlueprint`, `UI_ANNOTATION_ID`, `BlueprintField`       |
| Slot map    | `DEFAULT_SLOT_MAP`, `resolveSlot`, `extendSlotMap`                   |
| View kit    | `defaultViewKit`, `createViewKit`, `ALL_KINDS`, `ALL_SHAPES`         |
| Field state | `resolveFieldState`, `isVisible`, `isInteractive`, `fieldStateClass` |
| Actions     | `filterActions`, `filterActionsConfig`                               |
| Provider    | `ViewsProvider`, `useViews`                                          |
| Theming     | `defaultTheme`, `mergeThemes`, `tokensToCss`, `formatValue`          |
| Codegen     | `generateViews`, `resolveVisibleFields`                              |

## Interaction Modules

- **Inline editing** — per-field edit affordances driven by field state
- **Drag & drop** — reorderable collections
- **FLIP animations** — smooth layout transitions between shapes
- **Skeletons** — loading placeholders generated from the blueprint

## Compile-Time Codegen

A Vite plugin generates view code at build time from your blueprints:

```ts
// vite.config.ts
import { hyperkitViewsPlugin } from '@ybouhjira/hyperkit-views/vite';

export default {
  plugins: [hyperkitViewsPlugin()],
};
```
