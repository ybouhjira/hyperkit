import type { Meta, StoryObj } from 'storybook-solidjs';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Data Display/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    code: { control: 'text' },
    language: {
      control: 'select',
      options: [
        undefined,
        'javascript',
        'typescript',
        'css',
        'html',
        'json',
        'bash',
        'shell',
        'markdown',
        'yaml',
      ],
    },
    label: { control: 'text' },
    showLineNumbers: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

const typescriptCode = `import { Component, createSignal } from 'solid-js';

export const Counter: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>
        Increment
      </button>
    </div>
  );
};`;

const javascriptCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10):', result);`;

const cssCode = `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: var(--color-primary);
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}`;

const jsonCode = `{
  "name": "@ybouhjira/hyperkit",
  "version": "2.5.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./dist/index.css": "./dist/index.css"
  },
  "peerDependencies": {
    "solid-js": "^1.8.0"
  }
}`;

const longCode = `// This is a longer code example to test horizontal scrolling
function processLargeDataset(data, options = { verbose: true, parallel: false, maxWorkers: 4 }) {
  const results = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const processed = transform(item, options.transformFunction || defaultTransform);
    const validated = validate(processed, options.validationRules || defaultValidationRules);

    if (validated.isValid) {
      results.push({ ...validated.data, processedAt: Date.now(), index: i });
    } else {
      console.warn(\`Validation failed for item at index \${i}:\`, validated.errors);
    }
  }

  return results;
}

function defaultTransform(item) {
  return { ...item, transformed: true, timestamp: Date.now() };
}

function defaultValidationRules(item) {
  return item !== null && typeof item === 'object' && Object.keys(item).length > 0;
}

// Example usage
const data = generateTestData(1000);
const results = processLargeDataset(data, { verbose: true, parallel: true, maxWorkers: 8 });
console.log(\`Processed \${results.length} items successfully\`);`;

export const TypeScript: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
  },
};

export const JavaScript: Story = {
  args: {
    code: javascriptCode,
    language: 'javascript',
  },
};

export const WithLabel: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
    label: 'TypeScript',
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
    showLineNumbers: true,
  },
};

export const WithLabelAndLineNumbers: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
    label: 'Counter.tsx',
    showLineNumbers: true,
  },
};

export const JSON: Story = {
  args: {
    code: jsonCode,
    language: 'json',
    label: 'package.json',
  },
};

export const CSS: Story = {
  args: {
    code: cssCode,
    language: 'css',
    label: 'Button.css',
    showLineNumbers: true,
  },
};

export const PlainText: Story = {
  args: {
    code: 'This is plain text without syntax highlighting.\nIt can span multiple lines.\nBut no language is specified.',
  },
};

export const LongCode: Story = {
  args: {
    code: longCode,
    language: 'javascript',
    label: 'processData.js',
    showLineNumbers: true,
  },
};

export const Bash: Story = {
  args: {
    code: `#!/bin/bash

# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build`,
    language: 'bash',
    label: 'build.sh',
    showLineNumbers: true,
  },
};

export const HTML: Story = {
  args: {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SolidKit Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,
    language: 'html',
    label: 'index.html',
  },
};

export const EmptyCode: Story = {
  args: {
    code: '',
    label: 'Empty File',
  },
};
