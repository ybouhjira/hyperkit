import { createSignal, createEffect, onCleanup, For, Show, type ParentProps } from 'solid-js';
import { Button } from '../../primitives/Button/Button';
import { Badge } from '../../primitives/Badge/Badge';
import { Card } from '../../primitives/Card/Card';
import type {
  Annotation,
  AnnotationElementInfo,
  InspectorProps,
  InspectorStorage,
  ThreadMessage,
} from './types';
import { InspectorContext } from './context';
import { useInspectorStorage } from './context';
import '@ybouhjira/hyperkit-styles/composites/Inspector/Inspector.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const INSPECTOR_ATTR = 'data-sk-inspector';
// Note popover geometry lives here (not in CSS) because the placement math
// below needs the numbers to clamp against the viewport; width is applied
// inline together with the computed top/left.
const ANNOTATION_PANEL_WIDTH = 320;
const ANNOTATION_PANEL_HEIGHT = 240;
const PIN_OFFSET = 16;

// ─── InspectorProvider ───────────────────────────────────────────────────────

export interface InspectorProviderProps {
  storage: InspectorStorage;
}

export function InspectorProvider(props: ParentProps<InspectorProviderProps>) {
  const contextValue = {
    get storage() {
      return props.storage;
    },
  };
  return (
    <InspectorContext.Provider value={contextValue}>{props.children}</InspectorContext.Provider>
  );
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

function isInspectorElement(el: Element): boolean {
  let current: Element | null = el;
  while (current && current !== document.body) {
    if (current.hasAttribute(INSPECTOR_ATTR)) return true;
    current = current.parentElement;
  }
  return false;
}

function computeSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();
    const htmlEl = current as HTMLElement;
    if (htmlEl.id) {
      selector += '#' + htmlEl.id;
      parts.unshift(selector);
      break;
    }
    const classes = Array.from(current.classList)
      .filter((c: string) => !c.startsWith('sk-devtools') && !c.startsWith('inspector'))
      .slice(0, 2);
    if (classes.length !== 0) selector += '.' + classes.join('.');
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(current) + 1;
      if (siblings.length > 1) selector += ':nth-child(' + index + ')';
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

function getTextPreview(el: Element): string {
  const text = el.textContent || '';
  return text.trim().substring(0, 80) + (text.length > 80 ? '...' : '');
}

function getElementInfo(el: Element): AnnotationElementInfo {
  const rect = el.getBoundingClientRect();
  return {
    tagName: el.tagName.toLowerCase(),
    classes: Array.from(el.classList),
    textPreview: getTextPreview(el),
    boundingRect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    computedRole: el.getAttribute('role') ?? undefined,
    ariaLabel: el.getAttribute('aria-label') ?? undefined,
  };
}

/** Runtime-computed overlay geometry — visual styling lives in Inspector.css. */
function getOverlayPosition(el: Element): Record<string, string> {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  };
}

/** Runtime-computed popover placement — visual styling lives in Inspector.css. */
function getAnnotationPanelPosition(el: Element): Record<string, string> {
  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;

  const top =
    spaceBelow >= ANNOTATION_PANEL_HEIGHT + 8
      ? rect.bottom + 8
      : rect.top - ANNOTATION_PANEL_HEIGHT - 8;

  let left = rect.left;
  if (left + ANNOTATION_PANEL_WIDTH > window.innerWidth - 8) {
    left = window.innerWidth - ANNOTATION_PANEL_WIDTH - 8;
  }
  if (left < 8) left = 8;

  return {
    top: Math.max(8, top) + 'px',
    left: left + 'px',
    width: ANNOTATION_PANEL_WIDTH + 'px',
  };
}

function formatRelativeTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ─── ThreadMessageItem ───────────────────────────────────────────────────────

function ThreadMessageItem(props: { msg: ThreadMessage }) {
  const isClaude = () => props.msg.author === 'claude';
  const attr = { [INSPECTOR_ATTR]: 'true' };
  return (
    <div {...attr} class={`sk-inspector__msg ${isClaude() ? 'sk-inspector__msg--claude' : ''}`}>
      <div class="sk-inspector__msg-meta" {...attr}>
        <span class="sk-inspector__msg-author" {...attr}>
          {isClaude() ? 'Claude' : 'You'}
        </span>
        <span class="sk-inspector__msg-time" {...attr}>
          {formatRelativeTime(props.msg.timestamp)}
        </span>
      </div>
      <div class="sk-inspector__msg-text" {...attr}>
        {props.msg.text}
      </div>
    </div>
  );
}

// ─── ThreadItem ──────────────────────────────────────────────────────────────

function ThreadItem(props: {
  ann: Annotation;
  expanded: boolean;
  onToggle: () => void;
  onHighlight: () => void;
  onReply: (text: string) => void;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [replyText, setReplyText] = createSignal('');
  const attr = { [INSPECTOR_ATTR]: 'true' };

  function submitReply() {
    const text = replyText().trim();
    if (!text) return;
    props.onReply(text);
    setReplyText('');
  }

  const isResolved = () => props.ann.status === 'resolved';
  const firstMsg = () => props.ann.thread[0];
  const replyCount = () => props.ann.thread.length - 1;
  const el = () => props.ann.elementInfo;

  return (
    <div
      {...attr}
      class={`sk-inspector__thread ${isResolved() ? 'sk-inspector__thread--resolved' : ''}`}
    >
      {/* Thread header */}
      <div {...attr} class="sk-inspector__thread-header" onClick={() => props.onToggle()}>
        <div
          {...attr}
          class={`sk-inspector__dot ${isResolved() ? 'sk-inspector__dot--resolved' : ''}`}
        />
        <div class="sk-inspector__thread-main" {...attr}>
          <span class="sk-inspector__thread-selector" {...attr}>
            {'<' + (el()?.tagName || '?') + '>'}
            {(el()?.classes ?? [])
              .slice(0, 2)
              .map((c: string) => ' .' + c)
              .join('')}
            {el()?.textPreview != null
              ? ' "' + (el()?.textPreview ?? '').substring(0, 20) + '"'
              : ''}
          </span>
          <Show when={firstMsg()}>
            <span class="sk-inspector__thread-preview" {...attr}>
              {firstMsg()?.text}
            </span>
          </Show>
        </div>
        <div class="sk-inspector__thread-actions" {...attr}>
          <Show when={replyCount() > 0}>
            <Badge variant="default" {...attr}>
              {replyCount()}
            </Badge>
          </Show>
          <div {...attr} title={isResolved() ? 'Reopen' : 'Resolve'}>
            <Button
              {...attr}
              variant="ghost"
              size="sm"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                props.onResolve();
              }}
            >
              {isResolved() ? '↩' : '✓'}
            </Button>
          </div>
          <div {...attr} title="Delete">
            <Button
              {...attr}
              variant="ghost"
              size="sm"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                props.onDelete();
              }}
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded thread body */}
      <Show when={props.expanded}>
        <div {...attr} class="sk-inspector__thread-body">
          <Button
            {...attr}
            variant="ghost"
            size="sm"
            class="sk-inspector__jump-btn"
            onClick={props.onHighlight}
          >
            Jump to element ↗
          </Button>
          <div class="sk-inspector__msgs" {...attr}>
            <For each={props.ann.thread}>{(msg) => <ThreadMessageItem msg={msg} />}</For>
          </div>
          <div {...attr} class="sk-inspector__reply-box">
            <textarea
              {...attr}
              class="sk-inspector__textarea sk-inspector__textarea--reply"
              placeholder="Reply..."
              value={replyText()}
              onInput={(e) => setReplyText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  submitReply();
                }
                e.stopPropagation();
              }}
            />
            <div class="sk-inspector__actions sk-inspector__actions--reply" {...attr}>
              <span class="sk-inspector__kbd-hint" {...attr}>
                Ctrl+Enter
              </span>
              <Button
                {...attr}
                variant="primary"
                size="sm"
                disabled={!replyText().trim()}
                onClick={submitReply}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

// ─── Inspector ───────────────────────────────────────────────────────────────

export const Inspector = (props: InspectorProps) => {
  const storage = useInspectorStorage();

  const [hoveredEl, setHoveredEl] = createSignal<Element | null>(null);
  const [selectedEl, setSelectedEl] = createSignal<Element | null>(null);
  const [noteText, setNoteText] = createSignal('');
  const [annotations, setAnnotations] = createSignal<Annotation[]>([]);
  const [panelOpen, setPanelOpen] = createSignal(true);
  const [highlightEl, setHighlightEl] = createSignal<Element | null>(null);
  const [expandedId, setExpandedId] = createSignal<string | null>(null);
  const [filter, setFilter] = createSignal<'all' | 'open' | 'resolved'>('open');

  // Load annotations on mount
  createEffect(() => {
    storage
      .getAll()
      .then(setAnnotations)
      .catch(() => {});
  });

  // Real-time subscription (if storage supports it)
  createEffect(() => {
    if (!storage.subscribe) return;
    const unsub = storage.subscribe((updated) => {
      setAnnotations(updated);
      setPanelOpen(true);
    });
    onCleanup(unsub);
  });

  // Update overlay positions on scroll
  createEffect(() => {
    const onScroll = () => {
      const h = hoveredEl();
      if (h) setHoveredEl(h);
      const s = selectedEl();
      if (s) setSelectedEl(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onCleanup(() => window.removeEventListener('scroll', onScroll, { capture: true }));
  });

  // Inspect mode mouse/keyboard handlers
  createEffect(() => {
    if (!props.active) {
      setHoveredEl(null);
      setSelectedEl(null);
      setNoteText('');
      return;
    }

    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as Element;
      if (isInspectorElement(el)) return;
      setHoveredEl(el);
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target as Element;
      if (isInspectorElement(el)) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedEl(el);
      setHoveredEl(null);
      setNoteText('');
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedEl()) {
          setSelectedEl(null);
          setNoteText('');
        } else {
          props.onClose();
        }
      }
    };

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    onCleanup(() => {
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
    });
  });

  // ── Actions ──────────────────────────────────────────────────────────────

  function saveAnnotation() {
    const el = selectedEl();
    if (!el || !noteText().trim()) return;
    storage
      .create({
        selector: computeSelector(el),
        elementInfo: getElementInfo(el),
        note: noteText().trim(),
      })
      .then((saved) => {
        setAnnotations((prev) => [...prev, saved]);
        setSelectedEl(null);
        setNoteText('');
        setExpandedId(saved.id);
        setPanelOpen(true);
      })
      .catch(() => {});
  }

  function deleteAnnotation(id: string) {
    storage
      .delete(id)
      .then(() => setAnnotations((prev) => prev.filter((a) => a.id !== id)))
      .catch(() => {});
  }

  function replyToAnnotation(id: string, text: string) {
    storage
      .reply(id, text, 'user')
      .then((updated) => {
        setAnnotations((prev) => prev.map((a) => (a.id === id ? updated : a)));
      })
      .catch(() => {});
  }

  function toggleAnnotationStatus(ann: Annotation) {
    const newStatus = ann.status === 'resolved' ? 'open' : 'resolved';
    storage
      .update(ann.id, { status: newStatus })
      .then((updated) => {
        setAnnotations((prev) => prev.map((a) => (a.id === ann.id ? updated : a)));
      })
      .catch(() => {});
  }

  function highlightAnnotationElement(ann: Annotation) {
    try {
      const el = document.querySelector(ann.selector);
      if (el) {
        setHighlightEl(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightEl(null), 2000);
      }
    } catch {
      /* invalid selector */
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const filteredAnnotations = () => {
    const all = annotations();
    const sorted = [...all].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const f = filter();
    if (f === 'all') return sorted;
    return sorted.filter((a) => a.status === f);
  };

  const openCount = () => annotations().filter((a) => a.status === 'open').length;
  const resolvedCount = () => annotations().filter((a) => a.status === 'resolved').length;

  const attr = { [INSPECTOR_ATTR]: 'true' };

  return (
    <>
      {/* Hover highlight overlay */}
      <Show when={props.active && hoveredEl() != null && !selectedEl()}>
        <div
          {...attr}
          class="sk-inspector__overlay"
          style={getOverlayPosition(hoveredEl() as Element)}
        >
          <div {...attr} class="sk-inspector__overlay-tag">
            {(hoveredEl() as Element).tagName.toLowerCase()}
            {(hoveredEl() as Element).className
              ? ' .' +
                Array.from((hoveredEl() as Element).classList)
                  .slice(0, 2)
                  .join(' .')
              : ''}
          </div>
        </div>
      </Show>

      {/* Selected element highlight */}
      <Show when={selectedEl() != null}>
        <div
          {...attr}
          class="sk-inspector__overlay sk-inspector__overlay--selected"
          style={getOverlayPosition(selectedEl() as Element)}
        />
      </Show>

      {/* Annotation input panel */}
      <Show when={selectedEl() != null}>
        <div
          {...attr}
          class="sk-inspector__note"
          style={getAnnotationPanelPosition(selectedEl() as Element)}
        >
          <Card {...attr} padding="md">
            <div class="sk-inspector__note-stack" {...attr}>
              <div {...attr} class="sk-inspector__element-chip">
                <span class="sk-inspector__element-tag" {...attr}>
                  {'<' + (selectedEl() as Element).tagName.toLowerCase() + '>'}
                </span>{' '}
                <span class="sk-inspector__element-classes" {...attr}>
                  {Array.from((selectedEl() as Element).classList)
                    .slice(0, 3)
                    .map((c: string) => '.' + c)
                    .join('')}
                </span>
                <Show when={getTextPreview(selectedEl() as Element)}>
                  <div class="sk-inspector__element-preview sk-inspector__hint-text" {...attr}>
                    "{getTextPreview(selectedEl() as Element)}"
                  </div>
                </Show>
              </div>
              <textarea
                {...attr}
                class="sk-inspector__textarea"
                placeholder="Add a comment on this element..."
                value={noteText()}
                onInput={(e) => setNoteText(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveAnnotation();
                  }
                  e.stopPropagation();
                }}
              />
              <div class="sk-inspector__actions" {...attr}>
                <span class="sk-inspector__kbd-hint" {...attr}>
                  Ctrl+Enter to save
                </span>
                <Button
                  {...attr}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEl(null);
                    setNoteText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  {...attr}
                  variant="primary"
                  size="sm"
                  disabled={!noteText().trim()}
                  onClick={saveAnnotation}
                >
                  Comment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Show>

      {/* Pin indicators on annotated elements */}
      <For each={annotations()}>
        {(ann) => {
          let target: Element | null = null;
          try {
            target = document.querySelector(ann.selector);
          } catch {
            /* invalid selector */
          }
          if (!target) return null;
          const rect = target.getBoundingClientRect();
          const isResolved = ann.status === 'resolved';
          return (
            <div
              {...attr}
              class={`sk-inspector__pin ${isResolved ? 'sk-inspector__pin--resolved' : ''}`}
              title={ann.thread[0]?.text || ''}
              onClick={() => {
                setExpandedId(ann.id);
                setPanelOpen(true);
                highlightAnnotationElement(ann);
              }}
              style={{
                top: rect.top + 'px',
                left: rect.right - PIN_OFFSET + 'px',
              }}
            >
              {'💬'}
            </div>
          );
        }}
      </For>

      {/* Highlight overlay for "Jump to element" */}
      <Show when={highlightEl() != null}>
        <div
          {...attr}
          class="sk-inspector__overlay sk-inspector__overlay--flash"
          style={getOverlayPosition(highlightEl() as Element)}
        />
      </Show>

      {/* ── Comments side panel ────────────────────────────────────────────── */}
      <Show when={annotations().length > 0 || props.active}>
        <Show
          when={panelOpen()}
          fallback={
            <div {...attr} class="sk-inspector__fab">
              <Button {...attr} variant="primary" size="sm" onClick={() => setPanelOpen(true)}>
                {'💬'} {annotations().length} comment
                {annotations().length !== 1 ? 's' : ''}
              </Button>
            </div>
          }
        >
          <div {...attr} class="sk-inspector__panel">
            {/* Panel header */}
            <div {...attr} class="sk-inspector__panel-header">
              <div class="sk-inspector__panel-title" {...attr}>
                <span class="sk-inspector__panel-title-text" {...attr}>
                  Comments
                </span>
                <Badge variant="info" {...attr}>
                  {annotations().length}
                </Badge>
              </div>
              <Button {...attr} variant="ghost" size="sm" onClick={() => setPanelOpen(false)}>
                {'✕'}
              </Button>
            </div>

            {/* Filter tabs */}
            <div {...attr} class="sk-inspector__panel-filters">
              <For each={['all', 'open', 'resolved'] as const}>
                {(f) => (
                  <Button
                    {...attr}
                    variant={filter() === f ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all'
                      ? `All (${annotations().length})`
                      : f === 'open'
                        ? `Open (${openCount()})`
                        : `Resolved (${resolvedCount()})`}
                  </Button>
                )}
              </For>
            </div>

            {/* Thread list */}
            <div {...attr} class="sk-inspector__panel-list">
              <Show
                when={filteredAnnotations().length > 0}
                fallback={
                  <div {...attr} class="sk-inspector__panel-empty">
                    <span class="sk-inspector__panel-empty-icon" aria-hidden="true" {...attr}>
                      {'💬'}
                    </span>
                    <span class="sk-inspector__hint-text" {...attr}>
                      No {filter() !== 'all' ? filter() + ' ' : ''}comments
                    </span>
                  </div>
                }
              >
                <For each={filteredAnnotations()}>
                  {(ann) => (
                    <ThreadItem
                      ann={ann}
                      expanded={expandedId() === ann.id}
                      onToggle={() => setExpandedId((prev) => (prev === ann.id ? null : ann.id))}
                      onHighlight={() => highlightAnnotationElement(ann)}
                      onReply={(text) => replyToAnnotation(ann.id, text)}
                      onResolve={() => toggleAnnotationStatus(ann)}
                      onDelete={() => deleteAnnotation(ann.id)}
                    />
                  )}
                </For>
              </Show>
            </div>

            {/* Panel footer */}
            <div {...attr} class="sk-inspector__panel-footer">
              <Button
                {...attr}
                variant={props.active ? 'primary' : 'secondary'}
                size="sm"
                class="sk-inspector__footer-btn"
                onClick={props.active ? props.onClose : (props.onNewComment ?? props.onClose)}
              >
                {props.active ? '✓ Click any element to comment' : '+ New Comment'}
              </Button>
            </div>
          </div>
        </Show>
      </Show>
    </>
  );
};
