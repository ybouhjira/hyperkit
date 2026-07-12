import { Component, createSignal, createEffect, splitProps, JSX } from 'solid-js';
import { For } from 'solid-js';
import { Icon } from '../../icons';
import '@ybouhjira/hyperkit-styles/composites/MobilePanelView/MobilePanelView.css';

export interface MobilePanelTab {
  id: string;
  label: string;
  icon?: string;
  render: () => JSX.Element;
}

export interface MobilePanelViewProps {
  tabs: MobilePanelTab[];
  activeId?: string;
  defaultId?: string;
  onTabChange?: (id: string) => void;
  class?: string;
}

export const MobilePanelView: Component<MobilePanelViewProps> = (props) => {
  const [local, others] = splitProps(props, [
    'tabs',
    'activeId',
    'defaultId',
    'onTabChange',
    'class',
  ]);

  const resolveInitialTab = () => {
    if (local.activeId && local.tabs.some((t) => t.id === local.activeId)) {
      return local.activeId;
    }
    if (local.defaultId && local.tabs.some((t) => t.id === local.defaultId)) {
      return local.defaultId;
    }
    return local.tabs[0]?.id || '';
  };

  const [internalActiveId, setInternalActiveId] = createSignal(resolveInitialTab());

  createEffect(() => {
    if (local.activeId !== undefined) {
      setInternalActiveId(local.activeId);
    }
  });

  createEffect(() => {
    const currentId = internalActiveId();
    const firstTab = local.tabs[0];
    if (!local.tabs.some((t) => t.id === currentId) && firstTab != null) {
      const fallbackId = firstTab.id;
      setInternalActiveId(fallbackId);
      local.onTabChange?.(fallbackId);
    }
  });

  const handleTabClick = (id: string) => {
    if (local.activeId === undefined) {
      setInternalActiveId(id);
    }
    local.onTabChange?.(id);
  };

  const activeTab = () => local.tabs.find((t) => t.id === internalActiveId());

  return (
    <div class={`sk-mobile-panel-view ${local.class || ''}`} {...others}>
      <div class="sk-mobile-panel-view__tabs">
        <For each={local.tabs}>
          {(tab) => (
            <button
              class={`sk-mobile-panel-view__tab ${
                tab.id === internalActiveId() ? 'sk-mobile-panel-view__tab--active' : ''
              }`}
              onClick={() => handleTabClick(tab.id)}
              type="button"
            >
              {tab.icon && <Icon name={tab.icon} size="sm" />}
              <span class="sk-mobile-panel-view__tab-label">{tab.label}</span>
            </button>
          )}
        </For>
      </div>
      <div class="sk-mobile-panel-view__content">{activeTab()?.render()}</div>
    </div>
  );
};
