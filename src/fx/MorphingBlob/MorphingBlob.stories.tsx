import type { Meta, StoryObj } from 'storybook-solidjs';
import { MorphingBlob } from './MorphingBlob';

const meta = {
  title: 'FX/MorphingBlob',
  component: MorphingBlob,
  tags: ['autodocs'],
  argTypes: {
    points: { control: { type: 'range', min: 3, max: 12, step: 1 } },
    size: { control: { type: 'range', min: 80, max: 400, step: 10 } },
    speed: { control: { type: 'range', min: 0.5, max: 10, step: 0.5 } },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
} satisfies Meta<typeof MorphingBlob>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { points: 6, size: 200, speed: 3, opacity: 0.6 },
  render: (args) => <MorphingBlob {...args} />,
};

export const Accent: Story = {
  args: { size: 200, color: 'var(--sk-accent)', speed: 3, opacity: 0.7 },
  render: (args) => <MorphingBlob {...args} />,
};

export const MultiBlob: Story = {
  args: { size: 160, speed: 2.5, opacity: 0.5 },
  render: (args) => (
    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
      <MorphingBlob
        {...args}
        color="var(--sk-accent)"
        style={{ position: 'absolute', top: '0', left: '0' }}
      />
      <MorphingBlob
        {...args}
        color="var(--sk-info)"
        speed={4}
        style={{ position: 'absolute', top: '50px', left: '80px' }}
      />
      <MorphingBlob
        {...args}
        color="var(--sk-success)"
        speed={5}
        style={{ position: 'absolute', top: '100px', left: '20px' }}
      />
    </div>
  ),
};

export const Slow: Story = {
  args: { size: 250, speed: 8, points: 8, opacity: 0.8 },
  render: (args) => <MorphingBlob {...args} />,
};

export const Sharp: Story = {
  args: { size: 180, points: 3, speed: 2, opacity: 0.7 },
  render: (args) => <MorphingBlob {...args} color="var(--sk-warning)" />,
};
