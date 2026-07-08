import { describe, it, expect } from 'vitest';
import { extractTokens, extractExamples, parseMeta } from './extract.js';

describe('extractTokens', () => {
  it('returns unique, sorted --sk- tokens', () => {
    const css = '.x{color:var(--sk-accent);gap:var(--sk-space-sm);background:var(--sk-accent)}';
    expect(extractTokens(css)).toEqual(['--sk-accent', '--sk-space-sm']);
  });

  it('returns [] when there are none', () => {
    expect(extractTokens('.x{color:red}')).toEqual([]);
  });
});

describe('extractExamples', () => {
  it('returns [] when there are no Story exports', () => {
    expect(extractExamples('export default meta;')).toEqual([]);
  });

  it('extracts a single story to end of file', () => {
    const r = extractExamples('export const Default: Story = { render: () => null };');
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ name: 'Default', storyId: 'Default' });
    expect(r[0]?.source).toContain('render');
  });

  it('splits multiple stories at the next export', () => {
    const r = extractExamples('export const A: Story = {};\nexport const B: Story = {};');
    expect(r.map((e) => e.name)).toEqual(['A', 'B']);
    expect(r[0]?.source).toBe('export const A: Story = {};');
  });
});

describe('parseMeta', () => {
  it('parses frontmatter, description, do/dont and a11y', () => {
    const md = [
      '---',
      'summary: A picker.',
      'status: beta',
      'a11y: Keyboard navigable.',
      '---',
      'Long description.',
      '',
      '## Do',
      '- use it',
      '- compose it',
      '',
      "## Don't",
      '- abuse it',
    ].join('\n');
    const m = parseMeta(md);
    expect(m).toMatchObject({
      summary: 'A picker.',
      status: 'beta',
      a11y: 'Keyboard navigable.',
      description: 'Long description.',
    });
    expect(m.dosAndDonts).toEqual({ do: ['use it', 'compose it'], dont: ['abuse it'] });
  });

  it('empty input yields undocumented defaults', () => {
    const m = parseMeta('');
    expect(m).toMatchObject({ summary: '', status: 'stable', description: '' });
    expect(m.a11y).toBeUndefined();
    expect(m.dosAndDonts).toBeUndefined();
  });

  it('invalid status falls back to stable', () => {
    expect(parseMeta('---\nstatus: wat\n---\n').status).toBe('stable');
  });

  it('skips frontmatter lines without a colon', () => {
    expect(parseMeta('---\nnope\nsummary: ok\n---\n').summary).toBe('ok');
  });

  it('a do-only section still yields dosAndDonts (empty dont)', () => {
    expect(parseMeta('## Do\n- a').dosAndDonts).toEqual({ do: ['a'], dont: [] });
  });
});
