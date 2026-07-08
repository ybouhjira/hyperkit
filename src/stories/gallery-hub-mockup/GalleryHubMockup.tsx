import { Component, createSignal, Show, createEffect } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { BrowsePage } from './BrowsePage';
import { DownloadsPage } from './DownloadsPage';
import { SearchPage } from './SearchPage';
import { SettingsPage } from './SettingsPage';
import { FaceSwapPage } from './FaceSwapPage';

type Page = 'browse' | 'faceswap' | 'downloads' | 'search' | 'settings';

const pageLabels: Record<string, string> = {
  browse: 'Browse',
  faceswap: 'Face Swap',
  downloads: 'Downloads',
  search: 'Search',
  settings: 'Settings',
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: Component<NavItemProps> = (props) => {
  return (
    <Box
      onClick={props.onClick}
      style={{
        padding: '12px 16px',
        'border-radius': '8px',
        background: props.active ? 'var(--sk-accent)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <Flex gap="sm" style={{ 'align-items': 'center' }}>
        <Text
          style={{
            'font-size': '20px',
            opacity: props.active ? '1' : '0.7',
          }}
        >
          {props.icon}
        </Text>
        <Text
          style={{
            'font-size': '14px',
            'font-weight': props.active ? '600' : '400',
            color: props.active ? 'white' : 'var(--sk-text-primary)',
          }}
        >
          {props.label}
        </Text>
      </Flex>
    </Box>
  );
};

export interface GalleryHubMockupProps {
  initialPage?: Page;
}

export const GalleryHubMockup: Component<GalleryHubMockupProps> = (props) => {
  const [activePage, setActivePage] = createSignal<Page>(props.initialPage || 'browse');

  createEffect(() => {
    if (props.initialPage) setActivePage(props.initialPage);
  });

  return (
    <Flex style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Stack
        gap="sm"
        style={{
          width: '220px',
          background: 'var(--sk-bg-primary)',
          'border-right': '1px solid var(--sk-border)',
          padding: '16px',
          'flex-shrink': '0',
        }}
      >
        {/* App Title */}
        <Box style={{ 'margin-bottom': '24px', padding: '8px' }}>
          <Text
            style={{
              'font-size': '20px',
              'font-weight': 'bold',
              color: 'var(--sk-text-primary)',
            }}
          >
            Gallery Hub
          </Text>
        </Box>

        {/* Navigation Items */}
        <NavItem
          icon="🖼️"
          label="Browse"
          active={activePage() === 'browse'}
          onClick={() => setActivePage('browse')}
        />
        <NavItem
          icon="🎭"
          label="Face Swap"
          active={activePage() === 'faceswap'}
          onClick={() => setActivePage('faceswap')}
        />
        <NavItem
          icon="⬇️"
          label="Downloads"
          active={activePage() === 'downloads'}
          onClick={() => setActivePage('downloads')}
        />
        <NavItem
          icon="🔍"
          label="Search"
          active={activePage() === 'search'}
          onClick={() => setActivePage('search')}
        />

        {/* Spacer */}
        <Box style={{ flex: '1' }} />

        <NavItem
          icon="⚙️"
          label="Settings"
          active={activePage() === 'settings'}
          onClick={() => setActivePage('settings')}
        />
      </Stack>

      {/* Main Content */}
      <Flex
        style={{
          flex: '1',
          'flex-direction': 'column',
          background: 'var(--sk-bg-primary)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px 24px',
            'border-bottom': '1px solid var(--sk-border)',
            'flex-shrink': '0',
          }}
        >
          <Text
            style={{
              'font-size': '16px',
              'font-weight': '500',
              color: 'var(--sk-text-secondary)',
            }}
          >
            {pageLabels[activePage()] ?? activePage()}
          </Text>
        </Box>

        {/* Content Area */}
        <Box style={{ flex: '1', overflow: 'auto' }}>
          <Show when={activePage() === 'browse'}>
            <BrowsePage />
          </Show>
          <Show when={activePage() === 'faceswap'}>
            <FaceSwapPage />
          </Show>
          <Show when={activePage() === 'downloads'}>
            <DownloadsPage />
          </Show>
          <Show when={activePage() === 'search'}>
            <SearchPage />
          </Show>
          <Show when={activePage() === 'settings'}>
            <SettingsPage />
          </Show>
        </Box>
      </Flex>
    </Flex>
  );
};
