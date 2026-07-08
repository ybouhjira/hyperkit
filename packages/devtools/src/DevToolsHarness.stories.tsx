import type { Meta, StoryObj } from 'storybook-solidjs';
import { onMount, onCleanup, createSignal, Show } from 'solid-js';
import {
  registerNavigable,
  unregisterNavigable,
  dispatchAction,
  clearActionHistory,
  clearActionEventListeners,
} from '@ybouhjira/hyperkit';
import { DevTools } from './DevTools';

const meta: Meta = {
  title: 'Observability/DevTools Overlay',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const SCENARIOS = [
  { id: 'scenario.code', label: 'Code' },
  { id: 'scenario.debug', label: 'Debug' },
  { id: 'scenario.monitor', label: 'Monitor' },
  { id: 'scenario.explore', label: 'Explore' },
  { id: 'scenario.trace', label: 'Trace' },
];

const ACTION_NAMES = ['enter', 'inspect', 'select', 'edit', 'preview', 'toggle'];

function seedNavigables(): () => void {
  for (const scenario of SCENARIOS) {
    const actions = new Map<
      string,
      { name: string; description: string; handler: (p: unknown) => unknown }
    >();
    for (const name of ACTION_NAMES) {
      actions.set(name, {
        name,
        description: `${scenario.label} · ${name}`,
        handler: () => {
          if (Math.random() < 0.05) throw new Error(`boom in ${scenario.id}/${name}`);
          return { ok: true };
        },
      });
    }
    registerNavigable({ id: scenario.id, label: scenario.label, actions });
  }
  return () => {
    for (const scenario of SCENARIOS) unregisterNavigable(scenario.id);
  };
}

function pickWeighted<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export const LiveStream: Story = {
  name: 'Live Action Stream (open Timeline tab)',
  render: () => {
    const [running, setRunning] = createSignal(true);
    const [count, setCount] = createSignal(0);

    onMount(() => {
      clearActionHistory();
      clearActionEventListeners();
      const cleanupNavigables = seedNavigables();

      const tick = async () => {
        if (!running()) return;
        const scenario = pickWeighted(SCENARIOS);
        const action = pickWeighted(ACTION_NAMES);
        try {
          await dispatchAction(scenario.id, action);
        } catch {
          // handler throws 5% of the time; swallow so the timeline sees the error result
        }
        setCount((c) => c + 1);
      };

      const interval = window.setInterval(tick, 450);
      onCleanup(() => {
        window.clearInterval(interval);
        cleanupNavigables();
      });
    });

    return (
      <div
        style={{
          'min-height': '100vh',
          background: 'var(--sk-bg-primary)',
          color: 'var(--sk-text-primary)',
          padding: 'var(--sk-space-xl)',
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-md)',
        }}
      >
        <h2 style={{ margin: 0, 'font-size': 'var(--sk-font-size-xl)' }}>
          DevTools Overlay — Live Timeline Demo
        </h2>
        <p style={{ margin: 0, color: 'var(--sk-text-secondary)' }}>
          The DevTools overlay is forced open (bottom-right). Click the{' '}
          <strong>Timeline</strong> tab to watch navigable actions stream in real time.
          Events: <code style={{ 'font-family': 'var(--sk-font-code)' }}>{count()}</code>
        </p>
        <div style={{ display: 'flex', gap: 'var(--sk-space-sm)' }}>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            style={{
              padding: 'var(--sk-space-xs) var(--sk-space-md)',
              background: 'var(--sk-accent-muted)',
              color: 'var(--sk-text-primary)',
              border: '1px solid var(--sk-border)',
              'border-radius': 'var(--sk-radius-sm)',
              cursor: 'pointer',
            }}
          >
            <Show when={running()} fallback="▶ Resume stream">
              ⏸ Pause stream
            </Show>
          </button>
        </div>
        <DevTools open={true} product="Harness" version="0.1.0" />
      </div>
    );
  },
};
