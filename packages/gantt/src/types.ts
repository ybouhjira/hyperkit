/**
 * Public types for `@ybouhjira/gantt`.
 *
 * Designed so MVP features (lanes + bars + linear deps) cover our 7-diagram
 * docs app today, while reserving room for activations/critical-path/date-axis
 * without breaking consumers. Adding a new optional field on a task or a new
 * tone key is always non-breaking.
 */

/**
 * Semantic tone for a task bar. Consumers map each tone to concrete colors
 * through the `palette` prop — the component itself never picks colors.
 *
 * MVP uses the fixed union below. If we ever need more tones, widen to
 * `string` and document the convention.
 */
export type GanttTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

/** Per-tone colors. All values should be CSS strings; `var(--sk-*)` is expected. */
export interface GanttToneColors {
  readonly fill: string;
  readonly stroke: string;
  readonly text: string;
}

/** User-supplied palette. One entry per tone used by any task. */
export type GanttPalette = Readonly<Record<GanttTone, GanttToneColors>>;

/** Horizontal section label on the left. */
export interface GanttLane {
  readonly id: string;
  readonly label: string;
}

/**
 * A single bar on the chart. `startDay` + `duration` are in abstract "days"
 * from the project start — we keep them as numbers rather than Date objects
 * so the MVP doesn't need to care about weekends, holidays, or timezones.
 */
export interface GanttTask {
  readonly id: string;
  readonly label: string;
  readonly lane: string;
  readonly startDay: number;
  readonly duration: number;
  readonly tone?: GanttTone;
  /** Task ids this one visually depends on (rendered as a connector line). */
  readonly dependsOn?: readonly string[];
}

/** Full chart input. `lanes` order controls top-to-bottom order on screen. */
export interface GanttData {
  readonly lanes: readonly GanttLane[];
  readonly tasks: readonly GanttTask[];
}
