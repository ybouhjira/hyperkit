import type { Meta, StoryObj } from 'storybook-solidjs';
import { Flex } from '../../primitives/Flex';
import { SplitButton } from './SplitButton';

const meta: Meta<typeof SplitButton> = {
  title: 'Data Entry/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Default: Story = {
  render: () => (
    <SplitButton
      label="Save"
      icon="save"
      onClick={() => console.log('Save clicked')}
      options={[
        { label: 'Save As...', icon: 'copy', onClick: () => console.log('Save As') },
        { label: 'Save All', icon: 'download', onClick: () => console.log('Save All') },
      ]}
    />
  ),
};

export const Primary: Story = {
  render: () => (
    <SplitButton
      label="Deploy"
      icon="upload"
      variant="primary"
      onClick={() => console.log('Deploy clicked')}
      options={[
        { label: 'Deploy to Staging', icon: 'play', onClick: () => console.log('Staging') },
        { label: 'Deploy to Production', icon: 'send', onClick: () => console.log('Production') },
        { label: 'Rollback', icon: 'refresh', onClick: () => console.log('Rollback') },
      ]}
    />
  ),
};

export const Danger: Story = {
  render: () => (
    <SplitButton
      label="Delete"
      icon="trash"
      variant="danger"
      onClick={() => console.log('Delete clicked')}
      options={[
        { label: 'Move to Trash', icon: 'trash', onClick: () => console.log('Trash') },
        { label: 'Delete Permanently', icon: 'x', onClick: () => console.log('Permanent') },
      ]}
    />
  ),
};

export const Small: Story = {
  render: () => (
    <Flex gap="sm" align="center">
      <SplitButton
        label="Run"
        icon="play"
        size="sm"
        onClick={() => console.log('Run')}
        options={[
          { label: 'Run Tests', icon: 'check', onClick: () => console.log('Tests') },
          { label: 'Run Debug', icon: 'terminal', onClick: () => console.log('Debug') },
        ]}
      />
      <SplitButton
        label="Build"
        icon="code"
        size="sm"
        variant="primary"
        onClick={() => console.log('Build')}
        options={[
          { label: 'Build Dev', onClick: () => console.log('Dev') },
          { label: 'Build Prod', onClick: () => console.log('Prod') },
        ]}
      />
    </Flex>
  ),
};

export const WithDisabledOptions: Story = {
  render: () => (
    <SplitButton
      label="Export"
      icon="download"
      onClick={() => console.log('Export clicked')}
      options={[
        { label: 'Export as PDF', icon: 'file', onClick: () => console.log('PDF') },
        {
          label: 'Export as Excel',
          icon: 'file',
          onClick: () => console.log('Excel'),
          disabled: true,
        },
        { label: 'Export as CSV', icon: 'file', onClick: () => console.log('CSV') },
        {
          label: 'Export as JSON',
          icon: 'code',
          onClick: () => console.log('JSON'),
          disabled: true,
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SplitButton
      label="Save"
      icon="save"
      disabled
      onClick={() => console.log('Save clicked')}
      options={[
        { label: 'Save As...', onClick: () => console.log('Save As') },
        { label: 'Save All', onClick: () => console.log('Save All') },
      ]}
    />
  ),
};
