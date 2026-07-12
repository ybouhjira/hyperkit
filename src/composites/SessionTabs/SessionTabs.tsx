import { Component, For, Show } from 'solid-js';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import '@ybouhjira/hyperkit-styles/composites/SessionTabs/SessionTabs.css';

export type TabSessionStatus = 'idle' | 'streaming' | 'error';

export interface SessionTab {
  id: string;
  name: string;
  status: TabSessionStatus;
  unreadCount?: number;
}

export interface SessionTabsProps {
  tabs: SessionTab[];
  activeTabId?: string;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  onNewTab?: () => void;
  class?: string;
}

export const SessionTabs: Component<SessionTabsProps> = (props) => {
  return (
    <div class={`sk-session-tabs ${props.class ?? ''}`} data-testid="session-tabs">
      <For each={props.tabs}>
        {(tab) => {
          const isActive = () => tab.id === props.activeTabId;
          return (
            <button
              type="button"
              onClick={() => props.onTabSelect?.(tab.id)}
              class={`sk-session-tab${isActive() ? ' sk-session-tab--active' : ''}`}
              data-testid="session-tab"
              data-active={isActive()}
            >
              <span class={`sk-session-tab__dot sk-session-tab__dot--${tab.status}`} />
              <span class="sk-session-tab__name">{tab.name}</span>
              <Show when={(tab.unreadCount ?? 0) > 0}>
                <Badge variant="info" type="count" count={tab.unreadCount} />
              </Show>
              <Show when={props.onTabClose}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onTabClose?.(tab.id);
                  }}
                  class="sk-session-tab__close"
                  role="button"
                  aria-label={`Close ${tab.name}`}
                  data-testid="tab-close"
                >
                  ×
                </span>
              </Show>
            </button>
          );
        }}
      </For>
      <Show when={props.onNewTab}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => props.onNewTab?.()}
          class="ml-1"
          data-testid="new-tab-button"
        >
          +
        </Button>
      </Show>
    </div>
  );
};
