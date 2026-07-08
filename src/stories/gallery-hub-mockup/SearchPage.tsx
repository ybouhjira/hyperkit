import { Component, For } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';

const mockResults = [
  { id: 1, title: 'Beach Sunset', matches: 12 },
  { id: 2, title: 'Mountain Peak', matches: 8 },
  { id: 3, title: 'City Night', matches: 15 },
  { id: 4, title: 'Forest Trail', matches: 6 },
  { id: 5, title: 'Ocean View', matches: 10 },
];

export const SearchPage: Component = () => {
  return (
    <Box style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <Text
        style={{
          'font-size': '24px',
          'font-weight': 'bold',
          'margin-bottom': '24px',
          color: 'var(--sk-text-primary)',
        }}
      >
        Search
      </Text>

      <Stack gap="lg">
        <Box
          style={{
            width: '100%',
            'max-width': '600px',
          }}
        >
          <input
            type="text"
            placeholder="Search images..."
            style={{
              width: '100%',
              padding: '12px 16px',
              'font-size': '16px',
              background: 'var(--sk-bg-secondary)',
              border: '1px solid var(--sk-border)',
              'border-radius': '8px',
              color: 'var(--sk-text-primary)',
              outline: 'none',
            }}
          />
        </Box>

        <Stack gap="sm">
          <Text
            style={{
              'font-size': '14px',
              'font-weight': '500',
              color: 'var(--sk-text-secondary)',
              'text-transform': 'uppercase',
              'letter-spacing': '0.5px',
            }}
          >
            Results
          </Text>

          <Stack gap="sm">
            <For each={mockResults}>
              {(result) => (
                <Flex
                  style={{
                    padding: '16px',
                    background: 'var(--sk-bg-secondary)',
                    'border-radius': '8px',
                    border: '1px solid var(--sk-border)',
                    'justify-content': 'space-between',
                    'align-items': 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Flex gap="sm" style={{ 'align-items': 'center' }}>
                    <Box
                      style={{
                        width: '60px',
                        height: '60px',
                        background:
                          'linear-gradient(135deg, var(--sk-accent), var(--sk-accent-hover))',
                        'border-radius': '6px',
                        opacity: '0.8',
                      }}
                    />
                    <Text
                      style={{
                        'font-size': '16px',
                        color: 'var(--sk-text-primary)',
                      }}
                    >
                      {result.title}
                    </Text>
                  </Flex>
                  <Text
                    style={{
                      'font-size': '14px',
                      color: 'var(--sk-text-secondary)',
                    }}
                  >
                    {result.matches} matches
                  </Text>
                </Flex>
              )}
            </For>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
