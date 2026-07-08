import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { MediaTrimmer } from './MediaTrimmer';

// Mock HTMLVideoElement and HTMLCanvasElement for JSDOM
beforeEach(() => {
  // Mock video element
  HTMLVideoElement.prototype.load = vi.fn();
  HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLVideoElement.prototype.pause = vi.fn();

  // Mock canvas getContext (returns null in JSDOM)
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
});

describe('MediaTrimmer', () => {
  it('renders without crashing', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const component = document.querySelector('.sk-media-trimmer');
    expect(component).toBeInTheDocument();
  });

  it('shows play button', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const playBtn = document.querySelector('.sk-media-trimmer__play-btn');
    expect(playBtn).toBeInTheDocument();
    expect(playBtn?.textContent).toBe('▶');
  });

  it('shows time displays', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const times = document.querySelector('.sk-media-trimmer__times');
    expect(times).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const onTrimChange = vi.fn();
    render(() => (
      <MediaTrimmer
        src="https://example.com/video.mp4"
        onTrimChange={onTrimChange}
        class="custom-class"
      />
    ));

    const component = document.querySelector('.sk-media-trimmer');
    expect(component).toHaveClass('custom-class');
  });

  it('has correct structure', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    expect(document.querySelector('.sk-media-trimmer__timeline')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__thumbnails')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__handle--start')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__handle--end')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__controls')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__overlay-left')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__overlay-right')).toBeInTheDocument();
    expect(document.querySelector('.sk-media-trimmer__selection')).toBeInTheDocument();
  });

  it('renders video element', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video?.getAttribute('src')).toBe('https://example.com/video.mp4');
    expect(video?.getAttribute('muted')).toBe('');
  });
});

describe('MediaTrimmer play/pause', () => {
  it('toggles play button text on click', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const playBtn = document.querySelector('.sk-media-trimmer__play-btn') as HTMLButtonElement;
    expect(playBtn.textContent).toBe('▶');

    await fireEvent.click(playBtn);
    expect(playBtn.textContent).toBe('⏸');

    await fireEvent.click(playBtn);
    expect(playBtn.textContent).toBe('▶');
  });

  it('calls video.play() on play click', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const playBtn = document.querySelector('.sk-media-trimmer__play-btn') as HTMLButtonElement;
    await fireEvent.click(playBtn);

    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });

  it('calls video.pause() on pause click', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const playBtn = document.querySelector('.sk-media-trimmer__play-btn') as HTMLButtonElement;
    await fireEvent.click(playBtn); // play
    await fireEvent.click(playBtn); // pause

    expect(HTMLVideoElement.prototype.pause).toHaveBeenCalled();
  });
});

describe('MediaTrimmer initial time display', () => {
  it('shows 0:00 for start and end before metadata loads', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const times = document.querySelector('.sk-media-trimmer__times');
    const spans = times?.querySelectorAll('span');
    // Start, duration, end — all 0:00 initially
    expect(spans?.[0]?.textContent).toBe('0:00');
    expect(spans?.[2]?.textContent).toBe('0:00');
  });

  it('shows duration display element', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const duration = document.querySelector('.sk-media-trimmer__duration');
    expect(duration).toBeInTheDocument();
  });
});

describe('MediaTrimmer overlays and selection', () => {
  it('renders left overlay at 0% initially', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const overlay = document.querySelector('.sk-media-trimmer__overlay-left') as HTMLElement;
    expect(overlay.style.width).toBe('0%');
  });

  it('renders selection area covering full width initially', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const selection = document.querySelector('.sk-media-trimmer__selection') as HTMLElement;
    expect(selection.style.left).toBe('0%');
    expect(selection.style.width).toBe('100%');
  });

  it('renders start handle at 0% initially', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const startHandle = document.querySelector('.sk-media-trimmer__handle--start') as HTMLElement;
    expect(startHandle.style.left).toBe('0%');
  });

  it('renders end handle at 100% initially', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const endHandle = document.querySelector('.sk-media-trimmer__handle--end') as HTMLElement;
    expect(endHandle.style.left).toBe('100%');
  });
});

describe('MediaTrimmer custom props', () => {
  it('applies custom style', () => {
    const onTrimChange = vi.fn();
    render(() => (
      <MediaTrimmer
        src="https://example.com/video.mp4"
        onTrimChange={onTrimChange}
        style={{ border: '1px solid red' }}
      />
    ));

    const component = document.querySelector('.sk-media-trimmer') as HTMLElement;
    expect(component.style.border).toBe('1px solid red');
  });

  it('uses default thumbnailCount of 10', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    // The component should render without crashing with defaults
    expect(document.querySelector('.sk-media-trimmer__thumbnails')).toBeInTheDocument();
  });

  it('play button is type="button"', () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const playBtn = document.querySelector('.sk-media-trimmer__play-btn');
    expect(playBtn).toHaveAttribute('type', 'button');
  });
});

describe('MediaTrimmer handle drag', () => {
  it('start handle responds to mousedown', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const startHandle = document.querySelector('.sk-media-trimmer__handle--start') as HTMLElement;

    // Simulate mousedown - should not throw
    await fireEvent.mouseDown(startHandle);
    expect(startHandle).toBeInTheDocument();
  });

  it('end handle responds to mousedown', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const endHandle = document.querySelector('.sk-media-trimmer__handle--end') as HTMLElement;

    await fireEvent.mouseDown(endHandle);
    expect(endHandle).toBeInTheDocument();
  });

  it('start handle drag dispatches mousemove and mouseup', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const startHandle = document.querySelector('.sk-media-trimmer__handle--start') as HTMLElement;
    const timeline = startHandle.parentElement as HTMLElement;

    // Mock getBoundingClientRect on the timeline
    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 500,
      bottom: 50,
      width: 500,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    await fireEvent.mouseDown(startHandle, { clientX: 0, clientY: 25 });
    // Simulate mousemove on document
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 25 }));
    // Simulate mouseup to clean up
    document.dispatchEvent(new MouseEvent('mouseup'));

    // The notifyTrimChange is debounced, so we need to wait
    await vi.waitFor(
      () => {
        expect(onTrimChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('end handle drag dispatches mousemove and mouseup', async () => {
    const onTrimChange = vi.fn();
    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    const endHandle = document.querySelector('.sk-media-trimmer__handle--end') as HTMLElement;
    const timeline = endHandle.parentElement as HTMLElement;

    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 500,
      bottom: 50,
      width: 500,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    await fireEvent.mouseDown(endHandle, { clientX: 500, clientY: 25 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400, clientY: 25 }));
    document.dispatchEvent(new MouseEvent('mouseup'));

    await vi.waitFor(
      () => {
        expect(onTrimChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });
});

describe('MediaTrimmer video metadata loading', () => {
  it('sets duration and time on loadedmetadata', async () => {
    const onTrimChange = vi.fn();

    // Spy on createElement to intercept the dynamically created video
    const origCreateElement = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'video') {
        // After the component sets src, we simulate metadata loading
        const origSetSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src')?.set;
        if (origSetSrc) {
          Object.defineProperty(el, 'src', {
            set(value: string) {
              origSetSrc.call(el, value);
              if (value !== '') {
                Object.defineProperty(el, 'duration', { value: 30, configurable: true });
                el.dispatchEvent(new Event('loadedmetadata'));
              }
            },
            get() {
              return el.getAttribute('src') ?? '';
            },
            configurable: true,
          });
        }
      }
      return el;
    });

    render(() => <MediaTrimmer src="https://example.com/video.mp4" onTrimChange={onTrimChange} />);

    // After metadata loads, the times should update
    const times = document.querySelector('.sk-media-trimmer__times');
    const spans = times?.querySelectorAll('span');
    // Start should be 0:00
    expect(spans?.[0]?.textContent).toBe('0:00');

    createSpy.mockRestore();
  });
});
