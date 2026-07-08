import type { Meta, StoryObj } from 'storybook-solidjs';
import { GalleryHubMockup } from './GalleryHubMockup';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { galleryHubDarkTheme } from '../../theme/presets';

const meta = {
  title: 'Pages/Gallery Hub',
  component: GalleryHubMockup,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={galleryHubDarkTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof GalleryHubMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Browse: Story = {
  args: {
    initialPage: 'browse',
  },
};

export const FaceSwap: Story = {
  args: {
    initialPage: 'faceswap',
  },
};

export const Downloads: Story = {
  args: {
    initialPage: 'downloads',
  },
};

export const Search: Story = {
  args: {
    initialPage: 'search',
  },
};

export const Settings: Story = {
  args: {
    initialPage: 'settings',
  },
};
