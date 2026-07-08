/** @jsxImportSource solid-js */
import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal, Show } from 'solid-js';
import { Motion } from './Motion';
import { Presence } from './Presence';

const meta = {
  title: 'Motion/Motion',
  component: Motion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Motion>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Basic: Fade In
// ---------------------------------------------------------------------------

export const FadeIn: Story = {
  render: () => (
    <Motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 600, easing: 'out' }}
      style={{
        padding: 'var(--sk-space-lg)',
        background: 'var(--sk-bg-secondary)',
        'border-radius': 'var(--sk-radius-md)',
      }}
    >
      Fades in on mount
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// Slide Up with spring easing
// ---------------------------------------------------------------------------

export const SlideUp: Story = {
  render: () => (
    <Motion
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 500, easing: 'spring' }}
      style={{
        padding: 'var(--sk-space-lg)',
        background: 'var(--sk-bg-secondary)',
        'border-radius': 'var(--sk-radius-md)',
      }}
    >
      Slides up with spring easing
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// Scale In
// ---------------------------------------------------------------------------

export const ScaleIn: Story = {
  render: () => (
    <Motion
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 300, easing: 'bounce' }}
      style={{
        padding: 'var(--sk-space-lg)',
        background: 'var(--sk-bg-secondary)',
        'border-radius': 'var(--sk-radius-md)',
      }}
    >
      Scales in with bounce
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// Hover Effect
// ---------------------------------------------------------------------------

export const HoverEffect: Story = {
  render: () => (
    <Motion
      animate={{ scale: 1 }}
      hover={{ scale: 1.06 }}
      transition={{ duration: 150, easing: 'out' }}
      style={{
        padding: 'var(--sk-space-lg)',
        background: 'var(--sk-accent)',
        color: 'white',
        'border-radius': 'var(--sk-radius-md)',
        cursor: 'pointer',
        'font-weight': '600',
      }}
    >
      Hover over me
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// Press Effect
// ---------------------------------------------------------------------------

export const PressEffect: Story = {
  render: () => (
    <Motion
      animate={{ scale: 1 }}
      hover={{ scale: 1.04 }}
      press={{ scale: 0.94 }}
      transition={{ duration: 120, easing: 'out' }}
      style={{
        padding: 'var(--sk-space-lg)',
        background: 'var(--sk-accent)',
        color: 'white',
        'border-radius': 'var(--sk-radius-md)',
        cursor: 'pointer',
        'font-weight': '600',
      }}
    >
      Press me
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// Spring Bounce
// ---------------------------------------------------------------------------

export const SpringBounce: Story = {
  render: () => (
    <Motion
      initial={{ opacity: 0, y: -40, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 700, easing: 'bounce' }}
      style={{
        padding: 'var(--sk-space-xl)',
        background: 'var(--sk-bg-secondary)',
        'border-radius': 'var(--sk-radius-lg)',
        'text-align': 'center',
        'font-size': 'var(--sk-font-size-xl)',
      }}
    >
      Bounce!
    </Motion>
  ),
};

// ---------------------------------------------------------------------------
// With Presence — enter/exit toggle
// ---------------------------------------------------------------------------

export const WithPresence: Story = {
  render: () => {
    const [visible, setVisible] = createSignal(true);

    return (
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-md)',
          'align-items': 'center',
        }}
      >
        <button
          onClick={() => setVisible((v) => !v)}
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-md)',
            background: 'var(--sk-accent)',
            color: 'white',
            border: 'none',
            'border-radius': 'var(--sk-radius-md)',
            cursor: 'pointer',
          }}
        >
          {visible() ? 'Hide' : 'Show'}
        </button>

        <div style={{ 'min-height': '80px', display: 'flex', 'align-items': 'center' }}>
          <Presence exitBeforeEnter>
            <Show when={visible()}>
              <Motion
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 250, easing: 'out' }}
                style={{
                  padding: 'var(--sk-space-md) var(--sk-space-lg)',
                  background: 'var(--sk-bg-secondary)',
                  'border-radius': 'var(--sk-radius-md)',
                  border: '1px solid var(--sk-border)',
                }}
              >
                Animated in and out
              </Motion>
            </Show>
          </Presence>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Staggered list (multiple variants)
// ---------------------------------------------------------------------------

export const StaggeredList: Story = {
  render: () => {
    const items = ['First item', 'Second item', 'Third item', 'Fourth item'];

    return (
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: 'var(--sk-space-sm)' }}>
        {items.map((item, i) => (
          <Motion
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 300, easing: 'out', delay: i * 80 }}
            style={{
              padding: 'var(--sk-space-sm) var(--sk-space-md)',
              background: 'var(--sk-bg-secondary)',
              'border-radius': 'var(--sk-radius-sm)',
              border: '1px solid var(--sk-border)',
            }}
          >
            {item}
          </Motion>
        ))}
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Polymorphic rendering via `as` prop
// ---------------------------------------------------------------------------

export const PolymorphicAs: Story = {
  render: () => (
    <Motion
      as="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      hover={{ scale: 1.04 }}
      press={{ scale: 0.96 }}
      transition={{ duration: 200, easing: 'out' }}
      style={{
        padding: 'var(--sk-space-sm) var(--sk-space-md)',
        background: 'var(--sk-accent)',
        color: 'white',
        border: 'none',
        'border-radius': 'var(--sk-radius-md)',
        cursor: 'pointer',
        'font-size': 'var(--sk-font-size-base)',
      }}
    >
      I am a &lt;button&gt;
    </Motion>
  ),
};
