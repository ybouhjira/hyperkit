import { Component, For, createEffect, createSignal } from 'solid-js';
import { Icon } from '../../icons';
import '@ybouhjira/hyperkit-styles/composites/TabBar/TabBar.css';

export interface TabBarTab {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  dirty?: boolean;
}

export interface TabBarProps {
  tabs: TabBarTab[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
  onAdd?: () => void;
  class?: string;
}

export const TabBar: Component<TabBarProps> = (props) => {
  const [_focusedIndex, setFocusedIndex] = createSignal<number>(-1);
  let scrollContainerRef: HTMLDivElement | undefined;

  const activeIndex = () => props.tabs.findIndex((tab) => tab.id === props.activeId);

  createEffect(() => {
    const index = activeIndex();
    if (index !== -1 && scrollContainerRef != null) {
      const activeTab = scrollContainerRef.children[index] as HTMLElement;
      if (activeTab != null) {
        activeTab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }
  });

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
      const prevTab = scrollContainerRef?.children[index - 1] as HTMLElement;
      prevTab?.focus();
    } else if (e.key === 'ArrowRight' && index < props.tabs.length - 1) {
      e.preventDefault();
      setFocusedIndex(index + 1);
      const nextTab = scrollContainerRef?.children[index + 1] as HTMLElement;
      nextTab?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const tab = props.tabs[index];
      if (tab != null) {
        props.onSelect?.(tab.id);
      }
    }
  };

  const handleClose = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    props.onClose?.(id);
  };

  return (
    <div class={`sk-tab-bar ${props.class || ''}`}>
      <div class="sk-tab-bar-scroll" ref={scrollContainerRef}>
        <For each={props.tabs}>
          {(tab, index) => (
            <button
              class={`sk-tab-bar-tab ${tab.id === props.activeId ? 'active' : ''}`}
              onClick={() => props.onSelect?.(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index())}
              aria-selected={tab.id === props.activeId}
              role="tab"
            >
              {tab.icon && <Icon name={tab.icon} size="sm" />}
              <span class="sk-tab-bar-label">{tab.label}</span>
              {tab.color && <span class="sk-tab-bar-color" style={{ background: tab.color }} />}
              {tab.dirty && <span class="sk-tab-bar-dirty" />}
              {props.onClose && (
                <button
                  class="sk-tab-bar-close"
                  onClick={(e) => handleClose(e, tab.id)}
                  aria-label={`Close ${tab.label}`}
                  type="button"
                >
                  <Icon name="x" size="xs" />
                </button>
              )}
            </button>
          )}
        </For>
      </div>
      {props.onAdd && (
        <button class="sk-tab-bar-add" onClick={props.onAdd} aria-label="Add tab" type="button">
          <Icon name="plus" size="sm" />
        </button>
      )}
    </div>
  );
};
