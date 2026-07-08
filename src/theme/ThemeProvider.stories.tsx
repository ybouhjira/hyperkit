import type { Meta, StoryObj } from 'storybook-solidjs';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Input } from '../primitives/Input';

const ThemeDemo = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div class="space-y-4 p-6 bg-surface-900 rounded-lg">
      <div class="flex items-center gap-4">
        <span class="text-surface-200">Current: {theme()}</span>
        <Button onClick={toggleTheme}>Toggle Theme</Button>
      </div>
      <div class="flex gap-2">
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <Input placeholder="Type something..." />
      <div class="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Foundation/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Dark: Story = {
  render: () => (
    <ThemeProvider defaultTheme="dark">
      <ThemeDemo />
    </ThemeProvider>
  ),
};

export const Light: Story = {
  render: () => (
    <ThemeProvider defaultTheme="light">
      <ThemeDemo />
    </ThemeProvider>
  ),
};
