import { Component, Show, For } from 'solid-js';
import { FileAttachment } from './types';
import { CloseIcon } from './icons';

export interface AttachmentBarProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
}

export const AttachmentBar: Component<AttachmentBarProps> = (props) => {
  return (
    <Show when={props.attachments.length > 0}>
      <div class="sk-message-input__attachments">
        <For each={props.attachments}>
          {(att) => (
            <div class="sk-message-input__file-chip">
              <span class="sk-message-input__file-chip-name">{att.name}</span>
              <button
                class="sk-message-input__file-chip-remove"
                onClick={() => props.onRemove(att.id)}
                type="button"
                aria-label={`Remove ${att.name}`}
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};
