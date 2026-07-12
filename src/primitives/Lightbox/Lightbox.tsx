import {
  type Component,
  type Accessor,
  createSignal,
  createEffect,
  onCleanup,
  Show,
  For,
} from 'solid-js';
import { Portal, isServer } from 'solid-js/web';
import '@ybouhjira/hyperkit-styles/primitives/Lightbox/Lightbox.css';

export interface LightboxImage {
  /** Image URL. */
  src: string;
  /** Accessible alt text for the image. */
  alt?: string;
}

export interface LightboxProps {
  /** Whether the lightbox is open. */
  open: Accessor<boolean> | boolean;
  /** Called when the lightbox should close. */
  onClose: () => void;
  /** Array of images to display. */
  images: LightboxImage[];
  /** Index of the initially displayed image.
   * @default 0 */
  initialIndex?: number;
}

/**
 * Full-screen image gallery overlay with keyboard navigation, swipe gestures,
 * and backdrop click to close. SSR-safe: renders nothing on server.
 *
 * @example
 * ```tsx
 * import { Lightbox } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * const [open, setOpen] = createSignal(false);
 * const [startIndex, setStartIndex] = createSignal(0);
 * const images = [
 *   { src: "/product-1.jpg", alt: "Front view" },
 *   { src: "/product-2.jpg", alt: "Side view" },
 *   { src: "/product-3.jpg", alt: "Detail" },
 * ];
 *
 * // Trigger from a thumbnail grid
 * <For each={images}>
 *   {(img, i) => (
 *     <img
 *       src={img.src}
 *       alt={img.alt}
 *       onClick={() => { setStartIndex(i()); setOpen(true); }}
 *       style={{ cursor: "pointer" }}
 *     />
 *   )}
 * </For>
 * <Lightbox open={open} onClose={() => setOpen(false)} images={images} initialIndex={startIndex()} />
 * ```
 *
 * @see ImagePreview - for inline single-image preview without overlay
 * @see MediaGrid - for responsive media card layout
 */
export const Lightbox: Component<LightboxProps> = (props) => {
  const isOpen = () => (typeof props.open === 'function' ? props.open() : props.open);

  const [currentIndex, setCurrentIndex] = createSignal(props.initialIndex ?? 0);

  // Sync initialIndex when it changes externally
  createEffect(() => {
    setCurrentIndex(props.initialIndex ?? 0);
  });

  const total = () => props.images.length;

  const prev = () => {
    setCurrentIndex((i) => (i - 1 + total()) % total());
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % total());
  };

  // Keyboard navigation — capture onClose in a local variable to avoid solid/reactivity lint
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen()) return;
    const close = props.onClose;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  createEffect(() => {
    if (isServer) return;
    if (isOpen()) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
  });

  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch == null) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch == null) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    // Require more horizontal movement than vertical (swipe not scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
  };

  // Preload adjacent images (client only)
  createEffect(() => {
    if (isServer) return;
    const idx = currentIndex();
    const imgs = props.images;
    if (imgs.length <= 1) return;
    const nextIdx = (idx + 1) % imgs.length;
    const prevIdx = (idx - 1 + imgs.length) % imgs.length;
    [nextIdx, prevIdx].forEach((i) => {
      const img = imgs[i];
      if (img == null) return;
      const preload = new Image();
      preload.src = img.src;
    });
  });

  const current = () => props.images[currentIndex()];

  return (
    <Portal>
      <Show when={isOpen()}>
        <div
          class="sk-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Backdrop */}
          <div class="sk-lightbox__backdrop" onClick={() => props.onClose()} aria-hidden="true" />

          {/* Close button */}
          <button
            type="button"
            class="sk-lightbox__close"
            onClick={() => props.onClose()}
            aria-label="Close gallery"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Main image area */}
          <div class="sk-lightbox__stage">
            <Show when={total() > 1}>
              <button
                type="button"
                class="sk-lightbox__nav sk-lightbox__nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                disabled={total() <= 1}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </Show>

            <Show when={current() != null}>
              <img
                src={current()?.src}
                alt={current()?.alt ?? ''}
                class="sk-lightbox__image"
                draggable={false}
              />
            </Show>

            <Show when={total() > 1}>
              <button
                type="button"
                class="sk-lightbox__nav sk-lightbox__nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                disabled={total() <= 1}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </Show>
          </div>

          {/* Dot indicators */}
          <Show when={total() > 1}>
            <div class="sk-lightbox__dots" role="tablist" aria-label="Image navigation">
              <For each={props.images}>
                {(_, i) => (
                  <button
                    type="button"
                    role="tab"
                    class={`sk-lightbox__dot${i() === currentIndex() ? ' sk-lightbox__dot--active' : ''}`}
                    aria-selected={i() === currentIndex()}
                    aria-label={`Image ${i() + 1} of ${total()}`}
                    onClick={() => setCurrentIndex(i())}
                  />
                )}
              </For>
            </div>
          </Show>

          {/* Counter */}
          <Show when={total() > 1}>
            <div class="sk-lightbox__counter" aria-live="polite">
              {currentIndex() + 1} / {total()}
            </div>
          </Show>
        </div>
      </Show>
    </Portal>
  );
};
