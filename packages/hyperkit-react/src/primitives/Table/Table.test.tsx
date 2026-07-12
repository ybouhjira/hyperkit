import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, type TableColumn } from './Table';

interface User {
  id: string;
  name: string;
  role: string;
}

const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
];
const data: User[] = [
  { id: '1', name: 'Maya', role: 'admin' },
  { id: '2', name: 'Sara', role: 'dev' },
];

describe('Table', () => {
  it('renders the sk-table contract with rows and cells', () => {
    render(<Table columns={columns} data={data} getRowKey={(u) => u.id} />);
    expect(screen.getByRole('table')).toHaveClass('sk-table__table');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Maya')).toHaveClass('sk-table__cell');
  });

  it('sortable header cycles asc → desc via onSort', () => {
    const onSort = vi.fn();
    const { rerender } = render(
      <Table columns={columns} data={data} getRowKey={(u) => u.id} onSort={onSort} />
    );
    const header = screen.getByText('Name').closest('th')!;
    expect(header).toHaveClass('sk-table__header-cell--sortable');
    fireEvent.click(header);
    expect(onSort).toHaveBeenCalledWith('name', 'asc');

    rerender(
      <Table
        columns={columns}
        data={data}
        getRowKey={(u) => u.id}
        onSort={onSort}
        sortColumn="name"
        sortDirection="asc"
      />
    );
    expect(screen.getByText('Name').closest('th')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(screen.getByText('Name').closest('th')!);
    expect(onSort).toHaveBeenLastCalledWith('name', 'desc');
  });

  it('row click + selection classes', () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        getRowKey={(u) => u.id}
        onRowClick={onRowClick}
        selectedKey="2"
      />
    );
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveClass('sk-table__row--clickable');
    expect(rows[1]).toHaveClass('sk-table__row--selected');
    fireEvent.click(rows[0]!);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('empty data shows the empty state', () => {
    render(<Table columns={columns} data={[]} getRowKey={(u: User) => u.id} emptyState="Nothing" />);
    expect(screen.getByText('Nothing')).toHaveClass('sk-table__empty');
  });
});
