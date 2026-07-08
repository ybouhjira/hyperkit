// ── Navigation ────────────────────────────────────────
export {
  registerContentType,
  getContentType,
  getDefaultPanel,
  getPanelsForContentType,
  getAllContentTypes,
  clearContentTypes,
} from './ContentRegistry';

export { NavigationProvider, useNavigation } from './NavigationContext';
export type { NavigationProviderProps } from './NavigationContext';

export { useNavigable } from './useNavigable';

export { NavigationMenu } from './NavigationMenu';

export { PanelContentSlot } from './PanelContentSlot';

export type {
  ContentRef,
  ContentTypeDefinition,
  NavigationTarget,
  PanelCapability,
  ParamDef,
  PanelContentConfig,
  NavigationContextValue,
  NavigableResult,
  PanelContentSlotProps,
  NavigationMenuProps,
} from './types';

// ── NavigableRegistry ─────────────────────────────────
export {
  registerNavigable,
  unregisterNavigable,
  getNavigable,
  getAllNavigables,
  inspectNavigables,
  dispatchAction,
  clearNavigables,
  // #279 ActionMiddleware
  addActionMiddleware,
  removeActionMiddleware,
  clearActionMiddlewares,
  // #280 ActionEventStream
  onActionDispatched,
  getActionHistory,
  clearActionHistory,
  clearActionEventListeners,
  // #281 Reactive State Subscriptions
  onStateChange,
  onAnyStateChange,
  notifyStateChange,
  clearStateListeners,
  // #282 Global State Snapshot
  captureGlobalState,
  restoreGlobalState,
  diffState,
} from './NavigableRegistry';

export type {
  JsonSchema,
  NavigableDefinition,
  NavigableActionEntry,
  NavigableActionSchema,
  DispatchResult,
  NavigableInfo,
  // #279
  ActionMiddleware,
  // #280
  ActionEvent,
  // #281
  StateChangeListener,
  // #282
  AppStateSnapshot,
} from './NavigableRegistry';

// ── createNavigable ───────────────────────────────────
export { createNavigable } from './createNavigable';
export type {
  CreateNavigableOptions,
  NavigableActionConfig,
  NavigableHandle,
} from './createNavigable';

// ── Middleware ────────────────────────────────────────
export {
  createPermissionMiddleware,
  setActionPermission,
  clearActionPermissions,
  createUndoRedoMiddleware,
  createLoggingMiddleware,
  createAnalyticsMiddleware,
  createRateLimitMiddleware,
} from './middleware';
export type {
  PermissionLevel,
  PermissionMiddlewareOptions,
  UndoEntry,
  UndoRedoOptions,
  UndoRedoHandle,
  LoggingMiddlewareOptions,
  AnalyticsMetrics,
  AnalyticsMiddlewareOptions,
  AnalyticsMiddlewareHandle,
  RateLimitRule,
  RateLimitMiddlewareOptions,
} from './middleware';

// ── Transport ─────────────────────────────────────────
export {
  connectTransport,
  WebSocketTransportAdapter,
  MessagePortTransportAdapter,
  TauriIPCAdapter,
} from './transport';
export type {
  NavigableTransportAdapter,
  TransportMessage,
  TransportOptions,
  WebSocketTransportOptions,
  TauriIPCOptions,
} from './transport';

// ── Persistence ───────────────────────────────────────
export {
  LocalStorageAdapter,
  MemoryStorageAdapter,
  enableStatePersistence,
  serializeGlobalState,
  hydrateGlobalState,
  BroadcastChannelAdapter,
} from './persistence';
export type {
  StateStorageAdapter,
  PersistenceOptions,
  BroadcastChannelOptions,
} from './persistence';

// ── Health ─────────────────────────────────────────────
export { checkNavigableHealth } from './health';
export type { HealthStatus, NavigableHealth, HealthCheckOptions } from './health';

// ── Composition ──────────────────────────────────────
export { dispatchTransaction } from './composition';
export { registerCompositeAction, getCompositeActions, clearCompositeActions } from './composition';
export type {
  TransactionStep,
  TransactionResult,
  CompositeActionStep,
  CompositeActionDef,
} from './composition';

// ── Testing ───────────────────────────────────────────
export { TestNavigableRegistry, createTestRegistry } from './testing';
export type { MockNavigableOptions, MockNavigableHandle } from './testing';

// ── Replay (#297) ─────────────────────────────────────
export { startActionRecording, replaySession } from './replay';
export type {
  RecordedAction,
  ActionRecording,
  ReplayOptions,
  RecordingHandle,
  ReplayHandle,
} from './replay';

// ── DevTools ──────────────────────────────────────────
export { createNavigableDevTools } from './devtools';
export { useDevTools } from './devtools';
export type { DevToolsState, NavigableDevToolsHandle } from './devtools';
