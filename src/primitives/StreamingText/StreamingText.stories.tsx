import type { Meta, StoryObj } from 'storybook-solidjs';
import { StreamingText } from './StreamingText';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal, onCleanup } from 'solid-js';

const meta = {
  title: 'Data Display/StreamingText',
  component: StreamingText,
  tags: ['autodocs'],
} satisfies Meta<typeof StreamingText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [chunks] = createSignal(['Hello ', 'world ', 'from ', 'streaming ', 'text!']);
    return <StreamingText chunks={chunks} />;
  },
};

export const PlainFormat: Story = {
  render: () => {
    const [chunks] = createSignal([
      'Plain text format\n',
      'No markdown rendering\n',
      'Just raw text output\n',
      'Line by line...',
    ]);
    return <StreamingText chunks={chunks} format="plain" />;
  },
};

export const Simulated: Story = {
  render: () => {
    const [chunks, setChunks] = createSignal<string[]>([]);
    const words = [
      'Once ',
      'upon ',
      'a ',
      'time, ',
      'there ',
      'was ',
      'a ',
      '**bold** ',
      'story ',
      'about ',
      '*streaming* ',
      'text...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setChunks((prev) => [...prev, words[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    onCleanup(() => clearInterval(interval));
    return <StreamingText chunks={chunks} />;
  },
};

export const MarkdownStreaming: Story = {
  render: () => {
    const [chunks, setChunks] = createSignal<string[]>([]);
    const words = [
      '# ',
      'Markdown ',
      'Streaming\n\n',
      'This ',
      'demonstrates ',
      '**real-time** ',
      'markdown ',
      'rendering.\n\n',
      '- ',
      'Item ',
      '1\n',
      '- ',
      'Item ',
      '2\n',
      '- ',
      'Item ',
      '3',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setChunks((prev) => [...prev, words[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
    onCleanup(() => clearInterval(interval));
    return <StreamingText chunks={chunks} format="markdown" />;
  },
};

export const AllVariants: Story = {
  render: () => {
    const [markdownChunks] = createSignal(['# Markdown\n\n', 'This is **bold** ', 'and *italic*.']);
    const [plainChunks] = createSignal(['Plain text\n', 'No formatting\n', 'Simple output']);

    return (
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Markdown Format
          </Text>
          <StreamingText chunks={markdownChunks} format="markdown" />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Plain Format
          </Text>
          <StreamingText chunks={plainChunks} format="plain" />
        </Stack>
      </Stack>
    );
  },
};
