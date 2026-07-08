import type { Meta, StoryObj } from 'storybook-solidjs';
import { Accordion } from './Accordion';
import type { AccordionItemData } from './Accordion';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Display/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether multiple items can be expanded simultaneously',
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether all items can be collapsed (single mode only)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all accordion items',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: AccordionItemData[] = [
  {
    value: 'item-1',
    title: 'What is SolidKit?',
    content: 'SolidKit is a modern component library for SolidJS applications.',
  },
  {
    value: 'item-2',
    title: 'How do I install it?',
    content: 'Install via npm: npm install @ybouhjira/hyperkit',
  },
  {
    value: 'item-3',
    title: 'Is it production ready?',
    content: 'Yes! SolidKit is actively maintained and used in production.',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

export const MultipleExpand: Story = {
  args: {
    items: basicItems,
    type: 'multiple',
  },
};

export const DefaultExpanded: Story = {
  args: {
    items: basicItems,
    defaultValue: 'item-2',
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      {
        value: 'item-1',
        title: 'Active Item',
        content: 'This item is interactive.',
      },
      {
        value: 'item-2',
        title: 'Disabled Item',
        content: 'This content is not accessible.',
        disabled: true,
      },
      {
        value: 'item-3',
        title: 'Another Active Item',
        content: 'This item works normally.',
      },
    ],
  },
};

export const FAQ: Story = {
  args: {
    items: [
      {
        value: 'pricing',
        title: 'What are your pricing plans?',
        content: (
          <Stack gap="sm">
            <Text as="p">We offer three pricing tiers:</Text>
            <ul>
              <li>
                <Text as="span" weight="semibold">
                  Free
                </Text>{' '}
                - Perfect for personal projects
              </li>
              <li>
                <Text as="span" weight="semibold">
                  Pro
                </Text>{' '}
                - $29/month for professionals
              </li>
              <li>
                <Text as="span" weight="semibold">
                  Enterprise
                </Text>{' '}
                - Custom pricing for teams
              </li>
            </ul>
          </Stack>
        ),
      },
      {
        value: 'support',
        title: 'How can I contact support?',
        content: (
          <Stack gap="sm">
            <Text as="p">We offer multiple support channels:</Text>
            <ul>
              <li>Email: support@hyperkit.dev</li>
              <li>Discord: Join our community server</li>
              <li>GitHub: Open an issue for bugs</li>
            </ul>
          </Stack>
        ),
      },
      {
        value: 'refund',
        title: 'What is your refund policy?',
        content: (
          <Text as="p">
            We offer a 30-day money-back guarantee. If you're not satisfied with your purchase,
            contact us within 30 days for a full refund, no questions asked.
          </Text>
        ),
      },
      {
        value: 'updates',
        title: 'Do you provide regular updates?',
        content: (
          <Text as="p">
            Yes! We release new features and improvements regularly. All updates are included in
            your subscription at no additional cost.
          </Text>
        ),
      },
    ],
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Single Expand (Default)
        </Text>
        <Accordion items={basicItems} />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Multiple Expand
        </Text>
        <Accordion items={basicItems} type="multiple" />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          With Default Expanded
        </Text>
        <Accordion items={basicItems} defaultValue="item-2" />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          All Disabled
        </Text>
        <Accordion items={basicItems} disabled />
      </Stack>

      <Stack gap="sm">
        <Text as="h3" size="lg" weight="semibold">
          Custom Styling
        </Text>
        <Accordion
          items={basicItems}
          style={{
            '--sk-accordion-border': 'var(--sk-accent)',
            '--sk-accordion-trigger-hover-bg': 'var(--sk-accent-muted)',
          }}
        />
      </Stack>
    </Stack>
  ),
};
