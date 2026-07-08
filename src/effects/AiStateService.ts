import { Context, Effect, Layer, Stream } from 'effect';
import {
  getAllNavigables,
  inspectNavigables,
  dispatchAction,
  onAnyStateChange,
  onActionDispatched,
} from '../navigation/NavigableRegistry';
import type { AiStateError } from './errors';
import { AiStateError as AiStateErrorImpl } from './errors';

// ─── Domain Types ──────────────────────────────────────────────────────────────

export interface ComponentSnapshot {
  readonly id: string;
  readonly type: string;
  readonly selector: string;
  readonly textContent: string;
  readonly state?: Record<string, unknown>;
  readonly visible: boolean;
  readonly bounds: { x: number; y: number; width: number; height: number };
}

export interface AnnotationSnapshot {
  readonly id: string;
  readonly elementSelector: string;
  readonly text: string;
  readonly author: 'user' | 'ai';
  readonly status: 'open' | 'resolved';
  readonly replies: ReadonlyArray<{ author: string; text: string }>;
}

export interface AppSnapshot {
  readonly title: string;
  readonly url: string;
  readonly timestamp: number;
  readonly components: ReadonlyArray<ComponentSnapshot>;
  readonly annotations: ReadonlyArray<AnnotationSnapshot>;
  readonly viewportSize: { width: number; height: number };
}

export interface ElementContent {
  readonly selector: string;
  readonly tagName: string;
  readonly textContent: string;
  readonly attributes: Record<string, string>;
  readonly children: number;
  readonly bounds: { x: number; y: number; width: number; height: number };
}

export interface StateUpdate {
  readonly target: string;
  readonly operation: 'set' | 'merge' | 'delete';
  readonly path?: string;
  readonly value?: unknown;
}

export interface AppNotification {
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly title: string;
  readonly message?: string;
  readonly durationMs?: number;
}

export interface UserEvent {
  readonly type:
    'click' | 'annotation-create' | 'annotation-reply' | 'form-change' | 'action-trigger';
  readonly timestamp: number;
  readonly target?: string;
  readonly data?: Record<string, unknown>;
}

// ─── Notification Emitter ──────────────────────────────────────────────────────

type NotificationListener = (notification: AppNotification) => void;

const notificationListeners = new Set<NotificationListener>();

/** Subscribe to notifications pushed by the AI bridge. Returns an unsubscribe fn. */
export function onAiNotification(listener: NotificationListener): () => void {
  notificationListeners.add(listener);
  return () => notificationListeners.delete(listener);
}

function emitNotification(notification: AppNotification): void {
  notificationListeners.forEach((l) => l(notification));
}

// ─── Highlight Helper ──────────────────────────────────────────────────────────

const HIGHLIGHT_CLASS = 'sk-ai-highlight';

function injectHighlightStyles(): void {
  if (typeof document === 'undefined') return;
  const id = 'sk-ai-highlight-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes sk-ai-glow-pulse {
      0%, 100% { box-shadow: 0 0 0 2px var(--sk-accent, #6366f1), 0 0 12px 4px color-mix(in srgb, var(--sk-accent, #6366f1) 40%, transparent); }
      50%       { box-shadow: 0 0 0 3px var(--sk-accent, #6366f1), 0 0 20px 8px color-mix(in srgb, var(--sk-accent, #6366f1) 60%, transparent); }
    }
    .${HIGHLIGHT_CLASS} {
      animation: sk-ai-glow-pulse var(--sk-duration-slow, 300ms) ease-in-out infinite;
      position: relative;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
}

// ─── DOM Helper ───────────────────────────────────────────────────────────────

function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

function getBounds(el: Element): { x: number; y: number; width: number; height: number } {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

function collectAttributes(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

// ─── Service Interface ─────────────────────────────────────────────────────────

export interface AiStateService {
  // AI reads app state
  readonly getAppSnapshot: Effect.Effect<AppSnapshot, AiStateError>;
  readonly getElementContent: (selector: string) => Effect.Effect<ElementContent, AiStateError>;
  readonly getAnnotations: Effect.Effect<ReadonlyArray<AnnotationSnapshot>, AiStateError>;

  // AI modifies app state
  readonly pushStateUpdate: (update: StateUpdate) => Effect.Effect<void, AiStateError>;
  readonly pushNotification: (notification: AppNotification) => Effect.Effect<void, AiStateError>;
  readonly highlightElement: (
    selector: string,
    durationMs?: number
  ) => Effect.Effect<void, AiStateError>;

  // Event stream
  readonly userEvents: Stream.Stream<UserEvent, AiStateError>;
}

// ─── Context Tag ──────────────────────────────────────────────────────────────

export const AiStateService = Context.GenericTag<AiStateService>('AiStateService');

// ─── Implementation ───────────────────────────────────────────────────────────

function makeImpl(): AiStateService {
  // Push-based stream for user events — store emit so action/state listeners can feed into it
  type StreamEmit = Parameters<Parameters<typeof Stream.async<UserEvent, AiStateError>>[0]>[0];
  let streamEmit: StreamEmit | null = null;

  const userEvents: Stream.Stream<UserEvent, AiStateError> = Stream.async((emit) => {
    streamEmit = emit;

    const unsubAction = onActionDispatched((event) => {
      const ue: UserEvent = {
        type: 'action-trigger',
        timestamp: Date.now(),
        target: event.target,
        data: { action: event.action, params: event.params },
      };
      void emit.single(ue);
    });

    const unsubState = onAnyStateChange((_id, _state) => {
      // State changes are not user events per se — silently ignored in the stream
    });

    return Effect.sync(() => {
      unsubAction();
      unsubState();
    });
  });

  function pushUserEvent(event: UserEvent): void {
    void streamEmit?.single(event);
  }

  // Attach global click listener to emit click events
  if (typeof window !== 'undefined') {
    window.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const selector = target.id
        ? `#${target.id}`
        : target.className
          ? `.${String(target.className).split(' ').filter(Boolean).join('.')}`
          : target.tagName.toLowerCase();
      pushUserEvent({
        type: 'click',
        timestamp: Date.now(),
        target: selector,
        data: { tagName: target.tagName.toLowerCase() },
      });
    });
  }

  // ── getAppSnapshot ────────────────────────────────────────────────────────

  const getAppSnapshot: AiStateService['getAppSnapshot'] = Effect.try({
    try: (): AppSnapshot => {
      const infos = inspectNavigables();
      const navigables = getAllNavigables();

      const components: ComponentSnapshot[] = infos.map((info, i) => {
        const nav = navigables[i];
        const el =
          safeQuerySelector(`[data-navigable-id="${info.id}"]`) ?? safeQuerySelector(`#${info.id}`);
        const bounds = el ? getBounds(el) : { x: 0, y: 0, width: 0, height: 0 };
        const visible = el ? (el as HTMLElement).offsetParent !== null : false;
        const textContent = el?.textContent?.trim() ?? '';

        return {
          id: info.id,
          type: info.category ?? 'unknown',
          selector: `[data-navigable-id="${info.id}"]`,
          textContent,
          state: nav?.getState ? (nav.getState() as Record<string, unknown>) : undefined,
          visible,
          bounds,
        };
      });

      return {
        title: typeof document !== 'undefined' ? document.title : '',
        url: typeof location !== 'undefined' ? location.href : '',
        timestamp: Date.now(),
        components,
        annotations: [],
        viewportSize: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
      };
    },
    catch: (err): AiStateError =>
      new AiStateErrorImpl({ reason: err instanceof Error ? err.message : String(err) }),
  });

  // ── getElementContent ─────────────────────────────────────────────────────

  const getElementContent: AiStateService['getElementContent'] = (selector) =>
    Effect.try({
      try: (): ElementContent => {
        const el = safeQuerySelector(selector);
        if (!el) {
          throw new AiStateErrorImpl({ reason: `Element not found`, selector });
        }
        return {
          selector,
          tagName: el.tagName.toLowerCase(),
          textContent: el.textContent?.trim() ?? '',
          attributes: collectAttributes(el),
          children: el.children.length,
          bounds: getBounds(el),
        };
      },
      catch: (err): AiStateError =>
        err instanceof AiStateErrorImpl
          ? err
          : new AiStateErrorImpl({
              reason: err instanceof Error ? err.message : String(err),
              selector,
            }),
    });

  // ── getAnnotations ────────────────────────────────────────────────────────

  const getAnnotations: AiStateService['getAnnotations'] = Effect.succeed(
    [] as ReadonlyArray<AnnotationSnapshot>
  );

  // ── pushStateUpdate ───────────────────────────────────────────────────────

  const pushStateUpdate: AiStateService['pushStateUpdate'] = (update) =>
    Effect.tryPromise({
      try: async (): Promise<void> => {
        const actionName =
          update.operation === 'set'
            ? 'setState'
            : update.operation === 'merge'
              ? 'mergeState'
              : 'deleteState';

        await dispatchAction(update.target, actionName, {
          path: update.path,
          value: update.value,
        });
      },
      catch: (err): AiStateError =>
        new AiStateErrorImpl({
          reason: err instanceof Error ? err.message : String(err),
        }),
    });

  // ── pushNotification ──────────────────────────────────────────────────────

  const pushNotification: AiStateService['pushNotification'] = (notification) =>
    Effect.sync(() => {
      emitNotification(notification);
    });

  // ── highlightElement ──────────────────────────────────────────────────────

  const highlightElement: AiStateService['highlightElement'] = (selector, durationMs = 2000) =>
    Effect.try({
      try: (): void => {
        injectHighlightStyles();
        const el = safeQuerySelector(selector);
        if (!el) {
          throw new AiStateErrorImpl({ reason: `Element not found for highlight`, selector });
        }
        el.classList.add(HIGHLIGHT_CLASS);
        setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), durationMs);
      },
      catch: (err): AiStateError =>
        err instanceof AiStateErrorImpl
          ? err
          : new AiStateErrorImpl({
              reason: err instanceof Error ? err.message : String(err),
              selector,
            }),
    });

  return {
    getAppSnapshot,
    getElementContent,
    getAnnotations,
    pushStateUpdate,
    pushNotification,
    highlightElement,
    userEvents,
  };
}

// ─── Layer Factory ─────────────────────────────────────────────────────────────

/** Create a Layer that provides AiStateService. */
export function makeAiStateLayer(): Layer.Layer<AiStateService> {
  return Layer.succeed(AiStateService, makeImpl());
}
