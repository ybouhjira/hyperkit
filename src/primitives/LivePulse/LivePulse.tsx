/**
 * LivePulse — Law #11 enforcer ("REALTIME = ALWAYS ANIMATED").
 *
 * Wraps any element to make it visibly "alive" while a job is running.
 * When `active=true`:
 *   - animated accent border (1.5s loop, conic gradient sweep)
 *   - subtle opacity breath on the wrapped child
 *   - tiny pulsing accent dot in the top-right corner (the always-visible
 *     "I am alive" signal that survives `prefers-reduced-motion`)
 * When `active=false`:
 *   - animation freezes instantly
 *   - dot disappears
 *   - wrapped child renders untouched
 *
 * Per the premium-ui design spec (skills/premium-ui-design.md) Law #11: anything that
 * represents a running job/agent/stream/sync MUST carry an active
 * animation while running. Static = paused/done. Movement = alive.
 *
 * Use directly:
 *   <LivePulse active={status === 'running'}>
 *     <Card>...</Card>
 *   </LivePulse>
 *
 * Or via `<Card live={status === 'running'}>...</Card>` which auto-wraps.
 */

import { type Component, type JSX, Show, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/LivePulse/LivePulse.css';

export interface LivePulseProps {
  /** Whether the wrapped content represents an active live job. */
  active: boolean;
  /** Override the accent color used by the border + dot. */
  accentColor?: string;
  /** Disable the corner dot when the visual is too small for it. */
  hideDot?: boolean;
  /** Additional class on the wrapper. */
  class?: string;
  /** Inline style on the wrapper. */
  style?: JSX.CSSProperties;
  /** Children to wrap. */
  children: JSX.Element;
}

export const LivePulse: Component<LivePulseProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'active',
    'accentColor',
    'hideDot',
    'class',
    'style',
    'children',
  ]);

  const cssVars = (): JSX.CSSProperties =>
    local.accentColor !== undefined
      ? ({ '--sk-livepulse-color': local.accentColor } as JSX.CSSProperties)
      : ({} as JSX.CSSProperties);

  return (
    <div
      class={`sk-livepulse${local.active ? ' sk-livepulse--active' : ''}${local.class ? ` ${local.class}` : ''}`}
      data-live={local.active ? 'true' : 'false'}
      aria-busy={local.active}
      style={{ ...cssVars(), ...(local.style ?? {}) }}
      {...rest}
    >
      {local.children}
      <Show when={local.active && !local.hideDot}>
        <span class="sk-livepulse__dot" aria-hidden="true" />
      </Show>
    </div>
  );
};
