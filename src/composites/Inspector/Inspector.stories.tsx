import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { Inspector, InspectorProvider } from './Inspector';
import type { Annotation, InspectorStorage } from './types';

const meta: Meta<typeof Inspector> = {
  title: 'Composites/Inspector',
  component: Inspector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Inspector>;

/** In-memory storage so the inspector is interactive without a backend. */
function demoStorage(): InspectorStorage {
  let annotations: Annotation[] = [
    {
      id: 'a1',
      selector: '.story-demo h3',
      elementInfo: {
        tagName: 'h3',
        classes: [],
        textPreview: 'Inspectable surface',
        boundingRect: { x: 16, y: 16, width: 220, height: 24 },
      },
      status: 'open',
      createdAt: new Date().toISOString(),
      thread: [
        {
          id: 't1',
          author: 'user',
          text: 'Heading feels too small here.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];
  return {
    getAll: () => Promise.resolve([...annotations]),
    create: (data) => {
      const a: Annotation = {
        id: `a${annotations.length + 1}`,
        selector: data.selector,
        elementInfo: data.elementInfo,
        status: 'open',
        createdAt: new Date().toISOString(),
        // The note becomes the thread's first message — same contract as the
        // reference adapter; dropping it made submitted comments vanish.
        thread: [
          { id: 't1', author: 'user', text: data.note, timestamp: new Date().toISOString() },
        ],
      };
      annotations = [...annotations, a];
      return Promise.resolve(a);
    },
    update: (id, patch) => {
      annotations = annotations.map((a) => (a.id === id ? { ...a, ...patch } : a));
      const found = annotations.find((a) => a.id === id);
      if (found === undefined) return Promise.reject(new Error('not found'));
      return Promise.resolve(found);
    },
    delete: (id) => {
      annotations = annotations.filter((a) => a.id !== id);
      return Promise.resolve();
    },
    reply: (id, text, author) => {
      annotations = annotations.map((a) =>
        a.id === id
          ? {
              ...a,
              thread: [
                ...a.thread,
                {
                  id: `t${a.thread.length + 1}`,
                  author: author === 'claude' ? ('claude' as const) : ('user' as const),
                  text,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : a
      );
      const found = annotations.find((a) => a.id === id);
      if (found === undefined) return Promise.reject(new Error('not found'));
      return Promise.resolve(found);
    },
  };
}

/**
 * Click-capture component — an ACTIVE inspector intercepts every click on the
 * page (that's its job), so the demo starts inactive behind a toggle.
 */
export const ClickToActivate: Story = {
  render: () => {
    const [active, setActive] = createSignal(false);
    return (
      <InspectorProvider storage={demoStorage()}>
        <Box class="story-demo" p="md" minH="220px">
          <Stack gap="sm" align="start">
            <Text as="h3" size="lg" weight="semibold">
              Inspectable surface
            </Text>
            <Text as="p" color="secondary">
              The inspector panel reviews annotations against this content.
            </Text>
            <Button onClick={() => setActive(true)}>Start inspecting</Button>
          </Stack>
        </Box>
        <Inspector active={active()} onClose={() => setActive(false)} />
      </InspectorProvider>
    );
  },
};
