import type { Meta, StoryObj } from 'storybook-solidjs';
import { AudioInput } from './AudioInput';
import { createSignal } from 'solid-js';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Entry/AudioInput',
  component: AudioInput,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'list'],
      description: 'Selection mode',
    },
    accept: {
      control: 'text',
      description: 'Accepted audio file types',
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
      description: 'Disable the input',
    },
  },
} satisfies Meta<typeof AudioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <AudioInput value={value()} onChange={setValue} />;
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <AudioInput
        value={value()}
        onChange={setValue}
        placeholder="Drop your audio file here or click to browse"
      />
    );
  },
};

export const ListMode: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <AudioInput
        value={value()}
        onChange={setValue}
        mode="list"
        placeholder="Select multiple audio files"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <AudioInput value={value()} onChange={setValue} disabled />;
  },
};

export const WithMaxSize: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <Stack gap="md">
        <AudioInput
          value={value()}
          onChange={setValue}
          maxSize={5 * 1024 * 1024} // 5 MB
          placeholder="Max file size: 5 MB"
        />
        <Text as="p" size="sm" color="secondary">
          Files larger than 5 MB will be rejected
        </Text>
      </Stack>
    );
  },
};

export const CustomAccept: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <Stack gap="md">
        <AudioInput
          value={value()}
          onChange={setValue}
          accept="audio/mp3,audio/wav"
          placeholder="Only MP3 and WAV files"
        />
        <Text as="p" size="sm" color="secondary">
          Accepts: audio/mp3, audio/wav
        </Text>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [singleValue, setSingleValue] = createSignal<File | File[] | null>(null);
    const [listValue, setListValue] = createSignal<File | File[] | null>(null);
    const [disabledValue, setDisabledValue] = createSignal<File | File[] | null>(null);

    return (
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Single Mode
          </Text>
          <AudioInput value={singleValue()} onChange={setSingleValue} />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            List Mode
          </Text>
          <AudioInput value={listValue()} onChange={setListValue} mode="list" />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Disabled
          </Text>
          <AudioInput value={disabledValue()} onChange={setDisabledValue} disabled />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            With Max Size (1 MB)
          </Text>
          <AudioInput
            value={singleValue()}
            onChange={setSingleValue}
            maxSize={1024 * 1024}
            placeholder="Max 1 MB"
          />
        </Stack>
      </Stack>
    );
  },
};
