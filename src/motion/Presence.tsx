import { Component } from 'solid-js';
import { Presence as PresenceOne } from 'solid-motionone';
import type { PresenceProps } from './types';

/**
 * Wraps solid-motionone `Presence` to orchestrate enter/exit transitions
 * for child `<Motion>` components.
 *
 * - `initial` — when `false`, disables the first enter animation on all
 *   child `<Motion>` elements when `Presence` first renders. Defaults to `true`.
 * - `exitBeforeEnter` — when `true`, waits for the exiting element to finish
 *   before animating the entering one. Defaults to `false`.
 *
 * @example
 * ```tsx
 * <Presence exitBeforeEnter>
 *   <Show when={visible()}>
 *     <Motion
 *       initial={{ opacity: 0 }}
 *       animate={{ opacity: 1 }}
 *       exit={{ opacity: 0 }}
 *     >
 *       Content
 *     </Motion>
 *   </Show>
 * </Presence>
 * ```
 */
export const Presence: Component<PresenceProps> = (props) => {
  return (
    <PresenceOne initial={props.initial} exitBeforeEnter={props.exitBeforeEnter}>
      {props.children}
    </PresenceOne>
  );
};
