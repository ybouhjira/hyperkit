import type { Meta, StoryObj } from 'storybook-solidjs';
import { HolographicCard } from './HolographicCard';

const meta = {
  title: 'FX/HolographicCard',
  component: HolographicCard,
  tags: ['autodocs'],
  argTypes: {
    intensity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Effect intensity (0-1)',
    },
    angle: {
      control: { type: 'range', min: 0, max: 360, step: 15 },
      description: 'Gradient angle in degrees',
    },
    animated: {
      control: 'boolean',
      description: 'Auto-animate the holographic effect',
    },
  },
} satisfies Meta<typeof HolographicCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    intensity: 0.5,
    angle: 135,
    animated: true,
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <HolographicCard {...args} style={{ 'min-width': '240px' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Holographic</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Hover to see the shimmer effect.
        </p>
      </HolographicCard>
    </div>
  ),
};

export const HighIntensity: Story = {
  args: {
    intensity: 1,
    angle: 45,
    animated: true,
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <HolographicCard {...args} style={{ 'min-width': '240px' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Max Intensity</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Full holographic rainbow effect.
        </p>
      </HolographicCard>
    </div>
  ),
};

export const StaticShimmer: Story = {
  args: {
    intensity: 0.6,
    angle: 90,
    animated: false,
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <HolographicCard {...args} style={{ 'min-width': '240px' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>
          Static (Hover only)
        </h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          No auto-animation, effect on hover only.
        </p>
      </HolographicCard>
    </div>
  ),
};

export const Subtle: Story = {
  args: {
    intensity: 0.2,
    angle: 160,
    animated: true,
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
      <HolographicCard {...args} style={{ 'min-width': '240px' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Subtle Shimmer</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Barely-visible holographic effect for minimal UIs.
        </p>
      </HolographicCard>
    </div>
  ),
};
