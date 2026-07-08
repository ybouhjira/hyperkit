import { Component, Show, For } from 'solid-js';
import { MentionItem } from './types';

export interface MentionMenuProps {
  show: boolean;
  mentions: MentionItem[];
  selectedIndex: number;
  onSelect: (mention: MentionItem) => void;
  onHover: (index: number) => void;
}

export const MentionMenu: Component<MentionMenuProps> = (props) => {
  return (
    <Show when={props.show && props.mentions.length > 0}>
      <div class="sk-message-input__dropdown">
        <For each={props.mentions}>
          {(mention, i) => (
            <div
              class={`sk-message-input__dropdown-item ${i() === props.selectedIndex ? 'sk-message-input__dropdown-item--highlighted' : ''}`}
              onClick={() => props.onSelect(mention)}
              onMouseEnter={() => props.onHover(i())}
            >
              <Show when={mention.avatar}>
                <span class="sk-message-input__dropdown-item-icon">{mention.avatar}</span>
              </Show>
              <span class="sk-message-input__dropdown-item-name">@{mention.name}</span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};
