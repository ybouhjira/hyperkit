import type { CSSProperties, ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import '@ybouhjira/hyperkit-styles/primitives/Dialog/Dialog.css';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title displayed in the header. */
  title: string;
  /** Optional description below the title. */
  description?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Modal dialog on @radix-ui/react-dialog rendering the same `sk-dialog`
 * contract as the SolidJS package ([data-expanded] mirrored while open).
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  style,
}: DialogProps) {
  const expanded = open ? '' : undefined;
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="sk-dialog__overlay" data-expanded={expanded} />
        <div className="sk-dialog__positioner">
          <RadixDialog.Content
            className={`sk-dialog__content${className ? ` ${className}` : ''}`}
            style={style}
            data-expanded={expanded}
          >
            <div className="sk-dialog__header">
              <RadixDialog.Title className="sk-dialog__title">{title}</RadixDialog.Title>
              <RadixDialog.Close className="sk-dialog__close" aria-label="Close">
                ✕
              </RadixDialog.Close>
            </div>
            {description != null && (
              <RadixDialog.Description className="sk-dialog__description">
                {description}
              </RadixDialog.Description>
            )}
            <div className="sk-dialog__body">{children}</div>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
