import '@ybouhjira/hyperkit-styles/composites/PromptQueue/PromptQueue.css';
import { Show, For, Component, splitProps } from 'solid-js';
import { EmptyState } from '../../primitives/EmptyState';
import { Icon } from '../../icons';

export interface QueuedPrompt {
  id: string;
  text: string;
  addedAt?: number;
}

export interface PromptQueueProps {
  items: QueuedPrompt[];
  onRemove?: (id: string) => void;
  class?: string;
}

const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const PromptQueue: Component<PromptQueueProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'onRemove', 'class']);

  return (
    <div class={`sk-prompt-queue ${local.class ?? ''}`} {...others}>
      <Show
        when={local.items.length > 0}
        fallback={
          <EmptyState
            icon="message-square"
            title="No queued messages"
            description="Messages will appear here when queued"
          />
        }
      >
        <div class="sk-prompt-queue__list">
          <For each={local.items}>
            {(item, index) => (
              <div class="sk-prompt-queue__item" data-testid={`prompt-queue-item-${item.id}`}>
                <div class="sk-prompt-queue__position" data-testid="prompt-queue-position">
                  {index() + 1}
                </div>
                <div class="sk-prompt-queue__content">
                  <p class="sk-prompt-queue__text" title={item.text}>
                    {truncateText(item.text)}
                  </p>
                  <Show when={item.addedAt != null}>
                    {item.addedAt != null && (
                      <span class="sk-prompt-queue__timestamp">
                        {new Date(item.addedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </Show>
                </div>
                <Show when={local.onRemove}>
                  <button
                    class="sk-prompt-queue__remove"
                    onClick={() => local.onRemove?.(item.id)}
                    aria-label={`Remove message ${index() + 1}`}
                    data-testid={`prompt-queue-remove-${item.id}`}
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
