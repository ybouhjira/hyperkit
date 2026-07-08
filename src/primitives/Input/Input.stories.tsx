import type { Meta, StoryObj } from 'storybook-solidjs';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { createSignal } from 'solid-js';

const meta: Meta<typeof Input> = {
  title: 'Data Entry/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    type: { control: 'select', options: ['text', 'password', 'email', 'number'] },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const DefaultInput: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Input value={value()} onInput={setValue} />;
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Input placeholder="Enter your email" value={value()} onInput={setValue} />;
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return (
      <Input
        id="email"
        placeholder="Enter your email"
        value={value()}
        onInput={setValue}
        error="This field is required"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return <Input placeholder="Disabled input" disabled />;
  },
};

export const Password: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return (
      <Input type="password" placeholder="Enter password" value={value()} onInput={setValue} />
    );
  },
};

export const Email: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Input type="email" placeholder="user@example.com" value={value()} onInput={setValue} />;
  },
};

export const Search: Story = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Input type="search" placeholder="Search..." value={value()} onInput={setValue} />;
  },
};

const _textareaMeta: Meta<typeof Textarea> = {
  title: 'Data Entry/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export const DefaultTextarea: StoryObj<typeof Textarea> = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Textarea value={value()} onInput={setValue} />;
  },
};

export const WithTextareaPlaceholder: StoryObj<typeof Textarea> = {
  render: () => {
    const [value, setValue] = createSignal('');
    return <Textarea placeholder="Enter your message" value={value()} onInput={setValue} />;
  },
};

export const AutoResizeTextarea: StoryObj<typeof Textarea> = {
  render: () => {
    const [value, setValue] = createSignal('');
    return (
      <Textarea
        placeholder="Type multiple lines and watch it grow"
        autoResize
        minRows={3}
        maxRows={8}
        value={value()}
        onInput={setValue}
      />
    );
  },
};

export const TextareaWithError: StoryObj<typeof Textarea> = {
  render: () => {
    const [value, setValue] = createSignal('');
    return (
      <Textarea
        placeholder="Enter description"
        value={value()}
        onInput={setValue}
        error="Description must be at least 10 characters"
      />
    );
  },
};

export const DisabledTextarea: StoryObj<typeof Textarea> = {
  render: () => {
    return <Textarea placeholder="This is disabled" value="Cannot edit this text" disabled />;
  },
};

export const LargeTextarea: StoryObj<typeof Textarea> = {
  render: () => {
    const [value, setValue] = createSignal('');
    return (
      <Textarea placeholder="Large textarea" minRows={10} value={value()} onInput={setValue} />
    );
  },
};
