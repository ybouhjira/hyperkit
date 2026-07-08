import type { Meta, StoryObj } from 'storybook-solidjs';
import { TypewriterText } from './TypewriterText';

const meta = {
  title: 'FX/TypewriterText',
  component: TypewriterText,
  tags: ['autodocs'],
  argTypes: {
    speed: { control: { type: 'range', min: 10, max: 300, step: 10 } },
    delay: { control: { type: 'range', min: 0, max: 3000, step: 100 } },
    cursor: { control: 'boolean' },
    loop: { control: 'boolean' },
    deleteSpeed: { control: { type: 'range', min: 10, max: 200, step: 10 } },
    loopDelay: { control: { type: 'range', min: 100, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof TypewriterText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Hello, World! This is a typewriter effect.',
    speed: 60,
    cursor: true,
  },
  render: (args) => (
    <div style={{ 'font-size': '1.2rem' }}>
      <TypewriterText {...args} />
    </div>
  ),
};

export const WithLoop: Story = {
  args: {
    text: 'I build amazing UIs...',
    speed: 60,
    deleteSpeed: 30,
    loop: true,
    loopDelay: 1500,
    cursor: true,
  },
  render: (args) => (
    <div style={{ 'font-size': '1.5rem', 'font-weight': 'bold' }}>
      <TypewriterText {...args} />
    </div>
  ),
};

export const NoCursor: Story = {
  args: {
    text: 'No cursor, just text.',
    speed: 50,
    cursor: false,
  },
  render: (args) => <TypewriterText {...args} />,
};

export const FastTyping: Story = {
  args: {
    text: 'Super fast typing speed!',
    speed: 15,
    cursor: true,
  },
  render: (args) => <TypewriterText {...args} />,
};

export const WithDelay: Story = {
  args: {
    text: 'I start typing after a 2 second delay...',
    speed: 50,
    delay: 2000,
    cursor: true,
  },
  render: (args) => (
    <div>
      <TypewriterText {...args} />
    </div>
  ),
};

export const CustomCursor: Story = {
  args: {
    text: 'Custom cursor character.',
    speed: 60,
    cursor: true,
    cursorChar: '_',
  },
  render: (args) => <TypewriterText {...args} />,
};
