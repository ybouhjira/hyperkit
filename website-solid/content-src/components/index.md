---
title: Components
description: The full HyperKit component catalog, organized by category.
sidebar_position: 0
---

# Components

HyperKit ships 131 components. Every component is themed through `--sk-*` CSS custom properties and imported from a single package:

```tsx
import { Button, Card, Table } from '@ybouhjira/hyperkit';
```

### [Layout](./layout/)

Structural primitives for arranging content.

[AspectRatio](./layout/AspectRatio.mdx) · [Box](./layout/Box.mdx) · [Center](./layout/Center.mdx) · [Container](./layout/Container.mdx) · [DocumentPage](./layout/DocumentPage.mdx) · [Flex](./layout/Flex.mdx) · [Grid](./layout/Grid.mdx) · [MasonryGrid](./layout/MasonryGrid.mdx) · [MediaGrid](./layout/MediaGrid.mdx) · [ScrollArea](./layout/ScrollArea.mdx) · [Section](./layout/Section.mdx) · [Spacer](./layout/Spacer.mdx) · [Stack](./layout/Stack.mdx) · [Wrap](./layout/Wrap.mdx)

### [Input](./input/)

Form controls and user-input components.

[AudioInput](./input/AudioInput.mdx) · [Button](./input/Button.mdx) · [Checkbox](./input/Checkbox.mdx) · [ColorInput](./input/ColorInput.mdx) · [DateInput](./input/DateInput.mdx) · [DropZone](./input/DropZone.mdx) · [FileInput](./input/FileInput.mdx) · [FilterChip](./input/FilterChip.mdx) · [ImageInput](./input/ImageInput.mdx) · [Input](./input/Input.mdx) · [NumberInput](./input/NumberInput.mdx) · [RangeSlider](./input/RangeSlider.mdx) · [RecordButton](./input/RecordButton.mdx) · [SearchInput](./input/SearchInput.mdx) · [SegmentedBar](./input/SegmentedBar.mdx) · [SegmentedControl](./input/SegmentedControl.mdx) · [Select](./input/Select.mdx) · [Slider](./input/Slider.mdx) · [Switch](./input/Switch.mdx) · [TagInput](./input/TagInput.mdx) · [VideoInput](./input/VideoInput.mdx)

### [Display](./display/)

Content presentation and data display.

[AnnotationLayer](./display/AnnotationLayer.mdx) · [Badge](./display/Badge.mdx) · [Card](./display/Card.mdx) · [CodeBlock](./display/CodeBlock.mdx) · [ColorDot](./display/ColorDot.mdx) · [DiffView](./display/DiffView.mdx) · [ImagePreview](./display/ImagePreview.mdx) · [Kbd](./display/Kbd.mdx) · [Lightbox](./display/Lightbox.mdx) · [Markdown](./display/Markdown.mdx) · [MetricCard](./display/MetricCard.mdx) · [ProjectCard](./display/ProjectCard.mdx) · [SignalGrid](./display/SignalGrid.mdx) · [Skeleton](./display/Skeleton.mdx) · [Sparkline](./display/Sparkline.mdx) · [StatusDot](./display/StatusDot.mdx) · [StreamingText](./display/StreamingText.mdx) · [TerminalOutput](./display/TerminalOutput.mdx) · [Text](./display/Text.mdx) · [Timeline](./display/Timeline.mdx) · [Tooltip](./display/Tooltip.mdx) · [WaterfallChart](./display/WaterfallChart.mdx)

### [Feedback](./feedback/)

Loading, progress, and status indicators.

[EmptyState](./feedback/EmptyState.mdx) · [ErrorBanner](./feedback/ErrorBanner.mdx) · [LivePulse](./feedback/LivePulse.mdx) · [ProgressBar](./feedback/ProgressBar.mdx) · [ProgressRing](./feedback/ProgressRing.mdx) · [SpeakingIndicator](./feedback/SpeakingIndicator.mdx) · [Spinner](./feedback/Spinner.mdx) · [StreamingIndicator](./feedback/StreamingIndicator.mdx) · [TopProgressBar](./feedback/TopProgressBar.mdx)

### [Navigation](./navigation/)

Menus, overlays, and app navigation chrome.

[Accordion](./navigation/Accordion.mdx) · [BottomNav](./navigation/BottomNav.mdx) · [BottomSheet](./navigation/BottomSheet.mdx) · [Breadcrumb](./navigation/Breadcrumb.mdx) · [Collapsible](./navigation/Collapsible.mdx) · [Dialog](./navigation/Dialog.mdx) · [Drawer](./navigation/Drawer.mdx) · [Dropdown](./navigation/Dropdown.mdx) · [MenuBar](./navigation/MenuBar.mdx) · [MobileBottomBar](./navigation/MobileBottomBar.mdx) · [MobileNav](./navigation/MobileNav.mdx) · [MobilePanelView](./navigation/MobilePanelView.mdx) · [ModeSwitcher](./navigation/ModeSwitcher.mdx) · [Pagination](./navigation/Pagination.mdx) · [Popover](./navigation/Popover.mdx) · [Separator](./navigation/Separator.mdx) · [Sidebar](./navigation/Sidebar.mdx) · [StatusBar](./navigation/StatusBar.mdx) · [SuggestionChips](./navigation/SuggestionChips.mdx) · [TabBar](./navigation/TabBar.mdx) · [Tabs](./navigation/Tabs.mdx)

### [Chat & AI](./chat-ai/)

Chat interfaces and LLM tooling.

[AiCompanion](./chat-ai/AiCompanion.mdx) · [ChatWindow](./chat-ai/ChatWindow.mdx) · [CostTracker](./chat-ai/CostTracker.mdx) · [LLMChatBox](./chat-ai/LLMChatBox.mdx) · [MessageBubble](./chat-ai/MessageBubble.mdx) · [MessageInput](./chat-ai/MessageInput.mdx) · [MessageList](./chat-ai/MessageList.mdx) · [ModelSelector](./chat-ai/ModelSelector.mdx) · [PromptQueue](./chat-ai/PromptQueue.mdx) · [SessionIndicator](./chat-ai/SessionIndicator.mdx) · [SessionManager](./chat-ai/SessionManager.mdx) · [SessionSearch](./chat-ai/SessionSearch.mdx) · [SessionTabs](./chat-ai/SessionTabs.mdx) · [SubagentTracker](./chat-ai/SubagentTracker.mdx) · [ToolApproval](./chat-ai/ToolApproval.mdx) · [ToolExecution](./chat-ai/ToolExecution.mdx)

### [Data](./data/)

Tables, boards, dashboards, and file browsing.

[ActionForm](./data/ActionForm.mdx) · [DashboardContainer](./data/DashboardContainer.mdx) · [DashboardGrid](./data/DashboardGrid.mdx) · [DirectoryPicker](./data/DirectoryPicker.mdx) · [FileExplorer](./data/FileExplorer.mdx) · [IssueBoard](./data/IssueBoard.mdx) · [KanbanBoard](./data/KanbanBoard.mdx) · [LogViewer](./data/LogViewer.mdx) · [MediaTrimmer](./data/MediaTrimmer.mdx) · [ProjectDashboard](./data/ProjectDashboard.mdx) · [RepoCard](./data/RepoCard.mdx) · [StatBar](./data/StatBar.mdx) · [Table](./data/Table.mdx) · [VideoSourcePicker](./data/VideoSourcePicker.mdx)

### [Utilities](./utilities/)

Palettes, dialogs, settings, and developer tools.

[BugReporter](./utilities/BugReporter.mdx) · [CommandPalette](./utilities/CommandPalette.mdx) · [ConfirmDialog](./utilities/ConfirmDialog.mdx) · [ConnectionStatus](./utilities/ConnectionStatus.mdx) · [ContextMenu](./utilities/ContextMenu.mdx) · [DevToolbar](./utilities/DevToolbar.mdx) · [GuidedTour](./utilities/GuidedTour.mdx) · [Inspector](./utilities/Inspector.mdx) · [SettingsPanel](./utilities/SettingsPanel.mdx) · [SplitButton](./utilities/SplitButton.mdx) · [ThemeBuilder](./utilities/ThemeBuilder.mdx) · [ThemePickerModal](./utilities/ThemePickerModal.mdx) · [Toast](./utilities/Toast.mdx) · [UserProvider](./utilities/UserProvider.mdx)
