/**
 * Layout math for the Gantt renderer.
 *
 * Pure, framework-agnostic — takes `GanttData` + geometry constants and
 * returns concrete x/y/width/height for every bar, lane header, and day tick.
 * Keeping this pure makes it trivially unit-testable and lets the SVG
 * component stay dumb.
 */

import type { GanttData, GanttTask } from './types';

export interface GanttGeometry {
  readonly laneLabelWidth: number;
  readonly dayWidth: number;
  readonly laneHeaderHeight: number;
  readonly taskHeight: number;
  readonly taskGap: number;
  readonly lanePadding: number;
  readonly axisHeight: number;
}

export const DEFAULT_GEOMETRY: GanttGeometry = {
  laneLabelWidth: 160,
  dayWidth: 12,
  laneHeaderHeight: 28,
  taskHeight: 24,
  taskGap: 4,
  lanePadding: 8,
  axisHeight: 24,
};

export interface LaidOutTask extends GanttTask {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface LaidOutLane {
  readonly id: string;
  readonly label: string;
  readonly y: number;
  readonly height: number;
}

export interface GanttLayout {
  readonly width: number;
  readonly height: number;
  readonly totalDays: number;
  readonly geometry: GanttGeometry;
  readonly lanes: readonly LaidOutLane[];
  readonly tasks: readonly LaidOutTask[];
}

/**
 * Within a single lane, stack tasks into rows so overlapping bars don't
 * collide. Greedy first-fit — each task goes in the earliest row where the
 * last task on that row ends before this one starts. Good enough for MVP;
 * produces a minimal number of rows for typical project timelines.
 */
function packLaneRows(tasks: readonly GanttTask[]): number[] {
  const rowLastEnd: number[] = [];
  const rowByIndex: number[] = [];
  tasks.forEach((t) => {
    const end = t.startDay + t.duration;
    let placed = false;
    for (let r = 0; r < rowLastEnd.length; r += 1) {
      const lastEnd = rowLastEnd[r] ?? 0;
      if (lastEnd <= t.startDay) {
        rowLastEnd[r] = end;
        rowByIndex.push(r);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rowByIndex.push(rowLastEnd.length);
      rowLastEnd.push(end);
    }
  });
  return rowByIndex;
}

export function computeLayout(data: GanttData, geom: GanttGeometry = DEFAULT_GEOMETRY): GanttLayout {
  const totalDays = data.tasks.reduce((max, t) => Math.max(max, t.startDay + t.duration), 0);

  const lanes: LaidOutLane[] = [];
  const tasks: LaidOutTask[] = [];

  let cursorY = geom.axisHeight;
  data.lanes.forEach((lane) => {
    const laneTasks = data.tasks
      .filter((t) => t.lane === lane.id)
      .slice()
      .sort((a, b) => a.startDay - b.startDay);
    const rows = packLaneRows(laneTasks);
    const rowCount = rows.reduce((m, r) => Math.max(m, r + 1), 1);

    const laneHeight =
      geom.laneHeaderHeight +
      rowCount * geom.taskHeight +
      Math.max(0, rowCount - 1) * geom.taskGap +
      geom.lanePadding * 2;

    lanes.push({ id: lane.id, label: lane.label, y: cursorY, height: laneHeight });

    const firstRowY = cursorY + geom.laneHeaderHeight + geom.lanePadding;
    laneTasks.forEach((task, i) => {
      const row = rows[i] ?? 0;
      tasks.push({
        ...task,
        x: geom.laneLabelWidth + task.startDay * geom.dayWidth,
        y: firstRowY + row * (geom.taskHeight + geom.taskGap),
        w: Math.max(2, task.duration * geom.dayWidth),
        h: geom.taskHeight,
      });
    });

    cursorY += laneHeight;
  });

  return {
    width: geom.laneLabelWidth + totalDays * geom.dayWidth,
    height: cursorY,
    totalDays,
    geometry: geom,
    lanes,
    tasks,
  };
}
