// This file is ONLY imported on the client (via lazy() in Tooltip.tsx).
// It is safe to import @kobalte/core/tooltip here.
import { type Component, splitProps } from 'solid-js';
import { Tooltip as KobalteTooltip } from '@kobalte/core/tooltip';
import type { TooltipProps } from './Tooltip';
import './Tooltip.css';

export const TooltipImpl: Component<TooltipProps> = (props) => {
  const [local, others] = splitProps(props, [
    'content',
    'placement',
    'delay',
    'children',
    'class',
    'unstyled',
  ]);

  return (
    <KobalteTooltip placement={local.placement ?? 'top'} openDelay={local.delay ?? 300} {...others}>
      <KobalteTooltip.Trigger as="span" class={local.unstyled ? '' : 'sk-tooltip__trigger'}>
        {local.children}
      </KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content
          class={
            local.unstyled
              ? (local.class ?? '')
              : `sk-tooltip__content${local.class ? ` ${local.class}` : ''}`
          }
        >
          <KobalteTooltip.Arrow />
          {local.content}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip>
  );
};
