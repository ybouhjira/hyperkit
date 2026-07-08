import type { Meta, StoryObj } from 'storybook-solidjs';
import { Dialog } from './Dialog';
import { createSignal } from 'solid-js';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const DefaultOpen: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog open={open()} onOpenChange={setOpen} title="Dialog Title">
          <p>This is the dialog content. You can put any elements here.</p>
        </Dialog>
      </>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="Confirm Action"
          description="Are you sure you want to proceed? This action cannot be undone."
        >
          <div class="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </div>
        </Dialog>
      </>
    );
  },
};

export const Closed: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog open={open()} onOpenChange={setOpen} title="Dialog Title">
          <p>This dialog starts closed. Click the button to open it.</p>
        </Dialog>
      </>
    );
  },
};
