import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../Box';
import { Flex } from '../Flex';
import { Stack } from '../Stack';
import { Grid } from '../Grid';
import { Text } from '../Text';
import { Center } from '../Center';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { ProgressBar } from '../ProgressBar';
import { MasonryGrid } from '../MasonryGrid';
import { createSignal } from 'solid-js';

const meta: Meta = {
  title: 'Pages/Full App Mockup',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/** Status-token palette used to differentiate demo thumbnails without hardcoded colors. */
const THUMB_TOKENS = [
  'var(--sk-accent)',
  'var(--sk-success)',
  'var(--sk-warning)',
  'var(--sk-error)',
  'var(--sk-info)',
] as const;

const thumbToken = (index: number): string => THUMB_TOKENS[index % THUMB_TOKENS.length] as string;

// Sidebar component
const Sidebar = (props: { activeRoute?: string }) => (
  <Flex
    direction="column"
    bg="primary"
    borderRight
    borderColor="default"
    style={{ width: '220px', height: '100vh' }}
  >
    {/* Header */}
    <Box p="lg" borderBottom borderColor="default">
      <Text size="lg" weight="semibold">
        Gallery Hub
      </Text>
    </Box>

    {/* Nav Links */}
    <Stack gap="xs" p="sm" style={{ flex: '1' }}>
      <NavLink label="Browse" active={props.activeRoute === 'browse'} icon="📁" />
      <NavLink label="Downloads" active={props.activeRoute === 'downloads'} icon="⬇️" />
      <NavLink label="Search" active={props.activeRoute === 'search'} icon="🔍" />
      <NavLink label="Settings" active={props.activeRoute === 'settings'} icon="⚙️" />
    </Stack>

    {/* Bottom Action */}
    <Box p="sm" borderTop borderColor="default">
      <Button variant="secondary" fullWidth>
        <Flex align="center" justify="between" style={{ width: '100%' }}>
          <Text>Swap Panel</Text>
          <Badge type="count" count={2} variant="info" />
        </Flex>
      </Button>
    </Box>
  </Flex>
);

// Nav Link component
const NavLink = (props: { label: string; active?: boolean; icon: string }) => (
  <Box
    p="sm"
    borderRadius="md"
    bg={props.active ? 'tertiary' : undefined}
    hoverBg={!props.active ? 'secondary' : undefined}
    cursor="pointer"
    transition
  >
    <Flex align="center" gap="sm">
      <Text>{props.icon}</Text>
      <Text weight={props.active ? 'medium' : 'regular'}>{props.label}</Text>
    </Flex>
  </Box>
);

// Header component
const Header = (props: { title: string; subtitle?: string }) => (
  <Flex
    align="center"
    justify="between"
    px="lg"
    borderBottom
    borderColor="default"
    bg="primary"
    style={{ height: '64px' }}
  >
    <Box>
      <Text size="xl" weight="semibold">
        {props.title}
      </Text>
      {props.subtitle && (
        <Text size="sm" color="muted">
          {props.subtitle}
        </Text>
      )}
    </Box>
  </Flex>
);

// Gallery Card component
const GalleryCard = (props: { title: string; count: number; color: string; height?: number }) => (
  <Card padding="none" hoverable>
    <Box position="relative" overflow="hidden">
      {/* Thumbnail */}
      <Box style={{ background: props.color, height: `${props.height || 180}px`, width: '100%' }} />

      {/* Count Badge */}
      <Box position="absolute" top={8} right={8}>
        <Badge variant="soft" size="xs">
          {props.count} images
        </Badge>
      </Box>
    </Box>

    {/* Title */}
    <Box p="sm">
      <Text weight="medium">{props.title}</Text>
    </Box>
  </Card>
);

// Image Placeholder component
const ImagePlaceholder = (props: { color: string; height: number; showAction?: boolean }) => (
  <Box position="relative" cursor="pointer" borderRadius="md" overflow="hidden">
    <Box style={{ background: props.color, height: `${props.height}px`, width: '100%' }} />

    {props.showAction && (
      <Center position="absolute" inset={0} bg="elevated">
        <Button size="sm">Download</Button>
      </Center>
    )}
  </Box>
);

// Download Item component
const DownloadItem = (props: { title: string; progress: number; speed: string; eta: string }) => (
  <Card>
    <Stack gap="md">
      <Flex align="center" justify="between">
        <Box style={{ flex: '1' }}>
          <Text weight="medium">{props.title}</Text>
          <Flex align="center" gap="md" mt="2xs">
            <Text size="sm" color="muted">
              {props.speed}
            </Text>
            <Text size="sm" color="muted">
              ETA: {props.eta}
            </Text>
          </Flex>
        </Box>
        <Flex gap="sm">
          <Button size="sm" variant="ghost">
            ⏸
          </Button>
          <Button size="sm" variant="ghost">
            ✕
          </Button>
        </Flex>
      </Flex>
      <ProgressBar value={props.progress} />
    </Stack>
  </Card>
);

// Face Thumbnail component
const FaceThumbnail = (props: { name: string; color: string; active?: boolean }) => (
  <Box position="relative">
    <Box
      borderRadius="md"
      border
      borderColor={props.active ? 'accent' : 'default'}
      cursor="pointer"
      style={{ background: props.color, width: '80px', height: '80px' }}
    />
    <Text size="xs" align="center" mt="2xs">
      {props.name}
    </Text>
  </Box>
);

// Face Swap Panel component
const FaceSwapPanel = () => (
  <Flex
    direction="column"
    bg="secondary"
    borderLeft
    borderColor="default"
    style={{ width: '350px', height: '100vh' }}
  >
    {/* Header */}
    <Flex align="center" justify="between" p="md" borderBottom borderColor="default">
      <Text size="lg" weight="semibold">
        Face Swap
      </Text>
      <Flex gap="sm">
        <Button size="sm" variant="ghost">
          +
        </Button>
        <Button size="sm" variant="ghost">
          ✕
        </Button>
      </Flex>
    </Flex>

    {/* Face Grid */}
    <Box p="md" overflow="auto" style={{ flex: '1' }}>
      <Grid columns={3} gap="sm">
        <FaceThumbnail name="Person 1" color={thumbToken(0)} active />
        <FaceThumbnail name="Person 2" color={thumbToken(1)} />
        <FaceThumbnail name="Person 3" color={thumbToken(2)} />
        <FaceThumbnail name="Person 4" color={thumbToken(3)} />
      </Grid>
    </Box>

    {/* Footer */}
    <Box p="md" borderTop borderColor="default">
      <Flex align="center" gap="sm" mb="sm">
        <Box borderRadius="full" bg="accent" style={{ width: '8px', height: '8px' }} />
        <Text size="sm" color="muted">
          Click images to swap
        </Text>
      </Flex>
      <Text size="sm" color="muted">
        1 running / 3 completed
      </Text>
    </Box>
  </Flex>
);

const GALLERIES = [
  { title: 'Nature Photography', count: 24, height: 160 },
  { title: 'Street Art', count: 18, height: 220 },
  { title: 'Architecture', count: 32, height: 180 },
  { title: 'Portraits', count: 15, height: 200 },
  { title: 'Landscapes', count: 28, height: 170 },
  { title: 'Abstract', count: 22, height: 190 },
  { title: 'Wildlife', count: 19, height: 210 },
  { title: 'Urban Life', count: 26, height: 175 },
];

// Story 1: Full App Layout
export const FullApp: Story = {
  render: () => (
    <Flex overflow="hidden" style={{ height: '100vh' }}>
      <Sidebar activeRoute="browse" />
      <Flex direction="column" overflow="hidden" style={{ flex: '1' }}>
        <Header title="Browse Galleries" />
        <Box overflow="auto" p="lg" style={{ flex: '1' }}>
          <Stack gap="lg">
            <Box>
              <Text size="2xl" weight="bold" mb="2xs">
                Recent Galleries
              </Text>
              <Text color="muted">Browse and download image galleries</Text>
            </Box>

            <MasonryGrid columns={4} gap="md">
              {GALLERIES.map((g, i) => (
                <GalleryCard
                  title={g.title}
                  count={g.count}
                  color={thumbToken(i)}
                  height={g.height}
                />
              ))}
            </MasonryGrid>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  ),
};

// Story 2: Home Page - Gallery Grid
export const HomePage: Story = {
  render: () => (
    <Box p="lg">
      <Stack gap="lg">
        <Box>
          <Text size="2xl" weight="bold" mb="2xs">
            Recent Galleries
          </Text>
          <Text color="muted">Browse and download image galleries</Text>
        </Box>

        <MasonryGrid columns={4} gap="md">
          {GALLERIES.map((g, i) => (
            <GalleryCard title={g.title} count={g.count} color={thumbToken(i)} height={g.height} />
          ))}
        </MasonryGrid>
      </Stack>
    </Box>
  ),
};

// Story 3: Gallery Page - Image Grid
export const GalleryPage: Story = {
  render: () => (
    <Box p="lg">
      <Stack gap="lg">
        {/* Toolbar */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="sm">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
            <Box>
              <Text size="xl" weight="bold">
                Nature Photography
              </Text>
              <Text size="sm" color="muted">
                52 images
              </Text>
            </Box>
          </Flex>
          <Button>Download All</Button>
        </Flex>

        {/* Image Grid */}
        <MasonryGrid columns={4} gap="sm">
          {[180, 240, 200, 220, 190, 260, 170, 210, 230, 195, 250, 185].map((h, i) => (
            <ImagePlaceholder color={thumbToken(i)} height={h} showAction />
          ))}
        </MasonryGrid>
      </Stack>
    </Box>
  ),
};

// Story 4: Downloads Page
export const DownloadsPage: Story = {
  render: () => (
    <Box p="lg">
      <Stack gap="lg">
        <Box>
          <Text size="2xl" weight="bold" mb="2xs">
            Active Downloads
          </Text>
          <Text color="muted">Manage your download queue</Text>
        </Box>

        <Stack gap="md">
          <DownloadItem
            title="Nature Photography (24 images)"
            progress={65}
            speed="2.4 MB/s"
            eta="12s"
          />
          <DownloadItem title="Street Art (18 images)" progress={32} speed="1.8 MB/s" eta="28s" />
          <DownloadItem title="Architecture (32 images)" progress={89} speed="3.1 MB/s" eta="5s" />
        </Stack>
      </Stack>
    </Box>
  ),
};

// Story 5: Search Page
export const SearchPage: Story = {
  render: () => {
    const [hasResults, setHasResults] = createSignal(false);

    return (
      <Box p="lg">
        <Stack gap="lg">
          <Box>
            <Text size="2xl" weight="bold" mb="2xs">
              Search Galleries
            </Text>
            <Text color="muted">Find galleries by name or tags</Text>
          </Box>

          {/* Search Form */}
          <Flex gap="sm">
            <Box style={{ flex: '1' }}>
              <Input placeholder="Search galleries..." />
            </Box>
            <Button onClick={() => setHasResults(!hasResults())}>Search</Button>
          </Flex>

          {/* Results or Empty State */}
          {hasResults() ? (
            <MasonryGrid columns={4} gap="md">
              {GALLERIES.slice(0, 3).map((g, i) => (
                <GalleryCard
                  title={g.title}
                  count={g.count}
                  color={thumbToken(i)}
                  height={g.height}
                />
              ))}
            </MasonryGrid>
          ) : (
            <Card padding="lg">
              <Center>
                <Stack gap="md" align="center">
                  <Text size="4xl">🔍</Text>
                  <Text size="lg" weight="medium">
                    No results yet
                  </Text>
                  <Text color="muted">Search for galleries to get started</Text>
                </Stack>
              </Center>
            </Card>
          )}
        </Stack>
      </Box>
    );
  },
};

// Story 6: Settings Page
export const SettingsPage: Story = {
  render: () => (
    <Box p="lg">
      <Stack gap="lg">
        <Box>
          <Text size="2xl" weight="bold" mb="2xs">
            Settings
          </Text>
          <Text color="muted">Configure your download preferences</Text>
        </Box>

        {/* Plugins Section */}
        <Card>
          <Stack gap="md">
            <Text size="lg" weight="semibold">
              Plugins
            </Text>
            <Flex align="center" justify="between">
              <Box>
                <Text weight="medium">Face Swap Plugin</Text>
                <Text size="sm" color="muted">
                  Enable face swapping in galleries
                </Text>
              </Box>
              <Button variant="secondary" size="sm">
                Enabled
              </Button>
            </Flex>
          </Stack>
        </Card>

        {/* Download Settings */}
        <Card>
          <Stack gap="md">
            <Text size="lg" weight="semibold">
              Download Settings
            </Text>
            <Box>
              <Text size="sm" weight="medium" mb="2xs">
                Download Directory
              </Text>
              <Input value="~/Downloads/Galleries" />
            </Box>
            <Box>
              <Text size="sm" weight="medium" mb="2xs">
                Max Concurrent Downloads
              </Text>
              <Input type="number" value="3" />
            </Box>
          </Stack>
        </Card>

        {/* About Section */}
        <Card>
          <Stack gap="md">
            <Text size="lg" weight="semibold">
              About
            </Text>
            <Box>
              <Text size="sm" color="muted">
                Gallery Hub v1.0.0
              </Text>
              <Text size="sm" color="muted">
                Built with SolidJS + Rust + Python
              </Text>
            </Box>
          </Stack>
        </Card>

        <Box style={{ width: 'fit-content' }}>
          <Button>Save Settings</Button>
        </Box>
      </Stack>
    </Box>
  ),
};

// Story 7: Face Swap Panel
export const FaceSwapPanelStory: Story = {
  name: 'Face Swap Panel',
  render: () => <FaceSwapPanel />,
};

// Story 8: Full App with Face Swap Panel
export const AppWithFaceSwap: Story = {
  render: () => (
    <Flex overflow="hidden" style={{ height: '100vh' }}>
      <Sidebar activeRoute="browse" />
      <Flex direction="column" overflow="hidden" style={{ flex: '1' }}>
        <Header title="Browse Galleries" />
        <Box overflow="auto" p="lg" style={{ flex: '1' }}>
          <Stack gap="lg">
            <Box>
              <Text size="2xl" weight="bold" mb="2xs">
                Recent Galleries
              </Text>
              <Text color="muted">Browse and download image galleries</Text>
            </Box>

            <MasonryGrid columns={3} gap="md">
              {GALLERIES.slice(0, 6).map((g, i) => (
                <GalleryCard
                  title={g.title}
                  count={g.count}
                  color={thumbToken(i)}
                  height={g.height}
                />
              ))}
            </MasonryGrid>
          </Stack>
        </Box>
      </Flex>
      <FaceSwapPanel />
    </Flex>
  ),
};
