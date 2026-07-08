import { onCleanup, onMount, ParentProps } from 'solid-js';
import { Portal, DelegatedEvents, delegateEvents } from 'solid-js/web';
import { openDetachedWindow } from '../dock/detachedWindow';

export interface DetachedHostProps extends ParentProps {
  /** Fired when the panel must return to docked mode (popup closed or blocked). */
  onClosed: () => void;
}

/**
 * Hosts the DevTools panel DOM inside a separate popup window while the
 * components keep running in the main window's JS realm — so they read the
 * main document directly and the panel covers nothing in the IDE.
 */
export function DetachedHost(props: DetachedHostProps) {
  const handle = openDetachedWindow({ onClose: () => props.onClosed() });

  if (!handle) {
    // Popup blocked: fall back to docked mode once render settles.
    onMount(() => props.onClosed());
    return null;
  }

  // Solid delegates common events (click, input, …) on the realm's main
  // `document`; events inside the popup document never bubble there, so
  // delegation must also be installed on the popup document.
  delegateEvents(Array.from(DelegatedEvents), handle.window.document);
  onCleanup(() => handle.dispose());

  return (
    <Portal mount={handle.mount}>
      <div class="sk-devtools sk-devtools--detached">{props.children}</div>
    </Portal>
  );
}
