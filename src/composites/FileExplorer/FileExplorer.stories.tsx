import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { SearchInput } from '../../primitives/SearchInput';
import { FileExplorer } from './FileExplorer';

const meta: Meta<typeof FileExplorer> = {
  title: 'Data Display/FileExplorer',
  component: FileExplorer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box h="500px" w="600px">
        <Story />
      </Box>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof FileExplorer>;

const items = [
  { name: 'src', path: '/project/src', isDirectory: true, modifiedAt: new Date('2026-02-20') },
  { name: 'docs', path: '/project/docs', isDirectory: true, modifiedAt: new Date('2026-02-18') },
  {
    name: 'node_modules',
    path: '/project/node_modules',
    isDirectory: true,
    modifiedAt: new Date('2026-02-15'),
  },
  {
    name: '.github',
    path: '/project/.github',
    isDirectory: true,
    modifiedAt: new Date('2026-01-10'),
  },
  {
    name: 'package.json',
    path: '/project/package.json',
    isDirectory: false,
    size: 2048,
    modifiedAt: new Date('2026-02-22'),
  },
  {
    name: 'README.md',
    path: '/project/README.md',
    isDirectory: false,
    size: 4096,
    modifiedAt: new Date('2026-02-20'),
  },
  {
    name: 'tsconfig.json',
    path: '/project/tsconfig.json',
    isDirectory: false,
    size: 512,
    modifiedAt: new Date('2026-02-01'),
  },
  {
    name: 'index.ts',
    path: '/project/index.ts',
    isDirectory: false,
    size: 1024,
    modifiedAt: new Date('2026-02-23'),
  },
  {
    name: 'vite.config.ts',
    path: '/project/vite.config.ts',
    isDirectory: false,
    size: 768,
    modifiedAt: new Date('2026-02-19'),
  },
  {
    name: 'styles.css',
    path: '/project/styles.css',
    isDirectory: false,
    size: 256,
    modifiedAt: new Date('2026-02-17'),
  },
  {
    name: 'logo.svg',
    path: '/project/logo.svg',
    isDirectory: false,
    size: 3072,
    modifiedAt: new Date('2026-02-14'),
  },
  {
    name: 'test-results.xml',
    path: '/project/test-results.xml',
    isDirectory: false,
    size: 15360,
    modifiedAt: new Date('2026-02-24'),
  },
  {
    name: 'CHANGELOG.md',
    path: '/project/CHANGELOG.md',
    isDirectory: false,
    size: 8192,
    modifiedAt: new Date('2026-02-21'),
  },
  {
    name: 'docker-compose.yml',
    path: '/project/docker-compose.yml',
    isDirectory: false,
    size: 640,
    modifiedAt: new Date('2026-02-16'),
  },
];

export const List: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'list',
  },
};

export const Icons: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'icons',
  },
};

export const Gallery: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'gallery',
  },
};

export const Tree: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'tree',
    expandedPaths: new Set(['/project/src']),
    childrenCache: new Map([
      [
        '/project/src',
        [
          {
            name: 'components',
            path: '/project/src/components',
            isDirectory: true,
            modifiedAt: new Date('2026-02-19'),
          },
          {
            name: 'utils',
            path: '/project/src/utils',
            isDirectory: true,
            modifiedAt: new Date('2026-02-18'),
          },
          {
            name: 'index.ts',
            path: '/project/src/index.ts',
            isDirectory: false,
            size: 512,
            modifiedAt: new Date('2026-02-20'),
          },
          {
            name: 'App.tsx',
            path: '/project/src/App.tsx',
            isDirectory: false,
            size: 2048,
            modifiedAt: new Date('2026-02-20'),
          },
        ],
      ],
    ]),
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = createSignal<Set<string>>(
      new Set(['/project/package.json', '/project/README.md'])
    );
    return (
      <FileExplorer
        items={items}
        currentPath="/project"
        viewMode="list"
        selectedPaths={selected()}
        onSelectionChange={setSelected}
        onNavigate={(path) => console.log('Navigate:', path)}
        onSelect={(item) => console.log('Selected:', item.name)}
      />
    );
  },
};

export const SortBySize: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'list',
    sortField: 'size',
    sortDirection: 'desc',
  },
};

export const WithSearch: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = createSignal('md');
    const filteredItems = () =>
      items.filter((item) => item.name.toLowerCase().includes(searchQuery().toLowerCase()));

    return (
      <Stack gap="sm" h="100%">
        <SearchInput
          placeholder="Search files..."
          value={searchQuery()}
          onChange={(value) => setSearchQuery(value)}
        />
        <Box style={{ flex: 1, overflow: 'hidden' }}>
          <FileExplorer
            items={filteredItems()}
            currentPath="/project"
            viewMode="list"
            onNavigate={(path) => console.log('Navigate:', path)}
            onSelect={(item) => console.log('Selected:', item.name)}
          />
        </Box>
      </Stack>
    );
  },
};

export const Narrow: Story = {
  args: {
    items,
    currentPath: '/project',
    viewMode: 'icons',
  },
  decorators: [
    (Story) => (
      <Box h="400px" w="250px">
        <Story />
      </Box>
    ),
  ],
};

export const Loading: Story = {
  args: {
    items: [],
    currentPath: '/project',
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    currentPath: '/empty',
  },
};

export const ManyFiles: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => ({
      name: `file-${i}.ts`,
      path: `/project/file-${i}.ts`,
      isDirectory: i < 5,
      size: Math.floor(Math.random() * 10000),
      modifiedAt: new Date(2026, 1, Math.floor(Math.random() * 24) + 1),
    })),
    currentPath: '/project',
    viewMode: 'list',
  },
};
