/**
 * Minimal CSF (Component Story Format) renderer for HyperDocs live examples.
 *
 * A story export is either `{ render(args, ctx) => JSX }` or `{ args }` (in
 * which case the meta's `component` is rendered with those args). These pure
 * helpers turn a loaded story module into a live element — the glob that finds
 * the modules lives in LiveExample.tsx (build-time), this stays testable.
 */

import { type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

type Args = Record<string, unknown>;

export interface CsfStory {
  readonly render?: (args: Args, context: unknown) => JSX.Element;
  readonly args?: Args;
}

export interface CsfModule {
  readonly default?: { readonly component?: unknown; readonly args?: Args };
  readonly [exportName: string]: unknown;
}

/** Story export names (every object export that isn't `default`). */
export function storyNames(mod: CsfModule): string[] {
  return Object.keys(mod).filter(
    (key) => key !== 'default' && typeof mod[key] === 'object' && mod[key] !== null
  );
}

/** Resolve the requested story name, falling back to the first one (or null). */
export function pickStoryName(mod: CsfModule, requested?: string): string | null {
  const names = storyNames(mod);
  if (requested !== undefined && names.includes(requested)) return requested;
  return names[0] ?? null;
}

/** Render a named story live: its `render()` if present, else the component + args. */
export function renderCsf(mod: CsfModule, name: string): JSX.Element {
  const story = mod[name] as CsfStory;
  const meta = mod.default ?? {};
  const args: Args = { ...(meta.args ?? {}), ...(story.args ?? {}) };
  if (typeof story.render === 'function') return story.render(args, {});
  if (meta.component != null) {
    return (
      <Dynamic component={meta.component as Parameters<typeof Dynamic>[0]['component']} {...args} />
    );
  }
  return null;
}

/** Build a component-name → story-module-loader map from glob results. */
export function buildLoaderMap(
  modules: Record<string, () => Promise<unknown>>
): Record<string, () => Promise<CsfModule>> {
  const out: Record<string, () => Promise<CsfModule>> = {};
  for (const [path, loader] of Object.entries(modules)) {
    const match = /\/([^/]+)\/[^/]+\.stories\.tsx$/.exec(path);
    if (match !== null) out[match[1] as string] = loader as () => Promise<CsfModule>;
  }
  return out;
}
