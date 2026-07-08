import {
  createSignal,
  createEffect,
  onCleanup,
  mergeProps,
  splitProps,
  For,
  type JSX,
} from 'solid-js';
import { formatTime } from '../../hooks/useVideoPreview/formatTime';
import './MediaTrimmer.css';

export interface MediaTrimmerProps {
  src: string;
  onTrimChange: (start: number, end: number) => void;
  thumbnailCount?: number;
  minDuration?: number;
  class?: string;
  style?: JSX.CSSProperties;
}

export function MediaTrimmer(props: MediaTrimmerProps) {
  const merged = mergeProps({ thumbnailCount: 10, minDuration: 1 }, props);
  const [local] = splitProps(merged, [
    'src',
    'onTrimChange',
    'thumbnailCount',
    'minDuration',
    'class',
    'style',
  ]);

  const [thumbnails, setThumbnails] = createSignal<string[]>([]);
  const [startTime, setStartTime] = createSignal(0);
  const [endTime, setEndTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  let videoRef: HTMLVideoElement | undefined;
  let debounceTimeout: number | undefined;

  // Load video and extract thumbnails
  createEffect(() => {
    const src = local.src;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;

    const extractThumbnails = async (dur: number) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx === null) {
        // JSDOM environment - can't extract thumbnails
        return;
      }

      canvas.width = 160;
      canvas.height = 90;

      const thumbs: string[] = [];
      const count = local.thumbnailCount;

      for (let i = 0; i < count; i++) {
        const time = (dur / count) * i;
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            thumbs.push(dataUrl);
            video.removeEventListener('seeked', handleSeeked);
            resolve();
          };
          video.addEventListener('seeked', handleSeeked);
        });
      }

      setThumbnails(thumbs);
    };

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);
      void extractThumbnails(dur);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.src = src;

    onCleanup(() => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.src = '';
    });
  });

  // Debounced trim change callback
  const notifyTrimChange = (start: number, end: number) => {
    if (debounceTimeout !== undefined) {
      clearTimeout(debounceTimeout);
    }
    const callback = local.onTrimChange;
    debounceTimeout = window.setTimeout(() => {
      callback(start, end);
    }, 300);
  };

  // Handle playback
  const togglePlayback = () => {
    if (!videoRef) return;

    if (isPlaying()) {
      videoRef.pause();
      setIsPlaying(false);
    } else {
      videoRef.currentTime = startTime();
      void videoRef.play();
      setIsPlaying(true);
    }
  };

  // Monitor playback to loop within range
  createEffect(() => {
    const ref = videoRef;
    if (ref === undefined) return;

    const handleTimeUpdate = () => {
      if (ref.currentTime >= endTime()) {
        ref.currentTime = startTime();
      }
    };

    ref.addEventListener('timeupdate', handleTimeUpdate);
    onCleanup(() => {
      ref.removeEventListener('timeupdate', handleTimeUpdate);
    });
  });

  // Drag handling
  const handleStartDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const timeline = (e.currentTarget as HTMLElement | null)?.parentElement;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0]?.clientX : moveEvent.clientX;
      if (clientX === undefined) return;

      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newStart = percent * duration();
      const maxStart = endTime() - local.minDuration;

      const clampedStart = Math.max(0, Math.min(maxStart, newStart));
      setStartTime(clampedStart);
      notifyTrimChange(clampedStart, endTime());
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  const handleEndDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const timeline = (e.currentTarget as HTMLElement | null)?.parentElement;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0]?.clientX : moveEvent.clientX;
      if (clientX === undefined) return;

      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newEnd = percent * duration();
      const minEnd = startTime() + local.minDuration;

      const clampedEnd = Math.min(duration(), Math.max(minEnd, newEnd));
      setEndTime(clampedEnd);
      notifyTrimChange(startTime(), clampedEnd);
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  // Computed percentages
  const startPercent = () => (duration() > 0 ? (startTime() / duration()) * 100 : 0);
  const endPercent = () => (duration() > 0 ? (endTime() / duration()) * 100 : 100);

  return (
    <div class={`sk-media-trimmer ${local.class || ''}`} style={local.style}>
      <div class="sk-media-trimmer__preview">
        <video ref={videoRef} src={local.src} muted style={{ display: 'none' }} />
      </div>

      <div class="sk-media-trimmer__timeline">
        <div class="sk-media-trimmer__thumbnails">
          <For each={thumbnails()}>
            {(thumb) => <img class="sk-media-trimmer__thumb" src={thumb} alt="Thumbnail" />}
          </For>
        </div>

        <div class="sk-media-trimmer__overlay-left" style={{ width: `${startPercent()}%` }} />
        <div
          class="sk-media-trimmer__overlay-right"
          style={{ left: `${endPercent()}%`, width: `${100 - endPercent()}%` }}
        />

        <div
          class="sk-media-trimmer__handle sk-media-trimmer__handle--start"
          style={{ left: `${startPercent()}%` }}
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
        />
        <div
          class="sk-media-trimmer__handle sk-media-trimmer__handle--end"
          style={{ left: `${endPercent()}%` }}
          onMouseDown={handleEndDrag}
          onTouchStart={handleEndDrag}
        />

        <div
          class="sk-media-trimmer__selection"
          style={{
            left: `${startPercent()}%`,
            width: `${endPercent() - startPercent()}%`,
          }}
        />
      </div>

      <div class="sk-media-trimmer__controls">
        <button class="sk-media-trimmer__play-btn" onClick={togglePlayback} type="button">
          {isPlaying() ? '⏸' : '▶'}
        </button>
        <div class="sk-media-trimmer__times">
          <span>{formatTime(startTime())}</span>
          <span class="sk-media-trimmer__duration">{formatTime(endTime() - startTime())}</span>
          <span>{formatTime(endTime())}</span>
        </div>
      </div>
    </div>
  );
}
