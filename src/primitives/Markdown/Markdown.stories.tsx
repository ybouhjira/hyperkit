import type { Meta, StoryObj } from 'storybook-solidjs';
import { Markdown } from './Markdown';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Display/Markdown',
  component: Markdown,
  tags: ['autodocs'],
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const content = `# Hello World

This is **bold** and *italic* text.

Here's a [link to SolidJS](https://www.solidjs.com/).

- List item 1
- List item 2
- List item 3`;

    return <Markdown content={content} />;
  },
};

export const CodeBlocks: Story = {
  render: () => {
    const content = `# Code Examples

Inline code: \`const x = 42;\`

Fenced code block:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`

Another example:

\`\`\`bash
npm install @ybouhjira/hyperkit
npm run dev
\`\`\``;

    return <Markdown content={content} />;
  },
};

export const GFMTable: Story = {
  render: () => {
    const content = `# Feature Comparison

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Users | 1 | 10 | Unlimited |
| Storage | 5GB | 100GB | 1TB |
| Support | Email | Priority | 24/7 |
| Price | Free | $29/mo | Custom |`;

    return <Markdown content={content} />;
  },
};

export const Streaming: Story = {
  render: () => {
    const content = `# Streaming Content

This content is being streamed in real-time...

The cursor at the end indicates more content is coming.`;

    return <Markdown content={content} streaming={true} />;
  },
};

export const RichContent: Story = {
  render: () => {
    const content = `# Rich Markdown Document

## Features

This demonstrates **all major features** of the markdown renderer.

### Text Formatting

- **Bold text**
- *Italic text*
- ***Bold and italic***
- ~~Strikethrough~~
- \`inline code\`

### Lists

#### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List

1. First step
2. Second step
3. Third step

### Links and Images

Visit [SolidJS](https://www.solidjs.com/) for more info.

![Alt text](https://via.placeholder.com/150)

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Code Blocks

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Horizontal Rule

---

That's all!`;

    return <Markdown content={content} />;
  },
};

export const AllVariants: Story = {
  render: () => {
    const basicContent = `# Basic Example

**Bold** and *italic* text.`;

    const codeContent = `# Code

\`\`\`typescript
const hello = 'world';
\`\`\``;

    const tableContent = `| A | B |
|---|---|
| 1 | 2 |`;

    const streamingContent = `# Streaming

Content with cursor...`;

    return (
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Default
          </Text>
          <Markdown content={basicContent} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Code Blocks
          </Text>
          <Markdown content={codeContent} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            GFM Table
          </Text>
          <Markdown content={tableContent} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Streaming
          </Text>
          <Markdown content={streamingContent} streaming={true} />
        </Stack>
      </Stack>
    );
  },
};
