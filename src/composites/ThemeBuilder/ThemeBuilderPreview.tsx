import type { JSX } from 'solid-js';
import type { ThemeConfig } from '../../theme/types';
import { ThemeProvider } from '../../theme';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { Card } from '../../primitives/Card';
import { Input } from '../../primitives/Input';
import { Badge } from '../../primitives/Badge';

export interface ThemeBuilderPreviewProps {
  readonly theme: ThemeConfig;
}

export function ThemeBuilderPreview(props: ThemeBuilderPreviewProps): JSX.Element {
  return (
    <Box class="sk-theme-builder__preview">
      <ThemeProvider theme={props.theme}>
        <Stack gap="lg">
          <Text
            size="sm"
            weight="semibold"
            style={{ 'margin-bottom': 'var(--sk-spacing-sm, 8px)' }}
          >
            Preview
          </Text>

          {/* Buttons */}
          <Box>
            <Text
              size="xs"
              style={{
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-spacing-sm, 8px)',
              }}
            >
              BUTTONS
            </Text>
            <Flex gap="sm" wrap="wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </Flex>
          </Box>

          {/* Card */}
          <Box>
            <Text
              size="xs"
              style={{
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-spacing-sm, 8px)',
              }}
            >
              CARD
            </Text>
            <Card>
              <Stack gap="sm">
                <Text size="lg" weight="semibold">
                  Card Title
                </Text>
                <Text size="sm" style={{ color: 'var(--sk-text-secondary)' }}>
                  This is a preview card with some content to show how the theme looks.
                </Text>
              </Stack>
            </Card>
          </Box>

          {/* Inputs */}
          <Box>
            <Text
              size="xs"
              style={{
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-spacing-sm, 8px)',
              }}
            >
              INPUTS
            </Text>
            <Stack gap="sm">
              <Input placeholder="Text input" />
              <Input placeholder="Disabled input" disabled />
            </Stack>
          </Box>

          {/* Badges */}
          <Box>
            <Text
              size="xs"
              style={{
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-spacing-sm, 8px)',
              }}
            >
              BADGES
            </Text>
            <Flex gap="sm" wrap="wrap">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </Flex>
          </Box>

          {/* Typography */}
          <Box>
            <Text
              size="xs"
              style={{
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-spacing-sm, 8px)',
              }}
            >
              TYPOGRAPHY
            </Text>
            <Stack gap="sm">
              <Text size="2xl" weight="bold">
                Heading 1
              </Text>
              <Text size="xl" weight="semibold">
                Heading 2
              </Text>
              <Text size="base">Body text - Regular weight</Text>
              <Text size="sm" style={{ color: 'var(--sk-text-secondary)' }}>
                Secondary text
              </Text>
              <Text size="sm" style={{ color: 'var(--sk-text-muted)' }}>
                Muted text
              </Text>
            </Stack>
          </Box>
        </Stack>
      </ThemeProvider>
    </Box>
  );
}
