import { Component, JSX, Show } from 'solid-js';
import { Sidebar } from '../../composites/Sidebar';
import { SessionTabs, type SessionTab } from '../../composites/SessionTabs';
import './ChatLayout.css';

export interface ChatLayoutProps {
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  sidebarContent?: JSX.Element;
  tabs?: SessionTab[];
  activeTabId?: string;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  onNewTab?: () => void;
  children: JSX.Element;
  class?: string;
}

export const ChatLayout: Component<ChatLayoutProps> = (props) => {
  return (
    <div class={`sk-chat-layout ${props.class ?? ''}`} data-testid="chat-layout">
      {/* Sidebar */}
      <Sidebar
        open={props.sidebarOpen}
        onToggle={props.onSidebarToggle}
        header={<span class="sk-chat-window__title">Sessions</span>}
      >
        {props.sidebarContent ?? <div class="sk-message-list__empty">No sessions</div>}
      </Sidebar>

      {/* Main area */}
      <div class="sk-chat-layout__main">
        {/* Tab bar */}
        <Show when={props.tabs && props.tabs.length > 0}>
          {props.tabs && (
            <SessionTabs
              tabs={props.tabs}
              activeTabId={props.activeTabId}
              onTabSelect={props.onTabSelect}
              onTabClose={props.onTabClose}
              onNewTab={props.onNewTab}
            />
          )}
        </Show>

        {/* Chat content */}
        <div class="sk-chat-layout__content">{props.children}</div>
      </div>
    </div>
  );
};
