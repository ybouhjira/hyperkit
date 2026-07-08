import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { FileIcon } from './FileIcon';
import type { FileIconItem } from './FileIcon';

const makeItem = (overrides: Partial<FileIconItem> = {}): FileIconItem => ({
  name: 'file.txt',
  path: '/file.txt',
  isDirectory: false,
  ...overrides,
});

describe('FileIcon', () => {
  describe('renders correct icon by category', () => {
    it('renders folder icon for directories', () => {
      render(() => <FileIcon item={makeItem({ name: 'src', isDirectory: true })} />);
      const icon = screen.getByTestId('file-icon');
      // Folder SVG uses the folder path
      expect(icon.querySelector('path')?.getAttribute('d')).toContain('M2 6a2 2 0 012-2h5l2 2h5');
    });

    it('renders code icon for .ts files', () => {
      render(() => <FileIcon item={makeItem({ name: 'index.ts' })} />);
      const icon = screen.getByTestId('file-icon');
      // Code SVG uses the angle-bracket path
      expect(icon.querySelector('path')?.getAttribute('d')).toContain('M12.316 3.051');
    });

    it('renders generic file icon for unknown files', () => {
      render(() => <FileIcon item={makeItem({ name: 'file.xyz' })} />);
      const icon = screen.getByTestId('file-icon');
      // Generic file SVG path
      expect(icon.querySelector('path')?.getAttribute('d')).toContain('M4 4a2 2 0 012-2h4.586');
    });

    it('renders generic file icon for documents', () => {
      render(() => <FileIcon item={makeItem({ name: 'README.md' })} />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.querySelector('path')?.getAttribute('d')).toContain('M4 4a2 2 0 012-2h4.586');
    });
  });

  describe('applies correct colors', () => {
    it('applies TypeScript color for .ts files', () => {
      render(() => <FileIcon item={makeItem({ name: 'index.ts' })} />);
      const icon = screen.getByTestId('file-icon');
      // Should use CSS class for code category
      expect(icon.className).toContain('sk-fe-icon--code');
      // Should NOT have inline style when typeColor is not provided
      expect(icon.getAttribute('style')).toBeFalsy();
    });

    it('applies folder color for directories', () => {
      render(() => <FileIcon item={makeItem({ name: 'src', isDirectory: true })} />);
      const icon = screen.getByTestId('file-icon');
      // Should use CSS class for folder category
      expect(icon.className).toContain('sk-fe-icon--folder');
      // Should NOT have inline style when typeColor is not provided
      expect(icon.getAttribute('style')).toBeFalsy();
    });

    it('applies unknown color for unrecognized files', () => {
      render(() => <FileIcon item={makeItem({ name: 'Makefile' })} />);
      const icon = screen.getByTestId('file-icon');
      // Should use CSS class for unknown category
      expect(icon.className).toContain('sk-fe-icon--unknown');
      // Should NOT have inline style when typeColor is not provided
      expect(icon.getAttribute('style')).toBeFalsy();
    });

    it('uses typeColor override when provided', () => {
      render(() => <FileIcon item={makeItem({ name: 'index.ts', typeColor: '#FF0000' })} />);
      const icon = screen.getByTestId('file-icon');
      // When typeColor is provided, should use inline style
      expect(icon.getAttribute('style')).toContain('rgb(255, 0, 0)');
      // Should NOT have category class when typeColor is provided
      expect(icon.className).not.toContain('sk-fe-icon--code');
    });

    it('falls back to CSS class when typeColor is not provided', () => {
      render(() => <FileIcon item={makeItem({ name: 'index.ts' })} />);
      const icon = screen.getByTestId('file-icon');
      // Should use CSS class for code category
      expect(icon.className).toContain('sk-fe-icon--code');
      // Should NOT have inline style
      expect(icon.getAttribute('style')).toBeFalsy();
    });
  });

  describe('size classes', () => {
    it('applies sm size class by default', () => {
      render(() => <FileIcon item={makeItem()} />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.className).toContain('sk-file-icon--sm');
    });

    it('applies md size class when size is md', () => {
      render(() => <FileIcon item={makeItem()} size="md" />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.className).toContain('sk-file-icon--md');
    });

    it('applies lg size class when size is lg', () => {
      render(() => <FileIcon item={makeItem()} size="lg" />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.className).toContain('sk-file-icon--lg');
    });

    it('applies sm size class when size is explicitly sm', () => {
      render(() => <FileIcon item={makeItem()} size="sm" />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.className).toContain('sk-file-icon--sm');
    });
  });

  describe('renders SVG', () => {
    it('renders an svg element', () => {
      render(() => <FileIcon item={makeItem()} />);
      const icon = screen.getByTestId('file-icon');
      expect(icon.querySelector('svg')).not.toBeNull();
    });

    it('svg sizing is handled by CSS via BEM class on container', () => {
      render(() => <FileIcon item={makeItem()} />);
      const icon = screen.getByTestId('file-icon');
      // Sizing is now handled by CSS on the sk-file-icon container, not svg class attributes
      expect(icon.className).toContain('sk-file-icon');
      expect(icon.querySelector('svg')).not.toBeNull();
    });
  });
});
