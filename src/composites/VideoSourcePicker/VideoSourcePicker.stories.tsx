import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { VideoSourcePicker } from './VideoSourcePicker';
import {
  libraryVideoProvider,
  urlVideoProvider,
  localVideoProvider,
  comingSoonVideoProvider,
} from './providers';
import type { VideoLibraryItem, VideoSourceAdapter, VideoSource } from './types';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Composites/VideoSourcePicker',
  component: VideoSourcePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof VideoSourcePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE: VideoLibraryItem[] = [
  {
    id: 'bunny',
    url: 'https://youtu.be/bunny',
    title: 'Big Buck Bunny.mp4',
    sizeBytes: 158_000_000,
    addedAt: Date.now() - 2 * 3_600_000,
    cached: true,
  },
  {
    id: 'sintel',
    url: 'https://youtu.be/sintel',
    title: 'Sintel — open movie',
    sizeBytes: 412_000_000,
    addedAt: Date.now() - 2 * 86_400_000,
  },
];

/** A small in-memory adapter so the story is fully interactive. */
function demoAdapter(seed: VideoLibraryItem[] = SAMPLE): VideoSourceAdapter {
  let lib = [...seed];
  return {
    list: () => Promise.resolve([...lib]),
    download: (url) => {
      const existing = lib.find((e) => e.url === url);
      if (existing !== undefined) return Promise.resolve({ ...existing, cached: true });
      const next: VideoLibraryItem = {
        id: `dl-${lib.length}`,
        url,
        title: url.split('/').pop() || url,
        sizeBytes: 64_000_000,
        addedAt: Date.now(),
      };
      lib = [next, ...lib];
      return Promise.resolve(next);
    },
    fileUrl: (id) => `/api/vdl/file/${id}`,
    remove: (id) => {
      lib = lib.filter((e) => e.id !== id);
      return Promise.resolve();
    },
  };
}

function selectedLabel(source: VideoSource | null): string {
  if (source === null) return '—';
  return source.type === 'local'
    ? `local file ${source.file.name}`
    : `library ${source.item.title}`;
}

/** The standard IDE provider set: vdl library/url/local + cloud placeholders. */
function standardProviders(adapter: VideoSourceAdapter) {
  return [
    libraryVideoProvider(adapter),
    urlVideoProvider(adapter),
    localVideoProvider(),
    comingSoonVideoProvider({ id: 'gdrive', label: 'Google Drive' }),
    comingSoonVideoProvider({ id: 'gphotos', label: 'Google Photos' }),
    comingSoonVideoProvider({ id: 'fs', label: 'Filesystem' }),
  ];
}

function Demo(props: { providers?: ReturnType<typeof standardProviders> }) {
  const [picked, setPicked] = createSignal<VideoSource | null>(null);
  return (
    <Box style={{ 'max-width': '600px' }}>
      <VideoSourcePicker
        providers={props.providers ?? standardProviders(demoAdapter())}
        onSelect={setPicked}
      />
      <Text as="p" mt="md" size="base" color="secondary">
        Selected: {selectedLabel(picked())}
      </Text>
    </Box>
  );
}

export const AllSources: Story = {
  render: () => <Demo />,
};

export const EmptyLibrary: Story = {
  render: () => <Demo providers={standardProviders(demoAdapter([]))} />,
};

export const LocalOnly: Story = {
  render: () => <Demo providers={[localVideoProvider()]} />,
};

export const PlaceholdersOnly: Story = {
  render: () => (
    <Demo
      providers={[
        comingSoonVideoProvider({ id: 'gdrive', label: 'Google Drive' }),
        comingSoonVideoProvider({ id: 'gphotos', label: 'Google Photos' }),
      ]}
    />
  ),
};
