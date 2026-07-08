export { DevTools } from './DevTools';
export type { DevToolsProps } from './DevTools';
export { DevToolsProvider, useDevTools } from './context/DevToolsProvider';
export type { DevToolsProviderProps } from './context/DevToolsProvider';

// Re-export types
export type {
  DevToolsState,
  InspectedComponent,
  CssVarTrace,
  VarSource,
  InspectedProperty,
  MatchedRule,
  CssValue,
  VarExpression,
  TokenInfo,
} from './context/types';

// Dock + detach — panel positioning state and pop-out window wiring
export {
  DOCK_STORAGE_KEY,
  DOCK_POSITIONS,
  DEFAULT_DOCK_SIZES,
  isDockPosition,
  isSideDock,
  resizeCursor,
  loadDockPosition,
  saveDockPosition,
  nextDockSize,
  clampDockSize,
} from './dock/dockState';
export type { DockPosition, Point, ViewportSize } from './dock/dockState';
export { openDetachedWindow, copyStylesInto } from './dock/detachedWindow';
export type { DetachedWindowHandle, OpenDetachedWindowOptions } from './dock/detachedWindow';

// Engine exports for advanced usage
export {
  identifyComponent,
  getComponentLabel,
  isSolidKitElement,
  describeBem,
  getRegisteredComponents,
} from './engine/ComponentIdentifier';
export type {
  BemDescription,
  BemElementPart,
  BemModifierPart,
} from './engine/ComponentIdentifier';
export { tokensConsumed } from './engine/TokensConsumed';
export type { ConsumedToken } from './engine/TokensConsumed';
export { parseCssValue, extractVarNames, containsVar } from './engine/css-parser';
export { traceVarChain, traceElementStyles, describeTrace } from './engine/CssVariableTracer';
export { findMatchingRules, calculateSpecificity, getRawStyles } from './engine/StylesheetMatcher';
export { cleanSourceName, classifyRule, INLINE_SOURCE } from './engine/RuleProvenance';
export type { RuleOrigin } from './engine/RuleProvenance';
export { isThemeToken, getTokenMapping, resolveVarSource, getAllTokenGroups, getThemeKey, getAllTokenNames } from './engine/TokenRegistry';

// Theme Audit — per-element --sk-* token compliance verification
export {
  auditThemeCompliance,
  summarizeThemeAudit,
  normalizeCssValue,
  isRawLiteral,
  findMatchingToken,
  AUDITED_PROPERTIES,
  READABILITY_FLOOR_PX,
} from './engine/ThemeAuditEngine';
export type {
  ThemeAuditRow,
  ThemeAuditStatus,
  ThemeAuditSummary,
  AuditedProperty,
  PropertyKind,
} from './engine/ThemeAuditEngine';
export { ThemeAuditTab } from './ui/ThemeAuditTab';

// UX Audit
export { UxAuditTab } from './ui/UxAuditTab';
export { runUxAudit } from './engine/UxAuditEngine';
export type { UxAuditResult, UxAuditCheck, LawScore } from './engine/UxAuditEngine';

// Console forwarder — forward webview console + window errors to a backend
// endpoint. Standalone primitive any HyperKit app can adopt.
export {
  installConsoleForwarder,
  joinArgs,
  stringifyArg,
} from './console-forwarder/installConsoleForwarder';
export type {
  ConsoleForwarderEntry,
  ConsoleForwarderHandle,
  ConsoleForwarderOptions,
} from './console-forwarder/installConsoleForwarder';

// Perf probe — wedge hunter that records longtasks, instrumented timers,
// and hot loops. Standalone primitive any HyperKit app can adopt.
export { installPerfProbe } from './perf-probe/installPerfProbe';
export type {
  PerfEntry,
  PerfProbeHandle,
  PerfProbeOptions,
  PerfTarget,
} from './perf-probe/installPerfProbe';

// Main-thread monitor — Worker-based blocking detector that catches
// microtask starvation (which the timer-wrapper-based perf probe can't see).
export { installMainThreadMonitor } from './perf-probe/installMainThreadMonitor';
export type {
  MainThreadBlockedEntry,
  MainThreadMonitorHandle,
  MainThreadMonitorOptions,
  MainThreadTarget,
} from './perf-probe/installMainThreadMonitor';
