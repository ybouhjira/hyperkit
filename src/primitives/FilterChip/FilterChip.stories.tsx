import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { FilterChip } from './FilterChip';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta: Meta<typeof FilterChip> = {
  title: 'Primitives/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {
  args: { label: 'Events' },
};

export const Selected: Story = {
  args: { label: 'Events', selected: true },
};

export const Disabled: Story = {
  args: { label: 'Events', disabled: true },
};

export const Small: Story = {
  args: { label: 'Small', size: 'sm' },
};

export const WithIcon: Story = {
  args: {
    label: 'Errors',
    icon: <Text as="span">⚠</Text>,
    selected: true,
    color: 'var(--sk-error)',
  },
};

export const Interactive: StoryObj = {
  render: () => {
    const [selected, setSelected] = createSignal(false);
    return <FilterChip label="Toggle me" selected={selected()} onToggle={setSelected} />;
  },
};

export const FilterGroup: StoryObj = {
  render: () => {
    const filters = ['All', 'Errors', 'Warnings', 'Info', 'Debug'];
    const [active, setActive] = createSignal('All');
    return (
      <Flex gap="sm" wrap="wrap">
        {filters.map((f) => (
          <FilterChip label={f} selected={active() === f} onToggle={() => setActive(f)} />
        ))}
      </Flex>
    );
  },
};
