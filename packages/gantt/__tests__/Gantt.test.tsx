import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Gantt, computeLayout, DEFAULT_GEOMETRY } from '../src';
import type { GanttData, GanttPalette } from '../src';

const palette: GanttPalette = {
  neutral: { fill: 'rgb(1, 1, 1)', stroke: 'rgb(2, 2, 2)', text: 'rgb(3, 3, 3)' },
  accent: { fill: 'rgb(10, 10, 10)', stroke: 'rgb(11, 11, 11)', text: 'rgb(12, 12, 12)' },
  success: { fill: 'rgb(20, 20, 20)', stroke: 'rgb(21, 21, 21)', text: 'rgb(22, 22, 22)' },
  warning: { fill: 'rgb(30, 30, 30)', stroke: 'rgb(31, 31, 31)', text: 'rgb(32, 32, 32)' },
  error: { fill: 'rgb(40, 40, 40)', stroke: 'rgb(41, 41, 41)', text: 'rgb(42, 42, 42)' },
  info: { fill: 'rgb(50, 50, 50)', stroke: 'rgb(51, 51, 51)', text: 'rgb(52, 52, 52)' },
};

const basicData: GanttData = {
  lanes: [
    { id: 'design', label: 'Design' },
    { id: 'dev', label: 'Development' },
  ],
  tasks: [
    { id: 'wireframe', label: 'Wireframes', lane: 'design', startDay: 0, duration: 3 },
    {
      id: 'build',
      label: 'Build UI',
      lane: 'dev',
      startDay: 3,
      duration: 5,
      tone: 'accent',
      dependsOn: ['wireframe'],
    },
  ],
};

const barRects = (container: HTMLElement) => container.querySelectorAll('.sk-gantt__bars rect');

describe('Gantt', () => {
  it('renders an accessible svg with the sk-gantt class', () => {
    const { getByRole, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const svg = getByRole('img', { name: 'Gantt chart' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.classList.contains('sk-gantt')).toBe(true);
    unmount();
  });

  it('merges a custom class next to sk-gantt', () => {
    const { container, unmount } = render(() => (
      <Gantt data={basicData} palette={palette} class="my-chart" />
    ));
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('sk-gantt')).toBe(true);
    expect(svg.classList.contains('my-chart')).toBe(true);
    unmount();
  });

  it('sets the viewBox from the computed layout dimensions', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const layout = computeLayout(basicData, DEFAULT_GEOMETRY);
    expect(container.querySelector('svg')!.getAttribute('viewBox')).toBe(
      `0 0 ${layout.width} ${layout.height}`
    );
    unmount();
  });

  it('renders one bar and one label per task', () => {
    const { container, getByText, unmount } = render(() => (
      <Gantt data={basicData} palette={palette} />
    ));
    expect(barRects(container)).toHaveLength(2);
    expect(getByText('Wireframes')).toBeTruthy();
    expect(getByText('Build UI')).toBeTruthy();
    unmount();
  });

  it('positions bars according to the layout math', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const layout = computeLayout(basicData, DEFAULT_GEOMETRY);
    const rects = barRects(container);
    layout.tasks.forEach((t, i) => {
      const rect = rects[i]!;
      expect(rect.getAttribute('x')).toBe(String(t.x));
      expect(rect.getAttribute('y')).toBe(String(t.y));
      expect(rect.getAttribute('width')).toBe(String(t.w));
      expect(rect.getAttribute('height')).toBe(String(t.h));
    });
    unmount();
  });

  it('colors bars from the palette by tone, defaulting to neutral', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const [wireframe, build] = Array.from(barRects(container));
    // 'wireframe' has no tone → neutral; 'build' is accent.
    expect(wireframe!.getAttribute('fill')).toBe(palette.neutral.fill);
    expect(wireframe!.getAttribute('stroke')).toBe(palette.neutral.stroke);
    expect(build!.getAttribute('fill')).toBe(palette.accent.fill);
    expect(build!.getAttribute('stroke')).toBe(palette.accent.stroke);
    unmount();
  });

  it('renders lane header labels', () => {
    const { getByText, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    expect(getByText('Design')).toBeTruthy();
    expect(getByText('Development')).toBeTruthy();
    unmount();
  });

  it('renders a native title (tooltip) with the day range per bar', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const titles = Array.from(container.querySelectorAll('.sk-gantt__bars title')).map(
      (t) => t.textContent
    );
    expect(titles).toContain('Wireframes · day 0–3');
    expect(titles).toContain('Build UI · day 3–8');
    unmount();
  });

  it('renders axis labels on major (weekly) ticks only when axisLabel is given', () => {
    const data: GanttData = {
      lanes: [{ id: 'l', label: 'L' }],
      tasks: [{ id: 't', label: 'T', lane: 'l', startDay: 0, duration: 14 }],
    };
    const { container, unmount } = render(() => (
      <Gantt data={data} palette={palette} axisLabel={(day) => `D${day}`} />
    ));
    const labels = Array.from(container.querySelectorAll('.sk-gantt__axis text')).map(
      (t) => t.textContent
    );
    // 15 ticks (day 0..14), majors at 0, 7, 14.
    expect(labels).toEqual(['D0', 'D7', 'D14']);
    unmount();
  });

  it('renders no axis labels when axisLabel is omitted', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    expect(container.querySelectorAll('.sk-gantt__axis text')).toHaveLength(0);
    unmount();
  });

  it('renders one tick line per day plus one', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    const layout = computeLayout(basicData, DEFAULT_GEOMETRY);
    expect(container.querySelectorAll('.sk-gantt__axis line')).toHaveLength(layout.totalDays + 1);
    unmount();
  });

  it('draws a dependency connector per resolvable dependsOn entry', () => {
    const { container, unmount } = render(() => <Gantt data={basicData} palette={palette} />);
    expect(container.querySelectorAll('.sk-gantt__deps path')).toHaveLength(1);
    unmount();
  });

  it('skips connectors whose dependency id does not exist', () => {
    const data: GanttData = {
      lanes: [{ id: 'l', label: 'L' }],
      tasks: [{ id: 'a', label: 'A', lane: 'l', startDay: 0, duration: 2, dependsOn: ['missing'] }],
    };
    const { container, unmount } = render(() => <Gantt data={data} palette={palette} />);
    expect(container.querySelectorAll('.sk-gantt__deps path')).toHaveLength(0);
    unmount();
  });

  it('renders empty data as a bare chart with no bars or lanes', () => {
    const { container, unmount } = render(() => (
      <Gantt data={{ lanes: [], tasks: [] }} palette={palette} />
    ));
    expect(container.querySelector('svg')).toBeTruthy();
    expect(barRects(container)).toHaveLength(0);
    expect(container.querySelectorAll('.sk-gantt__lane')).toHaveLength(0);
    unmount();
  });

  it('applies custom geometry to rendered bar positions', () => {
    const geometry = { dayWidth: 30, laneLabelWidth: 50 };
    const { container, unmount } = render(() => (
      <Gantt data={basicData} palette={palette} geometry={geometry} />
    ));
    const layout = computeLayout(basicData, { ...DEFAULT_GEOMETRY, ...geometry });
    const first = barRects(container)[0]!;
    expect(first.getAttribute('x')).toBe(String(layout.tasks[0]!.x));
    expect(first.getAttribute('width')).toBe(String(layout.tasks[0]!.w));
    unmount();
  });
});
