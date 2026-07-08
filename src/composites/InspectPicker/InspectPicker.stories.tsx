import type { Meta, StoryObj } from 'storybook-solidjs';
import { Button } from '../../primitives/Button';
import { InspectPicker } from './InspectPicker';

const meta: Meta<typeof InspectPicker> = {
  title: 'Composites/InspectPicker',
  component: InspectPicker,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof InspectPicker>;

const capture = {
  selector: 'button.sk-btn.sk-btn--primary',
  tag: 'button',
  classes: 'sk-btn sk-btn--primary',
  text: 'Save changes',
  rect: { x: 120, y: 96, width: 132, height: 32 },
  url: 'https://example.test/settings',
};

export const Armed: Story = {
  args: {
    active: true,
  },
};

export const Captured: Story = {
  args: {
    active: false,
    capture,
    actions: (
      <>
        <Button variant="secondary" size="sm">
          Improve UX
        </Button>
        <Button variant="secondary" size="sm">
          Fix layout
        </Button>
        <Button variant="ghost" size="sm">
          Attach to chat
        </Button>
      </>
    ),
  },
};
