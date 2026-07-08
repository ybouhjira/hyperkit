import { Component, Show, splitProps, createSignal } from 'solid-js';
import type { DashboardCardConfig } from './types';

export interface DashboardCardInternalProps {
  config: DashboardCardConfig;
  isEditing: boolean;
  onRemove?: (id: string) => void;
  onDragStart?: (id: string, event: PointerEvent) => void;
  onResizeStart?: (id: string, event: PointerEvent) => void;
}

export const DashboardCard: Component<DashboardCardInternalProps> = (props) => {
  const [local] = splitProps(props, [
    'config',
    'isEditing',
    'onRemove',
    'onDragStart',
    'onResizeStart',
  ]);

  const [isDragHovered, setIsDragHovered] = createSignal(false);

  const handleHeaderPointerDown = (e: PointerEvent) => {
    if (!local.isEditing) return;
    e.preventDefault();
    local.onDragStart?.(local.config.id, e);
  };

  const handleResizePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    local.onResizeStart?.(local.config.id, e);
  };

  const canResize = () => local.isEditing && local.config.resizable !== false;
  const canRemove = () => local.isEditing && local.config.removable !== false;

  return (
    <div
      class="sk-dashboard-card"
      classList={{
        'sk-dashboard-card--editing': local.isEditing,
        'sk-dashboard-card--drag-hovered': isDragHovered(),
      }}
      style={{ contain: 'layout style' }}
    >
      <div
        class="sk-dashboard-card__header"
        classList={{ 'sk-dashboard-card__header--draggable': local.isEditing }}
        onPointerDown={handleHeaderPointerDown}
        onPointerEnter={() => local.isEditing && setIsDragHovered(true)}
        onPointerLeave={() => setIsDragHovered(false)}
      >
        <Show when={local.config.icon}>
          <span class="sk-dashboard-card__icon" aria-hidden="true">
            {local.config.icon}
          </span>
        </Show>
        <span class="sk-dashboard-card__title">{local.config.title}</span>
        <Show when={canRemove()}>
          <button
            class="sk-dashboard-card__remove"
            aria-label={`Remove ${local.config.title}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              local.onRemove?.(local.config.id);
            }}
          >
            ×
          </button>
        </Show>
      </div>
      <div class="sk-dashboard-card__body">
        {(() => {
          const CardComponent = local.config.component;
          return <CardComponent config={local.config} isEditing={local.isEditing} />;
        })()}
      </div>
      <Show when={canResize()}>
        <div
          class="sk-dashboard-card__resize-handle"
          aria-label="Resize card"
          onPointerDown={handleResizePointerDown}
        />
      </Show>
    </div>
  );
};
