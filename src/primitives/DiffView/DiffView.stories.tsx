import type { Meta, StoryObj } from 'storybook-solidjs';
import { DiffView } from './DiffView';

const meta: Meta<typeof DiffView> = {
  title: 'Data Display/DiffView',
  component: DiffView,
  tags: ['autodocs'],
  argTypes: {
    view: { control: 'inline-radio', options: ['split', 'unified'] },
    language: {
      control: 'select',
      options: [undefined, 'typescript', 'javascript', 'json', 'css', 'yaml'],
    },
    diff: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DiffView>;

const SAMPLE = `diff --git a/src/greet.ts b/src/greet.ts
index abc1234..def5678 100644
--- a/src/greet.ts
+++ b/src/greet.ts
@@ -1,6 +1,7 @@
 import { createSignal, createMemo } from 'solid-js';
-export function greet(name: string) {
-  return \`Hello, \${name}\`;
+export function greet(name: string, greeting = 'Hello'): string {
+  return \`\${greeting}, \${name}! This is a deliberately long line to show the single horizontal scroll container.\`;
 }
 const answer = 42;
-const removedOnly = true;
+const addedA = 1;
+const addedB = 2;`;

const MULTI_FILE = `${SAMPLE}
diff --git a/README.md b/README.md
@@ -1,2 +1,2 @@
-# Old Title
+# New Title
 A description line.`;

export const Split: Story = {
  args: { diff: SAMPLE, view: 'split', language: 'typescript' },
};

export const Unified: Story = {
  args: { diff: SAMPLE, view: 'unified', language: 'typescript' },
};

export const MultiFile: Story = {
  args: { diff: MULTI_FILE, view: 'split', language: 'typescript' },
};

export const Empty: Story = {
  args: { diff: '', view: 'split' },
};
