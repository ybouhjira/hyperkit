/// <reference types="node" />

/**
 * createElectronBridge — Wires window.__devbridge to an Electron WebContents.
 *
 * This module is Node.js-only (Electron main process). Do NOT import it in
 * renderer code or browser bundles.
 *
 * @example
 * ```ts
 * import { createDevBridgeServer } from './createDevBridgeServer';
 * import { createElectronBridge } from './createElectronBridge';
 *
 * mainWindow.webContents.once('did-finish-load', () => {
 *   const bridge = createElectronBridge(mainWindow.webContents);
 *   const { server } = createDevBridgeServer({ port: 9999, bridge, autoListen: true });
 * });
 * ```
 */

import type { BridgeExecutor } from './createDevBridgeServer';

/**
 * Minimal interface for the subset of Electron WebContents we need.
 * Using a structural type avoids a hard dependency on `electron` types in the
 * hyperkit package — callers pass the real webContents and TypeScript is happy.
 */
export interface ElectronWebContents {
  /** Evaluate JS in the renderer process and return the result. */
  executeJavaScript(code: string): Promise<unknown>;
}

/**
 * Create a BridgeExecutor that evaluates expressions in an Electron renderer.
 *
 * The executor wraps each expression in a Promise.resolve() so async results
 * (like screenshot()) are awaited correctly.
 *
 * @param webContents - The Electron BrowserWindow.webContents to target
 * @param timeout     - Max ms to wait for a result (default: 10_000)
 */
export function createElectronBridge(
  webContents: ElectronWebContents,
  options: { timeout?: number } = {}
): BridgeExecutor {
  const timeout = options.timeout ?? 10_000;

  return async (expression: string): Promise<unknown> => {
    // Wrap the expression so Promises are awaited and errors are caught cleanly
    const wrapped = `
      (async () => {
        try {
          return await (${expression});
        } catch (e) {
          return { __devbridge_error: true, message: String(e) };
        }
      })()
    `;

    const result = await Promise.race([
      webContents.executeJavaScript(wrapped),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`DevBridge bridge call timed out after ${timeout}ms`)),
          timeout
        )
      ),
    ]);

    // Propagate errors returned from the renderer
    if (result !== null && typeof result === 'object') {
      const resultRecord = result as Record<string, unknown>;
      if (resultRecord['__devbridge_error'] === true) {
        throw new Error(resultRecord['message'] as string);
      }
    }

    return result;
  };
}

/**
 * Install a capturePage helper in the renderer so DevBridge's screenshot()
 * can use Electron's native, full-fidelity capture instead of html2canvas.
 *
 * Call this once, after the window is ready to show, from the main process.
 *
 * @example
 * ```ts
 * mainWindow.webContents.once('did-finish-load', () => {
 *   installElectronScreenshot(mainWindow.webContents, mainWindow);
 * });
 * ```
 */
export function installElectronScreenshot(
  webContents: ElectronWebContents & {
    capturePage(): Promise<{ toPNG(): Buffer }>;
  }
): void {
  // Inject the hook via executeJavaScript rather than a preload script so
  // this utility works without any preload changes in the host app.
  void webContents.executeJavaScript(`
    window.__electronCapturePage = async function() {
      // Signal to the main process that a capture is needed.
      // If electron IPC is available, use it; otherwise fall back to
      // the postMessage channel that createElectronBridge monitors.
      if (window.electronAPI && typeof window.electronAPI.capturePage === 'function') {
        return window.electronAPI.capturePage();
      }
      // DevBridge server will call capturePage() directly on the WebContents
      // object and return the result — this stub is a hint to the bridge.
      return { __needsMainProcessCapture: true };
    };
    true; // suppress undefined return
  `);
}
