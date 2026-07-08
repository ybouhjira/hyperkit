import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Lightbox } from './Lightbox';
import { Flex } from '../Flex';

const meta: Meta<typeof Lightbox> = {
  title: 'Primitives/Lightbox',
  component: Lightbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Lightbox>;

const IMAGES = [
  { src: 'https://picsum.photos/seed/hyperkit-a/960/640', alt: 'Sample A' },
  { src: 'https://picsum.photos/seed/hyperkit-b/960/640', alt: 'Sample B' },
  { src: 'https://picsum.photos/seed/hyperkit-c/960/640', alt: 'Sample C' },
];

/** Overlay component — the demo stays contained: click a thumbnail to open. */
export const ClickToOpen: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [index, setIndex] = createSignal(0);
    return (
      <>
        <Flex gap="sm">
          {IMAGES.map((img, i) => (
            <img
              src={img.src}
              alt={img.alt}
              width={120}
              height={80}
              style={{
                cursor: 'pointer',
                'border-radius': 'var(--sk-radius-md)',
                'object-fit': 'cover',
              }}
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            />
          ))}
        </Flex>
        <Lightbox
          open={open}
          onClose={() => setOpen(false)}
          images={IMAGES}
          initialIndex={index()}
        />
      </>
    );
  },
};
