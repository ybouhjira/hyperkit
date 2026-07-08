import { describe, it, expect, vi } from 'vitest';
import { generateDocs } from './run.js';
import type { DocgenFs } from './collect.js';

const fs: DocgenFs = {
  readdir: (d) => (d === 'src/primitives' ? ['Button'] : []),
  readFileIfExists: (p) =>
    p === 'src/primitives/Button/Button.tsx'
      ? 'export interface ButtonProps { /** l */ label: string; }'
      : p === 'src/primitives/Button/meta.docs.md'
        ? '---\nsummary: A button.\n---\nBody\n## Do\n- a'
        : p === 'src/primitives/Button/Button.stories.tsx'
          ? 'export const Default: Story = {};'
          : null,
};

describe('generateDocs', () => {
  it('builds, writes, and checks the manifest', () => {
    const writeManifest = vi.fn();
    const { manifest, check } = generateDocs({ fs, srcDir: 'src', writeManifest });
    expect(manifest.stats.total).toBe(1);
    expect(writeManifest).toHaveBeenCalledOnce();
    expect(writeManifest.mock.calls[0]?.[0]).toContain('"Button"');
    expect(check.ok).toBe(true);
  });

  it('honours custom tiers', () => {
    const { manifest } = generateDocs({
      fs,
      srcDir: 'src',
      writeManifest: vi.fn(),
      tiers: [{ dir: 'primitives', category: 'P' }],
    });
    expect(manifest.entries[0]?.category).toBe('P');
  });
});
