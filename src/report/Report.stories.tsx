import type { Meta, StoryObj } from 'storybook-solidjs';
import { Report } from './Report';
import { architectureReviewSchema } from './presets/architectureReview';
import { ThemeProvider } from '../theme';
import { reportDarkTheme } from '../theme/presets';

const meta: Meta<typeof Report> = {
  title: 'Pages/Report',
  component: Report,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Report>;

export const ArchitectureReview: Story = {
  render: () => (
    <ThemeProvider theme={reportDarkTheme}>
      <Report schema={architectureReviewSchema} />
    </ThemeProvider>
  ),
};

export const DefaultTheme: Story = {
  render: () => <Report schema={architectureReviewSchema} />,
};
