// This file is ONLY imported on the client (via lazy() in Popover.tsx).
// It is safe to import @kobalte/core/popover here.
import { type Component, splitProps } from 'solid-js';
import { Popover as KobaltePopover } from '@kobalte/core/popover';
import type { PopoverProps } from './Popover';
import '@ybouhjira/hyperkit-styles/primitives/Popover/Popover.css';

export const PopoverClient: Component<PopoverProps> = (props) => {
  const [local, others] = splitProps(props, [
    'trigger',
    'content',
    'placement',
    'open',
    'onOpenChange',
    'class',
    'style',
  ]);

  return (
    <KobaltePopover
      placement={local.placement ?? 'bottom'}
      open={local.open}
      onOpenChange={local.onOpenChange}
      {...others}
    >
      <KobaltePopover.Trigger as="span" class="sk-popover__trigger" data-testid="popover-trigger">
        {local.trigger}
      </KobaltePopover.Trigger>
      <KobaltePopover.Portal>
        <KobaltePopover.Content
          class={`sk-popover__content${local.class ? ` ${local.class}` : ''}`}
          style={local.style}
          data-testid="popover-content"
        >
          <KobaltePopover.Arrow class="sk-popover__arrow" />
          {local.content}
        </KobaltePopover.Content>
      </KobaltePopover.Portal>
    </KobaltePopover>
  );
};
