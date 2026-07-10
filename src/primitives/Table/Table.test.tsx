import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Table } from './Table';

interface TestItem {
  id: string;
  name: string;
  age: number;
}

const testData: TestItem[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
];

describe('Table', () => {
  it('renders table with headers and rows', () => {
    render(() => <Table columns={columns} data={testData} getRowKey={(item) => item.id} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(() => <Table columns={columns} data={[]} getRowKey={(item) => item.id} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty state', () => {
    render(() => (
      <Table
        columns={columns}
        data={[]}
        getRowKey={(item) => item.id}
        emptyState="Custom empty message"
      />
    ));

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('uses custom render function for columns', () => {
    const customColumns = [
      {
        key: 'name',
        header: 'Name',
        render: (item: TestItem) => <strong>{item.name.toUpperCase()}</strong>,
      },
    ];

    render(() => <Table columns={customColumns} data={testData} getRowKey={(item) => item.id} />);

    expect(screen.getByText('ALICE')).toBeInTheDocument();
    expect(screen.getByText('BOB')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const handleRowClick = vi.fn();

    render(() => (
      <Table
        columns={columns}
        data={testData}
        getRowKey={(item) => item.id}
        onRowClick={handleRowClick}
      />
    ));

    const row = screen.getByText('Alice').closest('tr');
    fireEvent.click(row!);

    expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it('highlights selected row', () => {
    render(() => (
      <Table columns={columns} data={testData} getRowKey={(item) => item.id} selectedKey="2" />
    ));

    const bobRow = screen.getByText('Bob').closest('tr') as HTMLElement;
    expect(bobRow.classList.contains('sk-table__row--selected')).toBe(true);

    const aliceRow = screen.getByText('Alice').closest('tr') as HTMLElement;
    expect(aliceRow.classList.contains('sk-table__row--selected')).toBe(false);
  });

  it('handles sortable columns', () => {
    const handleSort = vi.fn();
    const sortableColumns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
    ];

    render(() => (
      <Table
        columns={sortableColumns}
        data={testData}
        getRowKey={(item) => item.id}
        onSort={handleSort}
      />
    ));

    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);

    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('toggles sort direction on second click', () => {
    const handleSort = vi.fn();
    const sortableColumns = [{ key: 'name', header: 'Name', sortable: true }];

    render(() => (
      <Table
        columns={sortableColumns}
        data={testData}
        getRowKey={(item) => item.id}
        onSort={handleSort}
        sortColumn="name"
        sortDirection="asc"
      />
    ));

    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);

    expect(handleSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('shows sort indicator for sorted column', () => {
    const sortableColumns = [{ key: 'name', header: 'Name', sortable: true }];

    render(() => (
      <Table
        columns={sortableColumns}
        data={testData}
        getRowKey={(item) => item.id}
        sortColumn="name"
        sortDirection="asc"
      />
    ));

    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('applies custom column width', () => {
    const columnsWithWidth = [
      { key: 'name', header: 'Name', width: '200px' },
      { key: 'age', header: 'Age', width: '100px' },
    ];

    render(() => (
      <Table columns={columnsWithWidth} data={testData} getRowKey={(item) => item.id} />
    ));

    const nameHeader = screen.getByText('Name').closest('th') as HTMLElement;
    expect(nameHeader.style.width).toBe('200px');
  });

  it('marks clickable rows so CSS hover styling applies', () => {
    render(() => (
      <Table
        columns={columns}
        data={testData}
        getRowKey={(item) => item.id}
        onRowClick={() => {}}
      />
    ));

    const row = screen.getByText('Alice').closest('tr') as HTMLElement;
    expect(row.classList.contains('sk-table__row--clickable')).toBe(true);
    // Hover styling lives in CSS — mouse events must not mutate inline styles.
    fireEvent.mouseEnter(row);
    expect(row.style.background).toBe('');
  });

  it('does not mark rows clickable when onRowClick is not provided', () => {
    render(() => <Table columns={columns} data={testData} getRowKey={(item) => item.id} />);

    const row = screen.getByText('Alice').closest('tr') as HTMLElement;
    expect(row.classList.contains('sk-table__row--clickable')).toBe(false);
  });

  it('applies the sk-table class on the root element', () => {
    const { container } = render(() => (
      <Table columns={columns} data={testData} getRowKey={(item) => item.id} />
    ));

    const root = container.firstChild as HTMLElement;
    expect(root.classList.contains('sk-table')).toBe(true);
  });

  it('supports keyboard sorting on sortable headers', () => {
    const handleSort = vi.fn();
    const sortableColumns = [{ key: 'name', header: 'Name', sortable: true }];

    render(() => (
      <Table
        columns={sortableColumns}
        data={testData}
        getRowKey={(item) => item.id}
        onSort={handleSort}
      />
    ));

    const nameHeader = screen.getByText('Name').closest('th') as HTMLElement;
    expect(nameHeader.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });
});
