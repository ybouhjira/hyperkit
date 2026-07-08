import type { Meta, StoryObj } from 'storybook-solidjs';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', onClick: () => console.log('Home') },
        { label: 'Projects', onClick: () => console.log('Projects') },
        { label: 'SolidKit', onClick: () => console.log('SolidKit') },
        { label: 'Components' },
      ]}
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', icon: 'home', onClick: () => console.log('Home') },
        { label: 'Documents', icon: 'folder', onClick: () => console.log('Documents') },
        { label: 'Reports', icon: 'folder', onClick: () => console.log('Reports') },
        { label: 'Q4-2024.pdf', icon: 'file' },
      ]}
    />
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb
      separator=">"
      items={[
        { label: 'Root', onClick: () => console.log('Root') },
        { label: 'Settings', onClick: () => console.log('Settings') },
        { label: 'Appearance' },
      ]}
    />
  ),
};

export const ArrowSeparator: Story = {
  render: () => (
    <Breadcrumb
      separator="→"
      items={[
        { label: 'Projects', icon: 'folder', onClick: () => console.log('Projects') },
        { label: 'SolidKit', icon: 'code', onClick: () => console.log('SolidKit') },
        { label: 'src', icon: 'folder', onClick: () => console.log('src') },
        { label: 'components', icon: 'folder', onClick: () => console.log('components') },
        { label: 'Button.tsx', icon: 'file' },
      ]}
    />
  ),
};

export const LongLabels: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Very Long Project Name That Exceeds Width', onClick: () => {} },
        { label: 'Another Really Long Folder Name', onClick: () => {} },
        { label: 'Short', onClick: () => {} },
        { label: 'CurrentFileWithVeryLongNameThatShouldTruncate.tsx' },
      ]}
    />
  ),
};

export const ShallowPath: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', icon: 'home', onClick: () => console.log('Home') },
        { label: 'Dashboard', icon: 'layout' },
      ]}
    />
  ),
};
