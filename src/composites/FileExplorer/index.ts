// Types (shared across all FileExplorer components)
export type { FileItem, ViewMode, SortField, SortDirection, ExplorerMode } from './types';

// Core composite
export { FileExplorer, formatSize } from './FileExplorer';
export type { FileExplorerProps } from './FileExplorer';

// Picker composites (near-term dogfood goal)
export { FilePicker } from './FilePicker';
export type { FilePickerProps } from './FilePicker';

export { FileSavePicker } from './FileSavePicker';
export type { FileSavePickerProps } from './FileSavePicker';

// Preview pane
export { FilePreview } from './FilePreview';
export type { FilePreviewProps } from './FilePreview';

// Context menu
export { FileContextMenu } from './FileContextMenu';
export type { FileContextMenuProps, FileContextMenuAction } from './FileContextMenu';

// Sub-components (composable building blocks)
export { FileIcon } from './FileIcon';
export type { FileIconProps } from './FileIcon';

export { FileExplorerToolbar } from './FileExplorerToolbar';
export type { FileExplorerToolbarProps } from './FileExplorerToolbar';

export { ViewModeSwitcher } from './ViewModeSwitcher';
export type { ViewModeSwitcherProps } from './ViewModeSwitcher';

export { PathBreadcrumb } from './PathBreadcrumb';
export type { PathBreadcrumbProps } from './PathBreadcrumb';

export { TreeView } from './TreeView';
export type { TreeViewProps } from './TreeView';

export { TreeNode } from './TreeNode';
export type { TreeNodeProps } from './TreeNode';

// Hooks
export { useFileNavigation } from './useFileNavigation';
export type { FileNavigationState } from './useFileNavigation';

export { useDragDropFiles } from './useDragDropFiles';
export type { DragDropFilesState } from './useDragDropFiles';

// View sub-components
export { ListView } from './views/ListView';
export type { ListViewProps } from './views/ListView';
export { IconsView } from './views/IconsView';
export type { IconsViewProps } from './views/IconsView';
export { GalleryView } from './views/GalleryView';
export type { GalleryViewProps } from './views/GalleryView';

// Utilities
export { getFileType } from './fileTypes';
export type { FileCategory, FileTypeInfo } from './fileTypes';
