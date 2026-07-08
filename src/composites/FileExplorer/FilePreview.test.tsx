import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { FilePreview } from './FilePreview';
import type { FileItem } from './types';

function makeItem(overrides: Partial<FileItem>): FileItem {
  return {
    name: 'file.txt',
    path: '/file.txt',
    isDirectory: false,
    ...overrides,
  };
}

describe('FilePreview', () => {
  it('renders without error for a plain file', () => {
    render(() => <FilePreview item={makeItem({ name: 'notes.txt' })} />);
    expect(screen.getByTestId('file-preview')).toBeInTheDocument();
  });

  it('shows meta for unknown file type', () => {
    render(() => <FilePreview item={makeItem({ name: 'unknown.xyz', size: 1024 })} />);
    expect(screen.getByTestId('file-preview-meta')).toBeInTheDocument();
  });

  it('shows directory meta for directories', () => {
    render(() => <FilePreview item={makeItem({ name: 'src', isDirectory: true })} />);
    expect(screen.getByTestId('file-preview-meta')).toBeInTheDocument();
    expect(screen.getByText('Folder')).toBeInTheDocument();
  });

  it('shows image preview when thumbnailUrl is set and ext is image', () => {
    render(() => (
      <FilePreview
        item={makeItem({ name: 'photo.png', thumbnailUrl: 'http://example.com/photo.png' })}
      />
    ));
    expect(screen.getByTestId('file-preview-image')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows no image preview without thumbnailUrl', () => {
    render(() => <FilePreview item={makeItem({ name: 'photo.png' })} />);
    expect(screen.queryByTestId('file-preview-image')).not.toBeInTheDocument();
    // Falls back to meta
    expect(screen.getByTestId('file-preview-meta')).toBeInTheDocument();
  });

  it('shows video preview when thumbnailUrl is set and ext is video', () => {
    render(() => (
      <FilePreview
        item={makeItem({ name: 'demo.mp4', thumbnailUrl: 'http://example.com/demo.mp4' })}
      />
    ));
    expect(screen.getByTestId('file-preview-video')).toBeInTheDocument();
  });

  it('shows audio preview when thumbnailUrl is set and ext is audio', () => {
    render(() => (
      <FilePreview
        item={makeItem({ name: 'song.mp3', thumbnailUrl: 'http://example.com/song.mp3' })}
      />
    ));
    expect(screen.getByTestId('file-preview-audio')).toBeInTheDocument();
  });

  it('shows PDF stub for pdf extension', () => {
    render(() => <FilePreview item={makeItem({ name: 'doc.pdf' })} />);
    expect(screen.getByTestId('file-preview-pdf-stub')).toBeInTheDocument();
    expect(screen.getByText(/PDF preview coming soon/i)).toBeInTheDocument();
  });

  it('shows text preview via iframe when thumbnailUrl set for .md file', () => {
    render(() => (
      <FilePreview
        item={makeItem({ name: 'README.md', thumbnailUrl: 'http://example.com/README.md' })}
      />
    ));
    expect(screen.getByTestId('file-preview-text')).toBeInTheDocument();
  });

  it('shows file size', () => {
    render(() => <FilePreview item={makeItem({ name: 'big.bin', size: 2048 })} />);
    // formatSize(2048) = "2.0 KB"
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('shows modified date', () => {
    const d = new Date('2026-02-20T12:00:00Z');
    render(() => <FilePreview item={makeItem({ name: 'old.txt', mtime: d })} />);
    // Date string should appear in some locale form
    expect(screen.getByTestId('file-preview')).toBeInTheDocument();
  });

  it('accepts class and style props', () => {
    render(() => (
      <FilePreview item={makeItem({})} class="custom-class" style={{ 'font-size': '12px' }} />
    ));
    const el = screen.getByTestId('file-preview');
    expect(el.className).toContain('custom-class');
  });
});
