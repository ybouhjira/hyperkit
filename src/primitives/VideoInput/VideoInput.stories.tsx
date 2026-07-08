import type { Meta, StoryObj } from 'storybook-solidjs';
import { VideoInput } from './VideoInput';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Data Entry/VideoInput',
  component: VideoInput,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'list'],
      description: 'Single or multi-video mode',
    },
    accept: {
      control: 'text',
      description: 'Accepted video MIME types',
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction',
    },
  },
} satisfies Meta<typeof VideoInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <VideoInput value={value()} onChange={setValue} />;
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <VideoInput value={value()} onChange={setValue} placeholder="Upload your video file" />;
  },
};

export const ListMode: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <VideoInput
        value={value()}
        onChange={setValue}
        mode="list"
        placeholder="Upload multiple videos"
      />
    );
  },
};

export const WithMaxSize: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <VideoInput
        value={value()}
        onChange={setValue}
        maxSize={10 * 1024 * 1024} // 10 MB
        placeholder="Max 10 MB per video"
      />
    );
  },
};

export const CustomAccept: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <VideoInput
        value={value()}
        onChange={setValue}
        accept="video/mp4,video/webm"
        placeholder="MP4 or WebM only"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <VideoInput value={value()} onChange={setValue} disabled placeholder="Disabled video input" />
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [single, setSingle] = createSignal<File | File[] | null>(null);
    const [multiple, setMultiple] = createSignal<File | File[] | null>(null);
    const [limited, setLimited] = createSignal<File | File[] | null>(null);

    return (
      <Stack gap="xl">
        <Stack gap="md">
          <Text as="h3" size="lg" weight="semibold">
            Single Mode
          </Text>
          <VideoInput value={single()} onChange={setSingle} placeholder="Select a video" />
        </Stack>

        <Stack gap="md">
          <Text as="h3" size="lg" weight="semibold">
            List Mode
          </Text>
          <VideoInput
            value={multiple()}
            onChange={setMultiple}
            mode="list"
            placeholder="Select multiple videos"
          />
        </Stack>

        <Stack gap="md">
          <Text as="h3" size="lg" weight="semibold">
            With Size Limit (5 MB)
          </Text>
          <VideoInput
            value={limited()}
            onChange={setLimited}
            maxSize={5 * 1024 * 1024}
            placeholder="Max 5 MB"
          />
        </Stack>

        <Stack gap="md">
          <Text as="h3" size="lg" weight="semibold">
            Disabled
          </Text>
          <VideoInput value={null} onChange={() => {}} disabled placeholder="Disabled state" />
        </Stack>
      </Stack>
    );
  },
};
