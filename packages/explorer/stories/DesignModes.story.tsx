import { Component, For, createSignal } from 'solid-js'
import { defineStory, control } from '../src/api'
import {
  Button,
  Input,
  Card,
  Badge,
  Tabs,
  Separator,
  Switch,
  ProgressBar,
  Text,
  Stack,
  Flex,
} from '@ybouhjira/hyperkit'

// ─── Types ──────────────────────────────────────────────────────────────────

type DesignMode = 'glass' | 'ink' | 'native' | 'command'

// ─── Mode Metadata ──────────────────────────────────────────────────────────

const MODE_META: Record<
  DesignMode,
  { label: string; description: string; accent: string; bg: string }
> = {
  glass: {
    label: 'Glass',
    description: 'Frosted surfaces · depth · blur',
    accent: '#7c6aff',
    bg: 'rgba(20, 18, 38, 0.98)',
  },
  ink: {
    label: 'Ink',
    description: 'Clean · typographic · Notion/Linear',
    accent: '#4f9cf9',
    bg: 'rgba(10, 12, 18, 0.98)',
  },
  native: {
    label: 'Native',
    description: 'Familiar · comfortable · system-like',
    accent: '#3b82f6',
    bg: 'rgba(15, 17, 24, 0.98)',
  },
  command: {
    label: 'Command',
    description: 'Terminal · dense · keyboard-driven',
    accent: '#22c55e',
    bg: 'rgba(8, 10, 10, 0.98)',
  },
}

const MODES: DesignMode[] = ['glass', 'ink', 'native', 'command']

// ─── Tab items ──────────────────────────────────────────────────────────────

const DEMO_TABS = [
  { value: 'overview', label: 'Overview', content: <span /> },
  { value: 'settings', label: 'Settings', content: <span /> },
  { value: 'data', label: 'Data', content: <span /> },
]

// ─── Component Showcase ─────────────────────────────────────────────────────

const ComponentShowcase: Component<{ mode: DesignMode; fullWidth?: boolean }> = (props) => {
  const [switchOn, setSwitchOn] = createSignal(true)
  const [inputVal, setInputVal] = createSignal('')
  const meta = () => MODE_META[props.mode]

  return (
    <div
      data-sk-mode={props.mode}
      style={{
        padding: 'var(--sk-space-lg)',
        'border-radius': 'var(--sk-radius-lg)',
        background: meta().bg,
        'min-height': props.fullWidth ? '560px' : '500px',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        'flex-direction': 'column',
        gap: 'var(--sk-space-md)',
      }}
    >
      {/* Mode header */}
      <div
        style={{
          display: 'flex',
          'align-items': 'baseline',
          gap: 'var(--sk-space-sm)',
          'padding-bottom': 'var(--sk-space-sm)',
          'border-bottom': '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Text
          as="h2"
          size="lg"
          weight="semibold"
          style={{ color: meta().accent, margin: '0' }}
        >
          {meta().label}
        </Text>
        <Text size="sm" color="secondary" style={{ margin: '0' }}>
          {meta().description}
        </Text>
      </div>

      <Stack gap="md">
        {/* Buttons */}
        <Stack gap="xs">
          <Text size="xs" color="secondary" weight="semibold" style={{ 'text-transform': 'uppercase', 'letter-spacing': '0.08em' }}>
            Buttons
          </Text>
          <Flex gap="xs" align="center" style={{ 'flex-wrap': 'wrap' }}>
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="danger" size="sm">Danger</Button>
          </Flex>
        </Stack>

        {/* Input */}
        <Stack gap="xs">
          <Text size="xs" color="secondary" weight="semibold" style={{ 'text-transform': 'uppercase', 'letter-spacing': '0.08em' }}>
            Input
          </Text>
          <Input
            placeholder="Type something..."
            value={inputVal()}
            onInput={setInputVal}
          />
        </Stack>

        {/* Badges */}
        <Stack gap="xs">
          <Text size="xs" color="secondary" weight="semibold" style={{ 'text-transform': 'uppercase', 'letter-spacing': '0.08em' }}>
            Badges
          </Text>
          <Flex gap="xs" align="center" style={{ 'flex-wrap': 'wrap' }}>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="default">Default</Badge>
          </Flex>
        </Stack>

        {/* Tabs */}
        <Stack gap="xs">
          <Text size="xs" color="secondary" weight="semibold" style={{ 'text-transform': 'uppercase', 'letter-spacing': '0.08em' }}>
            Tabs
          </Text>
          <Tabs
            items={DEMO_TABS}
            value="overview"
          />
        </Stack>

        <Separator />

        {/* Card */}
        <Card variant="outlined" padding="sm">
          <Stack gap="xs">
            <Text size="sm" weight="semibold">Card Component</Text>
            <Text size="xs" color="secondary">
              Outlined card variant — border adapts per mode
            </Text>
          </Stack>
        </Card>

        {/* Switch + Progress */}
        <Flex gap="lg" align="center" style={{ 'flex-wrap': 'wrap' }}>
          <Switch
            checked={switchOn()}
            onChange={setSwitchOn}
            label={switchOn() ? 'Enabled' : 'Disabled'}
            size="sm"
          />
        </Flex>

        <Stack gap="xs">
          <Flex align="center" justify="between">
            <Text size="xs" color="secondary">Progress</Text>
            <Text size="xs" color="secondary">60%</Text>
          </Flex>
          <ProgressBar value={60} size="sm" aria-label="Demo progress" />
        </Stack>
      </Stack>
    </div>
  )
}

// ─── 2×2 Comparison View ────────────────────────────────────────────────────

const AllModesComparison: Component = () => {
  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': '1fr 1fr',
        gap: 'var(--sk-space-md)',
        padding: 'var(--sk-space-lg)',
        background: '#080a0c',
        'min-height': '100vh',
        'box-sizing': 'border-box',
      }}
    >
      <For each={MODES}>
        {(mode) => <ComponentShowcase mode={mode} />}
      </For>
    </div>
  )
}

// ─── Single Mode Full-Width View ─────────────────────────────────────────────

const SingleModeView: Component<{ mode: DesignMode }> = (props) => {
  return (
    <div
      style={{
        padding: 'var(--sk-space-xl)',
        background: '#080a0c',
        'min-height': '100vh',
        display: 'flex',
        'align-items': 'flex-start',
        'justify-content': 'center',
        'box-sizing': 'border-box',
      }}
    >
      <div style={{ width: '100%', 'max-width': '560px' }}>
        <ComponentShowcase mode={props.mode} fullWidth />
      </div>
    </div>
  )
}

// ─── Story Exports ───────────────────────────────────────────────────────────

export const DesignModes = defineStory({
  title: 'Design Modes',
  category: 'Theme',
  layout: 'fullscreen',
  render: () => <AllModesComparison />,
  controls: {},
})

export const GlassMode = defineStory({
  title: 'Glass Mode',
  category: 'Theme',
  layout: 'fullscreen',
  render: () => <SingleModeView mode="glass" />,
  controls: {},
})

export const InkMode = defineStory({
  title: 'Ink Mode',
  category: 'Theme',
  layout: 'fullscreen',
  render: () => <SingleModeView mode="ink" />,
  controls: {},
})

export const NativeMode = defineStory({
  title: 'Native Mode',
  category: 'Theme',
  layout: 'fullscreen',
  render: () => <SingleModeView mode="native" />,
  controls: {},
})

export const CommandMode = defineStory({
  title: 'Command Mode',
  category: 'Theme',
  layout: 'fullscreen',
  render: () => <SingleModeView mode="command" />,
  controls: {},
})
