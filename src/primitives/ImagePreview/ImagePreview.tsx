import { type Component, For, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/ImagePreview/ImagePreview.css';

/** Configuration for a single image preview item. */
export interface ImagePreviewItem {
  /** Unique identifier. */
  id: string;
  /** Image source URL (data URL or blob URL). */
  src: string;
  /** Optional image name. */
  name?: string;
}

/** Props for the ImagePreview component. */
export interface ImagePreviewProps {
  /** Array of images to preview. */
  images: ImagePreviewItem[];
  /** Callback when remove button is clicked. */
  onRemove?: (id: string) => void;
  /** Maximum number of images to display. */
  maxVisible?: number;
  /** Additional CSS classes. */
  class?: string;
}

/** Grid of image thumbnails with optional remove buttons. */
export const ImagePreview: Component<ImagePreviewProps> = (props) => {
  const [local, others] = splitProps(props, ['images', 'onRemove', 'maxVisible', 'class']);

  const visibleImages = () => {
    const max = local.maxVisible;
    if (max !== undefined && max >= 0) {
      return local.images.slice(0, max);
    }
    return local.images;
  };

  const handleRemove = (id: string) => {
    local.onRemove?.(id);
  };

  const handleKeyDown = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRemove(id);
    }
  };

  return (
    <div class={`sk-image-preview ${local.class ?? ''}`} {...others}>
      <For each={visibleImages()}>
        {(image) => (
          <div class="sk-image-preview__item">
            <img src={image.src} alt={image.name ?? 'Preview'} class="sk-image-preview__image" />
            {local.onRemove && (
              <button
                type="button"
                class="sk-image-preview__remove"
                onClick={() => handleRemove(image.id)}
                onKeyDown={(e) => handleKeyDown(e, image.id)}
                aria-label={`Remove ${image.name ?? 'image'}`}
              >
                <svg
                  class="sk-image-preview__remove-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
      </For>
    </div>
  );
};
