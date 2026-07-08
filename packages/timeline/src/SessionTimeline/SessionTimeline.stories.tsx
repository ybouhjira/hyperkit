import type { Meta, StoryObj } from 'storybook-solidjs';
import { onMount } from 'solid-js';
import { SessionTimeline } from './SessionTimeline';
import { TimelineProvider, useTimeline } from '../TimelineProvider';
import type { TimelineEntry } from '../types';

const meta: Meta<typeof SessionTimeline> = {
  title: 'Observability/SessionTimeline',
  component: SessionTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SessionTimeline>;

export const Empty: Story = {
  render: (args) => (
    <div style={{ height: '480px' }}>
      <TimelineProvider autoSubscribe={false}>
        <SessionTimeline {...args} />
      </TimelineProvider>
    </div>
  ),
};

export const ThreeHourWorkSession: Story = {
  name: '3-Hour Work Session',
  render: (args) => {
    const now = Date.now();
    const start = now - 3 * 60 * 60 * 1000;
    const seeded = seedThreeHourSession(start);
    return (
      <div style={{ height: '520px' }}>
        <TimelineProvider autoSubscribe={false} maxEntries={10_000}>
          <Seeder entries={seeded} />
          <SessionTimeline {...args} nowMs={now} />
        </TimelineProvider>
      </div>
    );
  },
};

function Seeder(props: { entries: readonly TimelineEntry[] }) {
  const state = useTimeline();
  onMount(() => {
    for (const entry of props.entries) state.record(entry);
  });
  return null;
}

function seedThreeHourSession(start: number): readonly TimelineEntry[] {
  // Synthetic rhythm: Debug → Monitor → Code → Explore → Debug cycles, ~3h span
  const scenarios = [
    'scenario.debug',
    'scenario.monitor',
    'scenario.code',
    'scenario.explore',
    'scenario.debug',
    'scenario.code',
    'scenario.trace',
    'scenario.debug',
  ];
  const entries: TimelineEntry[] = [];
  const totalSpan = 3 * 60 * 60 * 1000;
  const segment = totalSpan / scenarios.length;
  let id = 0;
  scenarios.forEach((target, i) => {
    const segStart = start + segment * i;
    entries.push({
      id: String(++id),
      target,
      action: 'enter',
      params: undefined,
      result: { ok: true },
      timestamp: segStart,
      duration: 40,
    });
    const microCount = 18 + Math.floor(Math.random() * 10);
    for (let k = 0; k < microCount; k += 1) {
      const t = segStart + (segment / microCount) * k + Math.random() * (segment / microCount);
      const isErr = Math.random() < 0.04;
      entries.push({
        id: String(++id),
        target,
        action: ['inspect', 'select', 'edit', 'preview', 'toggle'][k % 5]!,
        params: undefined,
        result: isErr ? { ok: false, error: 'boom' } : { ok: true },
        timestamp: t,
        duration: 20 + Math.random() * 400,
      });
    }
  });
  entries.sort((a, b) => a.timestamp - b.timestamp);
  return entries;
}
