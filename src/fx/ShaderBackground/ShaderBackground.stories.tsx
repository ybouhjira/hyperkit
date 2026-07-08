import type { Meta, StoryObj } from 'storybook-solidjs';
import { ShaderBackground } from './ShaderBackground';

const meta = {
  title: 'FX/ShaderBackground',
  component: ShaderBackground,
  tags: ['autodocs'],
  argTypes: {
    preset: {
      control: 'select',
      options: ['noise', 'gradient', 'waves', 'aurora'],
    },
    speed: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    intensity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShaderBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Noise: Story = {
  args: { preset: 'noise', speed: 0.3, intensity: 0.5 },
  render: (args) => (
    <ShaderBackground {...args} style={{ height: '300px' }}>
      <span style={{ color: '#fff', 'font-size': '1.5rem', 'font-weight': 'bold' }}>
        Noise Shader
      </span>
    </ShaderBackground>
  ),
};

export const Aurora: Story = {
  args: { preset: 'aurora', speed: 0.2, intensity: 0.8 },
  render: (args) => (
    <ShaderBackground {...args} style={{ height: '300px' }}>
      <span style={{ color: '#fff', 'font-size': '1.5rem', 'font-weight': 'bold' }}>
        Aurora Borealis
      </span>
    </ShaderBackground>
  ),
};

export const Waves: Story = {
  args: { preset: 'waves', speed: 0.4, intensity: 0.6 },
  render: (args) => (
    <ShaderBackground {...args} style={{ height: '300px' }}>
      <span style={{ color: '#fff', 'font-size': '1.5rem', 'font-weight': 'bold' }}>
        Wave Effect
      </span>
    </ShaderBackground>
  ),
};

export const Gradient: Story = {
  args: { preset: 'gradient', speed: 0.3, intensity: 0.7 },
  render: (args) => (
    <ShaderBackground {...args} style={{ height: '300px' }}>
      <span style={{ color: '#fff', 'font-size': '1.5rem', 'font-weight': 'bold' }}>
        Animated Gradient
      </span>
    </ShaderBackground>
  ),
};

export const CustomColors: Story = {
  args: {
    preset: 'aurora',
    color1: '#ff6b6b',
    color2: '#4ecdc4',
    speed: 0.3,
    intensity: 0.7,
  },
  render: (args) => (
    <ShaderBackground {...args} style={{ height: '300px' }}>
      <span style={{ color: '#fff', 'font-size': '1.5rem', 'font-weight': 'bold' }}>
        Custom Colors
      </span>
    </ShaderBackground>
  ),
};
