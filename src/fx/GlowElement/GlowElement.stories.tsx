import type { Meta, StoryObj } from 'storybook-solidjs';
import { GlowElement } from './GlowElement';

const meta = {
  title: 'FX/GlowElement',
  component: GlowElement,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'text',
      description: 'Glow color (CSS color value)',
    },
    intensity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Glow intensity (0-1)',
    },
    size: {
      control: { type: 'range', min: 0, max: 60, step: 2 },
      description: 'Blur radius in pixels',
    },
    pulse: {
      control: 'boolean',
      description: 'Animate glow with pulse effect',
    },
    pulseSpeed: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.25 },
      description: 'Pulse animation duration in seconds',
    },
    as: {
      control: 'text',
      description: 'HTML element type',
    },
  },
} satisfies Meta<typeof GlowElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: 'var(--sk-accent)',
    intensity: 0.5,
    size: 20,
    pulse: false,
  },
  render: (args) => (
    <div style={{ padding: '3rem', display: 'flex', 'justify-content': 'center' }}>
      <GlowElement {...args}>
        <div
          style={{
            padding: 'var(--sk-space-md)',
            background: 'var(--sk-bg-secondary)',
            'border-radius': 'var(--sk-radius-md)',
            color: 'var(--sk-text-primary)',
          }}
        >
          Glowing Element
        </div>
      </GlowElement>
    </div>
  ),
};

export const Pulsing: Story = {
  args: {
    color: 'var(--sk-accent)',
    intensity: 0.6,
    size: 24,
    pulse: true,
    pulseSpeed: 2,
  },
  render: (args) => (
    <div style={{ padding: '3rem', display: 'flex', 'justify-content': 'center' }}>
      <GlowElement {...args}>
        <div
          style={{
            padding: 'var(--sk-space-md)',
            background: 'var(--sk-bg-secondary)',
            'border-radius': 'var(--sk-radius-md)',
            color: 'var(--sk-text-primary)',
          }}
        >
          Pulsing Glow
        </div>
      </GlowElement>
    </div>
  ),
};

export const SuccessGlow: Story = {
  args: {
    color: 'var(--sk-success)',
    intensity: 0.7,
    size: 16,
    pulse: true,
    pulseSpeed: 1.5,
  },
  render: (args) => (
    <div style={{ padding: '3rem', display: 'flex', 'justify-content': 'center' }}>
      <GlowElement {...args}>
        <div
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-md)',
            background: 'var(--sk-bg-secondary)',
            'border-radius': 'var(--sk-radius-xl)',
            color: 'var(--sk-success)',
            'font-weight': '600',
          }}
        >
          Active Status
        </div>
      </GlowElement>
    </div>
  ),
};

export const ErrorGlow: Story = {
  args: {
    color: 'var(--sk-error)',
    intensity: 0.8,
    size: 20,
    pulse: true,
    pulseSpeed: 1,
  },
  render: (args) => (
    <div style={{ padding: '3rem', display: 'flex', 'justify-content': 'center' }}>
      <GlowElement {...args}>
        <div
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-md)',
            background: 'var(--sk-bg-secondary)',
            'border-radius': 'var(--sk-radius-md)',
            color: 'var(--sk-error)',
            'font-weight': '600',
          }}
        >
          Alert!
        </div>
      </GlowElement>
    </div>
  ),
};
