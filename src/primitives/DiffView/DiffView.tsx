/**
 * DiffView — GitHub-style viewer for a raw unified diff.
 *
 * Side-by-side (split) is the default: the old file on the left, the new file
 * on the right, removed lines tinted red on the left, added lines tinted green
 * on the right, context on both, hunk headers spanning full width. A
 * SegmentedControl toggles to a single-column unified view.
 *
 * Every code line is syntax-highlighted with the shared highlight.js instance
 * (same setup as CodeBlock). Each file body is ONE horizontal scroll container:
 * the line-number gutters stay pinned while the code scrolls as a unit — there
 * are no per-line scrollbars.
 */

import {
  type JSX,
  type Component,
  splitProps,
  createMemo,
  createSignal,
  onCleanup,
  Show,
  For,
} from 'solid-js';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { highlightCode } from '../CodeBlock/hljs';
import { parseDiff, toSplitRows, type DiffFile, type DiffLine, type SplitRow } from './diff';
import './DiffView.css';

/** Layout mode for the diff. */
export type DiffViewMode = 'split' | 'unified';

/** Props for the DiffView component. */
export interface DiffViewProps {
  /** Raw unified diff text (e.g. `git diff` / `gh pr diff` output). */
  diff: string;
  /** Initial layout: side-by-side `split` (default) or single-column `unified`. */
  view?: DiffViewMode;
  /** Syntax-highlighting language for code lines. Auto-detects when omitted. */
  language?: string;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

/** One syntax-highlighted code cell. `blank` renders an empty padded cell. */
const Code: Component<{ line: DiffLine | null; language?: string; side?: 'old' | 'new' }> = (
  props
) => {
  const html = createMemo(() => (props.line ? highlightCode(props.line.text, props.language) : ''));
  const cls = createMemo(() => {
    if (!props.line) return 'sk-diff-view__code sk-diff-view__code--blank';
    return `sk-diff-view__code sk-diff-view__code--${props.line.kind}`;
  });
  return (
    <div class={cls()} data-side={props.side}>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <code class="hljs sk-diff-view__code-inner" innerHTML={html()} />
    </div>
  );
};

const NumCell: Component<{ n: number | null; side: 'old' | 'new' }> = (props) => (
  <div class={`sk-diff-view__num sk-diff-view__num--${props.side}`}>{props.n ?? ''}</div>
);

/** Split (side-by-side) body for one file. */
const SplitBody: Component<{ file: DiffFile; language?: string }> = (props) => {
  const rows = createMemo<SplitRow[]>(() => toSplitRows(props.file));
  return (
    <div class="sk-diff-view__grid sk-diff-view__grid--split">
      <For each={rows()}>
        {(row) => (
          <Show when={!row.hunk} fallback={<div class="sk-diff-view__hunk">{row.hunk?.text}</div>}>
            <div class="sk-diff-view__row">
              <NumCell n={row.left?.oldNo ?? null} side="old" />
              <Code line={row.left} language={props.language} side="old" />
              <NumCell n={row.right?.newNo ?? null} side="new" />
              <Code line={row.right} language={props.language} side="new" />
            </div>
          </Show>
        )}
      </For>
    </div>
  );
};

const MARK: Record<DiffLine['kind'], string> = {
  add: '+',
  del: '-',
  context: ' ',
  hunk: '',
  meta: '',
};

/** Unified (single-column) body for one file. */
const UnifiedBody: Component<{ file: DiffFile; language?: string }> = (props) => (
  <div class="sk-diff-view__grid sk-diff-view__grid--unified">
    <For each={props.file.lines}>
      {(line) => (
        <Show
          when={line.kind !== 'hunk'}
          fallback={<div class="sk-diff-view__hunk">{line.text}</div>}
        >
          <div class="sk-diff-view__row">
            <NumCell n={line.oldNo} side="old" />
            <NumCell n={line.newNo} side="new" />
            <div class={`sk-diff-view__mark sk-diff-view__mark--${line.kind}`}>
              {MARK[line.kind]}
            </div>
            <Code line={line} language={props.language} />
          </div>
        </Show>
      )}
    </For>
  </div>
);

const FileBlock: Component<{ file: DiffFile; mode: DiffViewMode; language?: string }> = (props) => (
  <div class="sk-diff-view__file">
    <div class="sk-diff-view__file-header">
      <span class="sk-diff-view__file-path">{props.file.path}</span>
      <span class="sk-diff-view__file-stats">
        <span class="sk-diff-view__stat-add">+{props.file.additions}</span>
        <span class="sk-diff-view__stat-del">−{props.file.deletions}</span>
      </span>
    </div>
    <div class="sk-diff-view__scroll">
      <Show
        when={props.mode === 'split'}
        fallback={<UnifiedBody file={props.file} language={props.language} />}
      >
        <SplitBody file={props.file} language={props.language} />
      </Show>
    </div>
  </div>
);

/**
 * Minimum container width (px) that comfortably fits two code columns
 * side-by-side. Below this the split layout overflows horizontally (e.g. on a
 * phone or a narrow IDE panel), so we collapse to the single-column unified
 * view — the same thing GitHub does on mobile.
 */
const SPLIT_MIN_WIDTH = 720;

/** GitHub-style diff viewer with split/unified toggle and syntax highlighting. */
export const DiffView: Component<DiffViewProps> = (props) => {
  const [local] = splitProps(props, ['diff', 'view', 'language', 'class', 'style']);

  const [override, setOverride] = createSignal<DiffViewMode | null>(null);

  // Track the rendered width of the viewer so split collapses to unified when
  // there isn't room for two columns — responds to the actual panel, not just
  // the viewport, which is what matters inside a resizable IDE layout.
  // A width of 0 means "not laid out yet" (initial render / jsdom), not narrow —
  // only a positive measurement under the threshold collapses to unified.
  const [width, setWidth] = createSignal(0);
  const narrow = createMemo(() => width() > 0 && width() < SPLIT_MIN_WIDTH);

  const attachObserver = (el: HTMLDivElement) => {
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined) setWidth(w);
    });
    ro.observe(el);
    onCleanup(() => ro.disconnect());
  };

  // When narrow, force unified regardless of prop/toggle so the diff always fits.
  const mode = createMemo<DiffViewMode>(() =>
    narrow() ? 'unified' : (override() ?? local.view ?? 'split')
  );

  const files = createMemo<DiffFile[]>(() => parseDiff(local.diff));

  return (
    <div
      ref={attachObserver}
      class={`sk-diff-view ${local.class ?? ''}`}
      style={local.style}
      data-mode={mode()}
      data-narrow={narrow() ? '' : undefined}
    >
      <Show
        when={files().length > 0}
        fallback={<div class="sk-diff-view__empty">No file changes.</div>}
      >
        <div class="sk-diff-view__toolbar">
          <span class="sk-diff-view__count">
            {files().length} file{files().length === 1 ? '' : 's'} changed
          </span>
          {/* The split/unified toggle is meaningless when we've force-collapsed
              to unified, so hide it on narrow widths. */}
          <Show when={!narrow()}>
            <SegmentedControl
              size="sm"
              aria-label="Diff layout"
              options={[
                { label: 'Split', value: 'split' },
                { label: 'Unified', value: 'unified' },
              ]}
              value={mode()}
              onChange={(v) => setOverride(v as DiffViewMode)}
            />
          </Show>
        </div>
        <For each={files()}>
          {(file) => <FileBlock file={file} mode={mode()} language={local.language} />}
        </For>
      </Show>
    </div>
  );
};
