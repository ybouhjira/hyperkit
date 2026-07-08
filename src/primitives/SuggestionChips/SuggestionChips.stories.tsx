import type { Meta, StoryObj } from 'storybook-solidjs';
import { SuggestionChips, type SuggestionChip } from './SuggestionChips';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta: Meta<typeof SuggestionChips> = {
  title: 'Data Entry/SuggestionChips',
  component: SuggestionChips,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionChips>;

// Icon components for stories
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

const CodeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const basicChips: SuggestionChip[] = [
  { id: '1', label: 'Quick search', icon: <SearchIcon /> },
  { id: '2', label: 'Recent files', icon: <FileIcon /> },
  { id: '3', label: 'Browse folders', icon: <FolderIcon /> },
  { id: '4', label: 'View code', icon: <CodeIcon /> },
];

const textOnlyChips: SuggestionChip[] = [
  { id: '1', label: 'Getting started' },
  { id: '2', label: 'Documentation' },
  { id: '3', label: 'Examples' },
  { id: '4', label: 'API Reference' },
  { id: '5', label: 'Community' },
];

const manyChips: SuggestionChip[] = [
  { id: '1', label: 'Search files', icon: <SearchIcon /> },
  { id: '2', label: 'Recent documents', icon: <FileIcon /> },
  { id: '3', label: 'Browse folders', icon: <FolderIcon /> },
  { id: '4', label: 'Code snippets', icon: <CodeIcon /> },
  { id: '5', label: 'Quick actions' },
  { id: '6', label: 'Settings' },
  { id: '7', label: 'Help & Support' },
  { id: '8', label: 'Keyboard shortcuts' },
];

export const Default: Story = {
  args: {
    chips: basicChips,
    onSelect: (chip) => console.log('Selected:', chip),
  },
};

export const TextOnly: Story = {
  args: {
    chips: textOnlyChips,
    onSelect: (chip) => console.log('Selected:', chip),
  },
};

export const ManyChips: Story = {
  args: {
    chips: manyChips,
    onSelect: (chip) => console.log('Selected:', chip),
  },
};

export const EmptyState: Story = {
  render: (props) => (
    <Stack p="xl" align="center" gap="md">
      <Stack align="center" gap="xs" color="muted">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <Text as="h3" size="xl" weight="semibold">
          No results found
        </Text>
        <Text size="base">Try one of these suggestions:</Text>
      </Stack>
      <SuggestionChips {...props} chips={basicChips} onSelect={(chip) => console.log(chip)} />
    </Stack>
  ),
};

export const WithDescriptions: Story = {
  args: {
    chips: [
      { id: '1', label: 'Quick search', icon: <SearchIcon />, description: 'Search all files' },
      {
        id: '2',
        label: 'Recent files',
        icon: <FileIcon />,
        description: 'View recently opened files',
      },
      {
        id: '3',
        label: 'Browse folders',
        icon: <FolderIcon />,
        description: 'Navigate folder structure',
      },
    ],
    onSelect: (chip) => console.log('Selected:', chip),
  },
};
