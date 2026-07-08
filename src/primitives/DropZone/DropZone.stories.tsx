import type { Meta, StoryObj } from 'storybook-solidjs';
import { DropZone } from './DropZone';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Entry/DropZone',
  component: DropZone,
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: 'text',
      description: 'Accepted file types (e.g., "image/*,video/*")',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple files',
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction',
    },
    idleText: {
      control: 'text',
      description: 'Text shown in idle state',
    },
    activeText: {
      control: 'text',
      description: 'Text shown during drag-over',
    },
  },
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDrop: (files: File[]) => {
      console.log('Files dropped:', files);
      alert(`Received ${files.length} file(s): ${files.map((f: File) => f.name).join(', ')}`);
    },
  },
};

export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    onDrop: (files: File[]) => {
      console.log('Images dropped:', files);
      alert(`Received ${files.length} image(s): ${files.map((f: File) => f.name).join(', ')}`);
    },
    idleText: 'Drop images here or click to browse',
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    onDrop: (files: File[]) => {
      console.log('Multiple files dropped:', files);
      alert(`Received ${files.length} file(s): ${files.map((f: File) => f.name).join(', ')}`);
    },
    idleText: 'Drop multiple files here',
  },
};

export const WithMaxSize: Story = {
  args: {
    maxSize: 1024 * 1024 * 5, // 5MB
    onDrop: (files: File[]) => {
      console.log('Files dropped (max 5MB):', files);
      alert(`Received ${files.length} file(s): ${files.map((f: File) => f.name).join(', ')}`);
    },
    idleText: 'Drop files (max 5MB)',
  },
};

export const CustomContent: Story = {
  args: {
    onDrop: (files: File[]) => {
      console.log('Files dropped:', files);
      alert(`Received ${files.length} file(s)`);
    },
    children: (
      <Stack gap="sm" align="center">
        <Text size="3xl">📁</Text>
        <Text as="h3" size="lg" weight="semibold">
          Upload Documents
        </Text>
        <Text as="p" size="sm" color="muted">
          Drag and drop files or click to browse
        </Text>
      </Stack>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onDrop: (files: File[]) => {
      console.log('This should not be called:', files);
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Default
        </Text>
        <DropZone onDrop={(files) => alert(`Default: ${files.length} file(s)`)} />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Images Only
        </Text>
        <DropZone
          accept="image/*"
          onDrop={(files) => alert(`Images: ${files.length} file(s)`)}
          idleText="Drop images here"
        />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Multiple Files
        </Text>
        <DropZone
          multiple
          onDrop={(files) => alert(`Multiple: ${files.length} file(s)`)}
          idleText="Drop multiple files"
        />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          With Max Size (1MB)
        </Text>
        <DropZone
          maxSize={1024 * 1024}
          onDrop={(files) => alert(`Max size: ${files.length} file(s)`)}
          idleText="Drop files (max 1MB)"
        />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Custom Content
        </Text>
        <DropZone onDrop={(files) => alert(`Custom: ${files.length} file(s)`)}>
          <Stack gap="sm" align="center">
            <Text size="2xl">🎨</Text>
            <Text as="p" color="muted">
              Custom upload area
            </Text>
          </Stack>
        </DropZone>
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Disabled
        </Text>
        <DropZone disabled onDrop={(files) => alert(`Disabled: ${files.length} file(s)`)} />
      </Stack>
    </Stack>
  ),
};
