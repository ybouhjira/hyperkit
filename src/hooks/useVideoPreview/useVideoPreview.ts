import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js';

export interface UseVideoPreviewReturn {
  /** Object URL of extracted thumbnail */
  thumbnail: Accessor<string | undefined>;
  /** Duration in seconds */
  duration: Accessor<number>;
  /** Video width in pixels */
  width: Accessor<number>;
  /** Video height in pixels */
  height: Accessor<number>;
  /** Whether extraction is in progress */
  loading: Accessor<boolean>;
  /** Error message if extraction failed */
  error: Accessor<string | undefined>;
}

/**
 * Hook for extracting video preview metadata (thumbnail, duration, dimensions)
 *
 * @param src - Reactive video source URL
 * @returns Video preview metadata and loading state
 *
 * @example
 * ```tsx
 * import { createSignal } from 'solid-js';
 * import { useVideoPreview } from '@ybouhjira/hyperkit';
 *
 * function VideoPreview() {
 *   const [videoSrc, setVideoSrc] = createSignal<string | undefined>();
 *   const preview = useVideoPreview(videoSrc);
 *
 *   return (
 *     <div>
 *       <Show when={preview.loading()}>Loading...</Show>
 *       <Show when={preview.error()}>
 *         <p>Error: {preview.error()}</p>
 *       </Show>
 *       <Show when={preview.thumbnail()}>
 *         <img src={preview.thumbnail()} alt="Video thumbnail" />
 *         <p>Duration: {preview.duration()}s</p>
 *         <p>Dimensions: {preview.width()}x{preview.height()}</p>
 *       </Show>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideoPreview(src: Accessor<string | undefined>): UseVideoPreviewReturn {
  const [thumbnail, setThumbnail] = createSignal<string | undefined>();
  const [duration, setDuration] = createSignal(0);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  createEffect(() => {
    const videoSrc = src();

    // Reset state when src is undefined
    if (!videoSrc) {
      setThumbnail(undefined);
      setDuration(0);
      setWidth(0);
      setHeight(0);
      setLoading(false);
      setError(undefined);
      return;
    }

    // Start loading
    setLoading(true);
    setError(undefined);

    // Create hidden video element
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    // Create canvas for thumbnail extraction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Canvas 2D context not supported');
      setLoading(false);
      return;
    }

    // Clean up object URLs on disposal
    onCleanup(() => {
      const currentThumbnail = thumbnail();
      if (currentThumbnail && currentThumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(currentThumbnail);
      }
      video.src = '';
      video.load(); // Release resources
    });

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setWidth(video.videoWidth);
      setHeight(video.videoHeight);

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to 25% for thumbnail
      video.currentTime = video.duration * 0.25;
    };

    // Handle seek completed
    const handleSeeked = () => {
      try {
        // Draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG data URL
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const objectURL = URL.createObjectURL(blob);
              setThumbnail(objectURL);
            } else {
              setError('Failed to create thumbnail blob');
            }
            setLoading(false);
          },
          'image/jpeg',
          0.7
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract thumbnail');
        setLoading(false);
      }
    };

    // Handle error
    const handleError = () => {
      setError('Failed to load video');
      setLoading(false);
    };

    // Attach event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    // Start loading video
    video.src = videoSrc;

    // Cleanup event listeners on disposal
    onCleanup(() => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    });
  });

  return {
    thumbnail,
    duration,
    width,
    height,
    loading,
    error,
  };
}
