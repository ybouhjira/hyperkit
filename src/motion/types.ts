import { JSX } from 'solid-js';
import type { VariantDefinition, Variants, MotionEvent, CustomPointerEvent } from '@motionone/dom';

export type { VariantDefinition, Variants } from '@motionone/dom';

/**
 * A flat map of CSS/transform property names to animatable values.
 * Alias for `VariantDefinition` from `@motionone/dom`.
 */
export type MotionVariant = VariantDefinition;

/**
 * A named variant map used with the `variants` prop.
 * Alias for `Variants` from `@motionone/dom`.
 */
export type MotionVariants = Variants;

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export type EasingPreset = 'default' | 'in' | 'out' | 'in-out' | 'bounce' | 'spring';

export interface MotionTransition {
  /** Duration in milliseconds (converted to seconds for motionone internally) */
  duration?: number;
  /**
   * CSS easing string or SK preset name.
   * Accepted presets: 'default' | 'in' | 'out' | 'in-out' | 'bounce' | 'spring'
   * Any CSS easing string is also accepted and passed through as-is.
   */
  easing?: string | EasingPreset;
  /** Delay in milliseconds (converted to seconds for motionone internally) */
  delay?: number;
}

export interface MotionProps {
  /** HTML element to render. Defaults to 'div'. */
  as?: keyof JSX.IntrinsicElements;
  /**
   * Initial state to animate from when the element first mounts.
   * Pass `false` to disable the initial animation.
   */
  initial?: VariantDefinition | false;
  /** Target state to animate to. Reactive — changing it triggers a transition. */
  animate?: VariantDefinition;
  /** State to animate to when the element is removed (requires `<Presence>`). */
  exit?: VariantDefinition;
  /** State to animate to while the element is hovered. */
  hover?: VariantDefinition;
  /** State to animate to while the element is pressed. */
  press?: VariantDefinition;
  /** Named variant map; entries can be referenced by string key in other props. */
  variants?: Variants;
  /** Transition options. Duration and delay are in milliseconds. */
  transition?: MotionTransition;
  /** Spring config (passed alongside or instead of transition). */
  spring?: SpringConfig;
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
  onMotionComplete?: (event: MotionEvent) => void;
  onMotionStart?: (event: MotionEvent) => void;
  onHoverStart?: (event: CustomPointerEvent) => void;
  onHoverEnd?: (event: CustomPointerEvent) => void;
  onPressStart?: (event: CustomPointerEvent) => void;
  onPressEnd?: (event: CustomPointerEvent) => void;
}

export interface PresenceProps {
  /**
   * When `false`, suppresses the first enter animation on all child `<Motion>`
   * elements the first time `Presence` renders. Defaults to `true`.
   */
  initial?: boolean;
  /**
   * When `true`, waits for the exiting element to finish before animating
   * the next entering element. Defaults to `false`.
   */
  exitBeforeEnter?: boolean;
  children: JSX.Element;
}
