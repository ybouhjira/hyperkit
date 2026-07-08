/**
 * Detached (pop-out) window wiring for the DevTools panel.
 *
 * Opens a same-origin popup via window.open and prepares it to host the
 * DevTools UI: copies the opener's stylesheets in, creates a mount node,
 * and reports when the user closes the popup. The DevTools components keep
 * running in the MAIN window's JS realm — only their DOM lives in the popup,
 * so they inspect the main document directly (no postMessage bridge needed)
 * and the highlight overlay still draws on the main window.
 *
 * Pure wiring — no Solid imports, fully testable with a mocked window.open.
 */

export interface DetachedWindowHandle {
  /** The popup window hosting the DevTools DOM. */
  window: Window;
  /** Element inside the popup the DevTools UI mounts into. */
  mount: HTMLElement;
  /**
   * Tear down: stop watching for user-close and close the popup.
   * After dispose, onClose will not fire. Safe to call twice.
   */
  dispose: () => void;
}

export interface OpenDetachedWindowOptions {
  /** Popup document title. */
  title?: string;
  /** Initial popup size (px). Structural, user-resizable afterwards. */
  width?: number;
  height?: number;
  /** Document whose stylesheets are copied into the popup. Default: global document. */
  sourceDocument?: Document;
  /** window.open implementation — injectable for tests. Default: global window.open. */
  openWindow?: (url: string, target: string, features: string) => Window | null;
  /** Fired once when the USER closes the popup (not when dispose() closes it). */
  onClose?: () => void;
}

/**
 * Clone every <style> and <link rel="stylesheet"> from the source document
 * into the target document's <head>, so the popup renders the DevTools with
 * the exact same CSS (including the built hyperkit-devtools.css and all
 * --sk-* token definitions) as the main window.
 */
export function copyStylesInto(target: Document, source: Document): void {
  const nodes = source.querySelectorAll('style, link[rel="stylesheet"]');
  for (const node of Array.from(nodes)) {
    target.head.appendChild(target.importNode(node, true));
  }
  // Token vars are often set inline on <html> (ThemeProvider does this).
  const rootStyle = source.documentElement.getAttribute('style');
  if (rootStyle) {
    target.documentElement.setAttribute('style', rootStyle);
  }
}

/**
 * Open the popup and prepare it as a DevTools host.
 * Returns null when the popup was blocked.
 */
export function openDetachedWindow(
  options: OpenDetachedWindowOptions = {},
): DetachedWindowHandle | null {
  const {
    title = 'HyperKit DevTools',
    width = 480,
    height = 640,
    sourceDocument = document,
    openWindow = (url, target, features) => window.open(url, target, features),
    onClose,
  } = options;

  const win = openWindow('', 'hk-devtools', `popup=yes,width=${width},height=${height}`);
  if (!win) return null;

  const doc = win.document;
  doc.title = title;
  copyStylesInto(doc, sourceDocument);

  const mount = doc.createElement('div');
  mount.className = 'sk-devtools-detached-root';
  doc.body.appendChild(mount);

  // 'pagehide' fires when the popup is closed. The popup never navigates
  // (it stays on the opener-created blank document), so this is reliable.
  let disposed = false;
  const handlePageHide = () => {
    if (disposed) return;
    disposed = true;
    onClose?.();
  };
  win.addEventListener('pagehide', handlePageHide);

  const dispose = () => {
    disposed = true;
    win.removeEventListener('pagehide', handlePageHide);
    if (!win.closed) win.close();
  };

  return { window: win, mount, dispose };
}
