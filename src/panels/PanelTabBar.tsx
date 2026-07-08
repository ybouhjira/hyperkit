import { Component, For, JSX } from 'solid-js';

export interface PanelTabBarProps {
  tabs: { id: string; title: string; icon?: string | (() => JSX.Element); pinned?: boolean }[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onDragStart?: (panelId: string, event: PointerEvent) => void;
  onPin?: (panelId: string) => void;
  onUnpin?: (panelId: string) => void;
}

export const PanelTabBar: Component<PanelTabBarProps> = (props) => {
  const handlePointerDown = (tabId: string, event: PointerEvent) => {
    if (!props.onDragStart) return;

    // Don't interfere with normal clicks — only start drag on move
    const startX = event.clientX;
    const startY = event.clientY;
    const DRAG_THRESHOLD = 5;

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        // Crossed threshold — initiate drag
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
        props.onDragStart?.(tabId, event);
      }
    };

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  return (
    <div class="sk-panel-tab-bar">
      <For each={props.tabs}>
        {(tab) => (
          <button
            classList={{
              'sk-panel-tab-bar__tab': true,
              'sk-panel-tab-bar__tab--active': tab.id === props.activeTabId,
              'sk-panel-tab-bar__tab--pinned': tab.pinned,
            }}
            onClick={() => props.onTabClick(tab.id)}
            onPointerDown={(e) => handlePointerDown(tab.id, e)}
          >
            {tab.pinned && (
              <span class="sk-panel-tab-bar__pin-indicator" title="Pinned">
                📌
              </span>
            )}
            {tab.icon != null && (
              <span class="sk-panel-tab-bar__icon">
                {typeof tab.icon === 'string' ? tab.icon : tab.icon()}
              </span>
            )}
            {tab.title}
            <span
              class="sk-panel-tab-bar__pin-action"
              title={tab.pinned ? 'Unpin tab' : 'Pin tab'}
              onClick={(e) => {
                e.stopPropagation();
                if (tab.pinned) {
                  props.onUnpin?.(tab.id);
                } else {
                  props.onPin?.(tab.id);
                }
              }}
            >
              {tab.pinned ? '✕' : '📌'}
            </span>
          </button>
        )}
      </For>
    </div>
  );
};
