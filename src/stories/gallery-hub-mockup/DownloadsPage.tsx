import { Component, For } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';

const mockDownloads = [
  { id: 1, name: 'beach-sunset-collection.zip', progress: 100, size: '245 MB' },
  { id: 2, name: 'mountain-landscapes.zip', progress: 67, size: '512 MB' },
  { id: 3, name: 'city-photography.zip', progress: 34, size: '189 MB' },
  { id: 4, name: 'nature-wallpapers.zip', progress: 12, size: '421 MB' },
];

export const DownloadsPage: Component = () => {
  return (
    <Box style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <Text
        style={{
          'font-size': '24px',
          'font-weight': 'bold',
          'margin-bottom': '16px',
          color: 'var(--sk-text-primary)',
        }}
      >
        Downloads
      </Text>

      <Stack gap="md">
        <For each={mockDownloads}>
          {(download) => (
            <Box
              style={{
                padding: '16px',
                background: 'var(--sk-bg-secondary)',
                'border-radius': '8px',
                border: '1px solid var(--sk-border)',
              }}
            >
              <Flex style={{ 'justify-content': 'space-between', 'margin-bottom': '12px' }}>
                <Text
                  style={{
                    'font-size': '16px',
                    'font-weight': '500',
                    color: 'var(--sk-text-primary)',
                  }}
                >
                  {download.name}
                </Text>
                <Text
                  style={{
                    'font-size': '14px',
                    color: 'var(--sk-text-secondary)',
                  }}
                >
                  {download.size}
                </Text>
              </Flex>

              <Flex gap="sm" style={{ 'align-items': 'center' }}>
                <Box
                  style={{
                    flex: '1',
                    height: '8px',
                    background: 'var(--sk-bg-tertiary)',
                    'border-radius': '4px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: `${download.progress}%`,
                      height: '100%',
                      background:
                        download.progress === 100 ? 'var(--sk-success)' : 'var(--sk-accent)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Text
                  style={{
                    'font-size': '14px',
                    'font-weight': '500',
                    color: 'var(--sk-text-primary)',
                    'min-width': '45px',
                  }}
                >
                  {download.progress}%
                </Text>
              </Flex>
            </Box>
          )}
        </For>
      </Stack>
    </Box>
  );
};
