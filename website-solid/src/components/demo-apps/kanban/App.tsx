/**
 * Sprint Board demo — KanbanBoard with real drag-and-drop, a Dialog card
 * editor (Input + TagInput + Select), working FilterChip tag filters, and a
 * sprint ProgressBar computed live from the store.
 *
 * KanbanBoard renders presentational cards; the drag interaction is layered
 * on top with delegated pointer events, resolving DOM cards back to store
 * cards by column/card index, and committing moves to the signal on drop.
 */
import { For, Show, createMemo, createSignal, onCleanup } from 'solid-js';
import {
  Button,
  Dialog,
  FilterChip,
  KanbanBoard,
  Input,
  ProgressBar,
  Select,
  TagInput,
  Text,
  type KanbanCard,
  type KanbanColumn,
} from '@ybouhjira/hyperkit';
import {
  ALL_ASSIGNEES,
  ALL_TAGS,
  ASSIGNEE_COLORS,
  COLUMNS,
  SEED_CARDS,
  SPRINT_NAME,
  TAG_COLORS,
  type ColumnId,
  type SprintCard,
} from './data';
import './kanban.css';

const DRAG_THRESHOLD = 6;
const ASSIGNEES = ALL_ASSIGNEES;
const POINT_OPTIONS = ['1', '2', '3', '5', '8'];

interface DragState {
  cardId: string;
  fromColumn: ColumnId;
  title: string;
  x: number;
  y: number;
  overColumn: ColumnId | null;
}

interface EditorState {
  /** null → creating a new card */
  id: string | null;
}

export function KanbanApp() {
  const [cards, setCards] = createSignal<SprintCard[]>(SEED_CARDS);
  const [activeTags, setActiveTags] = createSignal<ReadonlySet<string>>(new Set());
  const [activeAssignees, setActiveAssignees] = createSignal<ReadonlySet<string>>(new Set());

  // Editor dialog state
  const [editor, setEditor] = createSignal<EditorState | null>(null);
  const [formTitle, setFormTitle] = createSignal('');
  const [formTags, setFormTags] = createSignal<string[]>([]);
  const [formColumn, setFormColumn] = createSignal<ColumnId>('backlog');
  const [formAssignee, setFormAssignee] = createSignal(ASSIGNEES[0]);
  const [formPoints, setFormPoints] = createSignal('3');

  const doneCount = createMemo(() => cards().filter((c) => c.column === 'done').length);
  const donePoints = createMemo(() =>
    cards()
      .filter((c) => c.column === 'done')
      .reduce((sum, c) => sum + c.points, 0)
  );
  const totalPoints = createMemo(() => cards().reduce((sum, c) => sum + c.points, 0));
  const progress = createMemo(() =>
    cards().length === 0 ? 0 : Math.round((doneCount() / cards().length) * 100)
  );

  const tagCount = (tag: string) => cards().filter((c) => c.tags.includes(tag)).length;
  const assigneeCount = (who: string) => cards().filter((c) => c.assignee === who).length;

  const visibleCards = createMemo(() => {
    const tags = activeTags();
    const people = activeAssignees();
    return cards().filter(
      (c) =>
        (tags.size === 0 || c.tags.some((t) => tags.has(t))) &&
        (people.size === 0 || people.has(c.assignee))
    );
  });

  const boardColumns = createMemo<KanbanColumn[]>(() =>
    COLUMNS.map((col) => ({
      id: col.id,
      label: col.label,
      icon: col.icon,
      color: col.color,
      cards: visibleCards()
        .filter((c) => c.column === col.id)
        .map((c): KanbanCard => {
          const firstTag = c.tags[0];
          return {
            id: c.id,
            title: c.title,
            subtitle: `${c.assignee} · ${c.points} pt${c.points === 1 ? '' : 's'}`,
            icon: c.assignee.charAt(0),
            accent: ASSIGNEE_COLORS[c.assignee] ?? 'var(--sk-accent)',
            badge: firstTag
              ? { text: firstTag, color: TAG_COLORS[firstTag] ?? 'var(--sk-accent)' }
              : undefined,
          };
        }),
    }))
  );

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const moveCard = (cardId: string, to: ColumnId) => {
    setCards((list) => list.map((c) => (c.id === cardId ? { ...c, column: to } : c)));
  };

  // ---- Drag and drop (delegated pointer events over KanbanBoard) ----------
  let boardRef: HTMLDivElement | undefined;
  const [drag, setDrag] = createSignal<DragState | null>(null);
  let suppressClick = false;
  /** Detaches the window listeners of an in-flight drag, if any. */
  let detachDragListeners: (() => void) | null = null;
  onCleanup(() => detachDragListeners?.());

  const columnElements = () =>
    boardRef ? Array.from(boardRef.querySelectorAll<HTMLElement>('.sk-kanban__column')) : [];

  const columnAt = (x: number, y: number): { id: ColumnId; el: HTMLElement } | null => {
    const el = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('.sk-kanban__column');
    if (!el) return null;
    const index = columnElements().indexOf(el);
    const col = COLUMNS[index];
    return col ? { id: col.id, el } : null;
  };

  const clearDropHighlight = () => {
    for (const el of columnElements()) el.classList.remove('kanban-app__column--drop');
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !boardRef) return;
    const target = e.target as HTMLElement;
    const cardEl = target.closest<HTMLElement>('.sk-kanban__card');
    const colEl = target.closest<HTMLElement>('.sk-kanban__column');
    if (!cardEl || !colEl) return;

    // Resolve the DOM card back to store data via column/card indexes —
    // the DOM order mirrors boardColumns() exactly.
    const colIndex = columnElements().indexOf(colEl);
    const cardIndex = Array.from(colEl.querySelectorAll('.sk-kanban__card')).indexOf(cardEl);
    const column = boardColumns()[colIndex];
    const card = column?.cards[cardIndex];
    if (!column || !card) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const onMove = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        started = true;
        suppressClick = true;
      }
      ev.preventDefault();
      const over = columnAt(ev.clientX, ev.clientY);
      clearDropHighlight();
      if (over && over.id !== column.id) over.el.classList.add('kanban-app__column--drop');
      setDrag({
        cardId: card.id,
        fromColumn: column.id as ColumnId,
        title: card.title,
        x: ev.clientX,
        y: ev.clientY,
        overColumn: over?.id ?? null,
      });
    };

    const finish = (ev: PointerEvent, commit: boolean) => {
      detachDragListeners?.();
      clearDropHighlight();
      const state = drag();
      if (commit && started && state) {
        const over = columnAt(ev.clientX, ev.clientY);
        if (over && over.id !== state.fromColumn) moveCard(state.cardId, over.id);
      }
      setDrag(null);
      // The click event fires synchronously after pointerup — lift the
      // suppression right after it has been swallowed.
      setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    const onUp = (ev: PointerEvent) => finish(ev, true);
    const onCancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    detachDragListeners = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      detachDragListeners = null;
    };
  };

  // ---- Card editor --------------------------------------------------------

  const openEditor = (card: SprintCard | null) => {
    setFormTitle(card?.title ?? '');
    setFormTags(card?.tags ?? []);
    setFormColumn(card?.column ?? 'backlog');
    setFormAssignee(card?.assignee ?? ASSIGNEES[0]);
    setFormPoints(String(card?.points ?? 3));
    setEditor({ id: card?.id ?? null });
  };

  const handleCardClick = (card: KanbanCard) => {
    if (suppressClick) return;
    const data = cards().find((c) => c.id === card.id);
    if (data) openEditor(data);
  };

  const saveCard = () => {
    const state = editor();
    if (!state || !formTitle().trim()) return;
    const patch = {
      title: formTitle().trim(),
      tags: formTags(),
      column: formColumn(),
      assignee: formAssignee(),
      points: Number(formPoints()),
    };
    if (state.id === null) {
      setCards((list) => [...list, { id: `c-${Date.now()}`, ...patch }]);
    } else {
      setCards((list) => list.map((c) => (c.id === state.id ? { ...c, ...patch } : c)));
    }
    setEditor(null);
  };

  const deleteCard = () => {
    const state = editor();
    if (!state?.id) return;
    setCards((list) => list.filter((c) => c.id !== state.id));
    setEditor(null);
  };

  return (
    <div class="kanban-app">
      <header class="kanban-app__header">
        <div class="kanban-app__title-row">
          <Text as="h1" size="xl" weight="semibold">
            {SPRINT_NAME}
          </Text>
          <Button variant="primary" size="sm" onClick={() => openEditor(null)}>
            ＋ Add card
          </Button>
        </div>
        <div class="kanban-app__progress">
          <ProgressBar
            value={progress()}
            color="var(--sk-success)"
            aria-label="Sprint progress"
          />
          <Text size="sm" color="secondary" whiteSpace="nowrap">
            {doneCount()} of {cards().length} done · {donePoints()}/{totalPoints()} pts
          </Text>
        </div>
        <div class="kanban-app__filters">
          <Text size="sm" color="muted">
            People
          </Text>
          <For each={ALL_ASSIGNEES}>
            {(who) => (
              <FilterChip
                label={`${who} (${assigneeCount(who)})`}
                size="sm"
                color={ASSIGNEE_COLORS[who]}
                selected={activeAssignees().has(who)}
                onToggle={() =>
                  setActiveAssignees((prev) => {
                    const next = new Set(prev);
                    if (next.has(who)) next.delete(who);
                    else next.add(who);
                    return next;
                  })
                }
              />
            )}
          </For>
          <Text size="sm" color="muted">
            Tags
          </Text>
          <For each={ALL_TAGS}>
            {(tag) => (
              <FilterChip
                label={`${tag} (${tagCount(tag)})`}
                size="sm"
                color={TAG_COLORS[tag]}
                selected={activeTags().has(tag)}
                onToggle={() => toggleTag(tag)}
              />
            )}
          </For>
          <Show when={activeTags().size > 0 || activeAssignees().size > 0}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTags(new Set<string>());
                setActiveAssignees(new Set<string>());
              }}
            >
              Clear
            </Button>
          </Show>
        </div>
      </header>

      <div class="kanban-app__board" ref={boardRef} onPointerDown={handlePointerDown}>
        <KanbanBoard
          columns={boardColumns()}
          selectedCardId={drag()?.cardId ?? null}
          onCardClick={handleCardClick}
          emptyState="Drop a card here"
        />
      </div>

      <Show when={drag()}>
        {(d) => (
          <div
            class="kanban-app__ghost"
            style={{ transform: `translate(${d().x + 12}px, ${d().y + 8}px)` }}
          >
            {d().title}
          </div>
        )}
      </Show>

      <Dialog
        open={editor() !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
        title={editor()?.id ? 'Edit card' : 'New card'}
        description={
          editor()?.id
            ? 'Changes are written straight to the board store.'
            : 'The card is appended to the selected column.'
        }
      >
        <div class="kanban-app__form">
          <label class="kanban-app__field">
            <Text size="sm" color="secondary">
              Title
            </Text>
            <Input value={formTitle()} onInput={setFormTitle} placeholder="What needs doing?" />
          </label>
          <div class="kanban-app__field">
            <Text size="sm" color="secondary">
              Tags
            </Text>
            <TagInput
              value={formTags()}
              onChange={setFormTags}
              suggestions={ALL_TAGS}
              placeholder="Add a tag…"
            />
          </div>
          <div class="kanban-app__form-row">
            <div class="kanban-app__field">
              <Text size="sm" color="secondary">
                Status
              </Text>
              <Select
                options={COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
                value={formColumn()}
                onChange={(v) => setFormColumn(v as ColumnId)}
              />
            </div>
            <div class="kanban-app__field">
              <Text size="sm" color="secondary">
                Assignee
              </Text>
              <Select
                options={ASSIGNEES.map((a) => ({ value: a, label: a }))}
                value={formAssignee()}
                onChange={setFormAssignee}
              />
            </div>
            <div class="kanban-app__field">
              <Text size="sm" color="secondary">
                Points
              </Text>
              <Select
                options={POINT_OPTIONS.map((p) => ({ value: p, label: `${p} pts` }))}
                value={formPoints()}
                onChange={setFormPoints}
              />
            </div>
          </div>
          <div class="kanban-app__form-actions">
            <Show when={editor()?.id}>
              <Button variant="danger" onClick={deleteCard}>
                Delete
              </Button>
            </Show>
            <span class="kanban-app__form-spacer" />
            <Button variant="ghost" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCard} disabled={!formTitle().trim()}>
              {editor()?.id ? 'Save' : 'Add card'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
