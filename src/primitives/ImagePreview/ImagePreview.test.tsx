import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { ImagePreview } from './ImagePreview';
import type { ImagePreviewItem } from './ImagePreview';

const mockImages: ImagePreviewItem[] = [
  { id: '1', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg', name: 'Image 1' },
  { id: '2', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg', name: 'Image 2' },
  { id: '3', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg', name: 'Image 3' },
];

describe('ImagePreview', () => {
  describe('Rendering', () => {
    it('renders all images', () => {
      const { container } = render(() => <ImagePreview images={mockImages} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(3);
    });

    it('renders empty state when no images provided', () => {
      const { container } = render(() => <ImagePreview images={[]} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(0);
    });

    it('applies correct image src', () => {
      render(() => <ImagePreview images={[mockImages[0]]} />);
      const img = screen.getByAltText('Image 1') as HTMLImageElement;
      expect(img.src).toContain('data:image/png;base64');
    });

    it('uses name as alt text when provided', () => {
      render(() => <ImagePreview images={[mockImages[0]]} />);
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    });

    it('uses "Preview" as fallback alt text', () => {
      render(() => <ImagePreview images={[{ id: '1', src: 'test.jpg' }]} />);
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    it('applies custom class', () => {
      const { container } = render(() => <ImagePreview images={mockImages} class="custom-class" />);
      const preview = container.querySelector('.sk-image-preview');
      expect(preview?.className).toContain('custom-class');
    });
  });

  describe('Remove functionality', () => {
    it('shows remove button when onRemove is provided', () => {
      const { container } = render(() => <ImagePreview images={mockImages} onRemove={() => {}} />);
      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      expect(removeButtons).toHaveLength(3);
    });

    it('hides remove button when onRemove is not provided', () => {
      const { container } = render(() => <ImagePreview images={mockImages} />);
      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      expect(removeButtons).toHaveLength(0);
    });

    it('calls onRemove with correct id when button clicked', () => {
      const handleRemove = vi.fn();
      const { container } = render(() => (
        <ImagePreview images={mockImages} onRemove={handleRemove} />
      ));

      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      fireEvent.click(removeButtons[0]);

      expect(handleRemove).toHaveBeenCalledWith('1');
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when Enter key pressed on remove button', () => {
      const handleRemove = vi.fn();
      const { container } = render(() => (
        <ImagePreview images={mockImages} onRemove={handleRemove} />
      ));

      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      fireEvent.keyDown(removeButtons[0], { key: 'Enter' });

      expect(handleRemove).toHaveBeenCalledWith('1');
    });

    it('calls onRemove when Space key pressed on remove button', () => {
      const handleRemove = vi.fn();
      const { container } = render(() => (
        <ImagePreview images={mockImages} onRemove={handleRemove} />
      ));

      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      fireEvent.keyDown(removeButtons[0], { key: ' ' });

      expect(handleRemove).toHaveBeenCalledWith('1');
    });

    it('does not call onRemove for other keys', () => {
      const handleRemove = vi.fn();
      const { container } = render(() => (
        <ImagePreview images={mockImages} onRemove={handleRemove} />
      ));

      const removeButtons = container.querySelectorAll('.sk-image-preview__remove');
      fireEvent.keyDown(removeButtons[0], { key: 'Escape' });

      expect(handleRemove).not.toHaveBeenCalled();
    });

    it('has correct aria-label on remove button', () => {
      render(() => <ImagePreview images={[mockImages[0]]} onRemove={() => {}} />);
      expect(screen.getByLabelText('Remove Image 1')).toBeInTheDocument();
    });

    it('uses fallback aria-label when name not provided', () => {
      render(() => <ImagePreview images={[{ id: '1', src: 'test.jpg' }]} onRemove={() => {}} />);
      expect(screen.getByLabelText('Remove image')).toBeInTheDocument();
    });
  });

  describe('MaxVisible', () => {
    it('shows all images when maxVisible not set', () => {
      const { container } = render(() => <ImagePreview images={mockImages} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(3);
    });

    it('limits displayed images to maxVisible', () => {
      const { container } = render(() => <ImagePreview images={mockImages} maxVisible={2} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(2);
    });

    it('shows first N images when maxVisible is set', () => {
      render(() => <ImagePreview images={mockImages} maxVisible={2} />);
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Image 2')).toBeInTheDocument();
      expect(screen.queryByAltText('Image 3')).not.toBeInTheDocument();
    });

    it('shows all images when maxVisible is greater than images length', () => {
      const { container } = render(() => <ImagePreview images={mockImages} maxVisible={10} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(3);
    });

    it('shows no images when maxVisible is 0', () => {
      const { container } = render(() => <ImagePreview images={mockImages} maxVisible={0} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(0);
    });

    it('ignores negative maxVisible', () => {
      const { container } = render(() => <ImagePreview images={mockImages} maxVisible={-1} />);
      const images = container.querySelectorAll('.sk-image-preview__image');
      expect(images).toHaveLength(3);
    });
  });

  describe('Structure', () => {
    it('applies correct base class', () => {
      const { container } = render(() => <ImagePreview images={mockImages} />);
      expect(container.querySelector('.sk-image-preview')).toBeInTheDocument();
    });

    it('wraps each image in an item container', () => {
      const { container } = render(() => <ImagePreview images={mockImages} />);
      const items = container.querySelectorAll('.sk-image-preview__item');
      expect(items).toHaveLength(3);
    });

    it('renders remove icon SVG', () => {
      const { container } = render(() => (
        <ImagePreview images={[mockImages[0]]} onRemove={() => {}} />
      ));
      const svg = container.querySelector('.sk-image-preview__remove-icon');
      expect(svg).toBeInTheDocument();
    });
  });
});
