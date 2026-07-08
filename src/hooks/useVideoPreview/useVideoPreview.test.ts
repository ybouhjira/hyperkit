import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, createSignal } from 'solid-js';
import { useVideoPreview } from './useVideoPreview';
import { formatTime } from './formatTime';

// --- Mock helpers for video/canvas pipeline ---

interface MockVideoElement {
  src: string;
  crossOrigin: string;
  preload: string;
  currentTime: number;
  duration: number;
  videoWidth: number;
  videoHeight: number;
  listeners: Record<string, (() => void)[]>;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
  load: () => void;
}

interface MockCanvasContext {
  drawImage: ReturnType<typeof vi.fn>;
}

interface MockCanvas {
  width: number;
  height: number;
  getContext: (type: string) => MockCanvasContext | null;
  toBlob: (cb: (blob: Blob | null) => void, type?: string, quality?: number) => void;
}

function createMockVideoElement(opts?: {
  duration?: number;
  videoWidth?: number;
  videoHeight?: number;
}): MockVideoElement {
  return {
    src: '',
    crossOrigin: '',
    preload: '',
    currentTime: 0,
    duration: opts?.duration ?? 120,
    videoWidth: opts?.videoWidth ?? 1920,
    videoHeight: opts?.videoHeight ?? 1080,
    listeners: {},
    addEventListener(event: string, handler: () => void) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(handler);
    },
    removeEventListener(event: string, handler: () => void) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
      }
    },
    load: vi.fn(),
  };
}

function createMockCanvas(opts?: {
  contextReturnsNull?: boolean;
  blobReturnsNull?: boolean;
}): MockCanvas {
  const ctx: MockCanvasContext = {
    drawImage: vi.fn(),
  };
  return {
    width: 0,
    height: 0,
    getContext: (_type: string) => (opts?.contextReturnsNull ? null : ctx),
    toBlob: (cb: (blob: Blob | null) => void) => {
      if (opts?.blobReturnsNull) {
        cb(null);
      } else {
        cb(new Blob(['fake-image-data'], { type: 'image/jpeg' }));
      }
    },
  };
}

describe('hooks/useVideoPreview', () => {
  describe('formatTime', () => {
    it('should format 0 seconds', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should format seconds less than a minute', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(59)).toBe('0:59');
    });

    it('should format exactly one minute', () => {
      expect(formatTime(60)).toBe('1:00');
    });

    it('should format minutes and seconds', () => {
      expect(formatTime(61)).toBe('1:01');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(90)).toBe('1:30');
    });

    it('should format hours as minutes', () => {
      expect(formatTime(3661)).toBe('61:01');
      expect(formatTime(7200)).toBe('120:00');
    });

    it('should pad single-digit seconds with zero', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(601)).toBe('10:01');
    });

    it('should handle decimal seconds by flooring', () => {
      expect(formatTime(61.7)).toBe('1:01');
      expect(formatTime(125.9)).toBe('2:05');
    });

    it('should handle negative numbers', () => {
      expect(formatTime(-61)).toBe('-2:01');
    });
  });

  describe('useVideoPreview', () => {
    let mockVideo: MockVideoElement;
    let mockCanvas: MockCanvas;
    let origCreateElement: typeof document.createElement;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.restoreAllMocks();
      mockVideo = createMockVideoElement();
      mockCanvas = createMockCanvas();
      origCreateElement = document.createElement.bind(document);

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'video') return mockVideo as unknown as HTMLVideoElement;
        if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
        return origCreateElement(tag);
      });

      mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url');
      mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
      createRoot((dispose) => {
        const [src] = createSignal<string | undefined>();
        const preview = useVideoPreview(src);

        expect(preview.thumbnail()).toBeUndefined();
        expect(preview.duration()).toBe(0);
        expect(preview.width()).toBe(0);
        expect(preview.height()).toBe(0);
        expect(preview.loading()).toBe(false);
        expect(preview.error()).toBeUndefined();

        dispose();
      });
    });

    it('should not start loading when src is undefined', () => {
      createRoot((dispose) => {
        const [src] = createSignal<string | undefined>(undefined);
        const preview = useVideoPreview(src);

        expect(preview.loading()).toBe(false);
        expect(preview.error()).toBeUndefined();

        dispose();
      });
    });

    it('should have correct return type structure', () => {
      createRoot((dispose) => {
        const [src] = createSignal<string | undefined>();
        const preview = useVideoPreview(src);

        expect(typeof preview.thumbnail).toBe('function');
        expect(typeof preview.duration).toBe('function');
        expect(typeof preview.width).toBe('function');
        expect(typeof preview.height).toBe('function');
        expect(typeof preview.loading).toBe('function');
        expect(typeof preview.error).toBe('function');

        dispose();
      });
    });

    it('should start loading when src is provided', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('data:video/mp4;base64,test');
          const preview = useVideoPreview(src);

          // createEffect runs asynchronously, wait for it
          setTimeout(() => {
            expect(preview.loading()).toBe(true);
            expect(preview.error()).toBeUndefined();
            expect(mockVideo.src).toBe('data:video/mp4;base64,test');
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should set crossOrigin and preload on the video element', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          useVideoPreview(src);

          setTimeout(() => {
            expect(mockVideo.crossOrigin).toBe('anonymous');
            expect(mockVideo.preload).toBe('metadata');
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should extract duration and dimensions on loadedmetadata', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            const handler = mockVideo.listeners['loadedmetadata']?.[0];
            expect(handler).toBeDefined();
            handler();

            expect(preview.duration()).toBe(120);
            expect(preview.width()).toBe(1920);
            expect(preview.height()).toBe(1080);
            expect(mockVideo.currentTime).toBe(30);
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should extract thumbnail on seeked event', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            mockVideo.listeners['loadedmetadata']?.[0]();
            mockVideo.listeners['seeked']?.[0]();

            expect(preview.thumbnail()).toBe('blob:http://localhost/fake-blob-url');
            expect(preview.loading()).toBe(false);
            expect(mockCreateObjectURL).toHaveBeenCalled();
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should set error when blob creation returns null', async () => {
      mockCanvas = createMockCanvas({ blobReturnsNull: true });
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'video') return mockVideo as unknown as HTMLVideoElement;
        if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
        return origCreateElement(tag);
      });

      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            mockVideo.listeners['loadedmetadata']?.[0]();
            mockVideo.listeners['seeked']?.[0]();

            expect(preview.error()).toBe('Failed to create thumbnail blob');
            expect(preview.loading()).toBe(false);
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should set error when canvas context is not available', async () => {
      mockCanvas = createMockCanvas({ contextReturnsNull: true });
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'video') return mockVideo as unknown as HTMLVideoElement;
        if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
        return origCreateElement(tag);
      });

      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('data:video/mp4;base64,test');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            expect(preview.error()).toBe('Canvas 2D context not supported');
            expect(preview.loading()).toBe(false);
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should set error on video error event', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/bad-video.mp4');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            const handler = mockVideo.listeners['error']?.[0];
            expect(handler).toBeDefined();
            handler();

            expect(preview.error()).toBe('Failed to load video');
            expect(preview.loading()).toBe(false);
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should handle drawImage throwing an error', async () => {
      const throwingCtx: MockCanvasContext = {
        drawImage: vi.fn(() => {
          throw new Error('Security error: tainted canvas');
        }),
      };
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: () => throwingCtx,
        toBlob: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'video') return mockVideo as unknown as HTMLVideoElement;
        if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
        return origCreateElement(tag);
      });

      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          const preview = useVideoPreview(src);

          setTimeout(() => {
            mockVideo.listeners['loadedmetadata']?.[0]();
            mockVideo.listeners['seeked']?.[0]();

            expect(preview.error()).toBe('Security error: tainted canvas');
            expect(preview.loading()).toBe(false);
            dispose();
            resolve();
          }, 10);
        });
      });
    });

    it('should cleanup event listeners on dispose', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          useVideoPreview(src);

          setTimeout(() => {
            expect(mockVideo.listeners['loadedmetadata']?.length).toBe(1);
            expect(mockVideo.listeners['seeked']?.length).toBe(1);
            expect(mockVideo.listeners['error']?.length).toBe(1);

            dispose();

            expect(mockVideo.listeners['loadedmetadata']?.length).toBe(0);
            expect(mockVideo.listeners['seeked']?.length).toBe(0);
            expect(mockVideo.listeners['error']?.length).toBe(0);
            resolve();
          }, 10);
        });
      });
    });

    it('should revoke previous blob URL on cleanup', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          useVideoPreview(src);

          setTimeout(() => {
            // Generate a thumbnail
            mockVideo.listeners['loadedmetadata']?.[0]();
            mockVideo.listeners['seeked']?.[0]();

            dispose();

            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-blob-url');
            resolve();
          }, 10);
        });
      });
    });

    it('should clear video src and call load on cleanup', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          useVideoPreview(src);

          setTimeout(() => {
            dispose();

            expect(mockVideo.src).toBe('');
            expect(mockVideo.load).toHaveBeenCalled();
            resolve();
          }, 10);
        });
      });
    });

    it('should reset state when src changes to undefined', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src, setSrc] = createSignal<string | undefined>('data:video/mp4;base64,test');
          const preview = useVideoPreview(src);

          // Change to undefined
          setSrc(undefined);

          setTimeout(() => {
            expect(preview.thumbnail()).toBeUndefined();
            expect(preview.duration()).toBe(0);
            expect(preview.width()).toBe(0);
            expect(preview.height()).toBe(0);
            expect(preview.loading()).toBe(false);
            expect(preview.error()).toBeUndefined();
            dispose();
            resolve();
          }, 0);
        });
      });
    });

    it('should set canvas dimensions to match video', async () => {
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          const [src] = createSignal<string | undefined>('http://example.com/video.mp4');
          useVideoPreview(src);

          setTimeout(() => {
            mockVideo.listeners['loadedmetadata']?.[0]();

            expect(mockCanvas.width).toBe(1920);
            expect(mockCanvas.height).toBe(1080);
            dispose();
            resolve();
          }, 10);
        });
      });
    });
  });
});
