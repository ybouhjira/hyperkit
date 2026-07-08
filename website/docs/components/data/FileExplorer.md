---
title: FileExplorer
description: File browser with tree, list, icons, and gallery views.
slug: /components/data/FileExplorer
---

# FileExplorer

File browser with tree, list, icons, and gallery views.

![FileExplorer preview](/img/components/FileExplorer.webp)

```tsx
import { FileExplorer } from '@ybouhjira/hyperkit';
```

## Examples

### Loading

```tsx
<FileExplorer items={[]} currentPath="/project" loading />
```

### Empty

```tsx
<FileExplorer items={[]} currentPath="/empty" />
```

### Many Files

```tsx
<FileExplorer
  items={[
      {
        name: 'file-0.ts',
        path: '/project/file-0.ts',
        isDirectory: true,
        size: 9611,
        modifiedAt: 2026-02-03T23:00:00.000Z
      },
      {
        name: 'file-1.ts',
        path: '/project/file-1.ts',
        isDirectory: true,
        size: 8645,
        modifiedAt: 2026-02-02T23:00:00.000Z
      },
      {
        name: 'file-2.ts',
        path: '/project/file-2.ts',
        isDirectory: true,
        size: 1788,
        modifiedAt: 2026-02-22T00:00:00.000Z
      },
      {
        name: 'file-3.ts',
        path: '/project/file-3.ts',
        isDirectory: true,
        size: 1560,
        modifiedAt: 2026-02-02T23:00:00.000Z
      },
      {
        name: 'file-4.ts',
        path: '/project/file-4.ts',
        isDirectory: true,
        size: 6414,
        modifiedAt: 2026-02-13T23:00:00.000Z
      },
      {
        name: 'file-5.ts',
        path: '/project/file-5.ts',
        isDirectory: false,
        size: 7771,
        modifiedAt: 2026-02-10T23:00:00.000Z
      },
      {
        name: 'file-6.ts',
        path: '/project/file-6.ts',
        isDirectory: false,
        size: 3528,
        modifiedAt: 2026-02-07T23:00:00.000Z
      },
      {
        name: 'file-7.ts',
        path: '/project/file-7.ts',
        isDirectory: false,
        size: 4843,
        modifiedAt: 2026-02-23T00:00:00.000Z
      },
      {
        name: 'file-8.ts',
        path: '/project/file-8.ts',
        isDirectory: false,
        size: 2756,
        modifiedAt: 2026-01-31T23:00:00.000Z
      },
      {
        name: 'file-9.ts',
        path: '/project/file-9.ts',
        isDirectory: false,
        size: 2507,
        modifiedAt: 2026-02-04T23:00:00.000Z
      },
      {
        name: 'file-10.ts',
        path: '/project/file-10.ts',
        isDirectory: false,
        size: 3119,
        modifiedAt: 2026-02-16T00:00:00.000Z
      },
      {
        name: 'file-11.ts',
        path: '/project/file-11.ts',
        isDirectory: false,
        size: 5326,
        modifiedAt: 2026-02-16T00:00:00.000Z
      },
      {
        name: 'file-12.ts',
        path: '/project/file-12.ts',
        isDirectory: false,
        size: 7234,
        modifiedAt: 2026-02-13T23:00:00.000Z
      },
      {
        name: 'file-13.ts',
        path: '/project/file-13.ts',
        isDirectory: false,
        size: 5493,
        modifiedAt: 2026-02-10T23:00:00.000Z
      },
      {
        name: 'file-14.ts',
        path: '/project/file-14.ts',
        isDirectory: false,
        size: 9936,
        modifiedAt: 2026-02-19T00:00:00.000Z
      },
      {
        name: 'file-15.ts',
        path: '/project/file-15.ts',
        isDirectory: false,
        size: 9230,
        modifiedAt: 2026-02-24T00:00:00.000Z
      },
      {
        name: 'file-16.ts',
        path: '/project/file-16.ts',
        isDirectory: false,
        size: 3331,
        modifiedAt: 2026-02-10T23:00:00.000Z
      },
      {
        name: 'file-17.ts',
        path: '/project/file-17.ts',
        isDirectory: false,
        size: 3279,
        modifiedAt: 2026-02-18T00:00:00.000Z
      },
      {
        name: 'file-18.ts',
        path: '/project/file-18.ts',
        isDirectory: false,
        size: 9611,
        modifiedAt: 2026-02-22T00:00:00.000Z
      },
      {
        name: 'file-19.ts',
        path: '/project/file-19.ts',
        isDirectory: false,
        size: 8802,
        modifiedAt: 2026-02-16T00:00:00.000Z
      },
      {
        name: 'file-20.ts',
        path: '/project/file-20.ts',
        isDirectory: false,
        size: 3027,
        modifiedAt: 2026-02-02T23:00:00.000Z
      },
      {
        name: 'file-21.ts',
        path: '/project/file-21.ts',
        isDirectory: false,
        size: 2719,
        modifiedAt: 2026-02-03T23:00:00.000Z
      },
      {
        name: 'file-22.ts',
        path: '/project/file-22.ts',
        isDirectory: false,
        size: 3658,
        modifiedAt: 2026-02-18T00:00:00.000Z
      },
      {
        name: 'file-23.ts',
        path: '/project/file-23.ts',
        isDirectory: false,
        size: 9477,
        modifiedAt: 2026-02-14T23:00:00.000Z
      },
      {
        name: 'file-24.ts',
        path: '/project/file-24.ts',
        isDirectory: false,
        size: 7972,
        modifiedAt: 2026-02-24T00:00:00.000Z
      },
      {
        name: 'file-25.ts',
        path: '/project/file-25.ts',
        isDirectory: false,
        size: 3443,
        modifiedAt: 2026-02-02T23:00:00.000Z
      },
      {
        name: 'file-26.ts',
        path: '/project/file-26.ts',
        isDirectory: false,
        size: 9624,
        modifiedAt: 2026-02-10T23:00:00.000Z
      },
      {
        name: 'file-27.ts',
        path: '/project/file-27.ts',
        isDirectory: false,
        size: 661,
        modifiedAt: 2026-02-11T23:00:00.000Z
      },
      {
        name: 'file-28.ts',
        path: '/project/file-28.ts',
        isDirectory: false,
        size: 3171,
        modifiedAt: 2026-02-01T23:00:00.000Z
      },
      {
        name: 'file-29.ts',
        path: '/project/file-29.ts',
        isDirectory: false,
        size: 9730,
        modifiedAt: 2026-02-12T23:00:00.000Z
      },
      {
        name: 'file-30.ts',
        path: '/project/file-30.ts',
        isDirectory: false,
        size: 8602,
        modifiedAt: 2026-02-13T23:00:00.000Z
      },
      {
        name: 'file-31.ts',
        path: '/project/file-31.ts',
        isDirectory: false,
        size: 7569,
        modifiedAt: 2026-02-03T23:00:00.000Z
      },
      {
        name: 'file-32.ts',
        path: '/project/file-32.ts',
        isDirectory: false,
        size: 9899,
        modifiedAt: 2026-01-31T23:00:00.000Z
      },
      {
        name: 'file-33.ts',
        path: '/project/file-33.ts',
        isDirectory: false,
        size: 4920,
        modifiedAt: 2026-02-11T23:00:00.000Z
      },
      {
        name: 'file-34.ts',
        path: '/project/file-34.ts',
        isDirectory: false,
        size: 4452,
        modifiedAt: 2026-02-03T23:00:00.000Z
      },
      {
        name: 'file-35.ts',
        path: '/project/file-35.ts',
        isDirectory: false,
        size: 1501,
        modifiedAt: 2026-02-18T00:00:00.000Z
      },
      {
        name: 'file-36.ts',
        path: '/project/file-36.ts',
        isDirectory: false,
        size: 4609,
        modifiedAt: 2026-02-12T23:00:00.000Z
      },
      {
        name: 'file-37.ts',
        path: '/project/file-37.ts',
        isDirectory: false,
        size: 4156,
        modifiedAt: 2026-02-10T23:00:00.000Z
      },
      {
        name: 'file-38.ts',
        path: '/project/file-38.ts',
        isDirectory: false,
        size: 6958,
        modifiedAt: 2026-02-18T00:00:00.000Z
      },
      {
        name: 'file-39.ts',
        path: '/project/file-39.ts',
        isDirectory: false,
        size: 3938,
        modifiedAt: 2026-02-24T00:00:00.000Z
      },
      {
        name: 'file-40.ts',
        path: '/project/file-40.ts',
        isDirectory: false,
        size: 9630,
        modifiedAt: 2026-02-17T00:00:00.000Z
      },
      {
        name: 'file-41.ts',
        path: '/project/file-41.ts',
        isDirectory: false,
        size: 8245,
        modifiedAt: 2026-02-23T00:00:00.000Z
      },
      {
        name: 'file-42.ts',
        path: '/project/file-42.ts',
        isDirectory: false,
        size: 7143,
        modifiedAt: 2026-02-24T00:00:00.000Z
      },
      {
        name: 'file-43.ts',
        path: '/project/file-43.ts',
        isDirectory: false,
        size: 3078,
        modifiedAt: 2026-02-20T00:00:00.000Z
      },
      {
        name: 'file-44.ts',
        path: '/project/file-44.ts',
        isDirectory: false,
        size: 5003,
        modifiedAt: 2026-02-19T00:00:00.000Z
      },
      {
        name: 'file-45.ts',
        path: '/project/file-45.ts',
        isDirectory: false,
        size: 9038,
        modifiedAt: 2026-02-09T23:00:00.000Z
      },
      {
        name: 'file-46.ts',
        path: '/project/file-46.ts',
        isDirectory: false,
        size: 8185,
        modifiedAt: 2026-02-24T00:00:00.000Z
      },
      {
        name: 'file-47.ts',
        path: '/project/file-47.ts',
        isDirectory: false,
        size: 7207,
        modifiedAt: 2026-02-07T23:00:00.000Z
      },
      {
        name: 'file-48.ts',
        path: '/project/file-48.ts',
        isDirectory: false,
        size: 7834,
        modifiedAt: 2026-02-23T00:00:00.000Z
      },
      {
        name: 'file-49.ts',
        path: '/project/file-49.ts',
        isDirectory: false,
        size: 7381,
        modifiedAt: 2026-02-11T23:00:00.000Z
      }
    ]}
  currentPath="/project"
  viewMode="list"
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `FileItem[]` | — | — |
| `currentPath` * | `string` | — | — |
| `onNavigate` | `(path: string) => void` | — | — |
| `onSelect` | `(item: FileItem) => void` | — | — |
| `onBack` | `() => void` | — | — |
| `loading` | `boolean` | — | — |
| `viewMode` | `ViewMode` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |
| `unstyled` | `boolean` | — | — |
| `showToolbar` | `boolean` | — | — |
| `onRefresh` | `() => void` | — | — |
| `onCreateFolder` | `(name: string) => void` | — | — |
| `expandedPaths` | `Set<string>` | — | — |
| `onToggleExpand` | `(path: string) => void` | — | — |
| `loadingPaths` | `Set<string>` | — | — |
| `childrenCache` | `Map<string, FileItem[]>` | — | — |
| `loadChildren` | `(path: string) => Promise<FileItem[]>` | — | — |
| `selectedPaths` | `Set<string>` | — | — |
| `onSelectionChange` | `(selectedPaths: Set<string>) => void` | — | — |
| `selection` | `string[]` | — | Controlled selection as array of paths |
| `sortField` | `SortField` | — | — |
| `sortDirection` | `SortDirection` | — | — |
| `onSortChange` | `(field: SortField, direction: SortDirection) => void` | — | — |
| `showStatusBar` | `boolean` | — | — |
| `showSidebar` | `boolean` | — | — |
| `previewPane` | `boolean` | — | — |
| `previewSlot` | `(item: FileItem) => JSX.Element` | — | Custom renderer for the preview pane. Receives the currently focused/selected item. |
| `mode` | `ExplorerMode` | — | — |
| `onConfirm` | `(selection: FileItem[]) => void` | — | Fires on double-click / Enter / "Choose" button press in picker mode |
| `defaultFileName` | `string` | — | Default filename for save mode |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-accent-muted`, `--sk-bg-elevated`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-comp-button-border-radius`, `--sk-comp-card-border-radius`, `--sk-comp-input-border-radius`, `--sk-comp-list-item-border-radius`, `--sk-comp-list-item-height`, `--sk-comp-list-item-padding`, `--sk-comp-toolbar-backdrop-filter`, `--sk-comp-toolbar-background`, `--sk-comp-toolbar-border-bottom`, `--sk-comp-toolbar-border-radius`, `--sk-comp-toolbar-padding`, `--sk-density-item-md`, `--sk-duration-fast`, `--sk-duration-normal`, `--sk-duration-spin`, `--sk-error`, `--sk-fe-archive-color`, `--sk-fe-audio-color`, `--sk-fe-code-color`, `--sk-fe-config-color`, `--sk-fe-dialog-explorer-max-h`, `--sk-fe-dialog-explorer-min-h`, `--sk-fe-dialog-w`, `--sk-fe-document-color`, `--sk-fe-folder-color`, `--sk-fe-image-color`, `--sk-fe-preview-img-max-h`, `--sk-fe-preview-pane-w`, `--sk-fe-save-input-w`, `--sk-fe-sidebar-w`, `--sk-fe-unknown-color`, `--sk-fe-video-color`, `--sk-file-explorer-col-date-w`, `--sk-file-explorer-col-name-w`, `--sk-file-explorer-col-name-w-md`, `--sk-file-explorer-col-size-w`, `--sk-file-explorer-col-type-w`, `--sk-file-explorer-dialog-max-w`, `--sk-file-explorer-empty-h`, `--sk-file-explorer-name-min-w`, `--sk-file-explorer-preview-h`, `--sk-file-explorer-preview-max-w`, `--sk-focus-color`, `--sk-focus-offset`, `--sk-focus-style`, `--sk-focus-width`, `--sk-font-mono`, `--sk-font-size-2xl`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-icon-lg`, `--sk-icon-md`, `--sk-icon-xl`, `--sk-icon-xs`, `--sk-info`, `--sk-motion-fast`, `--sk-motion-normal`, `--sk-radius-lg`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-lg`, `--sk-shadow-xl`, `--sk-space-2xl`, `--sk-space-2xs`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-state-disabled-opacity`, `--sk-state-hover-bg`, `--sk-state-selected-bg`, `--sk-success`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`, `--sk-z-dropdown`, `--sk-z-modal`
