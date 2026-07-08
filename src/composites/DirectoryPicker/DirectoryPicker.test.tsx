import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { DirectoryPicker } from './DirectoryPicker';

const dirs = [
  { name: 'src', path: '/project/src', isDirectory: true },
  { name: 'docs', path: '/project/docs', isDirectory: true },
  { name: 'package.json', path: '/project/package.json', isDirectory: false },
];

describe('DirectoryPicker', () => {
  it('renders with default title', () => {
    render(() => <DirectoryPicker items={dirs} currentPath="/project" />);
    expect(screen.getByText('Select Working Directory')).toBeInTheDocument();
  });

  it('uses custom title', () => {
    render(() => <DirectoryPicker items={dirs} currentPath="/project" title="Choose Folder" />);
    expect(screen.getByText('Choose Folder')).toBeInTheDocument();
  });

  it('shows description when provided', () => {
    render(() => (
      <DirectoryPicker items={dirs} currentPath="/project" description="Pick a workspace" />
    ));
    expect(screen.getByText('Pick a workspace')).toBeInTheDocument();
  });

  it('only shows directories', () => {
    render(() => <DirectoryPicker items={dirs} currentPath="/project" />);
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('docs')).toBeInTheDocument();
    expect(screen.queryByText('package.json')).not.toBeInTheDocument();
  });

  it('shows current path', () => {
    render(() => <DirectoryPicker items={dirs} currentPath="/project" />);
    // Current path shown in both explorer toolbar and action area
    const pathTexts = screen.getAllByText('/project');
    expect(pathTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelect with current path', async () => {
    const onSelect = vi.fn();
    render(() => <DirectoryPicker items={dirs} currentPath="/project" onSelect={onSelect} />);
    await fireEvent.click(screen.getByText('Select This Directory'));
    expect(onSelect).toHaveBeenCalledWith('/project');
  });

  it('applies custom class', () => {
    render(() => <DirectoryPicker items={[]} currentPath="/" class="bg-black" />);
    expect(screen.getByTestId('directory-picker').className).toContain('bg-black');
  });
});
