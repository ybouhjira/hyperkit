import type { Meta, StoryObj } from 'storybook-solidjs';
import { AnimateOnScroll } from './AnimateOnScroll';
import { Card } from '../../primitives/Card/Card';
import { Text } from '../../primitives/Text/Text';
import { Box } from '../../primitives/Box/Box';

const meta = {
  title: 'Animation/AnimateOnScroll',
  component: AnimateOnScroll,
  tags: ['autodocs'],
  argTypes: {
    animation: {
      control: 'select',
      options: ['fadeIn', 'fadeUp', 'fadeDown', 'slideLeft', 'slideRight', 'scale'],
      description: 'Animation preset to use',
    },
    threshold: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'IntersectionObserver threshold (0-1)',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Animation delay in milliseconds',
    },
    duration: {
      control: { type: 'number', min: 100, max: 2000, step: 100 },
      description: 'Animation duration in milliseconds',
    },
    once: {
      control: 'boolean',
      description: "Only animate once (don't re-animate on scroll back)",
    },
  },
} satisfies Meta<typeof AnimateOnScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeIn: Story = {
  args: {
    animation: 'fadeIn',
  },
  render: (args) => (
    <div style={{ height: '150vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '100vh' }}>
        Scroll down to see the animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Fade In Animation
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content fades in when it enters the viewport.
          </Text>
        </Card>
      </AnimateOnScroll>
    </div>
  ),
};

export const FadeUp: Story = {
  args: {
    animation: 'fadeUp',
  },
  render: (args) => (
    <div style={{ height: '150vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '100vh' }}>
        Scroll down to see the animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Fade Up Animation
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content fades in and slides up when it enters the viewport.
          </Text>
        </Card>
      </AnimateOnScroll>
    </div>
  ),
};

export const SlideLeft: Story = {
  args: {
    animation: 'slideLeft',
  },
  render: (args) => (
    <div style={{ height: '150vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '100vh' }}>
        Scroll down to see the animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Slide Left Animation
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content slides in from the left when it enters the viewport.
          </Text>
        </Card>
      </AnimateOnScroll>
    </div>
  ),
};

export const Scale: Story = {
  args: {
    animation: 'scale',
  },
  render: (args) => (
    <div style={{ height: '150vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '100vh' }}>
        Scroll down to see the animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Scale Animation
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content scales up when it enters the viewport.
          </Text>
        </Card>
      </AnimateOnScroll>
    </div>
  ),
};

export const WithDelay: Story = {
  args: {
    animation: 'fadeUp',
    delay: 500,
  },
  render: (args) => (
    <div style={{ height: '150vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '100vh' }}>
        Scroll down to see the delayed animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Delayed Animation (500ms)
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content has a 500ms delay before animating.
          </Text>
        </Card>
      </AnimateOnScroll>
    </div>
  ),
};

export const Repeating: Story = {
  args: {
    animation: 'fadeUp',
    once: false,
  },
  render: (args) => (
    <div style={{ height: '200vh', padding: '2rem' }}>
      <Text size="lg" weight="bold" style={{ 'margin-bottom': '50vh' }}>
        Scroll down and back up to see the repeating animation
      </Text>

      <AnimateOnScroll {...args}>
        <Card padding="xl">
          <Text size="lg" weight="bold">
            Repeating Animation
          </Text>
          <Text style={{ 'margin-top': '0.5rem' }}>
            This content animates every time it enters the viewport.
          </Text>
        </Card>
      </AnimateOnScroll>

      <div style={{ height: '50vh' }} />
    </div>
  ),
};

export const AllAnimations: Story = {
  render: () => (
    <div style={{ height: '400vh', padding: '2rem' }}>
      <Text size="xl" weight="bold" style={{ 'margin-bottom': '2rem' }}>
        Scroll down to see all animation types
      </Text>

      <Box style={{ 'margin-bottom': '100vh' }}>
        <AnimateOnScroll animation="fadeIn">
          <Card padding="xl" style={{ 'margin-bottom': '2rem' }}>
            <Text size="lg" weight="bold">
              Fade In
            </Text>
            <Text>Simple opacity transition</Text>
          </Card>
        </AnimateOnScroll>
      </Box>

      <Box style={{ 'margin-bottom': '100vh' }}>
        <AnimateOnScroll animation="fadeUp" delay={100}>
          <Card padding="xl" style={{ 'margin-bottom': '2rem' }}>
            <Text size="lg" weight="bold">
              Fade Up
            </Text>
            <Text>Fades in while sliding up</Text>
          </Card>
        </AnimateOnScroll>
      </Box>

      <Box style={{ 'margin-bottom': '100vh' }}>
        <AnimateOnScroll animation="fadeDown" delay={200}>
          <Card padding="xl" style={{ 'margin-bottom': '2rem' }}>
            <Text size="lg" weight="bold">
              Fade Down
            </Text>
            <Text>Fades in while sliding down</Text>
          </Card>
        </AnimateOnScroll>
      </Box>

      <Box style={{ 'margin-bottom': '100vh' }}>
        <AnimateOnScroll animation="slideLeft" delay={300}>
          <Card padding="xl" style={{ 'margin-bottom': '2rem' }}>
            <Text size="lg" weight="bold">
              Slide Left
            </Text>
            <Text>Slides in from the left</Text>
          </Card>
        </AnimateOnScroll>
      </Box>

      <Box style={{ 'margin-bottom': '100vh' }}>
        <AnimateOnScroll animation="slideRight" delay={400}>
          <Card padding="xl" style={{ 'margin-bottom': '2rem' }}>
            <Text size="lg" weight="bold">
              Slide Right
            </Text>
            <Text>Slides in from the right</Text>
          </Card>
        </AnimateOnScroll>
      </Box>

      <Box>
        <AnimateOnScroll animation="scale" delay={500}>
          <Card padding="xl">
            <Text size="lg" weight="bold">
              Scale
            </Text>
            <Text>Scales up from 90% to 100%</Text>
          </Card>
        </AnimateOnScroll>
      </Box>
    </div>
  ),
};
