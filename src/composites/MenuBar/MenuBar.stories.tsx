import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { MenuBar } from './MenuBar';
import type { MenuDefinition } from './MenuBar';

const Wrapper = (props: { children: JSX.Element }) => (
  <Box p="lg" bg="primary" minH="300px">
    {props.children}
  </Box>
);

const meta = {
  title: 'Navigation/MenuBar',
  component: MenuBar,
  tags: ['autodocs'],
} satisfies Meta<typeof MenuBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMenus: MenuDefinition[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'new', label: 'New File', shortcut: 'Ctrl+N', handler: () => console.log('New') },
      { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', handler: () => console.log('Open') },
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S', handler: () => console.log('Save') },
      { id: 'sep1', label: '', type: 'separator' },
      { id: 'exit', label: 'Exit', shortcut: 'Ctrl+Q', handler: () => console.log('Exit') },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', handler: () => console.log('Undo') },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', handler: () => console.log('Redo') },
      { id: 'sep2', label: '', type: 'separator' },
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', handler: () => console.log('Cut') },
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', handler: () => console.log('Copy') },
      { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', handler: () => console.log('Paste') },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      {
        id: 'sidebar',
        label: 'Sidebar',
        shortcut: 'Ctrl+B',
        handler: () => console.log('Sidebar'),
      },
      {
        id: 'terminal',
        label: 'Terminal',
        shortcut: 'Ctrl+`',
        handler: () => console.log('Terminal'),
      },
      {
        id: 'command',
        label: 'Command Palette',
        shortcut: 'Ctrl+Shift+P',
        handler: () => console.log('Command Palette'),
      },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { id: 'shortcuts', label: 'Keyboard Shortcuts', handler: () => console.log('Shortcuts') },
      { id: 'about', label: 'About', handler: () => console.log('About') },
    ],
  },
];

export const Default: Story = {
  args: {
    menus: defaultMenus,
  },
  render: (args) => (
    <Wrapper>
      <MenuBar {...args} />
    </Wrapper>
  ),
};

export const WithSubmenus: Story = {
  args: {
    menus: [
      {
        id: 'file',
        label: 'File',
        items: [
          { id: 'new', label: 'New File', shortcut: 'Ctrl+N', handler: () => console.log('New') },
          { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', handler: () => console.log('Open') },
          {
            id: 'recent',
            label: 'Open Recent',
            submenu: [
              { id: 'recent1', label: 'project.tsx', handler: () => console.log('Recent 1') },
              { id: 'recent2', label: 'component.css', handler: () => console.log('Recent 2') },
              { id: 'recent3', label: 'utils.ts', handler: () => console.log('Recent 3') },
            ],
          },
          { id: 'sep1', label: '', type: 'separator' },
          { id: 'exit', label: 'Exit', shortcut: 'Ctrl+Q', handler: () => console.log('Exit') },
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        items: [
          { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', handler: () => console.log('Undo') },
          { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', handler: () => console.log('Redo') },
        ],
      },
    ],
  },
  render: (args) => (
    <Wrapper>
      <MenuBar {...args} />
    </Wrapper>
  ),
};

export const WithCheckboxItems: Story = {
  args: {
    menus: [
      {
        id: 'view',
        label: 'View',
        items: [
          {
            id: 'sidebar',
            label: 'Show Sidebar',
            shortcut: 'Ctrl+B',
            type: 'checkbox',
            checked: true,
            handler: () => console.log('Toggle Sidebar'),
          },
          {
            id: 'terminal',
            label: 'Show Terminal',
            shortcut: 'Ctrl+`',
            type: 'checkbox',
            checked: false,
            handler: () => console.log('Toggle Terminal'),
          },
          {
            id: 'status',
            label: 'Show Status Bar',
            type: 'checkbox',
            checked: true,
            handler: () => console.log('Toggle Status Bar'),
          },
        ],
      },
    ],
  },
  render: (args) => (
    <Wrapper>
      <MenuBar {...args} />
    </Wrapper>
  ),
};

export const Empty: Story = {
  args: {
    menus: [],
  },
  render: (args) => (
    <Wrapper>
      <MenuBar {...args} />
    </Wrapper>
  ),
};
