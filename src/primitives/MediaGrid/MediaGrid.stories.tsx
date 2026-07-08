import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { MediaGrid, type MediaGridItem } from './MediaGrid';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Display/MediaGrid',
  component: MediaGrid,
  tags: ['autodocs'],
} satisfies Meta<typeof MediaGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create mock items with colored placeholder images
const createPlaceholderItems = (count: number): MediaGridItem[] => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="${colors[i % colors.length]}" width="200" height="200"/><text fill="white" font-size="60" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${i + 1}</text></svg>`)}`,
    label: `Face ${i + 1}`,
  }));
};

export const Default: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>([]);
    return (
      <Stack gap="md">
        <Text color="secondary">Empty grid with add card - drag files or click to upload</Text>
        <MediaGrid
          items={items()}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
              label: f.name,
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
        />
      </Stack>
    );
  },
};

export const WithItems: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(4));
    return (
      <Stack gap="md">
        <Text color="secondary">Pre-populated grid with add, select, and delete functionality</Text>
        <MediaGrid
          items={items()}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
              label: f.name,
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
          onSelect={(id) => {
            console.log('Selected:', id);
          }}
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
          }}
        />
      </Stack>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(4));
    const [selectedId, setSelectedId] = createSignal<string | null>('2');
    return (
      <Stack gap="md">
        <Text color="secondary">Selected item highlighted - click items to select</Text>
        <MediaGrid
          items={items()}
          selectedId={selectedId()}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
              label: f.name,
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
          onSelect={(id) => {
            setSelectedId(id);
          }}
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
            if (selectedId() === id) {
              setSelectedId(null);
            }
          }}
        />
        <Text color="secondary">Selected ID: {selectedId() || 'None'}</Text>
      </Stack>
    );
  },
};

export const WithReplace: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(4));
    return (
      <Stack gap="md">
        <Text color="secondary">Drag files onto existing items to replace them</Text>
        <MediaGrid
          items={items()}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
              label: f.name,
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
          onReplace={(id, file) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, src: URL.createObjectURL(file), label: file.name }
                  : item
              )
            );
          }}
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
          }}
        />
      </Stack>
    );
  },
};

export const NoLabels: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(6));
    return (
      <Stack gap="md">
        <Text color="secondary">Items without labels shown</Text>
        <MediaGrid
          items={items()}
          showLabels={false}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
          }}
        />
      </Stack>
    );
  },
};

export const CustomColumnWidth: Story = {
  render: () => {
    const [items, setItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(4));
    return (
      <Stack gap="md">
        <Text color="secondary">Larger thumbnails with custom column width (200px min)</Text>
        <MediaGrid
          items={items()}
          columnMinWidth={200}
          onAdd={(files) => {
            const newItems = files.map((f, i) => ({
              id: String(Date.now() + i),
              src: URL.createObjectURL(f),
              label: f.name,
            }));
            setItems((prev) => [...prev, ...newItems]);
          }}
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
          }}
        />
      </Stack>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [items] = createSignal<MediaGridItem[]>(createPlaceholderItems(4));
    return (
      <Stack gap="md">
        <Text color="secondary">All interactions blocked when disabled</Text>
        <MediaGrid items={items()} disabled={true} />
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [emptyItems, setEmptyItems] = createSignal<MediaGridItem[]>([]);
    const [withItems, setWithItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(3));
    const [selectedId, setSelectedId] = createSignal<string | null>('2');
    const [noLabelItems, setNoLabelItems] = createSignal<MediaGridItem[]>(
      createPlaceholderItems(4)
    );
    const [largeItems, setLargeItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(3));
    const [disabledItems] = createSignal<MediaGridItem[]>(createPlaceholderItems(3));

    return (
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Empty
          </Text>
          <MediaGrid
            items={emptyItems()}
            onAdd={(files) => {
              const newItems = files.map((f, i) => ({
                id: String(Date.now() + i),
                src: URL.createObjectURL(f),
                label: f.name,
              }));
              setEmptyItems((prev) => [...prev, ...newItems]);
            }}
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            With Items + Selection
          </Text>
          <MediaGrid
            items={withItems()}
            selectedId={selectedId()}
            onAdd={(files) => {
              const newItems = files.map((f, i) => ({
                id: String(Date.now() + i),
                src: URL.createObjectURL(f),
                label: f.name,
              }));
              setWithItems((prev) => [...prev, ...newItems]);
            }}
            onSelect={(id) => {
              setSelectedId(id);
            }}
            onDelete={(id) => {
              setWithItems((prev) => prev.filter((item) => item.id !== id));
              if (selectedId() === id) {
                setSelectedId(null);
              }
            }}
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            No Labels
          </Text>
          <MediaGrid
            items={noLabelItems()}
            showLabels={false}
            onAdd={(files) => {
              const newItems = files.map((f, i) => ({
                id: String(Date.now() + i),
                src: URL.createObjectURL(f),
              }));
              setNoLabelItems((prev) => [...prev, ...newItems]);
            }}
            onDelete={(id) => {
              setNoLabelItems((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Large Columns (200px)
          </Text>
          <MediaGrid
            items={largeItems()}
            columnMinWidth={200}
            onAdd={(files) => {
              const newItems = files.map((f, i) => ({
                id: String(Date.now() + i),
                src: URL.createObjectURL(f),
                label: f.name,
              }));
              setLargeItems((prev) => [...prev, ...newItems]);
            }}
            onDelete={(id) => {
              setLargeItems((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Disabled
          </Text>
          <MediaGrid items={disabledItems()} disabled={true} />
        </Stack>
      </Stack>
    );
  },
};
