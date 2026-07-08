import {
  type JSX,
  type Component,
  createSignal,
  Show,
  For,
  onMount,
  onCleanup,
  splitProps,
  batch,
} from 'solid-js';
import './AnnotationLayer.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AnnotationLayerReply {
  id: string;
  author: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AnnotationLayerItem {
  id: string;
  /** CSS selector path from the container root to the target element. */
  selector: string;
  /** Relative X position within the target element (0–1). */
  x: number;
  /** Relative Y position within the target element (0–1). */
  y: number;
  text: string;
  author: 'user' | 'ai';
  timestamp: number;
  status: 'open' | 'resolved';
  replies?: AnnotationLayerReply[];
}

export interface AnnotationLayerProps {
  annotations: AnnotationLayerItem[];
  /** Whether annotation mode is active (crosshair cursor + click-to-annotate). */
  enabled?: boolean;
  onAnnotationCreate?: (annotation: Omit<AnnotationLayerItem, 'id' | 'timestamp'>) => void;
  onAnnotationReply?: (annotationId: string, text: string) => void;
  onAnnotationResolve?: (annotationId: string) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  /** Whether to show resolved annotations.
   * @default true */
  showResolved?: boolean;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Walk from `element` up to (but not including) `root`, building a CSS selector
 * path like `div.card:nth-child(2) > h3`.
 */
function buildSelector(element: Element, root: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== root) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : '';
    const classes = Array.from(current.classList)
      .filter((c) => !c.startsWith('sk-annotation'))
      .map((c) => `.${c}`)
      .join('');

    // Compute nth-child for disambiguation
    const parent = current.parentElement;
    let nthChild = '';
    if (parent) {
      const currentTag = current.tagName;
      const siblings = Array.from(parent.children).filter((el) => el.tagName === currentTag);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        nthChild = `:nth-child(${index})`;
      }
    }

    segments.unshift(`${tag}${id}${classes}${nthChild}`);
    current = current.parentElement;
  }

  return segments.join(' > ') || root.tagName.toLowerCase();
}

/** Resolve an annotation's pixel position within the container. Returns null if element not found. */
function resolvePosition(
  container: HTMLElement,
  annotation: AnnotationLayerItem
): { left: number; top: number } | null {
  try {
    // Try selector first, fall back to data-annotation-id attribute
    const candidates = [
      () => container.querySelector(annotation.selector),
      () => container.querySelector(`[data-annotation-id="${annotation.id}"]`),
    ];

    let target: Element | null = null;
    for (const fn of candidates) {
      target = fn();
      if (target) break;
    }

    if (!target) return null;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const left = targetRect.left - containerRect.left + annotation.x * targetRect.width;
    const top = targetRect.top - containerRect.top + annotation.y * targetRect.height;

    return { left, top };
  } catch {
    return null;
  }
}

/** Clamp a popover so it doesn't overflow the viewport. */
function clampPopover(
  anchor: { left: number; top: number },
  popoverWidth = 280,
  popoverHeight = 300
): JSX.CSSProperties {
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchor.left + 16;
  let top = anchor.top;

  if (left + popoverWidth + margin > vw) {
    left = anchor.left - popoverWidth - 8;
  }
  if (top + popoverHeight + margin > vh) {
    top = vh - popoverHeight - margin;
  }
  if (left < margin) left = margin;
  if (top < margin) top = margin;

  return { left: `${left}px`, top: `${top}px` };
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface NewAnnotationPopoverProps {
  position: { left: number; top: number };
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

const NewAnnotationPopover: Component<NewAnnotationPopoverProps> = (props) => {
  const [text, setText] = createSignal('');
  let inputRef!: HTMLTextAreaElement;

  onMount(() => {
    inputRef.focus();
  });

  const confirm = () => {
    const value = text().trim();
    if (value) props.onConfirm(value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirm();
    }
    if (e.key === 'Escape') {
      props.onCancel();
    }
  };

  const style = () => clampPopover(props.position, 260, 140);

  return (
    <div
      class="sk-annotation-popover sk-annotation-popover--new"
      style={{ position: 'absolute', ...style() }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={inputRef}
        class="sk-annotation-input"
        placeholder="Add a comment… (Enter to save, Shift+Enter for newline)"
        value={text()}
        onInput={(e) => setText(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />
      <div class="sk-annotation-popover__actions">
        <button class="sk-annotation-btn sk-annotation-btn--ghost" onClick={() => props.onCancel()}>
          Cancel
        </button>
        <button
          class="sk-annotation-btn sk-annotation-btn--primary"
          disabled={!text().trim()}
          onClick={confirm}
        >
          Add
        </button>
      </div>
    </div>
  );
};

interface ThreadPopoverProps {
  annotation: AnnotationLayerItem;
  position: { left: number; top: number };
  onClose: () => void;
  onReply?: (annotationId: string, text: string) => void;
  onResolve?: (annotationId: string) => void;
  onDelete?: (annotationId: string) => void;
}

const ThreadPopover: Component<ThreadPopoverProps> = (props) => {
  const [replyText, setReplyText] = createSignal('');

  const submitReply = () => {
    const value = replyText().trim();
    if (value && props.onReply) {
      props.onReply(props.annotation.id, value);
      setReplyText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitReply();
    }
    if (e.key === 'Escape') {
      props.onClose();
    }
  };

  const style = () => clampPopover(props.position, 280, 320);
  const allMessages = () => [
    {
      id: props.annotation.id,
      author: props.annotation.author,
      text: props.annotation.text,
      timestamp: props.annotation.timestamp,
    },
    ...(props.annotation.replies ?? []),
  ];

  return (
    <div
      class="sk-annotation-popover sk-annotation-popover--thread"
      style={{ position: 'absolute', ...style() }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div class="sk-annotation-popover__header">
        <span
          class={`sk-annotation-popover__status ${
            props.annotation.status === 'resolved'
              ? 'sk-annotation-popover__status--resolved'
              : 'sk-annotation-popover__status--open'
          }`}
        >
          {props.annotation.status === 'resolved' ? '✓ Resolved' : '● Open'}
        </span>
        <div class="sk-annotation-popover__header-actions">
          <Show when={props.annotation.status === 'open' && props.onResolve}>
            <button
              class="sk-annotation-btn sk-annotation-btn--ghost sk-annotation-btn--sm"
              onClick={() => props.onResolve?.(props.annotation.id)}
              title="Mark as resolved"
            >
              ✓ Resolve
            </button>
          </Show>
          <Show when={props.onDelete}>
            <button
              class="sk-annotation-btn sk-annotation-btn--ghost sk-annotation-btn--sm sk-annotation-btn--danger"
              onClick={() => props.onDelete?.(props.annotation.id)}
              title="Delete annotation"
            >
              ✕
            </button>
          </Show>
          <button
            class="sk-annotation-btn sk-annotation-btn--ghost sk-annotation-btn--sm"
            onClick={() => props.onClose()}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Thread messages */}
      <div class="sk-annotation-thread">
        <For each={allMessages()}>
          {(msg) => (
            <div class={`sk-annotation-message sk-annotation-message--${msg.author}`}>
              <div class="sk-annotation-message__meta">
                <span class="sk-annotation-message__author">
                  {msg.author === 'ai' ? '⬡ AI' : '◎ You'}
                </span>
                <span class="sk-annotation-message__time">{formatTime(msg.timestamp)}</span>
              </div>
              <p class="sk-annotation-message__text">{msg.text}</p>
            </div>
          )}
        </For>
      </div>

      {/* Reply input */}
      <Show when={props.annotation.status === 'open'}>
        <div class="sk-annotation-popover__reply">
          <textarea
            class="sk-annotation-input sk-annotation-input--sm"
            placeholder="Reply… (Enter to send)"
            value={replyText()}
            onInput={(e) => setReplyText(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            class="sk-annotation-btn sk-annotation-btn--primary sk-annotation-btn--sm"
            disabled={!replyText().trim()}
            onClick={submitReply}
          >
            Reply
          </button>
        </div>
      </Show>
    </div>
  );
};

// ── AnnotationPin ──────────────────────────────────────────────────────────────

interface AnnotationPinProps {
  annotation: AnnotationLayerItem;
  index: number;
  position: { left: number; top: number };
  isOpen: boolean;
  onClick: (e: MouseEvent) => void;
}

const AnnotationPin: Component<AnnotationPinProps> = (props) => {
  const isResolved = () => props.annotation.status === 'resolved';

  return (
    <div
      class={`sk-annotation-pin ${isResolved() ? 'sk-annotation-pin--resolved' : ''} ${
        props.isOpen ? 'sk-annotation-pin--active' : ''
      }`}
      style={{
        left: `${props.position.left}px`,
        top: `${props.position.top}px`,
      }}
      onClick={(e) => props.onClick(e)}
      title={props.annotation.text}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') props.onClick(e as unknown as MouseEvent);
      }}
      aria-label={`Annotation ${props.index + 1}: ${props.annotation.text}`}
      aria-pressed={props.isOpen}
    >
      <Show when={!isResolved()}>
        <span class="sk-annotation-pin__pulse" aria-hidden="true" />
      </Show>
      <span class="sk-annotation-pin__label">{isResolved() ? '✓' : String(props.index + 1)}</span>
    </div>
  );
};

// ── AnnotationLayer ────────────────────────────────────────────────────────────

/** Overlay system that enables point-and-comment on any child content. */
export const AnnotationLayer: Component<AnnotationLayerProps> = (props) => {
  const [local] = splitProps(props, [
    'annotations',
    'enabled',
    'onAnnotationCreate',
    'onAnnotationReply',
    'onAnnotationResolve',
    'onAnnotationDelete',
    'showResolved',
    'children',
    'class',
    'style',
  ]);

  let containerRef!: HTMLDivElement;

  // Pending click position for the new-annotation popover
  const [pendingPos, setPendingPos] = createSignal<{
    containerPx: { left: number; top: number };
    selector: string;
    relX: number;
    relY: number;
  } | null>(null);

  // Which annotation thread is open
  const [openAnnotationId, setOpenAnnotationId] = createSignal<string | null>(null);

  const showResolved = () => local.showResolved ?? true;

  const visibleAnnotations = () =>
    local.annotations.filter((a) => showResolved() || a.status !== 'resolved');

  // ── Click handler ──────────────────────────────────────────────────────────

  const handleContainerClick = (e: MouseEvent) => {
    if (!local.enabled) return;
    // If a thread popover is open, close it
    if (openAnnotationId() !== null) {
      setOpenAnnotationId(null);
      return;
    }
    // If new-annotation popover is open, cancel it
    if (pendingPos() !== null) {
      setPendingPos(null);
      return;
    }

    const containerRect = containerRef.getBoundingClientRect();

    // Find topmost non-annotation element at click point
    const clickedEl = document.elementFromPoint(e.clientX, e.clientY);
    if (!clickedEl || !containerRef.contains(clickedEl)) return;

    // Walk up from clicked element to find an element that is inside the container
    // but not itself the container, and not an annotation overlay element
    let target: Element | null = clickedEl;
    while (target && target !== containerRef) {
      if (
        !target.classList.contains('sk-annotation-pin') &&
        !target.classList.contains('sk-annotation-pin__pulse') &&
        !target.classList.contains('sk-annotation-pin__label') &&
        !target.classList.contains('sk-annotation-popover') &&
        !target.closest('.sk-annotation-popover') &&
        !target.closest('.sk-annotation-pin')
      ) {
        break;
      }
      target = target.parentElement;
    }
    if (!target || target === containerRef) return;

    const selector = buildSelector(target, containerRef);
    const targetRect = target.getBoundingClientRect();
    const relX = (e.clientX - targetRect.left) / targetRect.width;
    const relY = (e.clientY - targetRect.top) / targetRect.height;

    const containerPx = {
      left: e.clientX - containerRect.left,
      top: e.clientY - containerRect.top,
    };

    batch(() => {
      setPendingPos({ containerPx, selector, relX, relY });
      setOpenAnnotationId(null);
    });
  };

  // ── Keyboard dismiss ───────────────────────────────────────────────────────

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      batch(() => {
        setPendingPos(null);
        setOpenAnnotationId(null);
      });
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });
  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // ── Create annotation ──────────────────────────────────────────────────────

  const handleCreate = (text: string) => {
    const pos = pendingPos();
    if (!pos) return;
    local.onAnnotationCreate?.({
      selector: pos.selector,
      x: pos.relX,
      y: pos.relY,
      text,
      author: 'user',
      status: 'open',
    });
    setPendingPos(null);
  };

  // ── Pin click ──────────────────────────────────────────────────────────────

  const handlePinClick = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    batch(() => {
      setPendingPos(null);
      setOpenAnnotationId((prev) => (prev === id ? null : id));
    });
  };

  return (
    <div
      ref={containerRef}
      class={`sk-annotation-layer${local.enabled ? ' sk-annotation-layer--active' : ''}${
        local.class ? ` ${local.class}` : ''
      }`}
      style={local.style}
      onClick={handleContainerClick}
    >
      {local.children}

      {/* Annotation pins */}
      <For each={visibleAnnotations()}>
        {(annotation, index) => {
          const pos = () => resolvePosition(containerRef, annotation);
          return (
            <Show when={pos() !== null}>
              <AnnotationPin
                annotation={annotation}
                index={index()}
                position={pos() ?? { left: 0, top: 0 }}
                isOpen={openAnnotationId() === annotation.id}
                onClick={(e) => handlePinClick(e, annotation.id)}
              />

              {/* Thread popover */}
              <Show when={openAnnotationId() === annotation.id}>
                <ThreadPopover
                  annotation={annotation}
                  position={pos() ?? { left: 0, top: 0 }}
                  onClose={() => setOpenAnnotationId(null)}
                  onReply={local.onAnnotationReply}
                  onResolve={local.onAnnotationResolve}
                  onDelete={local.onAnnotationDelete}
                />
              </Show>
            </Show>
          );
        }}
      </For>

      {/* New annotation input popover */}
      <Show when={pendingPos() !== null}>
        <NewAnnotationPopover
          position={pendingPos()?.containerPx ?? { left: 0, top: 0 }}
          onConfirm={handleCreate}
          onCancel={() => setPendingPos(null)}
        />
      </Show>
    </div>
  );
};
