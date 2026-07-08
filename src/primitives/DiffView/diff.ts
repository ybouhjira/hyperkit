/**
 * diff — pure parser turning a `git` / `gh pr diff` unified diff into a typed
 * structure that DiffView renders GitHub-style. No DOM, 100% testable.
 */

export type DiffLineKind = 'context' | 'add' | 'del' | 'hunk' | 'meta';

export interface DiffLine {
  readonly kind: DiffLineKind;
  /** Line text WITHOUT the leading +/-/space marker (markers are styling). */
  readonly text: string;
  /** 1-based line number in the OLD file (null for added lines). */
  readonly oldNo: number | null;
  /** 1-based line number in the NEW file (null for removed lines). */
  readonly newNo: number | null;
}

export interface DiffFile {
  readonly path: string;
  /** Previous path when renamed; same as `path` otherwise. */
  readonly oldPath: string;
  readonly additions: number;
  readonly deletions: number;
  readonly status: 'added' | 'deleted' | 'renamed' | 'modified';
  readonly lines: ReadonlyArray<DiffLine>;
}

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/** Parse a unified diff into per-file line lists. */
export function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const rawLines = diff.split('\n');

  let cur: {
    path: string;
    oldPath: string;
    additions: number;
    deletions: number;
    status: DiffFile['status'];
    lines: DiffLine[];
  } | null = null;
  let oldNo = 0;
  let newNo = 0;

  const flush = (): void => {
    if (cur) files.push({ ...cur, lines: cur.lines });
    cur = null;
  };

  for (const line of rawLines) {
    if (line.startsWith('diff --git ')) {
      flush();
      const m = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      const p = m?.[2] ?? line.slice('diff --git '.length);
      cur = {
        path: p,
        oldPath: m?.[1] ?? p,
        additions: 0,
        deletions: 0,
        status: 'modified',
        lines: [],
      };
      continue;
    }
    if (cur === null) continue;

    if (line.startsWith('new file')) cur = { ...cur, status: 'added' };
    else if (line.startsWith('deleted file')) cur = { ...cur, status: 'deleted' };
    else if (line.startsWith('rename ')) cur = { ...cur, status: 'renamed' };

    if (
      line.startsWith('+++ ') ||
      line.startsWith('--- ') ||
      line.startsWith('index ') ||
      line.startsWith('new file') ||
      line.startsWith('deleted file') ||
      line.startsWith('rename ') ||
      line.startsWith('similarity ')
    ) {
      continue; // file-header noise, not shown as code
    }

    const hunk = HUNK.exec(line);
    if (hunk) {
      oldNo = Number(hunk[1]);
      newNo = Number(hunk[2]);
      cur.lines.push({ kind: 'hunk', text: line, oldNo: null, newNo: null });
      continue;
    }

    if (line.startsWith('+')) {
      cur.additions += 1;
      cur.lines.push({ kind: 'add', text: line.slice(1), oldNo: null, newNo: newNo });
      newNo += 1;
    } else if (line.startsWith('-')) {
      cur.deletions += 1;
      cur.lines.push({ kind: 'del', text: line.slice(1), oldNo: oldNo, newNo: null });
      oldNo += 1;
    } else if (line.startsWith(' ')) {
      cur.lines.push({ kind: 'context', text: line.slice(1), oldNo: oldNo, newNo: newNo });
      oldNo += 1;
      newNo += 1;
    }
    // a trailing '' (final newline split) or '\ No newline' is ignored.
  }
  flush();
  return files;
}

/** One row of a SIDE-BY-SIDE diff: old line on the left, new on the right. */
export interface SplitRow {
  /** Removed/context line shown on the left (old file), or null (blank). */
  readonly left: DiffLine | null;
  /** Added/context line shown on the right (new file), or null (blank). */
  readonly right: DiffLine | null;
  /** A full-width hunk header row (left/right both null when set). */
  readonly hunk: DiffLine | null;
}

/**
 * Convert a file's unified lines into side-by-side rows. Consecutive removed
 * lines pair with consecutive added lines (del[i] ↔ add[i]); the shorter side
 * pads with blanks. Context lines sit on both sides; hunks span full width.
 */
export function toSplitRows(file: DiffFile): SplitRow[] {
  const rows: SplitRow[] = [];
  let dels: DiffLine[] = [];
  let adds: DiffLine[] = [];
  const flush = (): void => {
    const n = Math.max(dels.length, adds.length);
    for (let i = 0; i < n; i += 1) {
      rows.push({ left: dels[i] ?? null, right: adds[i] ?? null, hunk: null });
    }
    dels = [];
    adds = [];
  };
  for (const line of file.lines) {
    if (line.kind === 'del') {
      dels.push(line);
      continue;
    }
    if (line.kind === 'add') {
      adds.push(line);
      continue;
    }
    flush();
    if (line.kind === 'hunk') rows.push({ left: null, right: null, hunk: line });
    else if (line.kind === 'context') rows.push({ left: line, right: line, hunk: null });
  }
  flush();
  return rows;
}

/** Total +/- across all files (e.g. for a PR header summary). */
export function diffTotals(files: ReadonlyArray<DiffFile>): {
  additions: number;
  deletions: number;
} {
  return files.reduce(
    (acc, f) => ({
      additions: acc.additions + f.additions,
      deletions: acc.deletions + f.deletions,
    }),
    { additions: 0, deletions: 0 }
  );
}
