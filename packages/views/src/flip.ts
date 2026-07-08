/** FLIP (First, Last, Invert, Play) animation utilities for shape transitions */

/** Position and dimensions of an element */
export interface ElementRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Recorded state of a field before transition */
export interface FlipSnapshot {
  readonly fieldName: string;
  readonly rect: ElementRect;
  readonly opacity: number;
}

/** FLIP animation options */
export interface FlipOptions {
  /** Animation duration in ms */
  readonly duration?: number;
  /** Easing function (CSS easing string) */
  readonly easing?: string;
  /** Elements entering (not in source) fade in */
  readonly fadeInDuration?: number;
  /** Elements leaving (not in target) fade out */
  readonly fadeOutDuration?: number;
}

/** Transition state for tracking animations */
export interface FlipTransition {
  /** Snapshot of source positions */
  readonly sourceSnapshot: readonly FlipSnapshot[];
  /** Whether the transition is currently animating */
  readonly animating: boolean;
}

const DEFAULT_FLIP_OPTIONS: Required<FlipOptions> = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  fadeInDuration: 200,
  fadeOutDuration: 150,
};

/** Record positions of all data-field elements within a container */
export const captureSnapshot = (container: Element): readonly FlipSnapshot[] => {
  const fields = container.querySelectorAll('[data-field]');
  const snapshots: FlipSnapshot[] = [];

  fields.forEach((el) => {
    const fieldName = el.getAttribute('data-field');
    if (!fieldName) return;

    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    snapshots.push({
      fieldName,
      rect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      opacity: parseFloat(style.opacity) || 1,
    });
  });

  return snapshots;
};

/** Get the delta between two rects */
export const calculateDelta = (
  first: ElementRect,
  last: ElementRect,
): { dx: number; dy: number; sw: number; sh: number } => ({
  dx: first.x - last.x,
  dy: first.y - last.y,
  sw: first.width / (last.width || 1),
  sh: first.height / (last.height || 1),
});

/** Classify fields into shared, entering, and leaving */
export const classifyFields = (
  source: readonly FlipSnapshot[],
  target: readonly FlipSnapshot[],
): {
  readonly shared: ReadonlyArray<{ field: string; source: FlipSnapshot; target: FlipSnapshot }>;
  readonly entering: readonly FlipSnapshot[];
  readonly leaving: readonly FlipSnapshot[];
} => {
  const sourceMap = new Map(source.map((s) => [s.fieldName, s]));
  const targetMap = new Map(target.map((s) => [s.fieldName, s]));

  const shared: Array<{ field: string; source: FlipSnapshot; target: FlipSnapshot }> = [];
  const entering: FlipSnapshot[] = [];
  const leaving: FlipSnapshot[] = [];

  for (const t of target) {
    const s = sourceMap.get(t.fieldName);
    if (s) {
      shared.push({ field: t.fieldName, source: s, target: t });
    } else {
      entering.push(t);
    }
  }

  for (const s of source) {
    if (!targetMap.has(s.fieldName)) {
      leaving.push(s);
    }
  }

  return { shared, entering, leaving };
};

/** Apply FLIP animation to a container after DOM has changed */
export const applyFlip = (
  container: Element,
  sourceSnapshot: readonly FlipSnapshot[],
  options?: FlipOptions,
): readonly Animation[] => {
  const opts = { ...DEFAULT_FLIP_OPTIONS, ...options };
  const targetSnapshot = captureSnapshot(container);
  const { shared, entering } = classifyFields(sourceSnapshot, targetSnapshot);

  const animations: Animation[] = [];

  // Shared fields: animate position + scale
  for (const { field, source, target } of shared) {
    const el = container.querySelector(`[data-field="${field}"]`);
    if (!el || !(el instanceof HTMLElement)) continue;

    const delta = calculateDelta(source.rect, target.rect);

    const anim = el.animate(
      [
        {
          transform: `translate(${delta.dx}px, ${delta.dy}px) scale(${delta.sw}, ${delta.sh})`,
          opacity: source.opacity,
        },
        {
          transform: 'translate(0, 0) scale(1, 1)',
          opacity: target.opacity,
        },
      ],
      {
        duration: opts.duration,
        easing: opts.easing,
        fill: 'backwards',
      },
    );

    animations.push(anim);
  }

  // Entering fields: fade in
  for (const entry of entering) {
    const el = container.querySelector(`[data-field="${entry.fieldName}"]`);
    if (!el || !(el instanceof HTMLElement)) continue;

    const anim = el.animate(
      [{ opacity: 0 }, { opacity: entry.opacity }],
      {
        duration: opts.fadeInDuration,
        easing: opts.easing,
        fill: 'backwards',
      },
    );

    animations.push(anim);
  }

  return animations;
};

/** Create a FLIP transition — call before DOM change, then apply after */
export const createFlipTransition = (container: Element): FlipTransition => ({
  sourceSnapshot: captureSnapshot(container),
  animating: false,
});

/** Check if View Transitions API is supported */
export const supportsViewTransitions = (): boolean => {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
};

/** Resolve FLIP options with defaults */
export const resolveFlipOptions = (options?: FlipOptions): Required<FlipOptions> => ({
  ...DEFAULT_FLIP_OPTIONS,
  ...options,
});
