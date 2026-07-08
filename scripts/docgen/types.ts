/**
 * docgen — the docs manifest data model.
 *
 * `docs-manifest.json` is the single source of truth for every doc consumer:
 * the in-IDE HyperDocs screen, llms.txt, the hyperkit-docs MCP, and the
 * CLAUDE catalog. It is GENERATED from each component's own source files, so
 * it can never drift from the code.
 */

/** A single public prop, extracted from the component's `{Name}Props` type. */
export interface PropDoc {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
  readonly defaultValue?: string;
}

/** A usage example, lifted from a `*.stories.tsx` story export. */
export interface ExampleDoc {
  readonly name: string;
  /** Verbatim source of the story export (for the "source" tab + copy). */
  readonly source: string;
  /** Stable id used to mount the live preview (matches the story export). */
  readonly storyId: string;
}

/** Do's & don'ts — the design-system contract for a component. */
export interface DosAndDonts {
  readonly do: readonly string[];
  readonly dont: readonly string[];
}

/** Hand-authored doc metadata (the ONLY non-generated input), from meta.docs.md. */
export interface MetaDoc {
  readonly summary: string;
  readonly status: 'stable' | 'beta' | 'deprecated';
  readonly description: string;
  readonly a11y?: string;
  readonly dosAndDonts?: DosAndDonts;
}

/** One fully-assembled documentation entry for a single export. */
export interface DocEntry {
  readonly name: string;
  readonly category: string;
  readonly status: 'stable' | 'beta' | 'deprecated';
  readonly summary: string;
  readonly description: string;
  readonly props: readonly PropDoc[];
  readonly examples: readonly ExampleDoc[];
  /** `--sk-*` tokens the component's CSS references. */
  readonly tokens: readonly string[];
  readonly a11y?: string;
  readonly dosAndDonts?: DosAndDonts;
  readonly sourcePath: string;
}

/** The generated manifest: every documented component + summary stats. */
export interface DocsManifest {
  readonly version: 1;
  readonly entries: readonly DocEntry[];
  readonly stats: {
    readonly total: number;
    readonly byCategory: Readonly<Record<string, number>>;
  };
}

/** Raw per-component inputs the orchestrator reads from disk. */
export interface RawComponent {
  readonly name: string;
  readonly category: string;
  readonly sourcePath: string;
  /** Source of the file declaring `{Name}Props` (types.ts or the .tsx). */
  readonly propsSource: string;
  readonly propsInterface: string;
  /** Component `.css` text (may be empty). */
  readonly cssText: string;
  /** `*.stories.tsx` text (may be empty). */
  readonly storiesText: string;
  /** `meta.docs.md` text (may be empty → undocumented). */
  readonly metaText: string;
}

/** Result of the `docs:check` gate. */
export interface DocCheckResult {
  readonly ok: boolean;
  readonly failures: readonly DocCheckFailure[];
  /** Share of public props that carry a description, 0..1. */
  readonly propDocCoverage: number;
}

export interface DocCheckFailure {
  readonly name: string;
  readonly issues: readonly string[];
}
