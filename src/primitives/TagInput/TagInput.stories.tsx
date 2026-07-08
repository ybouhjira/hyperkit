import type { Meta, StoryObj } from 'storybook-solidjs';
import { TagInput } from './TagInput';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Data Entry/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    maxTags: { control: 'number' },
    allowDuplicates: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Add tag...',
  },
};

export const WithDefaultTags: Story = {
  args: {
    defaultValue: ['react', 'solidjs', 'typescript'],
    placeholder: 'Add more tags...',
  },
};

export const WithSuggestions: Story = {
  args: {
    suggestions: [
      'react',
      'vue',
      'angular',
      'solidjs',
      'svelte',
      'typescript',
      'javascript',
      'css',
      'html',
    ],
    placeholder: 'Type to see suggestions...',
  },
};

export const MaxTags: Story = {
  args: {
    maxTags: 3,
    defaultValue: ['tag1', 'tag2'],
    placeholder: 'Maximum 3 tags',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Skills',
    placeholder: 'Add your skills...',
    suggestions: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS'],
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: ['disabled', 'tags'],
    disabled: true,
  },
};

export const AllowDuplicates: Story = {
  args: {
    allowDuplicates: true,
    placeholder: 'Duplicates allowed...',
  },
};

export const Controlled: Story = {
  render: () => {
    const [tags, setTags] = createSignal<string[]>(['initial']);
    return (
      <Stack gap="md">
        <TagInput
          value={tags()}
          onChange={setTags}
          placeholder="Controlled tags..."
          suggestions={['react', 'vue', 'solidjs']}
        />
        <Box p="md" bg="secondary" borderRadius="md">
          <Text weight="semibold">Current tags:</Text> {JSON.stringify(tags())}
        </Box>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          Default
        </Text>
        <TagInput placeholder="Add tag..." />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          With Default Tags
        </Text>
        <TagInput defaultValue={['react', 'solidjs', 'typescript']} />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          With Suggestions
        </Text>
        <TagInput
          suggestions={['react', 'vue', 'angular', 'solidjs', 'svelte']}
          placeholder="Type to see suggestions..."
        />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          Max Tags (3)
        </Text>
        <TagInput maxTags={3} defaultValue={['tag1', 'tag2']} placeholder="Maximum 3 tags" />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          With Label
        </Text>
        <TagInput label="Skills" placeholder="Add your skills..." />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          Disabled
        </Text>
        <TagInput defaultValue={['disabled', 'tags']} disabled />
      </Stack>

      <Stack gap="md">
        <Text as="h3" size="lg" weight="semibold">
          Allow Duplicates
        </Text>
        <TagInput allowDuplicates placeholder="Duplicates allowed..." />
      </Stack>
    </Stack>
  ),
};
