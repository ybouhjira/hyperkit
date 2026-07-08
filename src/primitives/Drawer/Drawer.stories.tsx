import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Drawer } from './Drawer';
import { Button } from '../Button';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta: Meta<typeof Drawer> = {
  title: 'Feedback/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const NavList = () => (
  <Stack gap="sm" style={{ padding: 'var(--sk-space-md)' }}>
    <Text size="sm" weight="semibold" color="muted">
      Navigation
    </Text>
    <Button variant="ghost">Home</Button>
    <Button variant="ghost">Projects</Button>
    <Button variant="ghost">Issues</Button>
    <Button variant="ghost">Settings</Button>
  </Stack>
);

export const SidebarExample: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Card style={{ padding: 'var(--sk-space-lg)' }}>
        <Stack gap="md">
          <Text>Primary navigation drawer — slides in from the left edge.</Text>
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
        </Stack>
        <Drawer
          open={open()}
          onOpenChange={setOpen}
          side="left"
          size="280px"
          aria-label="Primary navigation"
        >
          <NavList />
        </Drawer>
      </Card>
    );
  },
};

export const Left: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open left</Button>
        <Drawer open={open()} onOpenChange={setOpen} side="left">
          <NavList />
        </Drawer>
      </>
    );
  },
};

export const Right: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open right</Button>
        <Drawer open={open()} onOpenChange={setOpen} side="right">
          <NavList />
        </Drawer>
      </>
    );
  },
};

export const Top: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open top</Button>
        <Drawer open={open()} onOpenChange={setOpen} side="top" size="240px">
          <NavList />
        </Drawer>
      </>
    );
  },
};

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open bottom</Button>
        <Drawer open={open()} onOpenChange={setOpen} side="bottom" size="240px">
          <NavList />
        </Drawer>
      </>
    );
  },
};

export const NonModal: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button onClick={() => setOpen((v) => !v)}>Toggle non-modal drawer</Button>
        <Drawer open={open()} onOpenChange={setOpen} side="left" modal={false}>
          <NavList />
        </Drawer>
      </>
    );
  },
};

export const NotDismissible: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Drawer open={open()} onOpenChange={setOpen} dismissible={false}>
        <Stack gap="sm" style={{ padding: 'var(--sk-space-md)' }}>
          <Text>This drawer ignores Escape and backdrop clicks.</Text>
          <Button onClick={() => setOpen(false)}>Close explicitly</Button>
        </Stack>
      </Drawer>
    );
  },
};
