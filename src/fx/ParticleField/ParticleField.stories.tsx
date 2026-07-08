import type { Meta, StoryObj } from 'storybook-solidjs';
import { ParticleField } from './ParticleField';

const meta = {
  title: 'FX/ParticleField',
  component: ParticleField,
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'range', min: 10, max: 200, step: 10 },
      description: 'Number of particles',
    },
    color: {
      control: 'text',
      description: 'Particle color (CSS color value)',
    },
    speed: {
      control: { type: 'range', min: 0, max: 2, step: 0.1 },
      description: 'Particle movement speed (0-1)',
    },
    size: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Maximum particle size in pixels',
    },
    connections: {
      control: 'boolean',
      description: 'Draw lines between nearby particles',
    },
    connectionDistance: {
      control: { type: 'range', min: 30, max: 300, step: 10 },
      description: 'Max distance to draw connection lines',
    },
    interactive: {
      control: 'boolean',
      description: 'Particles react to mouse',
    },
  },
} satisfies Meta<typeof ParticleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 50,
    color: 'var(--sk-accent)',
    speed: 0.3,
    size: 3,
    connections: true,
    connectionDistance: 100,
    interactive: true,
  },
  render: (args) => (
    <div
      style={{
        background: 'var(--sk-bg-primary)',
        'border-radius': 'var(--sk-radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--sk-border)',
      }}
    >
      <ParticleField {...args} style={{ height: '350px' }} />
    </div>
  ),
};

export const Dense: Story = {
  args: {
    count: 120,
    color: 'var(--sk-accent)',
    speed: 0.2,
    size: 2,
    connections: true,
    connectionDistance: 80,
    interactive: true,
  },
  render: (args) => (
    <div
      style={{
        background: 'var(--sk-bg-primary)',
        'border-radius': 'var(--sk-radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--sk-border)',
      }}
    >
      <ParticleField {...args} style={{ height: '350px' }} />
    </div>
  ),
};

export const NoConnections: Story = {
  args: {
    count: 70,
    color: 'var(--sk-info)',
    speed: 0.5,
    size: 4,
    connections: false,
    interactive: true,
  },
  render: (args) => (
    <div
      style={{
        background: 'var(--sk-bg-primary)',
        'border-radius': 'var(--sk-radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--sk-border)',
      }}
    >
      <ParticleField {...args} style={{ height: '350px' }} />
    </div>
  ),
};

export const SuccessField: Story = {
  args: {
    count: 60,
    color: 'var(--sk-success)',
    speed: 0.4,
    size: 3,
    connections: true,
    connectionDistance: 120,
    interactive: false,
  },
  render: (args) => (
    <div
      style={{
        background: 'var(--sk-bg-primary)',
        'border-radius': 'var(--sk-radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--sk-border)',
      }}
    >
      <ParticleField {...args} style={{ height: '350px' }} />
    </div>
  ),
};
