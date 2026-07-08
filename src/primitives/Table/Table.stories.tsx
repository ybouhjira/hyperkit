import type { Meta, StoryObj } from 'storybook-solidjs';
import { Table, TableColumn } from './Table';
import { createSignal } from 'solid-js';
import { Badge } from '../Badge';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

const sampleData: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'User', status: 'inactive' },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'Editor',
    status: 'pending',
  },
  { id: '5', name: 'Eve Martinez', email: 'eve@example.com', role: 'Admin', status: 'active' },
];

const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (user) => {
      const variant =
        user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'danger';
      return <Badge variant={variant}>{user.status}</Badge>;
    },
  },
];

const meta: Meta<typeof Table<User>> = {
  title: 'Data Display/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

export const Default: Story = {
  render: () => <Table columns={columns} data={sampleData} getRowKey={(user) => user.id} />,
};

export const Sortable: Story = {
  render: () => {
    const [data, setData] = createSignal(sampleData);
    const [sortColumn, setSortColumn] = createSignal<string | undefined>();
    const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');

    const handleSort = (column: string, direction: 'asc' | 'desc') => {
      setSortColumn(column);
      setSortDirection(direction);

      const sorted = [...data()].sort((a, b) => {
        const aValue = a[column as keyof User];
        const bValue = b[column as keyof User];

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      setData(sorted);
    };

    return (
      <Table
        columns={columns}
        data={data()}
        getRowKey={(user) => user.id}
        sortColumn={sortColumn()}
        sortDirection={sortDirection()}
        onSort={handleSort}
      />
    );
  },
};

export const WithRowSelection: Story = {
  render: () => {
    const [selectedKey, setSelectedKey] = createSignal<string | null>(null);

    return (
      <Stack gap="md">
        <Text size="base">Selected: {selectedKey() || 'None'}</Text>
        <Table
          columns={columns}
          data={sampleData}
          getRowKey={(user) => user.id}
          selectedKey={selectedKey()}
          onRowClick={(user) => setSelectedKey(user.id)}
        />
      </Stack>
    );
  },
};

export const EmptyState: Story = {
  render: () => <Table columns={columns} data={[]} getRowKey={(user) => user.id} />,
};

export const CustomEmptyState: Story = {
  render: () => (
    <Table
      columns={columns}
      data={[]}
      getRowKey={(user) => user.id}
      emptyState={
        <Stack gap="xs" align="center">
          <Text size="5xl">📭</Text>
          <Text weight="semibold">No users found</Text>
          <Text size="base">Try adding some users to get started</Text>
        </Stack>
      }
    />
  ),
};

export const ManyRows: Story = {
  render: () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'User',
      status: (i % 3 === 0 ? 'active' : i % 2 === 0 ? 'pending' : 'inactive') as User['status'],
    }));

    return (
      <Box h={400} style={{ overflow: 'auto' }}>
        <Table columns={columns} data={largeData} getRowKey={(user) => user.id} />
      </Box>
    );
  },
};

export const CustomColumnWidths: Story = {
  render: () => {
    const customColumns: TableColumn<User>[] = [
      { key: 'name', header: 'Name', width: '30%', sortable: true },
      { key: 'email', header: 'Email', width: '40%', sortable: true },
      { key: 'role', header: 'Role', width: '15%', sortable: true },
      {
        key: 'status',
        header: 'Status',
        width: '15%',
        sortable: true,
        render: (user) => {
          const variant =
            user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'danger';
          return <Badge variant={variant}>{user.status}</Badge>;
        },
      },
    ];

    return <Table columns={customColumns} data={sampleData} getRowKey={(user) => user.id} />;
  },
};
