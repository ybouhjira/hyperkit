import { Component, For } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Grid } from '../../primitives/Grid';

const mockFaces = [
  { id: 1, label: 'Face A' },
  { id: 2, label: 'Face B' },
  { id: 3, label: 'Face C' },
  { id: 4, label: 'Face D' },
];

const mockResults = [
  { id: 1, status: 'completed' },
  { id: 2, status: 'processing' },
  { id: 3, status: 'queued' },
];

export const FaceSwapPage: Component = () => {
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
        Face Swap
      </Text>

      <Flex gap="lg" style={{ height: 'calc(100% - 60px)' }}>
        {/* Left Panel - Faces */}
        <Stack gap="md" style={{ flex: '1', 'min-width': '0' }}>
          <Text
            style={{
              'font-size': '16px',
              'font-weight': '600',
              color: 'var(--sk-text-primary)',
            }}
          >
            Detected Faces
          </Text>

          <Grid columns={2} gap="sm">
            <For each={mockFaces}>
              {(face) => (
                <Stack gap="sm">
                  <Box
                    style={{
                      width: '100%',
                      'aspect-ratio': '1',
                      background:
                        'linear-gradient(135deg, var(--sk-accent), var(--sk-accent-hover))',
                      'border-radius': '8px',
                      border: '2px solid var(--sk-border)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  <Text
                    style={{
                      'font-size': '14px',
                      color: 'var(--sk-text-primary)',
                      'text-align': 'center',
                    }}
                  >
                    {face.label}
                  </Text>
                </Stack>
              )}
            </For>
          </Grid>

          <Box
            style={{
              padding: '16px',
              background: 'var(--sk-bg-secondary)',
              'border-radius': '8px',
              border: '2px dashed var(--sk-border)',
              'text-align': 'center',
              cursor: 'pointer',
              'margin-top': '8px',
            }}
          >
            <Text
              style={{
                'font-size': '14px',
                color: 'var(--sk-text-secondary)',
              }}
            >
              + Upload Face
            </Text>
          </Box>
        </Stack>

        {/* Right Panel - Results */}
        <Stack gap="md" style={{ flex: '1', 'min-width': '0' }}>
          <Flex style={{ 'justify-content': 'space-between', 'align-items': 'center' }}>
            <Text
              style={{
                'font-size': '16px',
                'font-weight': '600',
                color: 'var(--sk-text-primary)',
              }}
            >
              Results
            </Text>
            <Box
              style={{
                padding: '8px 16px',
                background: 'var(--sk-accent)',
                'border-radius': '6px',
                cursor: 'pointer',
              }}
            >
              <Text style={{ 'font-size': '14px', color: 'white', 'font-weight': '500' }}>
                Process
              </Text>
            </Box>
          </Flex>

          <Stack gap="sm">
            <For each={mockResults}>
              {(result) => (
                <Box
                  style={{
                    padding: '12px',
                    background: 'var(--sk-bg-secondary)',
                    'border-radius': '8px',
                    border: '1px solid var(--sk-border)',
                  }}
                >
                  <Flex gap="sm" style={{ 'align-items': 'center' }}>
                    <Box
                      style={{
                        width: '80px',
                        height: '80px',
                        background:
                          result.status === 'completed'
                            ? 'linear-gradient(135deg, var(--sk-success), var(--sk-accent-hover))'
                            : 'var(--sk-bg-tertiary)',
                        'border-radius': '6px',
                        opacity: result.status === 'completed' ? '1' : '0.5',
                      }}
                    />
                    <Stack gap="xs" style={{ flex: '1' }}>
                      <Text
                        style={{
                          'font-size': '14px',
                          'font-weight': '500',
                          color: 'var(--sk-text-primary)',
                        }}
                      >
                        Result {result.id}
                      </Text>
                      <Text
                        style={{
                          'font-size': '12px',
                          color:
                            result.status === 'completed'
                              ? 'var(--sk-success)'
                              : result.status === 'processing'
                                ? 'var(--sk-warning)'
                                : 'var(--sk-text-secondary)',
                        }}
                      >
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Text>
                    </Stack>
                  </Flex>
                </Box>
              )}
            </For>
          </Stack>
        </Stack>
      </Flex>
    </Box>
  );
};
