import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { ScoreRing } from './ScoreRing';

const meta = {
  title: 'FX/ScoreRing',
  component: ScoreRing,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: { type: 'range', min: 60, max: 300, step: 10 } },
    thickness: { control: { type: 'range', min: 2, max: 30, step: 1 } },
    showLabel: { control: 'boolean' },
    animated: { control: 'boolean' },
  },
} satisfies Meta<typeof ScoreRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 78, size: 120, thickness: 8, showLabel: true, animated: true },
  render: (args) => <ScoreRing {...args} />,
};

export const ScoreRange: Story = {
  args: { size: 100 },
  render: (args) => (
    <div style={{ display: 'flex', gap: '24px', 'align-items': 'center' }}>
      <div style={{ 'text-align': 'center' }}>
        <ScoreRing {...args} value={25} />
        <div style={{ 'font-size': '12px', 'margin-top': '8px' }}>Low</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <ScoreRing {...args} value={55} />
        <div style={{ 'font-size': '12px', 'margin-top': '8px' }}>Medium</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <ScoreRing {...args} value={88} />
        <div style={{ 'font-size': '12px', 'margin-top': '8px' }}>High</div>
      </div>
    </div>
  ),
};

export const CustomColor: Story = {
  args: { value: 64, color: 'var(--sk-accent)', size: 140, thickness: 10, showLabel: true },
  render: (args) => <ScoreRing {...args} />,
};

export const NoLabel: Story = {
  args: { value: 90, showLabel: false, size: 80 },
  render: (args) => <ScoreRing {...args} />,
};

export const Interactive: Story = {
  args: { value: 50 },
  render: () => {
    const [val, setVal] = createSignal(50);
    return (
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
        <ScoreRing value={val()} size={150} thickness={12} showLabel />
        <input
          type="range"
          min={0}
          max={100}
          value={val()}
          onInput={(e) => setVal(Number(e.currentTarget.value))}
          style={{ width: '200px' }}
        />
        <span>Score: {val()}</span>
      </div>
    );
  },
};

export const CustomFormat: Story = {
  args: {
    value: 85,
    format: (v) => `${v}/100`,
    size: 130,
    thickness: 10,
    showLabel: true,
  },
  render: (args) => <ScoreRing {...args} />,
};
