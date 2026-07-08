/** Orchestrator: collect → build → write → check. Filesystem injected for tests. */

import { collectRawComponents, DEFAULT_TIERS, type DocgenFs, type Tier } from './collect.js';
import { buildManifest } from './manifest.js';
import { checkDocs } from './check.js';
import type { DocCheckResult, DocsManifest } from './types.js';

export interface GenerateDeps {
  readonly fs: DocgenFs;
  readonly srcDir: string;
  readonly writeManifest: (json: string) => void;
  readonly tiers?: readonly Tier[];
}

export function generateDocs(deps: GenerateDeps): {
  manifest: DocsManifest;
  check: DocCheckResult;
} {
  const raw = collectRawComponents(deps.fs, deps.srcDir, deps.tiers ?? DEFAULT_TIERS);
  const manifest = buildManifest(raw);
  deps.writeManifest(`${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, check: checkDocs(manifest) };
}
