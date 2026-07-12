import { type JSX, type Component, splitProps } from 'solid-js';
import { Dialog } from '../../primitives/Dialog';
import { Button } from '../../primitives/Button';
import '@ybouhjira/hyperkit-styles/composites/ConfirmDialog/ConfirmDialog.css';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children?: JSX.Element;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  class?: string;
}

export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'onClose',
    'onConfirm',
    'title',
    'children',
    'confirmLabel',
    'cancelLabel',
    'variant',
    'loading',
    'class',
  ]);

  const defaultTitle = () => (local.variant === 'danger' ? 'Are you sure?' : 'Confirm');
  const confirmVariant = () => (local.variant === 'danger' ? 'danger' : 'primary');

  return (
    <Dialog
      open={local.open}
      onOpenChange={(open) => {
        if (!open) local.onClose();
      }}
      title={local.title ?? defaultTitle()}
      class={local.class}
      {...others}
    >
      {local.children}
      <div class="sk-confirm-dialog__footer">
        <Button variant="ghost" onClick={local.onClose} disabled={local.loading}>
          {local.cancelLabel ?? 'Cancel'}
        </Button>
        <Button variant={confirmVariant()} onClick={local.onConfirm} loading={local.loading}>
          {local.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Dialog>
  );
};
