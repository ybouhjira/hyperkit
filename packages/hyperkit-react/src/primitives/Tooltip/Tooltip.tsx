import type { CSSProperties, ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import '@ybouhjira/hyperkit-styles/primitives/Tooltip/Tooltip.css';

export interface TooltipProps {
  /** Tooltip content to display. */
  content: ReactNode;
  /** Placement relative to the trigger.
   * @default 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing, in ms.
   * @default 400 */
  openDelay?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Tooltip on @radix-ui/react-tooltip rendering the same `sk-tooltip` contract
 * as the SolidJS package.
 */
export function Tooltip({
  content,
  placement = 'top',
  openDelay = 400,
  children,
  className,
  style,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={openDelay}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <span className="sk-tooltip__trigger">{children}</span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={`sk-tooltip__content${className ? ` ${className}` : ''}`}
            style={style}
            side={placement}
            sideOffset={6}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
