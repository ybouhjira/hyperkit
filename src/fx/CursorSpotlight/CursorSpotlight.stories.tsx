import type { Meta, StoryObj } from 'storybook-solidjs';
import { CursorSpotlight } from './CursorSpotlight';

const meta = {
  title: 'FX/CursorSpotlight',
  component: CursorSpotlight,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 50, max: 600, step: 25 },
      description: 'Spotlight diameter in pixels',
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Spotlight opacity (0-1)',
    },
    color: {
      control: 'text',
      description: 'Spotlight color',
    },
    blend: {
      control: 'select',
      options: ['screen', 'overlay', 'lighten', 'color-dodge', 'normal'],
      description: 'CSS mix-blend-mode',
    },
  },
} satisfies Meta<typeof CursorSpotlight>;

export default meta;
type Story = StoryObj<typeof meta>;

const DarkPanel = (props: { children: JSX.Element }) => (
  <div
    style={{
      background: 'var(--sk-bg-primary)',
      'border-radius': 'var(--sk-radius-lg)',
      width: '400px',
      height: '300px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      border: '1px solid var(--sk-border)',
    }}
  >
    {props.children}
  </div>
);

import type { JSX } from 'solid-js';

export const Default: Story = {
  args: {
    size: 200,
    opacity: 0.15,
    color: 'var(--sk-accent)',
    blend: 'screen',
  },
  render: (args) => (
    <div style={{ padding: '2rem' }}>
      <DarkPanel>
        <CursorSpotlight {...args} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              padding: 'var(--sk-space-xl)',
              color: 'var(--sk-text-primary)',
              'text-align': 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>Cursor Spotlight</h3>
            <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
              Move your cursor over this area.
            </p>
          </div>
        </CursorSpotlight>
      </DarkPanel>
    </div>
  ),
};

export const LargeSpotlight: Story = {
  args: {
    size: 350,
    opacity: 0.2,
    color: 'var(--sk-accent)',
    blend: 'screen',
  },
  render: (args) => (
    <div style={{ padding: '2rem' }}>
      <DarkPanel>
        <CursorSpotlight {...args} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              padding: 'var(--sk-space-xl)',
              color: 'var(--sk-text-primary)',
              'text-align': 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>Large Spotlight</h3>
            <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
              Wider beam covers more area.
            </p>
          </div>
        </CursorSpotlight>
      </DarkPanel>
    </div>
  ),
};

export const InfoColor: Story = {
  args: {
    size: 250,
    opacity: 0.25,
    color: 'var(--sk-info)',
    blend: 'screen',
  },
  render: (args) => (
    <div style={{ padding: '2rem' }}>
      <DarkPanel>
        <CursorSpotlight {...args} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              padding: 'var(--sk-space-xl)',
              color: 'var(--sk-text-primary)',
              'text-align': 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>Blue Spotlight</h3>
            <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
              Info color for data dashboards.
            </p>
          </div>
        </CursorSpotlight>
      </DarkPanel>
    </div>
  ),
};

export const OverlayBlend: Story = {
  args: {
    size: 200,
    opacity: 0.4,
    color: 'white',
    blend: 'overlay',
  },
  render: (args) => (
    <div style={{ padding: '2rem' }}>
      <DarkPanel>
        <CursorSpotlight {...args} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              padding: 'var(--sk-space-xl)',
              color: 'var(--sk-text-primary)',
              'text-align': 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>Overlay Blend</h3>
            <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
              White spot with overlay blend mode.
            </p>
          </div>
        </CursorSpotlight>
      </DarkPanel>
    </div>
  ),
};
