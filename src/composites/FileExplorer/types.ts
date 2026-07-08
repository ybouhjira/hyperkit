import type { JSX } from 'solid-js';

/**
 * A single file or directory item.
 *
 * @example
 * const item: FileItem = {
 *   name: 'README.md',
 *   path: '/project/README.md',
 *   isDirectory: false,
 *   size: 4096,
 *   mtime: new Date('2026-02-20'),
 * };
 */
export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  /** File size in bytes */
  size?: number;
  /** Last modified time (alias: mtime) */
  modifiedAt?: Date;
  /** Last modified time */
  mtime?: Date;
  /** Created/change time */
  ctime?: Date;
  /** Unix permission bits as string, e.g. "rwxr-xr-x" */
  permissions?: string;
  /** Owner username */
  owner?: string;
  /** Whether this item is a symbolic link */
  isSymlink?: boolean;
  /** Target path if this is a symlink */
  target?: string;
  /** MIME type, e.g. "image/png" */
  mimeType?: string;
  /** URL for a thumbnail image */
  thumbnailUrl?: string;
  /** User-supplied type label override */
  typeLabel?: string;
  /** User-supplied hex color for type icon */
  typeColor?: string;
  /** Category classification override */
  typeCategory?: string;
}

export type ViewMode = 'list' | 'icons' | 'gallery' | 'tree';
export type SortField = 'name' | 'size' | 'type' | 'modified';
export type SortDirection = 'asc' | 'desc';

/**
 * Explorer operating mode.
 * - `browser` – standard navigation (default)
 * - `picker`  – shows a "Choose" confirm button in the toolbar
 * - `save`    – shows a filename input + "Save" button in the toolbar
 */
export type ExplorerMode = 'browser' | 'picker' | 'save';

export type { JSX };
