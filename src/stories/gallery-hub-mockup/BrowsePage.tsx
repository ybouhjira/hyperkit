import { Component, For } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const mockImages = [
  { id: 1, title: 'Sunset Beach', height: 240 },
  { id: 2, title: 'Mountain View', height: 320 },
  { id: 3, title: 'City Lights', height: 280 },
  { id: 4, title: 'Forest Path', height: 200 },
  { id: 5, title: 'Ocean Waves', height: 300 },
  { id: 6, title: 'Desert Landscape', height: 260 },
  { id: 7, title: 'Northern Lights', height: 340 },
  { id: 8, title: 'Garden Flowers', height: 220 },
  { id: 9, title: 'City Skyline', height: 280 },
  { id: 10, title: 'Lake Reflection', height: 300 },
  { id: 11, title: 'Autumn Forest', height: 240 },
  { id: 12, title: 'Snowy Mountains', height: 320 },
];

export const BrowsePage: Component = () => {
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
        Browse Gallery
      </Text>

      <Box
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        <For each={mockImages}>
          {(image) => (
            <Stack gap="sm">
              <Box
                style={{
                  width: '100%',
                  height: `${image.height}px`,
                  background: `linear-gradient(135deg, var(--sk-accent), var(--sk-accent-hover))`,
                  'border-radius': '8px',
                  opacity: '0.8',
                }}
              />
              <Text
                style={{
                  'font-size': '14px',
                  color: 'var(--sk-text-primary)',
                }}
              >
                {image.title}
              </Text>
            </Stack>
          )}
        </For>
      </Box>
    </Box>
  );
};
