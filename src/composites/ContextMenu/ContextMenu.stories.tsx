import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { CodeBlock } from '../../primitives/CodeBlock';
import { SKContextMenu } from './ContextMenu';
import type { ContextMenuItem } from './ContextMenu';

const meta: Meta<typeof SKContextMenu> = {
  title: 'Feedback/ContextMenu',
  component: SKContextMenu,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof SKContextMenu>;

/** Dashed drop target that hosts the right-click surface in each story. */
const Target = (props: { children: JSX.Element }) => (
  <Box
    p="xl"
    bg="tertiary"
    borderRadius="md"
    style={{
      border: '2px dashed var(--sk-border)',
      'text-align': 'center',
      cursor: 'context-menu',
    }}
  >
    <Text>{props.children}</Text>
  </Box>
);

const basicItems: ContextMenuItem[] = [
  { label: 'Copy', icon: 'copy', shortcut: '⌘C', onClick: () => console.log('Copy') },
  { label: 'Cut', icon: 'edit', shortcut: '⌘X', onClick: () => console.log('Cut') },
  { label: 'Paste', icon: 'save', shortcut: '⌘V', onClick: () => console.log('Paste') },
  { type: 'separator' },
  {
    label: 'Delete',
    icon: 'trash',
    shortcut: '⌘⌫',
    onClick: () => console.log('Delete'),
    variant: 'danger',
  },
];

export const Default: Story = {
  render: () => (
    <SKContextMenu items={basicItems}>
      <Target>Right-click here</Target>
    </SKContextMenu>
  ),
};

const fileItems: ContextMenuItem[] = [
  { type: 'label', label: 'File Actions' },
  { label: 'Open', icon: 'external-link', shortcut: '⌘O', onClick: () => console.log('Open') },
  { label: 'Rename', icon: 'edit', shortcut: 'F2', onClick: () => console.log('Rename') },
  { label: 'Duplicate', icon: 'copy', onClick: () => console.log('Duplicate') },
  { type: 'separator' },
  { type: 'label', label: 'Sharing' },
  { label: 'Share Link', icon: 'link', onClick: () => console.log('Share') },
  { label: 'Copy URL', icon: 'copy', onClick: () => console.log('Copy URL') },
  { type: 'separator' },
  {
    label: 'Move to Trash',
    icon: 'trash',
    onClick: () => console.log('Delete'),
    variant: 'danger',
  },
];

export const WithSections: Story = {
  render: () => (
    <SKContextMenu items={fileItems}>
      <Target>Right-click for file menu</Target>
    </SKContextMenu>
  ),
};

const disabledItems: ContextMenuItem[] = [
  { label: 'Available Action', icon: 'check', onClick: () => console.log('Action') },
  {
    label: 'Disabled Action',
    icon: 'lock',
    onClick: () => console.log('Disabled'),
    disabled: true,
  },
  { label: 'Another Available', icon: 'star', onClick: () => console.log('Available') },
  { type: 'separator' },
  {
    label: 'Disabled Delete',
    icon: 'trash',
    onClick: () => console.log('Delete'),
    variant: 'danger',
    disabled: true,
  },
];

export const WithDisabledItems: Story = {
  render: () => (
    <SKContextMenu items={disabledItems}>
      <Target>Right-click to see disabled items</Target>
    </SKContextMenu>
  ),
};

const codeItems: ContextMenuItem[] = [
  {
    label: 'Go to Definition',
    icon: 'code',
    shortcut: 'F12',
    onClick: () => console.log('Go to def'),
  },
  {
    label: 'Find References',
    icon: 'search',
    shortcut: '⇧F12',
    onClick: () => console.log('Find refs'),
  },
  { type: 'separator' },
  {
    label: 'Format Document',
    icon: 'settings',
    shortcut: '⇧⌥F',
    onClick: () => console.log('Format'),
  },
  { label: 'Organize Imports', onClick: () => console.log('Organize') },
  { type: 'separator' },
  { label: 'Run', icon: 'terminal', shortcut: '⌘R', onClick: () => console.log('Run') },
];

export const CodeEditor: Story = {
  render: () => (
    <SKContextMenu items={codeItems}>
      <Box style={{ cursor: 'context-menu' }}>
        <CodeBlock
          language="typescript"
          code={`function hello() {
  console.log("Right-click me!");
}`}
        />
      </Box>
    </SKContextMenu>
  ),
};

const dangerItems: ContextMenuItem[] = [
  { label: 'Archive', icon: 'save', onClick: () => console.log('Archive') },
  { label: 'Mark as Read', icon: 'check', onClick: () => console.log('Mark read') },
  { type: 'separator' },
  {
    label: 'Delete Forever',
    icon: 'trash',
    shortcut: '⌘⌫',
    onClick: () => console.log('Delete'),
    variant: 'danger',
  },
  { label: 'Clear All Data', icon: 'x', onClick: () => console.log('Clear'), variant: 'danger' },
];

export const DangerActions: Story = {
  render: () => (
    <SKContextMenu items={dangerItems}>
      <Target>Right-click for destructive actions</Target>
    </SKContextMenu>
  ),
};
