import { type JSX, type Component, splitProps, Show } from 'solid-js';
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import '@ybouhjira/hyperkit-styles/primitives/Dialog/Dialog.css';

export interface DialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback fired when dialog open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Dialog title displayed in the header. */
  title: string;
  /** Optional description text displayed below the title. */
  description?: string;
  /** Dialog content to display in the body. */
  children: JSX.Element;
  /** Additional CSS class name for the dialog content. */
  class?: string;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Modal dialog component with overlay, title, description, and close button.
 *
 * @example
 * ```tsx
 * import { Dialog, Stack, Button, Input } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Create project dialog
 * const [open, setOpen] = createSignal(false);
 * const [name, setName] = createSignal("");
 * <Button onClick={() => setOpen(true)}>New Project</Button>
 * <Dialog
 *   open={open()}
 *   onOpenChange={setOpen}
 *   title="Create Project"
 *   description="Give your project a name to get started."
 * >
 *   <Stack gap="md">
 *     <Input placeholder="Project name" value={name()} onInput={setName} />
 *     <Stack direction="horizontal" gap="sm" justify="end">
 *       <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button onClick={() => { createProject(name()); setOpen(false); }}>Create</Button>
 *     </Stack>
 *   </Stack>
 * </Dialog>
 *
 * // Settings dialog without description
 * <Dialog open={settingsOpen()} onOpenChange={setSettingsOpen} title="Preferences">
 *   <SettingsPanel />
 * </Dialog>
 * ```
 *
 * @see ConfirmDialog - for simple yes/no confirmation dialogs
 * @see Popover - for non-modal floating panels
 */
export const Dialog: Component<DialogProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'onOpenChange',
    'title',
    'description',
    'children',
    'class',
    'unstyled',
  ]);

  return (
    <KobalteDialog open={local.open} onOpenChange={local.onOpenChange} {...others}>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay class={local.unstyled ? '' : 'sk-dialog__overlay'} />
        <div class={local.unstyled ? '' : 'sk-dialog__positioner'}>
          <KobalteDialog.Content
            class={
              local.unstyled
                ? (local.class ?? '')
                : `sk-dialog__content${local.class ? ` ${local.class}` : ''}`
            }
          >
            <div class={local.unstyled ? '' : 'sk-dialog__header'}>
              <KobalteDialog.Title class={local.unstyled ? '' : 'sk-dialog__title'}>
                {local.title}
              </KobalteDialog.Title>
              <Show when={local.description}>
                <KobalteDialog.Description class={local.unstyled ? '' : 'sk-dialog__description'}>
                  {local.description}
                </KobalteDialog.Description>
              </Show>
            </div>
            <div class={local.unstyled ? '' : 'sk-dialog__body'}>{local.children}</div>
            <KobalteDialog.CloseButton class={local.unstyled ? '' : 'sk-dialog__close'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </KobalteDialog.CloseButton>
          </KobalteDialog.Content>
        </div>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
};
