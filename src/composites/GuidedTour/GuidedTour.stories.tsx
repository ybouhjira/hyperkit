import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { TourProvider, useTour } from './TourProvider';
import type { TourDefinition } from './types';

const meta = {
  title: 'Composites/GuidedTour',
  component: TourProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof TourProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const InnerDemo = () => {
      const tour = useTour();

      const sampleTour: TourDefinition = {
        id: 'demo-tour',
        name: 'Welcome Tour',
        steps: [
          {
            id: 'step-1',
            title: 'Welcome',
            description: 'This is the first step of the tour.',
            target: '#demo-header',
          },
          {
            id: 'step-2',
            title: 'Content Area',
            description: 'Here is where the main content lives.',
            target: '#demo-content',
          },
          {
            id: 'step-3',
            title: 'Actions',
            description: 'Click buttons here to interact.',
            target: '#demo-actions',
          },
        ],
      };

      return (
        <Box p="xl">
          <Text as="h2" id="demo-header" size="xl" weight="semibold">
            Welcome to the App
          </Text>
          <Box
            id="demo-content"
            p="xl"
            my="md"
            borderRadius="md"
            style={{ border: '1px solid var(--sk-border)' }}
          >
            <Text as="p">This is the main content area of the application.</Text>
          </Box>
          <Flex id="demo-actions" gap="sm">
            <Button onClick={() => tour.start(sampleTour)}>Start Tour</Button>
            <Button variant="ghost" onClick={() => tour.cancel()}>
              Cancel Tour
            </Button>
          </Flex>
          <Text as="p" mt="md" color="muted">
            Tour Status: {tour.status()} | Progress: {Math.round(tour.progress())}%
          </Text>
        </Box>
      );
    };

    return (
      <TourProvider>
        <InnerDemo />
      </TourProvider>
    );
  },
};

export const TaskBased: Story = {
  render: () => {
    const InnerDemo = () => {
      const tour = useTour();
      let inputRef: HTMLInputElement | undefined;

      const taskTour: TourDefinition = {
        id: 'task-tour',
        name: 'Task Tutorial',
        type: 'task-based',
        steps: [
          {
            id: 'type-name',
            title: 'Enter Your Name',
            description: 'Type your name in the input field below.',
            target: '#name-input',
            validation: {
              description: 'Name field is filled',
              check: () => (inputRef?.value?.length ?? 0) > 0,
              interval: 300,
            },
          },
          {
            id: 'done',
            title: 'All Done!',
            description: 'You completed the task-based tour.',
          },
        ],
      };

      return (
        <Box p="xl">
          <Text as="h2" size="xl" weight="semibold">
            Task-Based Tour
          </Text>
          <Stack my="md" gap="sm" align="start">
            <label for="name-input">
              <Text>Your Name:</Text>
            </label>
            <input ref={inputRef} id="name-input" type="text" placeholder="Type here..." />
          </Stack>
          <Button onClick={() => tour.start(taskTour)}>Start Task Tour</Button>
          <Text as="p" mt="md" color="muted">
            Status: {tour.status()} | Step: {tour.currentStepIndex() + 1}/{tour.totalSteps()}
          </Text>
        </Box>
      );
    };

    return (
      <TourProvider>
        <InnerDemo />
      </TourProvider>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const InnerDemo = () => {
      const tour = useTour();
      let inputRef: HTMLInputElement | undefined;

      const sampleTour: TourDefinition = {
        id: 'demo-tour',
        name: 'Welcome Tour',
        steps: [
          {
            id: 'step-1',
            title: 'Welcome',
            description: 'This is the first step of the tour.',
            target: '#all-demo-header',
          },
          {
            id: 'step-2',
            title: 'Content Area',
            description: 'Here is where the main content lives.',
            target: '#all-demo-content',
          },
          {
            id: 'step-3',
            title: 'Actions',
            description: 'Click buttons here to interact.',
            target: '#all-demo-actions',
          },
        ],
      };

      const taskTour: TourDefinition = {
        id: 'task-tour',
        name: 'Task Tutorial',
        type: 'task-based',
        steps: [
          {
            id: 'type-name',
            title: 'Enter Your Name',
            description: 'Type your name in the input field below.',
            target: '#all-name-input',
            validation: {
              description: 'Name field is filled',
              check: () => (inputRef?.value?.length ?? 0) > 0,
              interval: 300,
            },
          },
          {
            id: 'done',
            title: 'All Done!',
            description: 'You completed the task-based tour.',
          },
        ],
      };

      return (
        <Stack gap="2xl">
          {/* Default Walkthrough */}
          <Box p="xl" borderRadius="md" style={{ border: '2px dashed var(--sk-border)' }}>
            <Text as="h2" id="all-demo-header" size="xl" weight="semibold">
              Walkthrough Tour Demo
            </Text>
            <Box
              id="all-demo-content"
              p="xl"
              my="md"
              borderRadius="md"
              style={{ border: '1px solid var(--sk-border)' }}
            >
              <Text as="p">This is the main content area of the application.</Text>
            </Box>
            <Flex id="all-demo-actions" gap="sm">
              <Button onClick={() => tour.start(sampleTour)}>Start Tour</Button>
              <Button variant="ghost" onClick={() => tour.cancel()}>
                Cancel Tour
              </Button>
            </Flex>
            <Text as="p" mt="md" color="muted">
              Tour Status: {tour.status()} | Progress: {Math.round(tour.progress())}%
            </Text>
          </Box>

          {/* Task-Based Tour */}
          <Box p="xl" borderRadius="md" style={{ border: '2px dashed var(--sk-border)' }}>
            <Text as="h2" size="xl" weight="semibold">
              Task-Based Tour Demo
            </Text>
            <Stack my="md" gap="sm" align="start">
              <label for="all-name-input">
                <Text>Your Name:</Text>
              </label>
              <input ref={inputRef} id="all-name-input" type="text" placeholder="Type here..." />
            </Stack>
            <Button onClick={() => tour.start(taskTour)}>Start Task Tour</Button>
            <Text as="p" mt="md" color="muted">
              Status: {tour.status()} | Step: {tour.currentStepIndex() + 1}/{tour.totalSteps()}
            </Text>
          </Box>
        </Stack>
      );
    };

    return (
      <TourProvider>
        <InnerDemo />
      </TourProvider>
    );
  },
};
