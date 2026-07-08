import { Component, Show, For } from 'solid-js';
import { SlashCommand } from './types';

export interface SlashCommandMenuProps {
  show: boolean;
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  onHover: (index: number) => void;
}

export const SlashCommandMenu: Component<SlashCommandMenuProps> = (props) => {
  return (
    <Show when={props.show && props.commands.length > 0}>
      <div class="sk-message-input__dropdown">
        <For each={props.commands}>
          {(cmd, i) => (
            <div
              class={`sk-message-input__dropdown-item ${i() === props.selectedIndex ? 'sk-message-input__dropdown-item--highlighted' : ''}`}
              onClick={() => props.onSelect(cmd)}
              onMouseEnter={() => props.onHover(i())}
            >
              <Show when={cmd.icon}>
                <span class="sk-message-input__dropdown-item-icon">{cmd.icon}</span>
              </Show>
              <span class="sk-message-input__dropdown-item-name">/{cmd.name}</span>
              <span class="sk-message-input__dropdown-item-desc">{cmd.description}</span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};
