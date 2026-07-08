import type { Meta, StoryObj } from 'storybook-solidjs';
import { SignalGrid } from './SignalGrid';

const meta: Meta<typeof SignalGrid> = {
  title: 'Primitives/SignalGrid',
  component: SignalGrid,
  tags: ['autodocs'],
  argTypes: {
    cellSize: { control: 'number' },
    gap: { control: 'number' },
    columns: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof SignalGrid>;

const generateCells = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `cell-${i}`,
    value: Math.random(),
    label: `Signal ${i + 1}`,
  }));

export const Default: Story = {
  args: {
    cells: generateCells(64),
    columns: 8,
  },
};

export const Large: Story = {
  args: {
    cells: generateCells(100),
    columns: 10,
    cellSize: 20,
    gap: 2,
  },
};

export const Small: Story = {
  args: {
    cells: generateCells(32),
    columns: 8,
    cellSize: 10,
    gap: 1,
  },
};

export const CustomColorScale: Story = {
  args: {
    cells: Array.from({ length: 40 }, (_, i) => ({
      id: `cell-${i}`,
      value: i / 39,
      label: `Value ${(i / 39).toFixed(2)}`,
    })),
    columns: 10,
    colorScale: (v: number) => `hsl(${Math.round(v * 240)}, 70%, 50%)`,
  },
};
