import { type Component, For, createMemo, splitProps } from 'solid-js';
import './Pagination.css';

export interface PaginationProps {
  /** Current active page (1-based). */
  current: number;
  /** Total number of pages. */
  total: number;
  /** Callback when the user navigates to a different page. */
  onChange: (page: number) => void;
  /** Maximum number of page buttons to show (excluding prev/next).
   * When total > maxVisible, ellipsis is rendered.
   * @default 5 */
  maxVisible?: number;
  /** Additional CSS class name. */
  class?: string;
}

type PageItem = { kind: 'page'; value: number } | { kind: 'ellipsis'; key: string };

/**
 * Accessible pagination control with ellipsis, prev/next buttons, and keyboard support.
 *
 * @example
 * ```tsx
 * import { Pagination } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Product listing pagination
 * const [page, setPage] = createSignal(1);
 * const totalPages = Math.ceil(totalProducts / perPage);
 *
 * <Pagination current={page()} total={totalPages} onChange={setPage} />
 *
 * // Custom maxVisible
 * <Pagination current={page()} total={50} onChange={setPage} maxVisible={7} />
 * ```
 *
 * @see Table - for data tables that include built-in sort/filter
 */
export const Pagination: Component<PaginationProps> = (props) => {
  const [local] = splitProps(props, ['current', 'total', 'onChange', 'maxVisible', 'class']);

  const maxVisible = () => local.maxVisible ?? 5;

  /**
   * Compute the array of page items to render, with ellipsis where needed.
   * Always shows: first page, last page, current page, and up to maxVisible
   * pages surrounding the current page.
   */
  const items = createMemo<PageItem[]>(() => {
    const total = local.total;
    const current = local.current;
    const max = maxVisible();

    if (total <= max) {
      // Fit all pages — no ellipsis needed
      return Array.from({ length: total }, (_, i) => ({ kind: 'page' as const, value: i + 1 }));
    }

    // Wing = pages on each side of current (subtract 1 for current itself)
    const wing = Math.floor((max - 1) / 2);

    let start = Math.max(2, current - wing);
    let end = Math.min(total - 1, current + wing);

    // Adjust window if it is near the edges
    if (current - wing <= 1) end = Math.min(total - 1, max - 1);
    if (current + wing >= total) start = Math.max(2, total - max + 2);

    const result: PageItem[] = [];

    // Always include page 1
    result.push({ kind: 'page', value: 1 });

    if (start > 2) {
      result.push({ kind: 'ellipsis', key: 'start' });
    }

    for (let i = start; i <= end; i++) {
      result.push({ kind: 'page', value: i });
    }

    if (end < total - 1) {
      result.push({ kind: 'ellipsis', key: 'end' });
    }

    // Always include last page
    if (total > 1) {
      result.push({ kind: 'page', value: total });
    }

    return result;
  });

  return (
    <nav
      class={`sk-pagination${local.class ? ` ${local.class}` : ''}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        type="button"
        class="sk-pagination__btn sk-pagination__btn--prev"
        onClick={() => local.onChange(local.current - 1)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            local.onChange(local.current - 1);
          }
        }}
        disabled={local.current <= 1}
        aria-label="Go to previous page"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page items */}
      <For each={items()}>
        {(item) => {
          if (item.kind === 'ellipsis') {
            return (
              <span class="sk-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            );
          }
          const page = item.value;
          const isActive = () => page === local.current;
          return (
            <button
              type="button"
              class={`sk-pagination__btn sk-pagination__btn--page${isActive() ? ' sk-pagination__btn--active' : ''}`}
              onClick={() => !isActive() && local.onChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={isActive() ? 'page' : undefined}
              disabled={isActive()}
            >
              {page}
            </button>
          );
        }}
      </For>

      {/* Next button */}
      <button
        type="button"
        class="sk-pagination__btn sk-pagination__btn--next"
        onClick={() => local.onChange(local.current + 1)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            local.onChange(local.current + 1);
          }
        }}
        disabled={local.current >= local.total}
        aria-label="Go to next page"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
};
