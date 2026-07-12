import { Component, createEffect, Show, For, createSignal, onCleanup } from 'solid-js';
import type { PanelContainerProps } from './types';
import { usePanelLayout } from './usePanelLayout';
import { usePanelDrag } from './usePanelDrag';
import { usePanelChrome } from './usePanelChrome';
import { PanelGroup } from './PanelGroup';
import { PanelTabBar } from './PanelTabBar';
import { PanelDropZone } from './PanelDropZone';
import { PanelDropPreview } from './PanelDropPreview';
import { PanelResizeHandle } from './PanelResizeHandle';
import { MaximizedView } from './MaximizedView';
import { PanelCollapsedStrip } from './PanelCollapsedStrip';
import { FloatingPanel } from './FloatingPanel';
import { DrawerPanel } from './DrawerPanel';
import { PipPanel } from './PipPanel';
import {
  computeContainerStyle,
  getAreaGridStyle,
  getDraggedPanelInfo,
  getDrawerEdge,
} from './panelGridStyles';
import '@ybouhjira/hyperkit-styles/panels/panels.css';

export const PanelContainer: Component<PanelContainerProps> = (props) => {
  const chrome = () => props.chrome ?? 'full';

  const {
    layout,
    actions,
    getPanelsForPosition,
    getFloatingPanels,
    getDrawerPanels,
    getPipPanels,
  } = usePanelLayout(props.panels, props.storageKey, props.initialLayout);

  const [containerBounds, setContainerBounds] = createSignal({ width: 0, height: 0 });

  const {
    dragState,
    startDrag: startDragInternal,
    dropZones,
    registerDropZone,
    unregisterDropZone,
  } = usePanelDrag(actions.move);

  const { isIdle, setContainerRef: setContainerRefChrome } = usePanelChrome();

  const handleContainerRef = (el: HTMLElement) => {
    setContainerRefChrome(el);
    // Track container bounds for floating panels
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    onCleanup(() => observer.disconnect());
  };

  const startDrag = (panelId: string, event?: PointerEvent) => {
    if (event) {
      startDragInternal(panelId, event);
    }
  };

  // Sync internal layout store with props.panels changes (add/remove panels)
  createEffect(() => {
    const incomingIds = new Set(props.panels.map((p) => p.id));
    const currentPanels = layout().panels;

    // Hide panels that were removed from props
    for (const id of Object.keys(currentPanels)) {
      const panelState = currentPanels[id];
      if (!incomingIds.has(id) && panelState?.visible) {
        actions.hide(id);
      }
    }

    // Show panels that were added back to props
    for (const panel of props.panels) {
      const state = currentPanels[panel.id];
      if (state != null && !state.visible) {
        actions.show(panel.id);
      }
    }
  });

  // Notify parent of layout changes
  createEffect(() => {
    props.onLayoutChange?.(layout());
  });

  const leftPanels = () => getPanelsForPosition('left');
  const rightPanels = () => getPanelsForPosition('right');
  const bottomPanels = () => getPanelsForPosition('bottom');
  const centerPanels = () => getPanelsForPosition('center');

  const hasLeft = () => leftPanels().length > 0;
  const hasRight = () => rightPanels().length > 0;
  const hasBottom = () => bottomPanels().length > 0;
  const hasCenter = () => centerPanels().length > 0;

  const hasCollapsedCenterPanels = () =>
    centerPanels().some((p) => p.state.collapsed && p.state.visible);
  const needsLeftStrip = () => hasLeft() || hasCollapsedCenterPanels();

  const allCollapsed = (position: 'left' | 'right' | 'bottom') => {
    const panels = getPanelsForPosition(position);
    return panels.length > 0 && panels.every((p) => p.state.collapsed);
  };

  const hasExpandedPanels = (position: 'left' | 'right' | 'bottom' | 'center') => {
    const panels = getPanelsForPosition(position);
    return panels.some((p) => !p.state.collapsed && p.state.visible);
  };

  const dragInfo = () => getDraggedPanelInfo(dragState().draggedPanelId, props.panels);

  const containerStyle = () =>
    computeContainerStyle({
      layout: layout(),
      isDragging: dragState().isDragging,
      hasLeft: hasLeft(),
      hasRight: hasRight(),
      hasBottom: hasBottom(),
      allCollapsedLeft: allCollapsed('left'),
      allCollapsedRight: allCollapsed('right'),
      allCollapsedBottom: allCollapsed('bottom'),
      needsLeftStrip: needsLeftStrip(),
    });

  const onResizeArea = (position: 'left' | 'right' | 'bottom') => (delta: number) => {
    const currentSize = layout().areaSizes[position];
    let newSize = currentSize;
    switch (position) {
      case 'left':
        newSize = currentSize + delta;
        break;
      case 'right':
        newSize = currentSize - delta;
        break;
      case 'bottom':
        newSize = currentSize - delta;
        break;
    }
    actions.resizeArea(position, newSize);
  };

  const handlePanelResize = (panelId: string, delta: number) => {
    const panel = layout().panels[panelId];
    if (!panel) return;
    const newSize = panel.size + delta;
    actions.resize(panelId, newSize);
  };

  return (
    <Show
      when={!layout().maximizedPanelId}
      fallback={
        <Show when={layout().maximizedPanelId}>
          {(maxId) => (
            <MaximizedView
              maximizedPanelId={maxId()}
              allPanels={props.panels}
              layout={layout()}
              getPanelsForPosition={getPanelsForPosition}
              onTabClick={(panelId) => actions.maximize(panelId)}
              onTabClose={(panelId) => actions.hide(panelId)}
              onRestore={() => actions.restore()}
              onCollapse={actions.collapse}
              onExpand={actions.expand}
              onClose={actions.hide}
            />
          )}
        </Show>
      }
    >
      <div
        classList={{
          'sk-panel-container': true,
          [`sk-panel-container--chrome-${chrome()}`]: true,
          'sk-panel-container--idle':
            isIdle() && (chrome() === 'fade-on-idle' || chrome() === 'auto-hide'),
        }}
        style={containerStyle()}
        ref={handleContainerRef}
      >
        {/* Left sidebar + collapsed center panels */}
        <Show when={needsLeftStrip()}>
          <div class="sk-panel-area sk-panel-area--left" style={getAreaGridStyle('left')}>
            <PanelCollapsedStrip
              panels={[...leftPanels(), ...centerPanels()]}
              direction="vertical"
              onExpand={actions.expand}
            />
            <Show when={hasExpandedPanels('left')}>
              <PanelGroup
                panels={leftPanels()}
                direction="vertical"
                onResize={handlePanelResize}
                onCollapse={actions.collapse}
                onExpand={actions.expand}
                onClose={actions.hide}
                onMaximize={(panelId) => actions.maximize(panelId)}
                onPip={(panelId) => actions.togglePip(panelId)}
                onDragStart={startDrag}
                draggedPanelId={dragState().draggedPanelId}
              />
            </Show>
            <Show when={dragState().isDragging && dragState().activeDropZone === 'left'}>
              <PanelDropPreview
                panelTitle={dragInfo().title}
                panelIcon={dragInfo().icon}
                visible={true}
              />
            </Show>
          </div>
          <Show when={hasLeft() && !allCollapsed('left')}>
            <div class="sk-resize-wrapper sk-resize-wrapper--left" style={{ 'grid-column': '2' }}>
              <PanelResizeHandle direction="horizontal" onResize={onResizeArea('left')} />
            </div>
          </Show>
        </Show>

        {/* Center area */}
        <div class="sk-panel-area sk-panel-area--center" style={getAreaGridStyle('center')}>
          <Show when={hasCenter()} fallback={props.children}>
            {/* Tab bar — only when center has 2+ expanded panels */}
            <Show when={hasExpandedPanels('center')}>
              <Show when={centerPanels().filter((p) => !p.state.collapsed).length >= 2}>
                <PanelTabBar
                  tabs={centerPanels()
                    .filter((p) => !p.state.collapsed)
                    .sort((a, b) => {
                      // Pinned tabs come first
                      if (a.state.pinned && !b.state.pinned) return -1;
                      if (!a.state.pinned && b.state.pinned) return 1;
                      // Within each group, maintain order
                      return a.state.order - b.state.order;
                    })
                    .map((p) => ({
                      id: p.config.id,
                      title: p.config.title,
                      icon: p.config.icon,
                      pinned: p.state.pinned,
                    }))}
                  activeTabId={layout().activeTabId ?? centerPanels()[0]?.config.id ?? ''}
                  onTabClick={actions.setActiveTab}
                  onDragStart={startDrag}
                  onPin={actions.pin}
                  onUnpin={actions.unpin}
                />
              </Show>
              <PanelGroup
                panels={centerPanels()}
                direction="vertical"
                onResize={handlePanelResize}
                onCollapse={actions.collapse}
                onExpand={actions.expand}
                onClose={actions.hide}
                onMaximize={(panelId) => actions.maximize(panelId)}
                onPip={(panelId) => actions.togglePip(panelId)}
                onDragStart={startDrag}
                draggedPanelId={dragState().draggedPanelId}
                tabMode={centerPanels().filter((p) => !p.state.collapsed).length >= 2}
                activeTabId={layout().activeTabId ?? centerPanels()[0]?.config.id}
              />
            </Show>
          </Show>
          <Show when={dragState().isDragging && dragState().activeDropZone === 'center'}>
            <PanelDropPreview
              panelTitle={dragInfo().title}
              panelIcon={dragInfo().icon}
              visible={true}
            />
          </Show>
        </div>

        {/* Right sidebar */}
        <Show when={hasRight()}>
          <Show when={!allCollapsed('right')}>
            <div class="sk-resize-wrapper sk-resize-wrapper--right" style={{ 'grid-column': '4' }}>
              <PanelResizeHandle direction="horizontal" onResize={onResizeArea('right')} />
            </div>
          </Show>
          <div class="sk-panel-area sk-panel-area--right" style={getAreaGridStyle('right')}>
            <PanelCollapsedStrip
              panels={rightPanels()}
              direction="vertical"
              onExpand={actions.expand}
            />
            <Show when={hasExpandedPanels('right')}>
              <PanelGroup
                panels={rightPanels()}
                direction="vertical"
                onResize={handlePanelResize}
                onCollapse={actions.collapse}
                onExpand={actions.expand}
                onClose={actions.hide}
                onMaximize={(panelId) => actions.maximize(panelId)}
                onPip={(panelId) => actions.togglePip(panelId)}
                onDragStart={startDrag}
                draggedPanelId={dragState().draggedPanelId}
              />
            </Show>
            <Show when={dragState().isDragging && dragState().activeDropZone === 'right'}>
              <PanelDropPreview
                panelTitle={dragInfo().title}
                panelIcon={dragInfo().icon}
                visible={true}
              />
            </Show>
          </div>
        </Show>

        {/* Bottom panel */}
        <Show when={hasBottom()}>
          <Show when={!allCollapsed('bottom')}>
            <div
              class="sk-resize-wrapper--bottom"
              style={{ 'grid-column': '1 / 6', 'grid-row': '2' }}
            >
              <PanelResizeHandle direction="vertical" onResize={onResizeArea('bottom')} />
            </div>
          </Show>
          <div class="sk-panel-area sk-panel-area--bottom" style={getAreaGridStyle('bottom')}>
            <PanelCollapsedStrip
              panels={bottomPanels()}
              direction="horizontal"
              onExpand={actions.expand}
            />
            <Show when={hasExpandedPanels('bottom')}>
              <PanelGroup
                panels={bottomPanels()}
                direction="horizontal"
                onResize={handlePanelResize}
                onCollapse={actions.collapse}
                onExpand={actions.expand}
                onClose={actions.hide}
                onMaximize={(panelId) => actions.maximize(panelId)}
                onPip={(panelId) => actions.togglePip(panelId)}
                onDragStart={startDrag}
                draggedPanelId={dragState().draggedPanelId}
              />
            </Show>
            <Show when={dragState().isDragging && dragState().activeDropZone === 'bottom'}>
              <PanelDropPreview
                panelTitle={dragInfo().title}
                panelIcon={dragInfo().icon}
                visible={true}
              />
            </Show>
          </div>
        </Show>

        {/* Empty area placeholders during drag */}
        <Show when={dragState().isDragging}>
          {/* Left — only when no left panels AND no collapsed strip needed */}
          <Show when={!needsLeftStrip()}>
            <div
              class="sk-panel-area sk-panel-area--left sk-panel-area--empty-drop"
              style={getAreaGridStyle('left')}
            >
              <Show when={dragState().activeDropZone === 'left'}>
                <PanelDropPreview
                  panelTitle={dragInfo().title}
                  panelIcon={dragInfo().icon}
                  visible={true}
                />
              </Show>
            </div>
          </Show>

          {/* Right — only when no right panels */}
          <Show when={!hasRight()}>
            <div
              class="sk-panel-area sk-panel-area--right sk-panel-area--empty-drop"
              style={getAreaGridStyle('right')}
            >
              <Show when={dragState().activeDropZone === 'right'}>
                <PanelDropPreview
                  panelTitle={dragInfo().title}
                  panelIcon={dragInfo().icon}
                  visible={true}
                />
              </Show>
            </div>
          </Show>

          {/* Bottom — only when no bottom panels */}
          <Show when={!hasBottom()}>
            <div
              class="sk-panel-area sk-panel-area--bottom sk-panel-area--empty-drop"
              style={{ ...getAreaGridStyle('bottom'), 'grid-row': '3' }}
            >
              <Show when={dragState().activeDropZone === 'bottom'}>
                <PanelDropPreview
                  panelTitle={dragInfo().title}
                  panelIcon={dragInfo().icon}
                  visible={true}
                />
              </Show>
            </div>
          </Show>
        </Show>

        {/* Drop zones during drag */}
        <Show when={dragState().isDragging}>
          <PanelDropZone
            position="left"
            active={dropZones().find((z) => z.position === 'left')?.active ?? false}
            visible={true}
            onRegister={registerDropZone}
            onUnregister={unregisterDropZone}
            style={{ 'grid-column': '1', 'grid-row': '1' }}
          />
          <PanelDropZone
            position="center"
            active={dropZones().find((z) => z.position === 'center')?.active ?? false}
            visible={true}
            onRegister={registerDropZone}
            onUnregister={unregisterDropZone}
            style={{ 'grid-column': '3', 'grid-row': '1' }}
          />
          <PanelDropZone
            position="right"
            active={dropZones().find((z) => z.position === 'right')?.active ?? false}
            visible={true}
            onRegister={registerDropZone}
            onUnregister={unregisterDropZone}
            style={{ 'grid-column': '5', 'grid-row': '1' }}
          />
          <PanelDropZone
            position="bottom"
            active={dropZones().find((z) => z.position === 'bottom')?.active ?? false}
            visible={true}
            onRegister={registerDropZone}
            onUnregister={unregisterDropZone}
            style={{ 'grid-column': '1 / 6', 'grid-row': '3' }}
          />

          {/* Drag ghost - full panel follows cursor anchored at grab point */}
          <Show
            when={(() => {
              const pos = dragState().currentPosition;
              const panelId = dragState().draggedPanelId;
              if (pos != null && panelId != null) {
                return { pos, panelId };
              }
              return undefined;
            })()}
          >
            {(data) => {
              const panelConfig = props.panels.find((p) => p.id === data().panelId);
              const offset = dragState().dragOffset ?? { x: 0, y: 0 };
              const rect = dragState().panelRect ?? { width: 200, height: 200 };

              return (
                <div
                  class="sk-drag-ghost"
                  style={{
                    transform: `translate(${data().pos.x - offset.x}px, ${data().pos.y - offset.y}px)`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                  }}
                >
                  {/* Ghost header */}
                  <div class="sk-drag-ghost__header">
                    <Show when={panelConfig?.icon}>
                      <span class="sk-drag-ghost__icon">
                        {typeof panelConfig?.icon === 'string' ? panelConfig.icon : null}
                      </span>
                    </Show>
                    <span>{panelConfig?.title ?? 'Panel'}</span>
                  </div>
                  {/* Ghost content */}
                  <div class="sk-drag-ghost__content">
                    {panelConfig != null ? panelConfig.render() : null}
                  </div>
                </div>
              );
            }}
          </Show>
        </Show>

        {/* Floating panels overlay */}
        <For each={getFloatingPanels()}>
          {(panel) => (
            <FloatingPanel
              config={panel.config}
              state={panel.state}
              position={panel.state.floatingPosition ?? { x: 100, y: 100 }}
              size={panel.state.floatingSize ?? { width: 400, height: 300 }}
              onMove={actions.moveFloating}
              onResize={actions.resizeFloating}
              onClose={(id) => actions.hide(id)}
              onDock={(id) => actions.setMode(id, 'docked')}
              containerBounds={containerBounds()}
            />
          )}
        </For>

        {/* Drawer panels */}
        <For each={getDrawerPanels()}>
          {(panel) => (
            <DrawerPanel
              config={panel.config}
              state={panel.state}
              isOpen={panel.state.drawerOpen ?? false}
              edge={getDrawerEdge(panel.state.position)}
              onOpen={actions.openDrawer}
              onClose={actions.closeDrawer}
              onDock={(id) => actions.setMode(id, 'docked')}
            />
          )}
        </For>

        {/* PiP panels */}
        <For each={getPipPanels()}>
          {(panel) => (
            <PipPanel
              config={panel.config}
              state={panel.state}
              onRestore={(id) => actions.togglePip(id)}
              containerBounds={containerBounds()}
            />
          )}
        </For>
      </div>
    </Show>
  );
};
