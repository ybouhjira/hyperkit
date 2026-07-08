import { describe, it, expect } from 'vitest';
import { parseDiff, toSplitRows, diffTotals, type DiffFile } from './diff';

describe('parseDiff', () => {
  it('ignores text before the first file header (cur === null)', () => {
    const files = parseDiff('garbage line\nanother\n');
    expect(files).toHaveLength(0);
  });

  it('parses a modified file with hunk, context, add and del lines', () => {
    const diff = [
      'diff --git a/src/foo.ts b/src/foo.ts',
      'index 111..222 100644',
      '--- a/src/foo.ts',
      '+++ b/src/foo.ts',
      '@@ -1,3 +1,4 @@',
      ' const a = 1;',
      '-const b = 2;',
      '+const b = 3;',
      '+const c = 4;',
      ' const d = 5;',
    ].join('\n');
    const [f] = parseDiff(diff);
    expect(f.path).toBe('src/foo.ts');
    expect(f.oldPath).toBe('src/foo.ts');
    expect(f.status).toBe('modified');
    expect(f.additions).toBe(2);
    expect(f.deletions).toBe(1);
    // hunk + 1 ctx + 1 del + 2 add + 1 ctx = 6 lines
    expect(f.lines).toHaveLength(6);
    expect(f.lines[0].kind).toBe('hunk');
    const ctx = f.lines[1];
    expect(ctx.kind).toBe('context');
    expect(ctx.oldNo).toBe(1);
    expect(ctx.newNo).toBe(1);
    const del = f.lines[2];
    expect(del.kind).toBe('del');
    expect(del.oldNo).toBe(2);
    expect(del.newNo).toBeNull();
    const add = f.lines[3];
    expect(add.kind).toBe('add');
    expect(add.newNo).toBe(2);
    expect(add.oldNo).toBeNull();
  });

  it('parses a hunk header without line counts (@@ -5 +6 @@)', () => {
    const diff = ['diff --git a/x b/x', '@@ -5 +6 @@', ' ctx'].join('\n');
    const [f] = parseDiff(diff);
    const ctx = f.lines[1];
    expect(ctx.oldNo).toBe(5);
    expect(ctx.newNo).toBe(6);
  });

  it('flushes the previous file when a new header appears (multi-file)', () => {
    const diff = [
      'diff --git a/one.ts b/one.ts',
      '@@ -1 +1 @@',
      '+a',
      'diff --git a/two.ts b/two.ts',
      '@@ -1 +1 @@',
      '+b',
    ].join('\n');
    const files = parseDiff(diff);
    expect(files.map((f) => f.path)).toEqual(['one.ts', 'two.ts']);
  });

  it('marks an added file (new file)', () => {
    const diff = [
      'diff --git a/new.ts b/new.ts',
      'new file mode 100644',
      'index 000..111',
      '+++ b/new.ts',
      '@@ -0,0 +1 @@',
      '+hello',
    ].join('\n');
    const [f] = parseDiff(diff);
    expect(f.status).toBe('added');
    expect(f.additions).toBe(1);
  });

  it('marks a deleted file (deleted file)', () => {
    const diff = [
      'diff --git a/gone.ts b/gone.ts',
      'deleted file mode 100644',
      '--- a/gone.ts',
      '@@ -1 +0,0 @@',
      '-bye',
    ].join('\n');
    const [f] = parseDiff(diff);
    expect(f.status).toBe('deleted');
    expect(f.deletions).toBe(1);
  });

  it('marks a renamed file and skips similarity noise', () => {
    const diff = [
      'diff --git a/old-name.ts b/new-name.ts',
      'similarity index 95%',
      'rename from old-name.ts',
      'rename to new-name.ts',
      '@@ -1 +1 @@',
      ' kept',
    ].join('\n');
    const [f] = parseDiff(diff);
    expect(f.status).toBe('renamed');
    expect(f.path).toBe('new-name.ts');
    expect(f.oldPath).toBe('old-name.ts');
    // only hunk + context survive; rename/similarity are skipped
    expect(f.lines).toHaveLength(2);
  });

  it('falls back to slice when the header does not match a/ b/ form', () => {
    const diff = ['diff --git weirdheader', '@@ -1 +1 @@', ' x'].join('\n');
    const [f] = parseDiff(diff);
    expect(f.path).toBe('weirdheader');
    expect(f.oldPath).toBe('weirdheader');
  });

  it('ignores lines that are not +/-/space (e.g. the no-newline marker)', () => {
    const diff = [
      'diff --git a/x b/x',
      '@@ -1 +1 @@',
      '-a',
      '+b',
      '\\ No newline at end of file',
    ].join('\n');
    const [f] = parseDiff(diff);
    // hunk + del + add — the backslash marker contributes no line.
    expect(f.lines).toHaveLength(3);
    expect(f.lines.map((l) => l.kind)).toEqual(['hunk', 'del', 'add']);
  });
});

describe('toSplitRows', () => {
  const parse = (lines: string[]): DiffFile =>
    parseDiff(['diff --git a/f b/f', ...lines].join('\n'))[0];

  it('pairs consecutive dels with adds (equal length)', () => {
    const f = parse(['@@ -1,2 +1,2 @@', '-old1', '-old2', '+new1', '+new2']);
    const rows = toSplitRows(f);
    // hunk row + 2 paired rows
    expect(rows).toHaveLength(3);
    expect(rows[0].hunk?.kind).toBe('hunk');
    expect(rows[1].left?.text).toBe('old1');
    expect(rows[1].right?.text).toBe('new1');
    expect(rows[2].left?.text).toBe('old2');
    expect(rows[2].right?.text).toBe('new2');
  });

  it('pads the right when there are more dels than adds', () => {
    const f = parse(['@@ -1,2 +1,1 @@', '-old1', '-old2', '+new1']);
    const rows = toSplitRows(f);
    const paired = rows.filter((r) => !r.hunk);
    expect(paired[0].right?.text).toBe('new1');
    expect(paired[1].right).toBeNull();
    expect(paired[1].left?.text).toBe('old2');
  });

  it('pads the left when there are more adds than dels', () => {
    const f = parse(['@@ -1,1 +1,2 @@', '-old1', '+new1', '+new2']);
    const rows = toSplitRows(f);
    const paired = rows.filter((r) => !r.hunk);
    expect(paired[1].left).toBeNull();
    expect(paired[1].right?.text).toBe('new2');
  });

  it('places context lines on both sides', () => {
    const f = parse(['@@ -1 +1 @@', ' same']);
    const rows = toSplitRows(f);
    const ctx = rows.find((r) => r.left && r.right && !r.hunk);
    expect(ctx?.left?.text).toBe('same');
    expect(ctx?.right?.text).toBe('same');
  });

  it('produces no row for a meta line (neither hunk nor context)', () => {
    const file: DiffFile = {
      path: 'x',
      oldPath: 'x',
      additions: 0,
      deletions: 0,
      status: 'modified',
      lines: [{ kind: 'meta', text: '\\ No newline', oldNo: null, newNo: null }],
    };
    expect(toSplitRows(file)).toHaveLength(0);
  });
});

describe('diffTotals', () => {
  it('sums additions and deletions across files', () => {
    const diff = [
      'diff --git a/one.ts b/one.ts',
      '@@ -1 +1,2 @@',
      '-a',
      '+b',
      '+c',
      'diff --git a/two.ts b/two.ts',
      '@@ -1,2 +1 @@',
      '-d',
      '-e',
      '+f',
    ].join('\n');
    const totals = diffTotals(parseDiff(diff));
    expect(totals).toEqual({ additions: 3, deletions: 3 });
  });

  it('returns zeros for an empty list', () => {
    expect(diffTotals([])).toEqual({ additions: 0, deletions: 0 });
  });
});
