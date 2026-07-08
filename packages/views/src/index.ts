export type {
  Kind,
  Shape,
  Intent,
  FieldState,
  BlueprintAnnotation,
  SolidkitViewsConfig,
} from './types';

export { UI_ANNOTATION_ID, ui, extractBlueprint } from './annotation';
export type { BlueprintField } from './annotation';

export type { Slot, SlotResolution, SlotMap } from './slot-map';
export { DEFAULT_SLOT_MAP, resolveSlot, extendSlotMap } from './slot-map';

export type { CanFn, FieldStateConfig, ResolvedFieldState } from './field-state';
export { resolveFieldState, isVisible, isInteractive, isCustomRender, fieldStateClass } from './field-state';

export type { ViewAction, ActionsConfig, ResolvedAction } from './actions';
export { filterActions, filterActionsConfig } from './actions';

export type {
  ViewKit,
  SlotRenderer,
  SlotRegistry,
  LayoutTemplate,
  CreateViewKitOptions,
} from './view-kit';
export {
  defaultViewKit,
  createViewKit,
  ALL_KINDS,
  ALL_SHAPES,
  DEFAULT_REGISTRY,
  DEFAULT_LAYOUTS,
} from './view-kit';

export type { CodegenConfig, GeneratedView, CodegenResult } from './codegen';
export { generateViews, resolveVisibleFields } from './codegen';

export type { ViewsProviderProps, ViewsContextValue } from './views-provider';
export { ViewsProvider, useViews } from './views-provider';

export type {
  ViewsTheme,
  DesignTokens,
  ComponentStyles,
  DataFormatters,
  ComponentSlots,
  Behaviors,
  RenderOverride,
  RenderOverrides,
} from './theme';
export {
  defaultTheme,
  mergeThemes,
  tokensToCss,
  formatValue,
  getSlotOverride,
  getRenderOverride,
  getBehavior,
  getSlotStyles,
} from './theme';

export type { SkeletonShape, DataState } from './skeleton';
export { SKELETON_SHAPES, detectDataState, getSkeletonShape, skeletonClass } from './skeleton';

export type { SelectionMode, SelectionState, SelectionCallbacks } from './selection';
export {
  createSelectionState,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection,
  selectionCount,
  selectedItems,
  selectionClass,
} from './selection';

export type { ElementRect, FlipSnapshot, FlipOptions, FlipTransition } from './flip';
export {
  captureSnapshot,
  calculateDelta,
  classifyFields,
  applyFlip,
  createFlipTransition,
  supportsViewTransitions,
  resolveFlipOptions,
} from './flip';

export type { DraggableConfig, DragState, DropResult, DragDropCallbacks } from './drag-drop';
export {
  createDragState,
  startDrag,
  updateDropTarget,
  completeDrop,
  cancelDrag,
  reorderItems,
  moveBetweenGroups,
  dragItemClass,
  dropZoneClass,
  isDraggableShape,
} from './drag-drop';

export type { EditorType, FieldEditor, EditFieldState, EditState, EditCallbacks } from './inline-edit';
export {
  detectEditorType,
  createEditState,
  startEditing,
  updateFieldValue,
  commitField,
  cancelField,
  getChanges,
  hasFieldError,
  hasErrors,
  editFieldClass,
  discardAll,
} from './inline-edit';

// Example blueprints
export { Issue, IssueStatus, Label, User } from './examples/Issue';
export type { Issue as IssueType, IssueStatus as IssueStatusType, Label as LabelType, User as UserType } from './examples/Issue';
