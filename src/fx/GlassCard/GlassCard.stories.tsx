import type { Meta, StoryObj } from 'storybook-solidjs';
import { GlassCard } from './GlassCard';

const meta = {
  title: 'FX/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  argTypes: {
    blur: {
      control: { type: 'range', min: 0, max: 40, step: 2 },
      description: 'Backdrop blur radius in pixels',
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Background opacity (0-1)',
    },
    border: {
      control: 'boolean',
      description: 'Show border',
    },
    tint: {
      control: 'select',
      options: ['light', 'dark', 'accent'],
      description: 'Tint color of the glass surface',
    },
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const GradientBackground = (props: { children: JSX.Element }) => (
  <div
    style={{
      padding: '3rem',
      background: 'linear-gradient(135deg, var(--sk-accent) 0%, var(--sk-info) 100%)',
      'border-radius': 'var(--sk-radius-lg)',
      'min-height': '200px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
    }}
  >
    {props.children}
  </div>
);

import type { JSX } from 'solid-js';

export const Default: Story = {
  args: {
    blur: 12,
    opacity: 0.15,
    border: true,
    tint: 'light',
  },
  render: (args) => (
    <GradientBackground>
      <GlassCard {...args}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Glass Card</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Frosted glass with backdrop blur.
        </p>
      </GlassCard>
    </GradientBackground>
  ),
};

export const AccentTint: Story = {
  args: {
    blur: 16,
    opacity: 0.25,
    border: true,
    tint: 'accent',
  },
  render: (args) => (
    <GradientBackground>
      <GlassCard {...args}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Accent Tint</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Glass surface tinted with the accent color.
        </p>
      </GlassCard>
    </GradientBackground>
  ),
};

export const DarkTint: Story = {
  args: {
    blur: 20,
    opacity: 0.4,
    border: true,
    tint: 'dark',
  },
  render: (args) => (
    <GradientBackground>
      <GlassCard {...args}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Dark Tint</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Darker background for contrast on light scenes.
        </p>
      </GlassCard>
    </GradientBackground>
  ),
};

export const NoBorder: Story = {
  args: {
    blur: 12,
    opacity: 0.2,
    border: false,
    tint: 'light',
  },
  render: (args) => (
    <GradientBackground>
      <GlassCard {...args}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>No Border</h3>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          Borderless glass for minimal aesthetics.
        </p>
      </GlassCard>
    </GradientBackground>
  ),
};
