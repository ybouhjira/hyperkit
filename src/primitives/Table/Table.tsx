import { JSX, For, Show, children, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Table/Table.css';

/** Configuration for a single table column. */
export interface TableColumn<T> {
  /** Property key to display from the data object. */
  key: keyof T;
  /** Column header text. */
  header: string;
  /** Optional fixed column width (CSS value). */
  width?: string;
  /** Allow sorting by this column.
   * @default false */
  sortable?: boolean;
  /** Custom render function for cell content. */
  render?: (item: T) => JSX.Element;
}

/** Props for the Table component. */
export interface TableProps<T> {
  /** Column definitions. */
  columns: TableColumn<T>[];
  /** Data rows to display. */
  data: T[];
  /** Callback when a row is clicked. */
  onRowClick?: (item: T) => void;
  /** Key of the currently selected row. */
  selectedKey?: string | null;
  /** Function to extract unique key from each row. */
  getRowKey: (item: T) => string;
  /** Key of the currently sorted column. */
  sortColumn?: string;
  /** Current sort direction. */
  sortDirection?: 'asc' | 'desc';
  /** Callback when column header is clicked for sorting. */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Content shown when data array is empty. */
  emptyState?: JSX.Element | string;
}

/**
 * Data table with sorting, row selection, and custom cell rendering.
 *
 * @example
 * ```tsx
 * import { Table, SearchInput, Stack, Badge } from "@ybouhjira/hyperkit";
 * import { createSignal, createMemo } from "solid-js";
 *
 * // Sortable user table with row selection
 * const [selected, setSelected] = createSignal<string | null>(null);
 * const [sortCol, setSortCol] = createSignal("name");
 * const [sortDir, setSortDir] = createSignal<"asc" | "desc">("asc");
 * <Table
 *   data={users}
 *   getRowKey={(u) => u.id}
 *   selectedKey={selected()}
 *   onRowClick={(u) => setSelected(u.id)}
 *   sortColumn={sortCol()}
 *   sortDirection={sortDir()}
 *   onSort={(col, dir) => { setSortCol(col); setSortDir(dir); }}
 *   columns={[
 *     { key: "name", header: "Name", sortable: true },
 *     { key: "email", header: "Email", sortable: true },
 *     {
 *       key: "role",
 *       header: "Role",
 *       render: (u) => <Badge variant={u.role === "admin" ? "info" : "default"}>{u.role}</Badge>,
 *     },
 *   ]}
 *   emptyState="No users found"
 * />
 * ```
 *
 * @see SearchInput - for filtering table data
 * @see EmptyState - for custom empty state component
 */
export function Table<T>(props: TableProps<T>): JSX.Element {
  const [local, others] = splitProps(props, [
    'columns',
    'data',
    'onRowClick',
    'selectedKey',
    'getRowKey',
    'sortColumn',
    'sortDirection',
    'onSort',
    'emptyState',
  ]);
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !local.onSort) return;

    const newDirection =
      local.sortColumn === column.key && local.sortDirection === 'asc' ? 'desc' : 'asc';
    local.onSort(String(column.key), newDirection);
  };

  const isColumnSorted = (column: TableColumn<T>): boolean => local.sortColumn === column.key;

  const sortGlyph = (column: TableColumn<T>): string => {
    if (!isColumnSorted(column)) return '▲';
    return local.sortDirection === 'asc' ? '▲' : '▼';
  };

  const ariaSort = (column: TableColumn<T>): 'ascending' | 'descending' | 'none' | undefined => {
    if (!column.sortable) return undefined;
    if (!isColumnSorted(column)) return 'none';
    return local.sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const isRowSelected = (item: T): boolean => {
    return local.selectedKey === local.getRowKey(item);
  };

  // Resolve once — reading the element-typed `emptyState` prop twice (in the
  // null-check and again as content) would double-create it and corrupt
  // hydration on prerendered pages.
  const emptyState = children(() => local.emptyState);

  return (
    <div class="sk-table" {...others}>
      <Show
        when={local.data.length > 0}
        fallback={
          <div class="sk-table__empty">
            {emptyState() != null ? emptyState() : 'No data available'}
          </div>
        }
      >
        <table class="sk-table__table">
          <thead class="sk-table__head">
            <tr>
              <For each={local.columns}>
                {(column) => (
                  <th
                    class={`sk-table__header-cell${column.sortable ? ' sk-table__header-cell--sortable' : ''}`}
                    style={{ width: column.width }}
                    aria-sort={ariaSort(column)}
                    tabIndex={column.sortable ? 0 : undefined}
                    onClick={() => handleSort(column)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(column);
                      }
                    }}
                  >
                    <div class="sk-table__header-label">
                      {column.header}
                      <Show when={column.sortable}>
                        <span
                          class={`sk-table__sort-indicator ${
                            isColumnSorted(column)
                              ? 'sk-table__sort-indicator--active'
                              : 'sk-table__sort-indicator--inactive'
                          }`}
                          aria-hidden="true"
                        >
                          {sortGlyph(column)}
                        </span>
                      </Show>
                    </div>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={local.data}>
              {(item) => (
                <tr
                  class={`sk-table__row${local.onRowClick ? ' sk-table__row--clickable' : ''}${
                    isRowSelected(item) ? ' sk-table__row--selected' : ''
                  }`}
                  onClick={() => local.onRowClick?.(item)}
                >
                  <For each={local.columns}>
                    {(column) => (
                      <td class="sk-table__cell">
                        {column.render ? column.render(item) : String(item[column.key])}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}
