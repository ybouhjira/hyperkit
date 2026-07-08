import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { ImageInput } from './ImageInput';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Entry/ImageInput',
  component: ImageInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ImageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return <ImageInput value={value()} onChange={setValue} />;
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = createSignal<File[]>([]);
    return (
      <ImageInput value={value()} onChange={(files) => setValue(files as File[])} mode="multiple" />
    );
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return (
      <ImageInput
        value={value()}
        onChange={setValue}
        placeholder="Drop your image here or click to browse"
      />
    );
  },
};

export const CustomPreviewSize: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return <ImageInput value={value()} onChange={setValue} previewSize={120} />;
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return <ImageInput value={value()} onChange={setValue} disabled />;
  },
};

export const WithMaxSize: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return (
      <Stack gap="sm">
        <ImageInput
          value={value()}
          onChange={setValue}
          maxSize={1024 * 1024}
          placeholder="Max 1MB"
        />
        <Text as="p" color="muted" size="sm">
          Maximum file size: 1MB
        </Text>
      </Stack>
    );
  },
};

export const JPEGOnly: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | null>(null);
    return (
      <Stack gap="sm">
        <ImageInput
          value={value()}
          onChange={setValue}
          accept="image/jpeg"
          placeholder="JPEG only"
        />
        <Text as="p" color="muted" size="sm">
          Accepts only JPEG images
        </Text>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [single, setSingle] = createSignal<File | null>(null);
    const [multiple, setMultiple] = createSignal<File[]>([]);
    const [disabled, setDisabled] = createSignal<File | null>(null);

    return (
      <Stack gap="lg">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Single Mode
          </Text>
          <ImageInput value={single()} onChange={setSingle} />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Multiple Mode
          </Text>
          <ImageInput
            value={multiple()}
            onChange={(files) => setMultiple(files as File[])}
            mode="multiple"
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Custom Preview Size (120px)
          </Text>
          <ImageInput
            value={multiple()}
            onChange={(files) => setMultiple(files as File[])}
            mode="multiple"
            previewSize={120}
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Disabled
          </Text>
          <ImageInput value={disabled()} onChange={setDisabled} disabled />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            With Max Size (1MB)
          </Text>
          <ImageInput
            value={single()}
            onChange={setSingle}
            maxSize={1024 * 1024}
            placeholder="Max 1MB"
          />
        </Stack>

        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Custom Placeholder
          </Text>
          <ImageInput
            value={single()}
            onChange={setSingle}
            placeholder="Drop your profile picture here"
          />
        </Stack>
      </Stack>
    );
  },
};
