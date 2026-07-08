import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { TopProgressBar } from './TopProgressBar';
import { Button } from '../Button';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Slider } from '../Slider';

const meta: Meta<typeof TopProgressBar> = {
  title: 'Feedback/TopProgressBar',
  component: TopProgressBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopProgressBar>;

export const RouteChange: Story = {
  render: () => {
    const [active, setActive] = createSignal(false);
    const simulate = () => {
      setActive(true);
      setTimeout(() => setActive(false), 2000);
    };
    return (
      <Stack gap="md" p="lg">
        <Text>Simulates a 2-second async route change.</Text>
        <Button onClick={simulate} disabled={active()}>
          {active() ? 'Loading…' : 'Simulate load'}
        </Button>
        <TopProgressBar active={active()} />
      </Stack>
    );
  },
};

export const Determinate: Story = {
  render: () => {
    const [progress, setProgress] = createSignal(0.35);
    return (
      <Stack gap="md" p="lg">
        <Text>Drag the slider to drive determinate progress: {(progress() * 100).toFixed(0)}%</Text>
        <Slider
          value={progress() * 100}
          min={0}
          max={100}
          onChange={(v: number) => setProgress(v / 100)}
        />
        <TopProgressBar active={progress() < 1} progress={progress()} />
      </Stack>
    );
  },
};

export const CustomColor: Story = {
  render: () => {
    const [active, setActive] = createSignal(false);
    return (
      <Stack gap="md" p="lg">
        <Button onClick={() => setActive((v) => !v)}>{active() ? 'Hide bar' : 'Show bar'}</Button>
        <TopProgressBar active={active()} color="var(--sk-success)" height={3} />
      </Stack>
    );
  },
};
