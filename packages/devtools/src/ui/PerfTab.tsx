/**
 * PerfTab — DevTools Performance tab.
 *
 * Reads from `../perf/perfStore`. Built with HyperKit primitives + only
 * `--sk-*` tokens — no hardcoded colors, sizes, or spacing per HyperKit
 * conventions. Shape:
 *
 *   1. Hero row     — current FPS + avg + max + good-frames %
 *   2. Frame graph  — live canvas with 60Hz/30Hz gridlines + spike dots
 *   3. Histogram    — bucket badges (<16/16-25/25-50/50+ ms)
 *   4. Spike log    — last 100 dropped frames with context
 */

import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  type JSX,
} from 'solid-js';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Flex,
  Stack,
  StatusDot,
  Text,
} from '@ybouhjira/hyperkit';
import {
  fps,
  avgMs,
  maxMs,
  spikes,
  startPerfStore,
  clearSpikes,
  getFrames,
  getHistogram,
  type PerfSpike,
} from '../perf/perfStore';

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

function fmtAge(ts: number, now: number): string {
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

function spikeVariant(ms: number): 'warning' | 'danger' {
  return ms >= 50 ? 'danger' : 'warning';
}

function fpsStatus(): 'success' | 'warning' | 'danger' {
  const f = fps();
  if (f >= 55) return 'success';
  if (f >= 30) return 'warning';
  return 'danger';
}

export function PerfTab(): JSX.Element {
  const [now, setNow] = createSignal(Date.now());
  let canvas: HTMLCanvasElement | undefined;

  onMount(() => {
    startPerfStore();
    const tickerId = window.setInterval(() => setNow(Date.now()), 1000);
    let raf = 0;
    const drawLoop = (): void => {
      drawGraph();
      raf = requestAnimationFrame(drawLoop);
    };
    raf = requestAnimationFrame(drawLoop);
    onCleanup(() => {
      window.clearInterval(tickerId);
      cancelAnimationFrame(raf);
    });
  });

  /* v8 ignore start — canvas drawing not asserted via testing-library */
  const drawGraph = (): void => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cap = 60;
    const drawGrid = (ms: number, color: string, label: string): void => {
      const y = h - (ms / cap) * h;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = '10px monospace';
      ctx.fillText(label, 6, y - 2);
    };

    // Pull current --sk-* token values so the canvas matches the active theme
    const root = getComputedStyle(document.documentElement);
    const okColor = root.getPropertyValue('--sk-success').trim() || 'rgba(43,172,118,0.6)';
    const warnColor = root.getPropertyValue('--sk-warning').trim() || 'rgba(236,178,46,0.6)';
    const lineColor = root.getPropertyValue('--sk-info').trim() || '#36c5f0';
    const errColor = root.getPropertyValue('--sk-error').trim() || '#e01e5a';

    drawGrid(16.67, okColor, '60Hz · 16.7ms');
    drawGrid(33.3, warnColor, '30Hz · 33ms');

    const samples = getFrames();
    const sw = samples.length;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < sw; i++) {
      const v = samples[i] ?? 0;
      if (v === 0) continue;
      const x = (i / (sw - 1)) * w;
      const y = h - (Math.min(v, cap) / cap) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = errColor;
    for (let i = 0; i < sw; i++) {
      const v = samples[i] ?? 0;
      if (v < 25) continue;
      const x = (i / (sw - 1)) * w;
      const y = h - (Math.min(v, cap) / cap) * h;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  /* v8 ignore stop */

  const histogram = (): ReturnType<typeof getHistogram> => {
    void now();             // reactive — recompute every 1s tick
    return getHistogram();
  };

  const totalFrames = createMemo(() => {
    const h = histogram();
    return h['<16ms'] + h['16-25ms'] + h['25-50ms'] + h['50ms+'];
  });

  const goodPct = createMemo(() => {
    const h = histogram();
    const t = totalFrames();
    return t > 0 ? Math.round((h['<16ms'] / t) * 100) : 0;
  });

  return (
    <div class="sk-devtools-perf" data-testid="devtools-perf-tab">
      <Stack gap="md">
        {/* Hero */}
        <Card variant="outlined" padding="md">
          <Flex align="center" gap="md">
            <Stack gap="xs">
              <Flex align="baseline" gap="sm">
                <Text size="2xl" weight="semibold" data-testid="perf-fps">
                  {fps()}
                </Text>
                <Text size="sm" color="muted">fps</Text>
                <StatusDot status={fpsStatus()} size="md" />
              </Flex>
              <Text size="xs" color="muted">
                avg <span data-testid="perf-avg">{avgMs().toFixed(1)}</span>ms ·
                max <span data-testid="perf-max">{maxMs().toFixed(0)}</span>ms
              </Text>
            </Stack>
            <Stack gap="xs" align="end">
              <Text size="sm" weight="semibold" data-testid="perf-good-pct">
                {goodPct()}%
              </Text>
              <Text size="xs" color="muted">frames at 60Hz target</Text>
            </Stack>
          </Flex>
        </Card>

        {/* Live frame-time graph */}
        <Card variant="outlined" padding="sm">
          <Stack gap="xs">
            <Flex align="center" gap="sm">
              <Text size="xs" weight="semibold" color="muted">
                FRAME-TIME · LAST 4s
              </Text>
              <Text size="xs" color="muted">red dots = dropped (&gt;25ms)</Text>
            </Flex>
            <canvas
              ref={canvas}
              width={1200}
              height={140}
              data-testid="perf-canvas"
            />
          </Stack>
        </Card>

        {/* Histogram */}
        <Card variant="outlined" padding="md">
          <Stack gap="sm">
            <Text size="xs" weight="semibold" color="muted">
              FRAME-TIME DISTRIBUTION
            </Text>
            <Flex gap="md" wrap="wrap">
              <Stack gap="xs">
                <Badge variant="success" size="md" data-testid="perf-bucket-good">
                  &lt;16ms · {histogram()['<16ms']}
                </Badge>
                <Text size="xs" color="muted">smooth (60Hz)</Text>
              </Stack>
              <Stack gap="xs">
                <Badge variant="info" size="md" data-testid="perf-bucket-ok">
                  16-25ms · {histogram()['16-25ms']}
                </Badge>
                <Text size="xs" color="muted">slight stutter</Text>
              </Stack>
              <Stack gap="xs">
                <Badge variant="warning" size="md" data-testid="perf-bucket-jank">
                  25-50ms · {histogram()['25-50ms']}
                </Badge>
                <Text size="xs" color="muted">visible jank</Text>
              </Stack>
              <Stack gap="xs">
                <Badge variant="danger" size="md" data-testid="perf-bucket-bad">
                  50ms+ · {histogram()['50ms+']}
                </Badge>
                <Text size="xs" color="muted">freeze</Text>
              </Stack>
            </Flex>
          </Stack>
        </Card>

        {/* Spike log */}
        <Card variant="outlined" padding="md">
          <Stack gap="sm">
            <Flex align="center" gap="sm">
              <Text size="xs" weight="semibold" color="muted">
                SPIKE LOG · LAST 100
              </Text>
              <Badge variant="soft" size="xs" data-testid="perf-spike-count">
                {spikes().length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                disabled={spikes().length === 0}
                onClick={clearSpikes}
                data-testid="perf-clear-spikes"
              >
                Clear
              </Button>
            </Flex>
            <Show
              when={spikes().length > 0}
              fallback={
                <EmptyState
                  title="No spikes recorded"
                  description="Frames dropped above 25ms will appear here."
                />
              }
            >
              <Stack gap="xs">
                <For each={spikes()}>
                  {(s: PerfSpike) => (
                    <Card
                      variant="outlined"
                      padding="sm"
                      data-testid="perf-spike"
                    >
                      <Flex align="center" gap="sm">
                        <Badge variant={spikeVariant(s.ms)} size="sm">
                          {s.ms.toFixed(0)}ms
                        </Badge>
                        <Text size="xs" color="muted">
                          {fmtTime(s.ts)} · {fmtAge(s.ts, now())}
                        </Text>
                        <Show when={s.context.screen}>
                          <Badge variant="soft" size="xs">
                            {s.context.screen}
                          </Badge>
                        </Show>
                        <Text size="xs" color="muted">
                          {s.context.animations} anims
                        </Text>
                      </Flex>
                    </Card>
                  )}
                </For>
              </Stack>
            </Show>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
