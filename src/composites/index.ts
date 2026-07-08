// Composites barrel - re-exports all composite components
export * from './AiCompanion';
export * from './ActionForm';
export * from './BottomSheet';
export * from './Breadcrumb';
export * from './BugReporter';
export * from './ChatWindow';
export * from './CommandPalette';
export * from './ConfirmDialog';
export * from './ConnectionStatus';
export * from './ContextMenu';
export * from './CostTracker';
export * from './DashboardContainer';
export * from './DashboardGrid';
export * from './DevToolbar';
export * from './DirectoryPicker';

// FileExplorer ecosystem - explicit exports to avoid ViewMode conflict
export {
  FileExplorer,
  FileIcon,
  FileExplorerToolbar,
  ViewModeSwitcher as FileViewModeSwitcher,
  PathBreadcrumb,
  TreeView,
  TreeNode,
  getFileType,
  ListView as FileListView,
  IconsView as FileIconsView,
  GalleryView as FileGalleryView,
  // New composites (Phase 1)
  FilePicker,
  FileSavePicker,
  FilePreview,
  FileContextMenu,
  formatSize,
  // New hooks
  useFileNavigation,
  useDragDropFiles,
} from './FileExplorer';
export type {
  FileExplorerProps,
  FileItem,
  ViewMode as FileViewMode,
  SortField as FileSortField,
  SortDirection as FileSortDirection,
  ExplorerMode,
  FileIconProps,
  FileExplorerToolbarProps,
  ViewModeSwitcherProps as FileViewModeSwitcherProps,
  TreeViewProps,
  TreeNodeProps,
  FileCategory,
  FileTypeInfo,
  PathBreadcrumbProps,
  ListViewProps as FileListViewProps,
  IconsViewProps as FileIconsViewProps,
  GalleryViewProps as FileGalleryViewProps,
  // New types (Phase 1)
  FilePickerProps,
  FileSavePickerProps,
  FilePreviewProps,
  FileContextMenuProps,
  FileContextMenuAction,
  FileNavigationState,
  DragDropFilesState,
} from './FileExplorer';

export * from './Inspector';
export * from './InspectPicker';
export * from './UserProvider';
export * from './IssueBoard';
export * from './GuidedTour';
export * from './KanbanBoard';
export * from './LLMChatBox';
export * from './LogViewer';
export * from './MediaTrimmer';
export * from './MenuBar';
export * from './MessageBubble';
export * from './MessageInput';
export * from './MessageList';
export * from './MobileBottomBar';
export * from './MobileNav';
export * from './MobilePanelView';
export * from './ModelSelector';
export * from './ModeSwitcher';
export * from './ProjectDashboard';
export * from './PromptQueue';
export * from './RepoCard';
export * from './SessionIndicator';
export * from './SessionManager';
export * from './SessionSearch';
export * from './SessionTabs';
export * from './SettingsPanel';
export * from './Sidebar';
export * from './SplitButton';
export * from './StatBar';
export * from './StatusBar';
export * from './SubagentTracker';
export * from './TabBar';
export * from './ThemeBuilder';
export * from './ThemePickerModal';
export * from './Toast';
export * from './ToolApproval';
export * from './ToolExecution';
export * from './VideoSourcePicker';
