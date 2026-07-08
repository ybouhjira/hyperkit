import type { Meta, StoryObj } from 'storybook-solidjs';
import { Button } from '../../primitives/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Composites/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete item…
        </Button>
        <ConfirmDialog
          open={open()}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setOpen(false);
          }}
        >
          <div>This action cannot be undone.</div>
        </ConfirmDialog>
      </>
    );
  },
};

export const Danger: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete item…
        </Button>
        <ConfirmDialog
          open={open()}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Deleted');
            setOpen(false);
          }}
          variant="danger"
          confirmLabel="Delete"
        >
          <div>This will permanently delete your account and all associated data.</div>
        </ConfirmDialog>
      </>
    );
  },
};

export const WithContent: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete item…
        </Button>
        <ConfirmDialog
          open={open()}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Saved');
            setOpen(false);
          }}
          title="Save Changes?"
          confirmLabel="Save"
          cancelLabel="Discard"
        >
          <div>
            <p>You have unsaved changes in the editor.</p>
            <p>Would you like to save them before closing?</p>
          </div>
        </ConfirmDialog>
      </>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete item…
        </Button>
        <ConfirmDialog
          open={open()}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              console.log('Processing complete');
              setLoading(false);
              setOpen(false);
            }, 2000);
          }}
          loading={loading()}
          confirmLabel="Process"
        >
          <div>Click confirm to start a 2-second simulated process.</div>
        </ConfirmDialog>
      </>
    );
  },
};
