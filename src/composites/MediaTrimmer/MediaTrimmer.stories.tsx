import type { Meta, StoryObj } from 'storybook-solidjs';
import { MediaTrimmer } from './MediaTrimmer';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Composites/MediaTrimmer',
  component: MediaTrimmer,
  tags: ['autodocs'],
} satisfies Meta<typeof MediaTrimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [range, setRange] = createSignal({ start: 0, end: 0 });
    return (
      <Box maxW="800px">
        <MediaTrimmer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          onTrimChange={(start, end) => setRange({ start, end })}
        />
        <Text as="p" mt="md" size="base" color="secondary">
          Selection: {range().start.toFixed(1)}s - {range().end.toFixed(1)}s (
          {(range().end - range().start).toFixed(1)}s duration)
        </Text>
      </Box>
    );
  },
};

export const WithCustomThumbnailCount: Story = {
  render: () => {
    const [range, setRange] = createSignal({ start: 0, end: 0 });
    return (
      <Box maxW="800px">
        <MediaTrimmer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          onTrimChange={(start, end) => setRange({ start, end })}
          thumbnailCount={20}
        />
        <Text as="p" mt="md" size="base" color="secondary">
          20 thumbnails - Selection: {range().start.toFixed(1)}s - {range().end.toFixed(1)}s
        </Text>
      </Box>
    );
  },
};

export const WithMinDuration: Story = {
  render: () => {
    const [range, setRange] = createSignal({ start: 0, end: 0 });
    return (
      <Box maxW="800px">
        <MediaTrimmer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          onTrimChange={(start, end) => setRange({ start, end })}
          minDuration={5}
        />
        <Text as="p" mt="md" size="base" color="secondary">
          Minimum 5 seconds - Selection: {range().start.toFixed(1)}s - {range().end.toFixed(1)}s
        </Text>
      </Box>
    );
  },
};

export const ShortVideo: Story = {
  render: () => {
    const [range, setRange] = createSignal({ start: 0, end: 0 });
    return (
      <Box maxW="800px">
        <MediaTrimmer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          onTrimChange={(start, end) => setRange({ start, end })}
          thumbnailCount={8}
        />
        <Text as="p" mt="md" size="base" color="secondary">
          Short video - Selection: {range().start.toFixed(1)}s - {range().end.toFixed(1)}s
        </Text>
      </Box>
    );
  },
};

export const WithCustomStyling: Story = {
  render: () => {
    const [range, setRange] = createSignal({ start: 0, end: 0 });
    return (
      <Box maxW="800px" p="lg" bg="secondary" borderRadius="md">
        <MediaTrimmer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          onTrimChange={(start, end) => setRange({ start, end })}
          class="custom-trimmer"
          style={{ '--sk-color-accent': 'var(--sk-warning)' }}
        />
        <Text as="p" mt="md" size="base" color="secondary">
          Custom accent color - Selection: {range().start.toFixed(1)}s - {range().end.toFixed(1)}s
        </Text>
      </Box>
    );
  },
};
