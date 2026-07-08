import { Component } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';

export const SettingsPage: Component = () => {
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
        Settings
      </Text>

      <Stack gap="xl" style={{ 'max-width': '600px' }}>
        {/* General Section */}
        <Stack gap="md">
          <Text
            style={{
              'font-size': '18px',
              'font-weight': '600',
              color: 'var(--sk-text-primary)',
            }}
          >
            General
          </Text>

          <Stack gap="sm">
            <Box>
              <Text
                style={{
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--sk-text-primary)',
                  'margin-bottom': '8px',
                  display: 'block',
                }}
              >
                Storage Location
              </Text>
              <input
                type="text"
                value="/Users/username/Pictures/GalleryHub"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  'font-size': '14px',
                  background: 'var(--sk-bg-secondary)',
                  border: '1px solid var(--sk-border)',
                  'border-radius': '6px',
                  color: 'var(--sk-text-primary)',
                  outline: 'none',
                }}
              />
            </Box>

            <Flex style={{ 'justify-content': 'space-between', 'align-items': 'center' }}>
              <Stack gap="xs">
                <Text
                  style={{
                    'font-size': '14px',
                    'font-weight': '500',
                    color: 'var(--sk-text-primary)',
                  }}
                >
                  Auto-organize imports
                </Text>
                <Text
                  style={{
                    'font-size': '12px',
                    color: 'var(--sk-text-secondary)',
                  }}
                >
                  Automatically sort images by date
                </Text>
              </Stack>
              <Box
                style={{
                  width: '44px',
                  height: '24px',
                  background: 'var(--sk-accent)',
                  'border-radius': '12px',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Box
                  style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    'border-radius': '50%',
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    transition: 'all 0.2s',
                  }}
                />
              </Box>
            </Flex>
          </Stack>
        </Stack>

        {/* Display Section */}
        <Stack gap="md">
          <Text
            style={{
              'font-size': '18px',
              'font-weight': '600',
              color: 'var(--sk-text-primary)',
            }}
          >
            Display
          </Text>

          <Stack gap="sm">
            <Box>
              <Text
                style={{
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--sk-text-primary)',
                  'margin-bottom': '8px',
                  display: 'block',
                }}
              >
                Theme
              </Text>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  'font-size': '14px',
                  background: 'var(--sk-bg-secondary)',
                  border: '1px solid var(--sk-border)',
                  'border-radius': '6px',
                  color: 'var(--sk-text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </Box>

            <Box>
              <Text
                style={{
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--sk-text-primary)',
                  'margin-bottom': '8px',
                  display: 'block',
                }}
              >
                Grid Size
              </Text>
              <Flex gap="sm">
                <Box
                  style={{
                    padding: '8px 16px',
                    background: 'var(--sk-accent)',
                    'border-radius': '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ 'font-size': '14px', color: 'white' }}>Small</Text>
                </Box>
                <Box
                  style={{
                    padding: '8px 16px',
                    background: 'var(--sk-bg-secondary)',
                    border: '1px solid var(--sk-border)',
                    'border-radius': '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ 'font-size': '14px', color: 'var(--sk-text-primary)' }}>
                    Medium
                  </Text>
                </Box>
                <Box
                  style={{
                    padding: '8px 16px',
                    background: 'var(--sk-bg-secondary)',
                    border: '1px solid var(--sk-border)',
                    'border-radius': '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ 'font-size': '14px', color: 'var(--sk-text-primary)' }}>
                    Large
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
