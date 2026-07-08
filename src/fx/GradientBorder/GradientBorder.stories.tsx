import type { Meta, StoryObj } from 'storybook-solidjs';
import { GradientBorder } from './GradientBorder';

const meta = {
  title: 'FX/GradientBorder',
  component: GradientBorder,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Border width in pixels',
    },
    animated: {
      control: 'boolean',
      description: 'Rotate the gradient continuously',
    },
    speed: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.5 },
      description: 'Gradient rotation speed in seconds',
    },
    radius: {
      control: 'text',
      description: 'Border radius CSS value',
    },
  },
} satisfies Meta<typeof GradientBorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 2,
    animated: true,
    speed: 3,
    radius: 'var(--sk-radius-md)',
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <GradientBorder {...args}>
        <div
          style={{
            padding: 'var(--sk-space-md)',
            'min-width': '200px',
            color: 'var(--sk-text-primary)',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem' }}>Gradient Border</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>Animated conic gradient.</p>
        </div>
      </GradientBorder>
    </div>
  ),
};

export const ThickBorder: Story = {
  args: {
    width: 4,
    animated: true,
    speed: 2,
    colors: ['var(--sk-accent)', 'var(--sk-warning)', 'var(--sk-error)', 'var(--sk-accent)'],
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <GradientBorder {...args}>
        <div
          style={{
            padding: 'var(--sk-space-md)',
            'min-width': '200px',
            color: 'var(--sk-text-primary)',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem' }}>Thick Border</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>4px warm gradient border.</p>
        </div>
      </GradientBorder>
    </div>
  ),
};

export const Static: Story = {
  args: {
    width: 2,
    animated: false,
    colors: ['var(--sk-accent)', 'var(--sk-info)', 'var(--sk-success)', 'var(--sk-accent)'],
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <GradientBorder {...args}>
        <div
          style={{
            padding: 'var(--sk-space-md)',
            'min-width': '200px',
            color: 'var(--sk-text-primary)',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem' }}>Static Gradient</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>No animation.</p>
        </div>
      </GradientBorder>
    </div>
  ),
};

export const PillShape: Story = {
  args: {
    width: 2,
    animated: true,
    speed: 4,
    radius: 'var(--sk-radius-xl)',
    colors: ['var(--sk-accent)', 'var(--sk-info)', 'var(--sk-accent)'],
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <GradientBorder {...args}>
        <div
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-xl)',
            color: 'var(--sk-text-primary)',
            'font-weight': '600',
          }}
        >
          Pill Badge
        </div>
      </GradientBorder>
    </div>
  ),
};
