import type { Meta, StoryObj } from 'storybook-solidjs';
import { FileInput } from './FileInput';
import { createSignal } from 'solid-js';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Entry/FileInput',
  component: FileInput,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'list'],
    },
    accept: { control: 'text' },
    maxSize: { control: 'number' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <FileInput value={value()} onChange={setValue} />;
  },
};

export const WithFile: Story = {
  render: () => {
    const mockFile = new File(['Sample content'], 'document.txt', { type: 'text/plain' });
    const [value, setValue] = createSignal<File | File[] | null>(mockFile);
    return <FileInput value={value()} onChange={setValue} />;
  },
};

export const ListMode: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <FileInput value={value()} onChange={setValue} mode="list" />;
  },
};

export const ListModeWithFiles: Story = {
  render: () => {
    const mockFiles = [
      new File(['Content 1'], 'report.pdf', { type: 'application/pdf' }),
      new File(['Content 2'], 'image.png', { type: 'image/png' }),
      new File(['Content 3'], 'video.mp4', { type: 'video/mp4' }),
    ];
    const [value, setValue] = createSignal<File | File[] | null>(mockFiles);
    return <FileInput value={value()} onChange={setValue} mode="list" />;
  },
};

export const AcceptPDF: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <FileInput
        value={value()}
        onChange={setValue}
        accept=".pdf,application/pdf"
        placeholder="Upload PDF only"
      />
    );
  },
};

export const WithMaxSize: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return (
      <FileInput
        value={value()}
        onChange={setValue}
        maxSize={5 * 1024 * 1024}
        placeholder="Max 5MB"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const mockFile = new File(['Sample content'], 'locked.txt', { type: 'text/plain' });
    const [value, setValue] = createSignal<File | File[] | null>(mockFile);
    return <FileInput value={value()} onChange={setValue} disabled />;
  },
};

export const CustomPlaceholder: Story = {
  render: () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    return <FileInput value={value()} onChange={setValue} placeholder="Drop your files here" />;
  },
};

export const AllVariants: Story = {
  render: () => {
    const [single, setSingle] = createSignal<File | File[] | null>(null);
    const [list, setList] = createSignal<File | File[] | null>(null);
    const [pdf, setPdf] = createSignal<File | File[] | null>(null);
    const mockFile = new File(['Sample'], 'example.txt', { type: 'text/plain' });
    const [disabled, setDisabled] = createSignal<File | File[] | null>(mockFile);

    return (
      <Box p="lg">
        <Stack gap="lg">
          <Stack gap="sm">
            <Text as="h3" size="lg" weight="semibold">
              Single Mode
            </Text>
            <FileInput value={single()} onChange={setSingle} />
          </Stack>

          <Stack gap="sm">
            <Text as="h3" size="lg" weight="semibold">
              List Mode
            </Text>
            <FileInput value={list()} onChange={setList} mode="list" />
          </Stack>

          <Stack gap="sm">
            <Text as="h3" size="lg" weight="semibold">
              PDF Only
            </Text>
            <FileInput
              value={pdf()}
              onChange={setPdf}
              accept=".pdf,application/pdf"
              placeholder="Upload PDF"
            />
          </Stack>

          <Stack gap="sm">
            <Text as="h3" size="lg" weight="semibold">
              Disabled
            </Text>
            <FileInput value={disabled()} onChange={setDisabled} disabled />
          </Stack>
        </Stack>
      </Box>
    );
  },
};
