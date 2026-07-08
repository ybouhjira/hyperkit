import { describe, it, expect } from 'vitest';
import { computeLayout, DEFAULT_GEOMETRY } from '../src';
import type { GanttData } from '../src';

const G = DEFAULT_GEOMETRY;

const data = (partial: Partial<GanttData> = {}): GanttData => ({
  lanes: [{ id: 'l1', label: 'Lane One' }],
  tasks: [{ id: 't1', label: 'Task One', lane: 'l1', startDay: 2, duration: 5 }],
  ...partial,
});

describe('computeLayout', () => {
  it('computes totalDays from the furthest task end', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 3 },
          { id: 'b', label: 'B', lane: 'l1', startDay: 10, duration: 4 },
        ],
      })
    );
    expect(layout.totalDays).toBe(14);
    expect(layout.width).toBe(G.laneLabelWidth + 14 * G.dayWidth);
  });

  it('positions a single task using geometry constants', () => {
    const layout = computeLayout(data());
    expect(layout.tasks).toHaveLength(1);
    const t = layout.tasks[0]!;
    expect(t.x).toBe(G.laneLabelWidth + 2 * G.dayWidth);
    expect(t.y).toBe(G.axisHeight + G.laneHeaderHeight + G.lanePadding);
    expect(t.w).toBe(5 * G.dayWidth);
    expect(t.h).toBe(G.taskHeight);
  });

  it('computes lane height for a single-row lane', () => {
    const layout = computeLayout(data());
    const lane = layout.lanes[0]!;
    expect(lane.y).toBe(G.axisHeight);
    expect(lane.height).toBe(G.laneHeaderHeight + G.taskHeight + G.lanePadding * 2);
    expect(layout.height).toBe(G.axisHeight + lane.height);
  });

  it('stacks overlapping tasks in the same lane into separate rows', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 5 },
          { id: 'b', label: 'B', lane: 'l1', startDay: 3, duration: 4 },
        ],
      })
    );
    const [a, b] = [layout.tasks[0]!, layout.tasks[1]!];
    expect(b.y).toBe(a.y + G.taskHeight + G.taskGap);
    expect(layout.lanes[0]!.height).toBe(
      G.laneHeaderHeight + 2 * G.taskHeight + G.taskGap + G.lanePadding * 2
    );
  });

  it('reuses a row when tasks do not overlap (first-fit packing)', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 3 },
          { id: 'b', label: 'B', lane: 'l1', startDay: 3, duration: 4 },
        ],
      })
    );
    expect(layout.tasks[0]!.y).toBe(layout.tasks[1]!.y);
    expect(layout.lanes[0]!.height).toBe(G.laneHeaderHeight + G.taskHeight + G.lanePadding * 2);
  });

  it('sorts tasks within a lane by startDay before packing', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'late', label: 'Late', lane: 'l1', startDay: 5, duration: 2 },
          { id: 'early', label: 'Early', lane: 'l1', startDay: 0, duration: 2 },
        ],
      })
    );
    expect(layout.tasks.map((t) => t.id)).toEqual(['early', 'late']);
  });

  it('stacks lanes vertically in input order', () => {
    const layout = computeLayout(
      data({
        lanes: [
          { id: 'l1', label: 'One' },
          { id: 'l2', label: 'Two' },
        ],
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 2 },
          { id: 'b', label: 'B', lane: 'l2', startDay: 0, duration: 2 },
        ],
      })
    );
    const [l1, l2] = [layout.lanes[0]!, layout.lanes[1]!];
    expect(l1.y).toBe(G.axisHeight);
    expect(l2.y).toBe(l1.y + l1.height);
    expect(layout.height).toBe(l2.y + l2.height);
  });

  it('keeps a lane with no tasks at header-only height', () => {
    const layout = computeLayout(data({ lanes: [{ id: 'empty', label: 'Empty' }], tasks: [] }));
    // rowCount is clamped to a minimum of 1, so an empty lane still reserves one row.
    expect(layout.lanes[0]!.height).toBe(G.laneHeaderHeight + G.taskHeight + G.lanePadding * 2);
    expect(layout.tasks).toHaveLength(0);
  });

  it('handles fully empty data', () => {
    const layout = computeLayout({ lanes: [], tasks: [] });
    expect(layout.totalDays).toBe(0);
    expect(layout.width).toBe(G.laneLabelWidth);
    expect(layout.height).toBe(G.axisHeight);
    expect(layout.lanes).toHaveLength(0);
    expect(layout.tasks).toHaveLength(0);
  });

  it('enforces a 2px minimum bar width for zero-duration tasks', () => {
    const layout = computeLayout(
      data({ tasks: [{ id: 'z', label: 'Z', lane: 'l1', startDay: 1, duration: 0 }] })
    );
    expect(layout.tasks[0]!.w).toBe(2);
  });

  it('drops tasks whose lane id matches no lane, but still counts them in totalDays', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 2 },
          { id: 'ghost', label: 'Ghost', lane: 'nope', startDay: 0, duration: 30 },
        ],
      })
    );
    expect(layout.tasks.map((t) => t.id)).toEqual(['a']);
    expect(layout.totalDays).toBe(30);
  });

  it('respects custom geometry', () => {
    const layout = computeLayout(data(), { ...G, dayWidth: 20, laneLabelWidth: 100 });
    expect(layout.width).toBe(100 + 7 * 20);
    expect(layout.tasks[0]!.x).toBe(100 + 2 * 20);
    expect(layout.tasks[0]!.w).toBe(5 * 20);
  });

  it('preserves task metadata (tone, dependsOn) on laid-out tasks', () => {
    const layout = computeLayout(
      data({
        tasks: [
          { id: 'a', label: 'A', lane: 'l1', startDay: 0, duration: 2 },
          {
            id: 'b',
            label: 'B',
            lane: 'l1',
            startDay: 4,
            duration: 2,
            tone: 'error',
            dependsOn: ['a'],
          },
        ],
      })
    );
    const b = layout.tasks.find((t) => t.id === 'b')!;
    expect(b.tone).toBe('error');
    expect(b.dependsOn).toEqual(['a']);
  });
});
