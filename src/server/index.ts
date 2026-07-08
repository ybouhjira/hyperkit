// ── NavigableRouter ────────────────────────────────────────────────────────
export { createNavigableRouter } from './NavigableRouter';
export type {
  NavigableRouterOptions,
  NavigableRouterHandle,
  IncomingRequest,
  ServerResponse,
  NextFunction,
} from './NavigableRouter';

// ── MCPToolGenerator ───────────────────────────────────────────────────────
export { generateMCPTools, routeMCPToolCall, buildToolName } from './MCPToolGenerator';
export type { MCPToolDefinition } from './MCPToolGenerator';

// ── DevBridge (browser-side) ───────────────────────────────────────────────
export { DevBridge } from './DevBridge';
export type { DevBridgeProps, DevBridgeAPI, DevBridgeHealth, ConsoleEntry } from './DevBridge';

// ── createDevBridgeServer (Node.js / Electron main) ───────────────────────
export { createDevBridgeServer } from './createDevBridgeServer';
export type {
  DevBridgeServerOptions,
  DevBridgeServerHandle,
  BridgeExecutor,
} from './createDevBridgeServer';

// ── createElectronBridge (Electron main) ──────────────────────────────────
export { createElectronBridge, installElectronScreenshot } from './createElectronBridge';
export type { ElectronWebContents } from './createElectronBridge';
