import type { Meta, StoryObj } from 'storybook-solidjs';
import { Collapsible } from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Navigation/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  args: {
    trigger: 'Click to expand',
    children: (
      <div class="px-3 py-2 text-sm text-surface-700 dark:text-surface-300">
        This is the collapsible content that will be shown when the trigger is clicked. It can
        contain any JSX elements.
      </div>
    ),
  },
};

export const Open: Story = {
  args: {
    trigger: 'Already expanded',
    open: true,
    children: (
      <div class="px-3 py-2 text-sm text-surface-700 dark:text-surface-300">
        This content is visible by default because the open prop is set to true.
      </div>
    ),
  },
};

export const DefaultOpen: Story = {
  args: {
    trigger: 'Default open (uncontrolled)',
    defaultOpen: true,
    children: (
      <div class="px-3 py-2 text-sm text-surface-700 dark:text-surface-300">
        This uses defaultOpen prop for uncontrolled state. You can still toggle it.
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    trigger: 'Disabled collapsible',
    disabled: true,
    children: (
      <div class="px-3 py-2 text-sm text-surface-700 dark:text-surface-300">
        This content cannot be toggled because the component is disabled.
      </div>
    ),
  },
};

export const WithRichContent: Story = {
  args: {
    trigger: 'Expand FAQ',
    children: (
      <div class="px-3 py-2 space-y-2">
        <p class="text-sm font-semibold text-surface-900 dark:text-surface-100">
          What is SolidKit?
        </p>
        <p class="text-sm text-surface-700 dark:text-surface-300">
          SolidKit is a modern UI library built with SolidJS and Kobalte primitives, styled with
          TailwindCSS v4. It provides accessible, customizable components for building web
          applications.
        </p>
      </div>
    ),
  },
};
