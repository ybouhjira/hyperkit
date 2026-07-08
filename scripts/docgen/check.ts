/**
 * The `docs:check` gate — "documented or it doesn't ship."
 *
 * Every exported component must carry a summary, at least one example, and
 * do's & don'ts (the design-system contract). Also reports prop-doc coverage
 * (share of public props with a description) as a metric.
 */

import type { DocCheckFailure, DocCheckResult, DocsManifest } from './types.js';

export function checkDocs(manifest: DocsManifest): DocCheckResult {
  const failures: DocCheckFailure[] = [];
  let propsTotal = 0;
  let propsDocumented = 0;

  for (const entry of manifest.entries) {
    const issues: string[] = [];
    if (entry.summary.trim() === '') issues.push('missing summary (add meta.docs.md)');
    if (entry.examples.length === 0) issues.push('no examples (add a *.stories.tsx story)');
    if (entry.dosAndDonts === undefined) issues.push("missing do's & don'ts");
    for (const prop of entry.props) {
      propsTotal += 1;
      if (prop.description.trim() !== '') propsDocumented += 1;
    }
    if (issues.length > 0) failures.push({ name: entry.name, issues });
  }

  return {
    ok: failures.length === 0,
    failures,
    propDocCoverage: propsTotal === 0 ? 1 : propsDocumented / propsTotal,
  };
}
