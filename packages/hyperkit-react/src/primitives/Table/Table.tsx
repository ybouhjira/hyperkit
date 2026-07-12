import type { CSSProperties, ReactNode } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Table/Table.css';

export interface TableColumn<T> {
  /** Property key to display from the data object. */
  key: keyof T;
  /** Column header text. */
  header: string;
  /** Optional fixed column width (CSS value). */
  width?: string;
  /** Allow sorting by this column. */
  sortable?: boolean;
  /** Custom render function for cell content. */
  render?: (item: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  /** Key of the currently selected row. */
  selectedKey?: string | null;
  /** Function to extract a unique key from each row. */
  getRowKey: (item: T) => string;
  /** Key of the currently sorted column. */
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  /** Callback when a sortable header is activated. */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Content shown when data is empty. */
  emptyState?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Data table rendering the same `sk-table` contract as the SolidJS package —
 * sortable headers with aria-sort, clickable/selected rows, empty state.
 */
export function Table<T>({
  columns,
  data,
  onRowClick,
  selectedKey,
  getRowKey,
  sortColumn,
  sortDirection,
  onSort,
  emptyState,
  className,
  style,
}: TableProps<T>) {
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;
    const next = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(String(column.key), next);
  };

  const isSorted = (column: TableColumn<T>) => sortColumn === column.key;
  const sortGlyph = (column: TableColumn<T>) =>
    !isSorted(column) ? '▲' : sortDirection === 'asc' ? '▲' : '▼';
  const ariaSort = (column: TableColumn<T>): 'ascending' | 'descending' | 'none' | undefined => {
    if (!column.sortable) return undefined;
    if (!isSorted(column)) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className={`sk-table${className ? ` ${className}` : ''}`} style={style}>
      {data.length === 0 ? (
        <div className="sk-table__empty">{emptyState ?? 'No data available'}</div>
      ) : (
        <table className="sk-table__table">
          <thead className="sk-table__head">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`sk-table__header-cell${column.sortable ? ' sk-table__header-cell--sortable' : ''}`}
                  style={{ width: column.width }}
                  aria-sort={ariaSort(column)}
                  tabIndex={column.sortable ? 0 : undefined}
                  onClick={() => handleSort(column)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(column);
                    }
                  }}
                >
                  <div className="sk-table__header-label">
                    {column.header}
                    {column.sortable && (
                      <span
                        className={`sk-table__sort-indicator ${
                          isSorted(column)
                            ? 'sk-table__sort-indicator--active'
                            : 'sk-table__sort-indicator--inactive'
                        }`}
                        aria-hidden="true"
                      >
                        {sortGlyph(column)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={getRowKey(item)}
                className={`sk-table__row${onRowClick ? ' sk-table__row--clickable' : ''}${
                  selectedKey === getRowKey(item) ? ' sk-table__row--selected' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="sk-table__cell">
                    {column.render ? column.render(item) : String(item[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
