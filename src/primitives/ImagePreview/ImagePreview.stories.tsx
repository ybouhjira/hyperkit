import type { Meta, StoryObj } from 'storybook-solidjs';
import { ImagePreview } from './ImagePreview';
import { createSignal } from 'solid-js';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta: Meta<typeof ImagePreview> = {
  title: 'Data Display/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  argTypes: {
    maxVisible: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ImagePreview>;

// Helper function to create placeholder image data URLs
const createPlaceholderImage = (color: string, text: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 200, 200);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 100, 100);

  return canvas.toDataURL();
};

const sampleImages = [
  { id: '1', src: createPlaceholderImage('#3b82f6', 'Image 1'), name: 'Image 1' },
  { id: '2', src: createPlaceholderImage('#8b5cf6', 'Image 2'), name: 'Image 2' },
  { id: '3', src: createPlaceholderImage('#ec4899', 'Image 3'), name: 'Image 3' },
  { id: '4', src: createPlaceholderImage('#f59e0b', 'Image 4'), name: 'Image 4' },
  { id: '5', src: createPlaceholderImage('#10b981', 'Image 5'), name: 'Image 5' },
];

export const Default: Story = {
  args: {
    images: sampleImages.slice(0, 2),
  },
};

export const WithRemove: Story = {
  render: () => {
    const [images, setImages] = createSignal(sampleImages.slice(0, 3));

    const handleRemove = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return <ImagePreview images={images()} onRemove={handleRemove} />;
  },
};

export const MultipleImages: Story = {
  render: () => {
    const [images, setImages] = createSignal(sampleImages);

    const handleRemove = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return <ImagePreview images={images()} onRemove={handleRemove} />;
  },
};

export const MaxVisible: Story = {
  render: () => {
    const [images, setImages] = createSignal(sampleImages);

    const handleRemove = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
      <Stack gap="sm">
        <Text as="p" color="secondary">
          Showing 3 of {images().length} images
        </Text>
        <ImagePreview images={images()} onRemove={handleRemove} maxVisible={3} />
      </Stack>
    );
  },
};

export const SingleImage: Story = {
  render: () => {
    const [images, setImages] = createSignal(sampleImages.slice(0, 1));

    const handleRemove = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return <ImagePreview images={images()} onRemove={handleRemove} />;
  },
};

export const EmptyState: Story = {
  args: {
    images: [],
  },
};

export const WithoutRemoveButton: Story = {
  args: {
    images: sampleImages.slice(0, 3),
  },
};

export const CustomClass: Story = {
  args: {
    images: sampleImages.slice(0, 2),
    class: 'custom-preview-class',
  },
};
