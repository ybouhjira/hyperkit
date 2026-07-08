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

[AspectRatio](./layout/AspectRatio.md) · [Box](./layout/Box.md) · [Center](./layout/Center.md) · [Container](./layout/Container.md) · [DocumentPage](./layout/DocumentPage.md) · [Flex](./layout/Flex.md) · [Grid](./layout/Grid.md) · [MasonryGrid](./layout/MasonryGrid.md) · [MediaGrid](./layout/MediaGrid.md) · [ScrollArea](./layout/ScrollArea.md) · [Section](./layout/Section.md) · [Spacer](./layout/Spacer.md) · [Stack](./layout/Stack.md) · [Wrap](./layout/Wrap.md)

### [Input](./input/)

Form controls and user-input components.

[AudioInput](./input/AudioInput.md) · [Button](./input/Button.md) · [Checkbox](./input/Checkbox.md) · [ColorInput](./input/ColorInput.md) · [DateInput](./input/DateInput.md) · [DropZone](./input/DropZone.md) · [FileInput](./input/FileInput.md) · [FilterChip](./input/FilterChip.md) · [ImageInput](./input/ImageInput.md) · [Input](./input/Input.md) · [NumberInput](./input/NumberInput.md) · [RangeSlider](./input/RangeSlider.md) · [RecordButton](./input/RecordButton.md) · [SearchInput](./input/SearchInput.md) · [SegmentedBar](./input/SegmentedBar.md) · [SegmentedControl](./input/SegmentedControl.md) · [Select](./input/Select.md) · [Slider](./input/Slider.md) · [Switch](./input/Switch.md) · [TagInput](./input/TagInput.md) · [VideoInput](./input/VideoInput.md)

### [Display](./display/)

Content presentation and data display.

[AnnotationLayer](./display/AnnotationLayer.md) · [Badge](./display/Badge.md) · [Card](./display/Card.md) · [CodeBlock](./display/CodeBlock.md) · [ColorDot](./display/ColorDot.md) · [DiffView](./display/DiffView.md) · [ImagePreview](./display/ImagePreview.md) · [Kbd](./display/Kbd.md) · [Lightbox](./display/Lightbox.md) · [Markdown](./display/Markdown.md) · [MetricCard](./display/MetricCard.md) · [ProjectCard](./display/ProjectCard.md) · [SignalGrid](./display/SignalGrid.md) · [Skeleton](./display/Skeleton.md) · [Sparkline](./display/Sparkline.md) · [StatusDot](./display/StatusDot.md) · [StreamingText](./display/StreamingText.md) · [TerminalOutput](./display/TerminalOutput.md) · [Text](./display/Text.md) · [Timeline](./display/Timeline.md) · [Tooltip](./display/Tooltip.md) · [WaterfallChart](./display/WaterfallChart.md)

### [Feedback](./feedback/)

Loading, progress, and status indicators.

[EmptyState](./feedback/EmptyState.md) · [ErrorBanner](./feedback/ErrorBanner.md) · [LivePulse](./feedback/LivePulse.md) · [ProgressBar](./feedback/ProgressBar.md) · [ProgressRing](./feedback/ProgressRing.md) · [SpeakingIndicator](./feedback/SpeakingIndicator.md) · [Spinner](./feedback/Spinner.md) · [StreamingIndicator](./feedback/StreamingIndicator.md) · [TopProgressBar](./feedback/TopProgressBar.md)

### [Navigation](./navigation/)

Menus, overlays, and app navigation chrome.

[Accordion](./navigation/Accordion.md) · [BottomNav](./navigation/BottomNav.md) · [BottomSheet](./navigation/BottomSheet.md) · [Breadcrumb](./navigation/Breadcrumb.md) · [Collapsible](./navigation/Collapsible.md) · [Dialog](./navigation/Dialog.md) · [Drawer](./navigation/Drawer.md) · [Dropdown](./navigation/Dropdown.md) · [MenuBar](./navigation/MenuBar.md) · [MobileBottomBar](./navigation/MobileBottomBar.md) · [MobileNav](./navigation/MobileNav.md) · [MobilePanelView](./navigation/MobilePanelView.md) · [ModeSwitcher](./navigation/ModeSwitcher.md) · [Pagination](./navigation/Pagination.md) · [Popover](./navigation/Popover.md) · [Separator](./navigation/Separator.md) · [Sidebar](./navigation/Sidebar.md) · [StatusBar](./navigation/StatusBar.md) · [SuggestionChips](./navigation/SuggestionChips.md) · [TabBar](./navigation/TabBar.md) · [Tabs](./navigation/Tabs.md)

### [Chat & AI](./chat-ai/)

Chat interfaces and LLM tooling.

[AiCompanion](./chat-ai/AiCompanion.md) · [ChatWindow](./chat-ai/ChatWindow.md) · [CostTracker](./chat-ai/CostTracker.md) · [LLMChatBox](./chat-ai/LLMChatBox.md) · [MessageBubble](./chat-ai/MessageBubble.md) · [MessageInput](./chat-ai/MessageInput.md) · [MessageList](./chat-ai/MessageList.md) · [ModelSelector](./chat-ai/ModelSelector.md) · [PromptQueue](./chat-ai/PromptQueue.md) · [SessionIndicator](./chat-ai/SessionIndicator.md) · [SessionManager](./chat-ai/SessionManager.md) · [SessionSearch](./chat-ai/SessionSearch.md) · [SessionTabs](./chat-ai/SessionTabs.md) · [SubagentTracker](./chat-ai/SubagentTracker.md) · [ToolApproval](./chat-ai/ToolApproval.md) · [ToolExecution](./chat-ai/ToolExecution.md)

### [Data](./data/)

Tables, boards, dashboards, and file browsing.

[ActionForm](./data/ActionForm.md) · [DashboardContainer](./data/DashboardContainer.md) · [DashboardGrid](./data/DashboardGrid.md) · [DirectoryPicker](./data/DirectoryPicker.md) · [FileExplorer](./data/FileExplorer.md) · [IssueBoard](./data/IssueBoard.md) · [KanbanBoard](./data/KanbanBoard.md) · [LogViewer](./data/LogViewer.md) · [MediaTrimmer](./data/MediaTrimmer.md) · [ProjectDashboard](./data/ProjectDashboard.md) · [RepoCard](./data/RepoCard.md) · [StatBar](./data/StatBar.md) · [Table](./data/Table.md) · [VideoSourcePicker](./data/VideoSourcePicker.md)

### [Utilities](./utilities/)

Palettes, dialogs, settings, and developer tools.

[BugReporter](./utilities/BugReporter.md) · [CommandPalette](./utilities/CommandPalette.md) · [ConfirmDialog](./utilities/ConfirmDialog.md) · [ConnectionStatus](./utilities/ConnectionStatus.md) · [ContextMenu](./utilities/ContextMenu.md) · [DevToolbar](./utilities/DevToolbar.md) · [GuidedTour](./utilities/GuidedTour.md) · [Inspector](./utilities/Inspector.md) · [SettingsPanel](./utilities/SettingsPanel.md) · [SplitButton](./utilities/SplitButton.md) · [ThemeBuilder](./utilities/ThemeBuilder.md) · [ThemePickerModal](./utilities/ThemePickerModal.md) · [Toast](./utilities/Toast.md) · [UserProvider](./utilities/UserProvider.md)

