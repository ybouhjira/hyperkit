import { Component, For, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/composites/KanbanBoard/KanbanBoard.css';

export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { text: string; color: string };
  accent?: string; // left border or icon color
  icon?: string; // text symbol
}

export interface KanbanColumn {
  id: string;
  label: string;
  icon?: string;
  color: string; // CSS color for the column header accent
  cards: KanbanCard[];
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  selectedCardId?: string | null;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  emptyState?: string;
  class?: string;
}

export const KanbanBoard: Component<KanbanBoardProps> = (props) => {
  return (
    <div class={`sk-kanban ${props.class || ''}`}>
      <For each={props.columns}>
        {(column) => (
          <div class="sk-kanban__column">
            <div class="sk-kanban__column-header" style={{ 'border-top-color': column.color }}>
              <div class="sk-kanban__column-label">
                <Show when={column.icon}>
                  <span class="sk-kanban__column-icon">{column.icon}</span>
                </Show>
                <span class="sk-kanban__column-name">{column.label}</span>
              </div>
              <span
                class="sk-kanban__column-count"
                style={{
                  color: column.color,
                  'background-color': `color-mix(in srgb, ${column.color} 10%, transparent)`,
                }}
              >
                {column.cards.length}
              </span>
            </div>
            <div class="sk-kanban__column-body">
              <Show
                when={column.cards.length > 0}
                fallback={<div class="sk-kanban__empty">{props.emptyState || 'No items'}</div>}
              >
                <For each={column.cards}>
                  {(card) => (
                    <div
                      class={`sk-kanban__card ${
                        props.selectedCardId === card.id ? 'sk-kanban__card--selected' : ''
                      }`}
                      onClick={() => props.onCardClick?.(card, column.id)}
                    >
                      <div class="sk-kanban__card-header">
                        <Show when={card.icon && card.accent}>
                          <span
                            class="sk-kanban__card-icon"
                            style={{
                              'background-color': `color-mix(in srgb, ${card.accent} 100%, transparent)`,
                            }}
                          >
                            {card.icon}
                          </span>
                        </Show>
                        <span class="sk-kanban__card-title">{card.title}</span>
                        <Show when={card.badge}>
                          {(badge) => (
                            <span
                              class="sk-kanban__card-badge"
                              style={{
                                color: badge().color,
                                'background-color': `color-mix(in srgb, ${badge().color} 10%, transparent)`,
                              }}
                            >
                              {badge().text}
                            </span>
                          )}
                        </Show>
                      </div>
                      <Show when={card.subtitle}>
                        <div class="sk-kanban__card-subtitle">{card.subtitle}</div>
                      </Show>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
