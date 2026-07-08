/**
 * perfStore — HyperKit DevTools Performance backend.
 *
 * One rAF loop drives a 4-second frame ring buffer + a spike log
 * (frames > 25ms with timestamp + active-anim count + active-screen
 * context). Used by `PerfTab` to render the live graph, histogram, and
 * spike log inside the DevTools panel.
 *
 * Store is module-singleton — every consumer shares the same loop. Safe
 * to import many times; `startPerfStore()` is idempotent.
 */

import { createSignal } from 'solid-js';

const FRAME_WINDOW = 240;          // ~4s at 60Hz
const SPIKE_THRESHOLD_MS = 25;     // ~1.5 frames at 60Hz — a real drop
const MAX_SPIKES = 100;

export interface PerfSpike {
  /** ms since unix epoch */
  ts: number;
  /** frame-delta in ms */
  ms: number;
  /** rough context — what was happening when the frame stuttered */
  context: {
    animations: number;
    screen: string;
  };
}

const frames = new Float32Array(FRAME_WINDOW);
let writePos = 0;
let started = false;
let lastT = 0;

const [fps, setFps] = createSignal(0);
const [avgMs, setAvgMs] = createSignal(0);
const [maxMs, setMaxMs] = createSignal(0);
const [spikes, setSpikes] = createSignal<PerfSpike[]>([]);
const [running, setRunning] = createSignal(false);

export { fps, avgMs, maxMs, spikes, running };

/** Snapshot of the current frame ring buffer (caller-owned copy). */
export function getFrames(): number[] {
  const out: number[] = [];
  for (let i = 0; i < FRAME_WINDOW; i++) {
    const idx = (writePos + i) % FRAME_WINDOW;
    out.push(frames[idx] ?? 0);
  }
  return out;
}

/**
 * Best-effort active-screen guess for spike context. Avoids hard
 * dependency on any framework router — just looks at common screen-class
 * conventions.
 */
function activeScreenId(): string {
  if (typeof document === 'undefined') return '';
  const main = document.querySelector('main.screen [class*=screen]');
  if (!main) return '';
  const cls = (main.className || '').toString().split(/\s+/);
  return cls.find((c) => c.endsWith('-screen') || c.endsWith('Screen')) ?? '';
}

function tick(now: number): void {
  if (lastT !== 0) {
    const d = now - lastT;
    frames[writePos] = d;
    writePos = (writePos + 1) % FRAME_WINDOW;

    if (d > SPIKE_THRESHOLD_MS && now > 1000) {
      const ctx: PerfSpike = {
        ts: Date.now(),
        ms: d,
        context: {
          animations:
            typeof document !== 'undefined' ? document.getAnimations().length : 0,
          screen: activeScreenId(),
        },
      };
      setSpikes((prev) => {
        const next = [ctx, ...prev];
        return next.length > MAX_SPIKES ? next.slice(0, MAX_SPIKES) : next;
      });
    }

    // Recompute aggregates every ~6 frames so consumer reactivity doesn't
    // itself create jank.
    if ((writePos % 6) === 0) {
      let sum = 0, mx = 0, count = 0;
      for (let i = 0; i < FRAME_WINDOW; i++) {
        const v = frames[i];
        if (v === undefined || v <= 0) continue;
        sum += v;
        if (v > mx) mx = v;
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      setAvgMs(avg);
      setMaxMs(mx);
      setFps(avg > 0 ? Math.round(1000 / avg) : 0);
    }
  }
  lastT = now;
  requestAnimationFrame(tick);
}

export function startPerfStore(): void {
  if (started) return;
  started = true;
  setRunning(true);
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(tick);
  }
}

export function clearSpikes(): void {
  setSpikes([]);
}

/** Histogram bucket counts: <16ms / 16-25ms / 25-50ms / 50ms+. */
export function getHistogram(): Record<'<16ms' | '16-25ms' | '25-50ms' | '50ms+', number> {
  let a = 0, b = 0, c = 0, d = 0;
  for (let i = 0; i < FRAME_WINDOW; i++) {
    const v = frames[i];
    if (v === undefined || v <= 0) continue;
    if (v < 16) a++;
    else if (v < 25) b++;
    else if (v < 50) c++;
    else d++;
  }
  return { '<16ms': a, '16-25ms': b, '25-50ms': c, '50ms+': d };
}
