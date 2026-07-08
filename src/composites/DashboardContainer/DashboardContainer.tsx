import { Component, createSignal, For, Show, splitProps, createMemo, JSX } from 'solid-js';
import { useDashboardLayout } from './useDashboardLayout';
import { useDashboardDrag } from './useDashboardDrag';
import { DashboardCard } from './DashboardCard';
import type { DashboardContainerProps, DashboardCardConfig, CardLayout } from './types';
import './DashboardContainer.css';

const gapMap = {
  sm: 'var(--sk-space-sm)',
  md: 'var(--sk-space-md)',
  lg: 'var(--sk-space-lg)',
} as const;

const rowHeightMap: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
};

export const DashboardContainer: Component<DashboardContainerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'cards',
    'columns',
    'rowHeight',
    'gap',
    'storageKey',
    'onLayoutChange',
    'editable',
    'class',
    'style',
  ]);

  const columns = () => local.columns ?? 12;
  const rowHeight = () => rowHeightMap[local.rowHeight ?? 'md'];
  const gap = () => local.gap ?? 'md';

  const [isEditing, setIsEditing] = createSignal(false);
  const [pickerOpen, setPickerOpen] = createSignal(false);
  const [visibleCardIds, setVisibleCardIds] = createSignal<Set<string>>(
    // eslint-disable-next-line solid/reactivity -- initial Set built once from stable config prop
    new Set(local.cards.map((c) => c.id))
  );

  const { layout, actions } = useDashboardLayout(
    // eslint-disable-next-line solid/reactivity -- cards is stable config, not a reactive source
    local.cards,
    columns,
    // eslint-disable-next-line solid/reactivity -- storageKey is a stable config prop
    local.storageKey,
    // eslint-disable-next-line solid/reactivity -- callback is a stable ref
    local.onLayoutChange
  );

  let containerRef!: HTMLDivElement;

  const getConfig = (id: string): DashboardCardConfig | undefined =>
    local.cards.find((c) => c.id === id);

  const { dragState, resizeState, handleDragStart, handleResizeStart } = useDashboardDrag({
    isEditing,
    columns,
    rowHeight,
    gap,
    get layout() {
      return layout;
    },
    containerRef: () => containerRef,
    getConfig,
    onMove: actions.moveCard,
    onResize: actions.resizeCard,
  });

  // ── Visible cards ────────────────────────────────────────────────────────

  const visibleLayouts = createMemo(() => layout.filter((l) => visibleCardIds().has(l.id)));

  const hiddenCards = createMemo(() => local.cards.filter((c) => !visibleCardIds().has(c.id)));

  const cardsByCategory = createMemo(() => {
    const map = new Map<string, DashboardCardConfig[]>();
    for (const card of hiddenCards()) {
      const cat = card.category ?? 'General';
      const existing = map.get(cat) ?? [];
      map.set(cat, [...existing, card]);
    }
    return map;
  });

  // ── Grid style helper ────────────────────────────────────────────────────

  const gridStyle = (): JSX.CSSProperties =>
    ({
      '--sk-dc-columns': columns(),
      '--sk-dc-row-height': `${rowHeight()}px`,
      '--sk-dc-gap': gapMap[gap()],
      ...local.style,
    }) as JSX.CSSProperties;

  const cardGridStyle = (l: CardLayout): Record<string, string> => {
    const ds = dragState();
    const rs = resizeState();

    const col = ds?.cardId === l.id ? ds.col : l.col;
    const row = ds?.cardId === l.id ? ds.row : l.row;
    const cols = rs?.cardId === l.id ? rs.cols : l.cols;
    const rows = rs?.cardId === l.id ? rs.rows : l.rows;

    return {
      'grid-column': `${col + 1} / span ${cols}`,
      'grid-row': `${row + 1} / span ${rows}`,
      'z-index': ds?.cardId === l.id || rs?.cardId === l.id ? '10' : '1',
    };
  };

  // ── Add/remove cards ─────────────────────────────────────────────────────

  const addCard = (config: DashboardCardConfig) => {
    actions.addCard(config, columns());
    setVisibleCardIds((prev) => {
      const next = new Set(prev);
      next.add(config.id);
      return next;
    });
    setPickerOpen(false);
  };

  const removeCard = (id: string) => {
    actions.removeCard(id);
    setVisibleCardIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div
      {...others}
      class={`sk-dashboard-container${local.class ? ` ${local.class}` : ''}`}
      classList={{ 'sk-dashboard-container--editing': isEditing() }}
    >
      <Show when={local.editable !== false}>
        <div class="sk-dashboard-container__toolbar">
          <button
            class="sk-dashboard-container__edit-btn"
            classList={{ 'sk-dashboard-container__edit-btn--active': isEditing() }}
            type="button"
            aria-label={isEditing() ? 'Done editing' : 'Edit dashboard'}
            aria-pressed={isEditing()}
            onClick={() => {
              setIsEditing((v) => !v);
              setPickerOpen(false);
            }}
          >
            ✎
          </button>
          <Show when={isEditing()}>
            <div class="sk-dashboard-container__picker-wrapper">
              <button
                class="sk-dashboard-container__add-btn"
                type="button"
                aria-label="Add card"
                aria-expanded={pickerOpen()}
                onClick={() => setPickerOpen((v) => !v)}
              >
                +
              </button>
              <Show when={pickerOpen() && hiddenCards().length > 0}>
                <div
                  class="sk-dashboard-container__picker"
                  role="listbox"
                  aria-label="Available cards"
                >
                  <For each={[...cardsByCategory().entries()]}>
                    {([category, cards]) => (
                      <div class="sk-dashboard-container__picker-group">
                        <div class="sk-dashboard-container__picker-category">{category}</div>
                        <For each={cards}>
                          {(card) => (
                            <button
                              class="sk-dashboard-container__picker-item"
                              type="button"
                              role="option"
                              aria-selected="false"
                              onClick={() => addCard(card)}
                            >
                              <Show when={card.icon}>
                                <span aria-hidden="true">{card.icon}</span>
                              </Show>
                              {card.title}
                            </button>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                  <Show when={hiddenCards().length === 0}>
                    <div class="sk-dashboard-container__picker-empty">All cards are visible</div>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>
          <Show when={isEditing()}>
            <button
              class="sk-dashboard-container__reset-btn"
              type="button"
              aria-label="Reset layout"
              onClick={() => {
                actions.resetLayout(local.cards, columns());
                setVisibleCardIds(new Set(local.cards.map((c) => c.id)));
              }}
            >
              ↺
            </button>
          </Show>
        </div>
      </Show>

      <div ref={containerRef} class="sk-dashboard-container__grid" style={gridStyle()}>
        <For each={visibleLayouts()}>
          {(layoutItem) => {
            const config = getConfig(layoutItem.id);
            if (!config) return null;

            return (
              <div
                class="sk-dashboard-container__cell"
                classList={{
                  'sk-dashboard-container__cell--dragging': dragState()?.cardId === layoutItem.id,
                }}
                style={cardGridStyle(layoutItem)}
              >
                <DashboardCard
                  config={config}
                  isEditing={isEditing()}
                  onRemove={removeCard}
                  onDragStart={handleDragStart}
                  onResizeStart={handleResizeStart}
                />
              </div>
            );
          }}
        </For>

        {/* Drop placeholder */}
        <Show when={dragState()}>
          {(ds) => {
            const currentLayout = layout.find((l) => l.id === ds().cardId);
            if (!currentLayout) return null;
            return (
              <div
                class="sk-dashboard-container__drop-placeholder"
                style={{
                  'grid-column': `${ds().col + 1} / span ${currentLayout.cols}`,
                  'grid-row': `${ds().row + 1} / span ${currentLayout.rows}`,
                }}
              />
            );
          }}
        </Show>
      </div>
    </div>
  );
};
