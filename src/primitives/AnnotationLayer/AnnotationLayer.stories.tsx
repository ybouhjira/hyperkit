import type { Meta, StoryObj } from 'storybook-solidjs';
import { AnnotationLayer, type AnnotationLayerItem } from './AnnotationLayer';
import { Box } from '../Box';
import { Text } from '../Text';
import { Button } from '../Button';

const meta: Meta<typeof AnnotationLayer> = {
  title: 'Primitives/AnnotationLayer',
  component: AnnotationLayer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnnotationLayer>;

const ANNOTATIONS: AnnotationLayerItem[] = [
  {
    id: 'a1',
    selector: '.demo-card',
    x: 0.24,
    y: 0.18,
    text: 'This heading should use the 2xl token, not xl.',
    author: 'user',
    timestamp: Date.now() - 3_600_000,
    status: 'open',
    replies: [
      {
        id: 'r1',
        author: 'ai',
        text: 'Fixed in #142 — bumped to --sk-font-size-2xl.',
        timestamp: Date.now() - 1_800_000,
      },
    ],
  },
  {
    id: 'a2',
    selector: '.demo-card',
    x: 0.7,
    y: 0.62,
    text: 'Button contrast fails WCAG AA on hover.',
    author: 'ai',
    timestamp: Date.now() - 600_000,
    status: 'resolved',
  },
];

export const Default: Story = {
  render: () => (
    <AnnotationLayer annotations={ANNOTATIONS} enabled showResolved>
      <Box
        class="demo-card"
        p="md"
        border
        borderRadius="md"
        bg="secondary"
        style={{ width: '420px', height: '180px' }}
      >
        <Text as="h3" size="lg" weight="semibold">
          Annotated surface
        </Text>
        <Text as="p">Click the markers to read the review thread.</Text>
        <Button>Primary action</Button>
      </Box>
    </AnnotationLayer>
  ),
};
