import type { Meta, StoryObj } from 'storybook-solidjs';
import { TiltCard } from './TiltCard';

const meta = {
  title: 'FX/TiltCard',
  component: TiltCard,
  tags: ['autodocs'],
  argTypes: {
    maxTilt: {
      control: { type: 'range', min: 0, max: 45, step: 1 },
      description: 'Maximum tilt angle in degrees',
    },
    perspective: {
      control: { type: 'number', min: 200, max: 2000, step: 100 },
      description: 'CSS perspective value in pixels',
    },
    scale: {
      control: { type: 'range', min: 1, max: 1.2, step: 0.01 },
      description: 'Scale factor on hover',
    },
    speed: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Transition speed in milliseconds',
    },
    glare: {
      control: 'boolean',
      description: 'Show glare effect',
    },
    glareOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Glare overlay opacity',
    },
  },
} satisfies Meta<typeof TiltCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxTilt: 15,
    perspective: 1000,
    scale: 1.02,
    speed: 400,
    glare: false,
  },
  render: (args) => (
    <div style={{ padding: '4rem', display: 'flex', 'justify-content': 'center' }}>
      <TiltCard {...args}>
        <div style={{ padding: '1rem', 'min-width': '200px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Tilt Card</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>Hover over me to tilt!</p>
        </div>
      </TiltCard>
    </div>
  ),
};

export const WithGlare: Story = {
  args: {
    maxTilt: 20,
    glare: true,
    glareOpacity: 0.3,
    scale: 1.05,
  },
  render: (args) => (
    <div style={{ padding: '4rem', display: 'flex', 'justify-content': 'center' }}>
      <TiltCard {...args}>
        <div style={{ padding: '1.5rem', 'min-width': '240px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Glare Effect</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
            Glare overlay follows the cursor.
          </p>
        </div>
      </TiltCard>
    </div>
  ),
};

export const SubtleTilt: Story = {
  args: {
    maxTilt: 5,
    perspective: 1500,
    scale: 1.01,
    speed: 600,
  },
  render: (args) => (
    <div style={{ padding: '4rem', display: 'flex', 'justify-content': 'center' }}>
      <TiltCard {...args}>
        <div style={{ padding: '1rem', 'min-width': '200px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Subtle Tilt</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
            Very gentle 3D effect for professional UIs.
          </p>
        </div>
      </TiltCard>
    </div>
  ),
};

export const ExaggeratedTilt: Story = {
  args: {
    maxTilt: 35,
    perspective: 600,
    scale: 1.08,
    glare: true,
    glareOpacity: 0.4,
  },
  render: (args) => (
    <div style={{ padding: '4rem', display: 'flex', 'justify-content': 'center' }}>
      <TiltCard {...args}>
        <div style={{ padding: '1.5rem', 'min-width': '240px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--sk-text-primary)' }}>Dramatic Tilt</h3>
          <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
            Strong perspective effect for gaming UIs.
          </p>
        </div>
      </TiltCard>
    </div>
  ),
};
