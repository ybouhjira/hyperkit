import { createSignal, createEffect, onCleanup, For, Show, type ParentProps } from 'solid-js';
import { Box } from '../../primitives/Box/Box';
import { Text } from '../../primitives/Text/Text';
import { Button } from '../../primitives/Button/Button';
import { Stack } from '../../primitives/Stack/Stack';
import { Flex } from '../../primitives/Flex/Flex';
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

// ─── Constants ───────────────────────────────────────────────────────────────

const INSPECTOR_ATTR = 'data-sk-inspector';
const PANEL_WIDTH = 360;
const ANNOTATION_PANEL_WIDTH = 320;
const ANNOTATION_PANEL_HEIGHT = 240;

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

function getOverlayStyle(el: Element, selected: boolean): Record<string, string> {
  const rect = el.getBoundingClientRect();
  return {
    position: 'fixed',
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    'pointer-events': 'none',
    'box-sizing': 'border-box',
    border: selected ? '2px solid var(--sk-accent)' : '2px solid var(--sk-info)',
    background: selected
      ? 'color-mix(in srgb, var(--sk-accent) 10%, transparent)'
      : 'color-mix(in srgb, var(--sk-info) 10%, transparent)',
    'z-index': '99990',
    'border-radius': 'var(--sk-radius-sm)',
  };
}

function getAnnotationPanelStyle(el: Element): Record<string, string> {
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
    position: 'fixed',
    top: Math.max(8, top) + 'px',
    left: left + 'px',
    width: ANNOTATION_PANEL_WIDTH + 'px',
    'z-index': '99999',
    'box-shadow': 'var(--sk-shadow-lg)',
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
    <Box
      {...attr}
      style={{
        'padding-left': 'var(--sk-space-sm)',
        'border-left': isClaude() ? '2px solid var(--sk-accent)' : '2px solid var(--sk-border)',
        background: isClaude()
          ? 'color-mix(in srgb, var(--sk-accent) 5%, transparent)'
          : 'transparent',
        'border-radius': '0 var(--sk-radius-sm) var(--sk-radius-sm) 0',
        padding: 'var(--sk-space-xs) var(--sk-space-sm)',
        'margin-bottom': 'var(--sk-space-xs)',
      }}
    >
      <Flex align="center" gap="xs" {...attr} style={{ 'margin-bottom': '2px' }}>
        <Text
          size="xs"
          {...attr}
          style={{
            color: isClaude() ? 'var(--sk-accent)' : 'var(--sk-text-muted)',
            'font-weight': '600',
          }}
        >
          {isClaude() ? 'Claude' : 'You'}
        </Text>
        <Text size="xs" color="muted" {...attr}>
          {formatRelativeTime(props.msg.timestamp)}
        </Text>
      </Flex>
      <Text size="sm" {...attr} style={{ 'line-height': '1.4' }}>
        {props.msg.text}
      </Text>
    </Box>
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
    <Box
      {...attr}
      style={{
        border: '1px solid var(--sk-border)',
        'border-radius': 'var(--sk-radius-md)',
        'margin-bottom': 'var(--sk-space-xs)',
        background: isResolved()
          ? 'color-mix(in srgb, var(--sk-bg-secondary) 60%, transparent)'
          : 'var(--sk-bg-secondary)',
        opacity: isResolved() ? '0.75' : '1',
        overflow: 'hidden',
      }}
    >
      {/* Thread header */}
      <Flex
        {...attr}
        align="start"
        gap="xs"
        style={{ padding: 'var(--sk-space-sm)', cursor: 'pointer' }}
        onClick={props.onToggle}
      >
        <Box
          {...attr}
          style={{
            'min-width': '8px',
            height: '8px',
            'border-radius': '50%',
            background: isResolved() ? 'var(--sk-success)' : 'var(--sk-warning)',
            'margin-top': '4px',
          }}
        />
        <Stack gap="xs" style={{ flex: '1', 'min-width': '0' }} {...attr}>
          <Text
            size="xs"
            color="muted"
            {...attr}
            style={{
              'font-family': 'monospace',
              'white-space': 'nowrap',
              overflow: 'hidden',
              'text-overflow': 'ellipsis',
            }}
          >
            {'<' + (el()?.tagName || '?') + '>'}
            {(el()?.classes ?? [])
              .slice(0, 2)
              .map((c: string) => ' .' + c)
              .join('')}
            {el()?.textPreview != null
              ? ' "' + (el()?.textPreview ?? '').substring(0, 20) + '"'
              : ''}
          </Text>
          <Show when={firstMsg()}>
            <Text
              size="sm"
              {...attr}
              style={{
                'white-space': 'nowrap',
                overflow: 'hidden',
                'text-overflow': 'ellipsis',
                opacity: isResolved() ? '0.7' : '1',
              }}
            >
              {firstMsg()?.text}
            </Text>
          </Show>
        </Stack>
        <Flex gap="xs" align="center" {...attr} style={{ 'flex-shrink': '0' }}>
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
              {isResolved() ? '\u21A9' : '\u2713'}
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
              \u2715
            </Button>
          </div>
        </Flex>
      </Flex>

      {/* Expanded thread body */}
      <Show when={props.expanded}>
        <Box
          {...attr}
          style={{ 'border-top': '1px solid var(--sk-border)', padding: 'var(--sk-space-sm)' }}
        >
          <Button
            {...attr}
            variant="ghost"
            size="sm"
            onClick={props.onHighlight}
            style={{
              'margin-bottom': 'var(--sk-space-sm)',
              'font-family': 'monospace',
              'font-size': 'var(--sk-font-size-xs)',
            }}
          >
            Jump to element \u2197
          </Button>
          <Stack gap="xs" {...attr}>
            <For each={props.ann.thread}>{(msg) => <ThreadMessageItem msg={msg} />}</For>
          </Stack>
          <Box {...attr} style={{ 'margin-top': 'var(--sk-space-sm)' }}>
            <textarea
              {...attr}
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
              style={{
                width: '100%',
                'min-height': '56px',
                padding: 'var(--sk-space-sm)',
                background: 'var(--sk-bg-primary)',
                color: 'var(--sk-text-primary)',
                border: '1px solid var(--sk-border)',
                'border-radius': 'var(--sk-radius-sm)',
                'font-size': 'var(--sk-font-size-sm)',
                resize: 'vertical',
                outline: 'none',
                'font-family': 'inherit',
                'box-sizing': 'border-box',
              }}
            />
            <Flex justify="end" gap="xs" {...attr} style={{ 'margin-top': 'var(--sk-space-xs)' }}>
              <Text
                size="xs"
                color="muted"
                {...attr}
                style={{ 'align-self': 'center', 'margin-right': 'auto' }}
              >
                Ctrl+Enter
              </Text>
              <Button
                {...attr}
                variant="primary"
                size="sm"
                disabled={!replyText().trim()}
                onClick={submitReply}
              >
                Reply
              </Button>
            </Flex>
          </Box>
        </Box>
      </Show>
    </Box>
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
        <div {...attr} style={getOverlayStyle(hoveredEl() as Element, false)}>
          <div
            {...attr}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              background: 'var(--sk-info)',
              color: 'var(--sk-bg-primary)',
              'font-size': 'var(--sk-font-size-xs)',
              padding: '1px var(--sk-space-xs)',
              'border-radius': 'var(--sk-radius-sm)',
              'pointer-events': 'none',
              'white-space': 'nowrap',
              'max-width': '200px',
              overflow: 'hidden',
              'text-overflow': 'ellipsis',
            }}
          >
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
        <div {...attr} style={getOverlayStyle(selectedEl() as Element, true)} />
      </Show>

      {/* Annotation input panel */}
      <Show when={selectedEl() != null}>
        <div {...attr} style={getAnnotationPanelStyle(selectedEl() as Element)}>
          <Card {...attr} style={{ padding: 'var(--sk-space-md)' }}>
            <Stack gap="sm" {...attr}>
              <Box
                {...attr}
                style={{
                  background: 'var(--sk-bg-secondary)',
                  'border-radius': 'var(--sk-radius-sm)',
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  border: '1px solid var(--sk-border)',
                }}
              >
                <Text size="xs" color="secondary" {...attr}>
                  <span style={{ color: 'var(--sk-accent)', 'font-family': 'monospace' }} {...attr}>
                    {'<' + (selectedEl() as Element).tagName.toLowerCase() + '>'}
                  </span>{' '}
                  <span style={{ color: 'var(--sk-text-muted)' }} {...attr}>
                    {Array.from((selectedEl() as Element).classList)
                      .slice(0, 3)
                      .map((c: string) => '.' + c)
                      .join('')}
                  </span>
                </Text>
                <Show when={getTextPreview(selectedEl() as Element)}>
                  <Text
                    size="xs"
                    color="muted"
                    {...attr}
                    style={{ 'margin-top': 'var(--sk-space-xs)' }}
                  >
                    "{getTextPreview(selectedEl() as Element)}"
                  </Text>
                </Show>
              </Box>
              <textarea
                {...attr}
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
                style={{
                  width: '100%',
                  'min-height': '80px',
                  padding: 'var(--sk-space-sm)',
                  background: 'var(--sk-bg-secondary)',
                  color: 'var(--sk-text-primary)',
                  border: '1px solid var(--sk-border)',
                  'border-radius': 'var(--sk-radius-sm)',
                  'font-size': 'var(--sk-font-size-sm)',
                  resize: 'vertical',
                  outline: 'none',
                  'font-family': 'inherit',
                  'box-sizing': 'border-box',
                }}
              />
              <Flex gap="xs" justify="end" {...attr}>
                <Text
                  size="xs"
                  color="muted"
                  {...attr}
                  style={{ 'align-self': 'center', 'margin-right': 'auto' }}
                >
                  Ctrl+Enter to save
                </Text>
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
              </Flex>
            </Stack>
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
              title={ann.thread[0]?.text || ''}
              onClick={() => {
                setExpandedId(ann.id);
                setPanelOpen(true);
                highlightAnnotationElement(ann);
              }}
              style={{
                position: 'fixed',
                top: rect.top + 'px',
                left: rect.right - 16 + 'px',
                'z-index': '99991',
                cursor: 'pointer',
                'font-size': '12px',
                'line-height': '1',
                'user-select': 'none',
                opacity: isResolved ? '0.5' : '1',
              }}
            >
              {'\uD83D\uDCAC'}
            </div>
          );
        }}
      </For>

      {/* Highlight overlay for "Jump to element" */}
      <Show when={highlightEl() != null}>
        <div
          {...attr}
          style={{
            ...getOverlayStyle(highlightEl() as Element, true),
            border: '2px solid var(--sk-warning)',
            background: 'color-mix(in srgb, var(--sk-warning) 15%, transparent)',
            'z-index': '99992',
          }}
        />
      </Show>

      {/* ── Comments side panel ────────────────────────────────────────────── */}
      <Show when={annotations().length > 0 || props.active}>
        <Show
          when={panelOpen()}
          fallback={
            <div
              {...attr}
              style={{
                position: 'fixed',
                bottom: 'var(--sk-space-lg)',
                right: 'var(--sk-space-md)',
                'z-index': '99993',
              }}
            >
              <Button {...attr} variant="primary" size="sm" onClick={() => setPanelOpen(true)}>
                {'\uD83D\uDCAC'} {annotations().length} comment
                {annotations().length !== 1 ? 's' : ''}
              </Button>
            </div>
          }
        >
          <div
            {...attr}
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              width: PANEL_WIDTH + 'px',
              height: '100vh',
              'z-index': '99993',
              display: 'flex',
              'flex-direction': 'column',
              'border-left': '1px solid var(--sk-border)',
              background: 'var(--sk-bg-primary)',
              'box-shadow': 'var(--sk-shadow-lg)',
            }}
          >
            {/* Panel header */}
            <Flex
              {...attr}
              align="center"
              justify="between"
              style={{
                padding: 'var(--sk-space-sm) var(--sk-space-md)',
                'border-bottom': '1px solid var(--sk-border)',
                'flex-shrink': '0',
              }}
            >
              <Flex align="center" gap="sm" {...attr}>
                <Text weight="semibold" size="sm" {...attr}>
                  Comments
                </Text>
                <Badge variant="info" {...attr}>
                  {annotations().length}
                </Badge>
              </Flex>
              <Button {...attr} variant="ghost" size="sm" onClick={() => setPanelOpen(false)}>
                {'\u2715'}
              </Button>
            </Flex>

            {/* Filter tabs */}
            <Flex
              {...attr}
              gap="xs"
              style={{
                padding: 'var(--sk-space-xs) var(--sk-space-md)',
                'border-bottom': '1px solid var(--sk-border)',
                'flex-shrink': '0',
              }}
            >
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
            </Flex>

            {/* Thread list */}
            <Box {...attr} style={{ overflow: 'auto', flex: '1', padding: 'var(--sk-space-sm)' }}>
              <Show
                when={filteredAnnotations().length > 0}
                fallback={
                  <Box {...attr} style={{ 'text-align': 'center', padding: 'var(--sk-space-xl)' }}>
                    <Text size="sm" color="muted" {...attr}>
                      No {filter() !== 'all' ? filter() + ' ' : ''}comments
                    </Text>
                  </Box>
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
            </Box>

            {/* Panel footer */}
            <Box
              {...attr}
              style={{
                padding: 'var(--sk-space-sm) var(--sk-space-md)',
                'border-top': '1px solid var(--sk-border)',
                'flex-shrink': '0',
              }}
            >
              <Button
                {...attr}
                variant={props.active ? 'primary' : 'secondary'}
                size="sm"
                style={{ width: '100%' }}
                onClick={props.active ? props.onClose : (props.onNewComment ?? props.onClose)}
              >
                {props.active ? '\u2713 Click any element to comment' : '+ New Comment'}
              </Button>
            </Box>
          </div>
        </Show>
      </Show>
    </>
  );
};
