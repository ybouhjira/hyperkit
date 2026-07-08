import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { SpringCounter } from './SpringCounter';

const meta = {
  title: 'FX/SpringCounter',
  component: SpringCounter,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number' } },
    stiffness: { control: { type: 'range', min: 10, max: 500, step: 10 } },
    damping: { control: { type: 'range', min: 1, max: 100, step: 1 } },
    precision: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    bounce: { control: 'boolean' },
  },
} satisfies Meta<typeof SpringCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 1337, stiffness: 170, damping: 26, bounce: true },
  render: (args) => <SpringCounter {...args} />,
};

export const Wobbly: Story = {
  args: { value: 42, stiffness: 80, damping: 8, bounce: true },
  render: (args) => {
    const [val, setVal] = createSignal(42);
    return (
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
        <SpringCounter {...args} value={val()} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVal(0)}>0</button>
          <button onClick={() => setVal(100)}>100</button>
          <button onClick={() => setVal(Math.floor(Math.random() * 1000))}>Random</button>
        </div>
      </div>
    );
  },
};

export const WithDecimal: Story = {
  args: { value: 99.95, precision: 2, stiffness: 170, damping: 26 },
  render: (args) => <SpringCounter {...args} />,
};

export const CustomFormat: Story = {
  args: {
    value: 4200,
    format: (v) => `$${Math.round(v).toLocaleString()}`,
    stiffness: 170,
    damping: 26,
    bounce: true,
  },
  render: (args) => <SpringCounter {...args} />,
};

export const Interactive: Story = {
  args: { value: 0 },
  render: () => {
    const [val, setVal] = createSignal(0);
    return (
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
        <SpringCounter value={val()} stiffness={200} damping={22} bounce />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 25, 50, 75, 100, 500, 9999].map((n) => (
            <button onClick={() => setVal(n)}>{n}</button>
          ))}
        </div>
      </div>
    );
  },
};
