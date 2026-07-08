import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DiffView } from './DiffView';

/**
 * Install a fake ResizeObserver that hands back a trigger to drive a width.
 * jsdom has no ResizeObserver, so this is how we exercise the responsive path.
 */
function stubResizeObserver() {
  let cb: ResizeObserverCallback | undefined;
  let observed: Element | undefined;
  class FakeRO {
    constructor(c: ResizeObserverCallback) {
      cb = c;
    }
    observe(el: Element) {
      observed = el;
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('ResizeObserver', FakeRO);
  return (width: number) => {
    cb?.([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver);
    return observed;
  };
}

const MODIFIED = [
  'diff --git a/src/foo.ts b/src/foo.ts',
  'index 111..222 100644',
  '--- a/src/foo.ts',
  '+++ b/src/foo.ts',
  '@@ -1,3 +1,3 @@',
  ' const a = 1;',
  '-const b = 2;',
  '+const b = 3;',
  ' const d = 5;',
].join('\n');

const TWO_FILES = [
  MODIFIED,
  'diff --git a/src/bar.ts b/src/bar.ts',
  '@@ -1 +1 @@',
  '-x',
  '+y',
].join('\n');

describe('DiffView', () => {
  it('shows an empty state when there are no file changes', () => {
    const { container } = render(() => <DiffView diff="" />);
    const empty = container.querySelector('.sk-diff-view__empty');
    expect(empty).toBeInTheDocument();
    expect(empty?.textContent).toContain('No file changes.');
  });

  it('defaults to split mode', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} />);
    const root = container.querySelector('.sk-diff-view') as HTMLElement;
    expect(root.dataset.mode).toBe('split');
    expect(container.querySelector('.sk-diff-view__grid--split')).toBeInTheDocument();
  });

  it('renders the file header with path and ± counts', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} />);
    expect(container.querySelector('.sk-diff-view__file-path')?.textContent).toBe('src/foo.ts');
    expect(container.querySelector('.sk-diff-view__stat-add')?.textContent).toBe('+1');
    expect(container.querySelector('.sk-diff-view__stat-del')?.textContent).toBe('−1');
  });

  it('tints removed lines on the left and added lines on the right (split pairing)', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} view="split" />);
    const del = container.querySelector('.sk-diff-view__code--del');
    const add = container.querySelector('.sk-diff-view__code--add');
    expect(del?.getAttribute('data-side')).toBe('old');
    expect(add?.getAttribute('data-side')).toBe('new');
    expect(del?.textContent).toContain('const b = 2;');
    expect(add?.textContent).toContain('const b = 3;');
  });

  it('renders a full-width hunk header row', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} />);
    const hunk = container.querySelector('.sk-diff-view__hunk');
    expect(hunk?.textContent).toContain('@@ -1,3 +1,3 @@');
  });

  it('pads the opposite side with a blank cell when del/add counts differ', () => {
    const onlyDel = [
      'diff --git a/x b/x',
      '@@ -1,2 +1,1 @@',
      '-removed-1',
      '-removed-2',
      '+kept',
    ].join('\n');
    const { container } = render(() => <DiffView diff={onlyDel} />);
    expect(container.querySelector('.sk-diff-view__code--blank')).toBeInTheDocument();
  });

  it('renders a blank left gutter when an added line has no old counterpart', () => {
    const moreAdds = ['diff --git a/x b/x', '@@ -1,1 +1,2 @@', '-old', '+new1', '+new2'].join('\n');
    const { container } = render(() => <DiffView diff={moreAdds} view="split" />);
    // The unpaired added line (new2) sits opposite a blank left cell whose old
    // gutter is empty.
    const oldNums = Array.from(container.querySelectorAll('.sk-diff-view__num--old')).map(
      (n) => n.textContent
    );
    expect(oldNums).toContain('');
    expect(container.querySelectorAll('.sk-diff-view__code--blank').length).toBeGreaterThan(0);
  });

  it('uses singular "file" for one file and plural for many', () => {
    const single = render(() => <DiffView diff={MODIFIED} />);
    expect(single.container.querySelector('.sk-diff-view__count')?.textContent).toBe(
      '1 file changed'
    );
    const many = render(() => <DiffView diff={TWO_FILES} />);
    expect(many.container.querySelector('.sk-diff-view__count')?.textContent).toBe(
      '2 files changed'
    );
  });

  it('renders unified mode from the view prop with mark cells', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} view="unified" />);
    const root = container.querySelector('.sk-diff-view') as HTMLElement;
    expect(root.dataset.mode).toBe('unified');
    expect(container.querySelector('.sk-diff-view__grid--unified')).toBeInTheDocument();
    expect(container.querySelector('.sk-diff-view__mark--add')?.textContent).toBe('+');
    expect(container.querySelector('.sk-diff-view__mark--del')?.textContent).toBe('-');
  });

  it('toggles between split and unified via the SegmentedControl', () => {
    const { container, getByText } = render(() => <DiffView diff={MODIFIED} />);
    const root = container.querySelector('.sk-diff-view') as HTMLElement;
    expect(root.dataset.mode).toBe('split');

    fireEvent.click(getByText('Unified'));
    expect(root.dataset.mode).toBe('unified');
    expect(container.querySelector('.sk-diff-view__grid--unified')).toBeInTheDocument();

    fireEvent.click(getByText('Split'));
    expect(root.dataset.mode).toBe('split');
  });

  it('syntax-highlights code lines for the given language', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} language="typescript" />);
    const inner = container.querySelector('.sk-diff-view__code-inner');
    expect(inner?.innerHTML).toContain('hljs-');
  });

  it('still renders code text for an unknown language (highlight fallback)', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} language="made-up-lang" />);
    expect(container.querySelector('.sk-diff-view__grid--split')).toBeInTheDocument();
    expect(container.textContent).toContain('const a = 1;');
  });

  it('renders empty gutter cells for lines that exist on only one side', () => {
    const { container } = render(() => <DiffView diff={MODIFIED} view="unified" />);
    // The added line has no old number → its old gutter cell is empty.
    const nums = Array.from(container.querySelectorAll('.sk-diff-view__num--old')).map(
      (n) => n.textContent
    );
    expect(nums).toContain('');
  });

  it('applies a custom class and inline style', () => {
    const { container } = render(() => (
      <DiffView diff={MODIFIED} class="my-diff" style={{ 'max-width': '900px' }} />
    ));
    const root = container.querySelector('.sk-diff-view') as HTMLElement;
    expect(root.classList.contains('my-diff')).toBe(true);
    expect(root.style.maxWidth).toBe('900px');
  });

  describe('responsive (mobile / narrow panels)', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('collapses split → unified when the container is too narrow', () => {
      const resize = stubResizeObserver();
      const { container } = render(() => <DiffView diff={MODIFIED} view="split" />);
      const root = container.querySelector('.sk-diff-view') as HTMLElement;

      // Wide enough for two columns → stays split, toggle visible.
      resize(1000);
      expect(root.dataset.mode).toBe('split');
      expect(root.hasAttribute('data-narrow')).toBe(false);
      expect(container.querySelector('[aria-label="Diff layout"]')).toBeInTheDocument();

      // Phone-width → forced unified, narrow flag set, toggle hidden.
      resize(400);
      expect(root.dataset.mode).toBe('unified');
      expect(root.hasAttribute('data-narrow')).toBe(true);
      expect(container.querySelector('.sk-diff-view__grid--unified')).toBeInTheDocument();
      expect(container.querySelector('[aria-label="Diff layout"]')).toBeNull();
    });

    it('treats an unmeasured (zero) width as not-narrow', () => {
      const resize = stubResizeObserver();
      const { container } = render(() => <DiffView diff={MODIFIED} view="split" />);
      const root = container.querySelector('.sk-diff-view') as HTMLElement;
      resize(0);
      expect(root.dataset.mode).toBe('split');
      expect(root.hasAttribute('data-narrow')).toBe(false);
    });
  });
});
