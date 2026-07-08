import { JSX, For, Show, splitProps } from 'solid-js';

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

  const getSortIndicator = (column: TableColumn<T>): JSX.Element => {
    if (!column.sortable) return '';
    if (local.sortColumn !== column.key) return <span style={{ opacity: '0.3' }}>▲</span>;
    return local.sortDirection === 'asc' ? '▲' : '▼';
  };

  const isRowSelected = (item: T): boolean => {
    return local.selectedKey === local.getRowKey(item);
  };

  return (
    <div
      style={{
        width: '100%',
        'overflow-x': 'auto',
      }}
      {...others}
    >
      <Show
        when={local.data.length > 0}
        fallback={
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              padding: '48px 16px',
              color: 'var(--sk-text-muted)',
              'font-family': 'var(--sk-font-ui)',
              'text-align': 'center',
            }}
          >
            {local.emptyState != null ? local.emptyState : 'No data available'}
          </div>
        }
      >
        <table
          style={{
            width: '100%',
            'border-collapse': 'collapse',
            'font-family': 'var(--sk-font-ui)',
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: '0',
              background: 'var(--sk-bg-secondary)',
              'z-index': '10',
            }}
          >
            <tr>
              <For each={local.columns}>
                {(column) => (
                  <th
                    style={{
                      padding: '8px 12px',
                      'text-align': 'left',
                      color: 'var(--sk-text-muted)',
                      'font-weight': '600',
                      'font-size': 'var(--sk-font-size-sm)',
                      'text-transform': 'uppercase',
                      'letter-spacing': '0.5px',
                      'border-bottom': '1px solid var(--sk-border-subtle)',
                      cursor: column.sortable ? 'pointer' : 'default',
                      'user-select': 'none',
                      width: column.width,
                    }}
                    onClick={() => handleSort(column)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        'align-items': 'center',
                        gap: '4px',
                      }}
                    >
                      {column.header}
                      <Show when={column.sortable}>
                        <span style={{ 'font-size': 'var(--sk-font-size-xs)' }}>
                          {getSortIndicator(column)}
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
              {(item) => {
                const selected = isRowSelected(item);
                return (
                  <tr
                    style={{
                      background: selected ? 'var(--sk-bg-tertiary)' : 'var(--sk-bg-primary)',
                      cursor: local.onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.15s ease',
                      'border-left': selected
                        ? '3px solid var(--sk-accent-muted)'
                        : '3px solid transparent',
                    }}
                    onClick={() => local.onRowClick?.(item)}
                    onMouseEnter={(e) => {
                      if (!local.onRowClick) return;
                      (e.currentTarget as HTMLElement).style.background = 'var(--sk-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!local.onRowClick) return;
                      (e.currentTarget as HTMLElement).style.background = selected
                        ? 'var(--sk-bg-tertiary)'
                        : 'var(--sk-bg-primary)';
                    }}
                  >
                    <For each={local.columns}>
                      {(column) => (
                        <td
                          style={{
                            padding: '8px 12px',
                            color: 'var(--sk-text-secondary)',
                            'border-bottom': '1px solid var(--sk-border-subtle)',
                          }}
                        >
                          {column.render ? column.render(item) : String(item[column.key])}
                        </td>
                      )}
                    </For>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}
