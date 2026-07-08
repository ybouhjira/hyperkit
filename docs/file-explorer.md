# FileExplorer Library

A comprehensive filesystem browser library inside HyperKit. Phase 1 delivers six composites, two hooks, and a shared type system — architected to grow into a full Nautilus-style desktop file manager.

## Architecture

```
src/composites/FileExplorer/
├── types.ts                 ← Shared FileItem, ExplorerMode, SortField, SortDirection
├── FileExplorer.tsx         ← Core explorer with two-pane, preview pane, mode prop
├── FileExplorerToolbar.tsx  ← Sort/filter/hidden-files toolbar; mode-specific actions
├── PathBreadcrumb.tsx       ← Clickable breadcrumb with editable inline-edit mode
├── FilePreview.tsx          ← Auto-detecting preview pane (image/video/audio/text/PDF)
├── FileContextMenu.tsx      ← Right-click context menu (consumer controls position)
├── FilePicker.tsx           ← Drop-in file-selection dialog
├── FileSavePicker.tsx       ← Drop-in save dialog with overwrite confirm
├── useFileNavigation.ts     ← Back/forward history stack hook
├── useDragDropFiles.ts      ← HTML5 drag-and-drop file drop hook
├── TreeView.tsx             ← Lazy-load tree with async loadChildren
└── index.ts                 ← Barrel re-exports
```

## Shared Types (`types.ts`)

```ts
interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  mtime?: Date;
  ctime?: Date;
  permissions?: string;
  owner?: string;
  isSymlink?: boolean;
  target?: string; // symlink target
  mimeType?: string;
  thumbnailUrl?: string; // used by FilePreview for media
}

type ExplorerMode = 'browser' | 'picker' | 'save';
type SortField = 'name' | 'size' | 'mtime' | 'type';
type SortDirection = 'asc' | 'desc';
```

## FilePicker Recipe

The most common use-case: replace ad-hoc file fetch/browse/pick code with a single component.

```tsx
import { FilePicker } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

const [open, setOpen] = createSignal(false);
const [items, setItems] = createSignal<FileItem[]>([]);

const handleNavigate = async (path: string) => {
  const files = await fetchDirectory(path);
  setItems(files);
};

<FilePicker
  open={open()}
  onClose={() => setOpen(false)}
  onPick={(selected) => console.log(selected)}
  items={items()}
  onNavigate={handleNavigate}
  filter={(item) => item.name.endsWith('.csv')}
  title="Choose a CSV file"
/>;
```

## FileSavePicker Recipe

```tsx
<FileSavePicker
  open={saveOpen()}
  onClose={() => setSaveOpen(false)}
  onSave={(directory, fileName) => saveFile(directory, fileName)}
  items={items()}
  defaultFileName="export.csv"
  onNavigate={handleNavigate}
/>
```

## Hooks

### `useFileNavigation`

Back/forward history with a minimal API:

```ts
const nav = useFileNavigation('/home/user');
nav.current(); // '/home/user'
nav.navigateTo('/etc');
nav.canGoBack(); // true
nav.back();
nav.canGoForward(); // true
nav.forward();
nav.history(); // full path history array
```

### `useDragDropFiles`

HTML5 drag-and-drop for file drops into any element:

```tsx
const { isDragOver, dragHandlers, droppedFiles } = useDragDropFiles((files) => {
  console.log('dropped', files);
});

<div class={isDragOver() ? 'active' : ''} {...dragHandlers}>
  Drop files here
</div>;
```

Uses an `enterCount` integer to prevent `isDragOver` flickering when hovering child elements.

## FilePreview

Auto-detects file type by extension and renders the appropriate viewer:

| Extension group                                  | Rendered as                                         |
| ------------------------------------------------ | --------------------------------------------------- |
| jpg, jpeg, png, gif, webp, svg, bmp              | `<img>` (uses `thumbnailUrl`)                       |
| mp4, webm, ogg, avi, mkv, mov                    | `<video controls>`                                  |
| mp3, wav, ogg, m4a, flac                         | `<audio controls>`                                  |
| txt, md, ts, tsx, js, jsx, json, yaml, css, html | `<iframe>` (uses `thumbnailUrl` as URL)             |
| pdf                                              | Stub "PDF preview coming soon"                      |
| directory or unknown                             | Icon + metadata (name, size, mtime, type, mimeType) |

```tsx
<FilePreview item={selectedItem()} />
```

## ExplorerMode

The `mode` prop on `FileExplorer` drives toolbar actions:

- `'browser'` (default): standard navigation toolbar
- `'picker'`: adds a "Choose" button; double-click or Enter on a file fires `onConfirm`
- `'save'`: adds a filename input and "Save" button in the toolbar

## Roadmap to Nautilus-Style File Manager (Phase 2+)

These are explicitly **not** in Phase 1 but the architecture supports them:

- Multi-pane layout (open folders side-by-side)
- Tab system (multiple directory tabs)
- Bookmarks / Places sidebar
- Batch operations (multi-select copy/move/delete)
- Drag-rearrange items
- Inline renaming
- OS-native file dialog integration via `DesktopProvider`
- Thumbnail generation via `useVideoPreview` hook
- Search within directory

## Testing

203 tests across 13 test files, all co-located with their source files. Run:

```bash
npx vitest run src/composites/FileExplorer
```
