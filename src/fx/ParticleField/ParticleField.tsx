import {
  type Component,
  type JSX,
  splitProps,
  onMount,
  onCleanup,
  createSignal,
  untrack,
} from 'solid-js';
import './ParticleField.css';

export interface ParticleFieldProps {
  /**
   * Number of particles
   * @default 50
   */
  count?: number;
  /**
   * Particle color (CSS color value)
   * @default 'var(--sk-accent)'
   */
  color?: string;
  /**
   * Particle movement speed (0-1)
   * @default 0.3
   */
  speed?: number;
  /**
   * Maximum particle size in pixels
   * @default 3
   */
  size?: number;
  /**
   * Draw lines between nearby particles
   * @default true
   */
  connections?: boolean;
  /**
   * Max distance in pixels to draw connection lines
   * @default 100
   */
  connectionDistance?: number;
  /**
   * Particles attract toward mouse position
   * @default true
   */
  interactive?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function resolveColor(canvas: HTMLCanvasElement, cssColor: string): string {
  // Handle CSS custom properties by measuring from a temporary element
  if (!cssColor.includes('var(')) return cssColor;
  const temp = document.createElement('div');
  temp.style.color = cssColor;
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  canvas.parentElement?.appendChild(temp);
  const resolved = getComputedStyle(temp).color;
  temp.remove();
  return resolved || '#888';
}

/**
 * ParticleField - Canvas-based floating particle animation.
 *
 * @example
 * ```tsx
 * <ParticleField count={80} connections interactive style={{ height: '400px' }} />
 * ```
 */
export const ParticleField: Component<ParticleFieldProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'count',
    'color',
    'speed',
    'size',
    'connections',
    'connectionDistance',
    'interactive',
    'class',
    'style',
  ]);

  const count = () => local.count ?? 50;
  const color = () => local.color ?? 'var(--sk-accent)';
  const speed = () => local.speed ?? 0.3;
  const maxSize = () => local.size ?? 3;
  const connections = () => local.connections ?? true;
  const connectionDistance = () => local.connectionDistance ?? 100;
  const interactive = () => local.interactive ?? true;

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia != null
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  let canvasRef: HTMLCanvasElement | undefined;
  let rafId: number | undefined;
  const [mousePos, setMousePos] = createSignal({ x: -9999, y: -9999 });

  let particles: Particle[] = [];

  const initParticles = (w: number, h: number) => {
    const particleCount = prefersReducedMotion ? Math.floor(untrack(count) * 0.3) : untrack(count);
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * untrack(speed) * 2,
      vy: (Math.random() - 0.5) * untrack(speed) * 2,
      size: Math.random() * untrack(maxSize) + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  };

  onMount(() => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
      initParticles(canvas.width, canvas.height);
    });

    resizeObserver.observe(canvas.parentElement ?? canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles(canvas.width, canvas.height);

    const resolvedColor = resolveColor(canvas, color());

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mouse = mousePos();

      for (const p of particles) {
        // Mouse attraction
        if (interactive() && !prefersReducedMotion) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.02;
            p.vy += (dy / dist) * force * 0.02;
          }
        }

        // Velocity damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Update position
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Draw connections
      if (connections() && !prefersReducedMotion) {
        const dist = connectionDistance();
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            if (!a || !b) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < dist) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = resolvedColor;
              ctx.globalAlpha = (1 - d / dist) * 0.3;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);

    onCleanup(() => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    });
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -9999, y: -9999 });
  };

  const classes = () => ['sk-particle-field', local.class].filter(Boolean).join(' ');

  const inlineStyle = (): JSX.CSSProperties => ({
    ...local.style,
  });

  return (
    <div class={classes()} style={inlineStyle()} {...rest}>
      <canvas
        ref={canvasRef}
        class="sk-particle-field__canvas"
        onMouseMove={(e: MouseEvent) => {
          if (interactive()) handleMouseMove(e);
        }}
        onMouseLeave={() => {
          if (interactive()) handleMouseLeave();
        }}
      />
    </div>
  );
};
