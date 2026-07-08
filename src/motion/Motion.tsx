import { Component, splitProps, useContext, createMemo } from 'solid-js';
import { Motion as MotionOne } from 'solid-motionone';
import type { AnimationOptionsWithOverrides } from '@motionone/dom';
import { AnimationContext } from '../animation/AnimationProvider';
import { resolveEasing } from './easing';
import type { MotionProps } from './types';

/**
 * Wraps solid-motionone `Motion` with SK system integration:
 *
 * - Easing preset resolution — pass `'bounce'`, `'spring'`, `'out'`, etc.
 *   and they map to the corresponding `--sk-ease-*` cubic-bezier values.
 * - AnimationProvider awareness — when `isActive()` is false (animations
 *   disabled or `prefers-reduced-motion` is set), duration collapses to 0.
 * - `speedMultiplier` from AnimationProvider is applied to duration and delay.
 * - Duration/delay expressed in **milliseconds** (internally converted to
 *   seconds to match the motionone API).
 * - `as` prop forwarded as `tag` to render any HTML element type.
 *
 * Works with or without a parent `<AnimationProvider>`. When no provider is
 * present, animations run at full speed using the 'default' easing.
 *
 * @example
 * ```tsx
 * <Motion
 *   initial={{ opacity: 0, y: 8 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   exit={{ opacity: 0 }}
 *   transition={{ duration: 200, easing: 'out' }}
 * >
 *   Hello
 * </Motion>
 * ```
 */
export const Motion: Component<MotionProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'as',
    'transition',
    'spring',
    'class',
    'style',
    'children',
    'onMotionComplete',
    'onMotionStart',
    'onHoverStart',
    'onHoverEnd',
    'onPressStart',
    'onPressEnd',
    'initial',
    'animate',
    'exit',
    'hover',
    'press',
    'variants',
  ]);

  // Optional — returns undefined when no AnimationProvider is above.
  const animCtx = useContext(AnimationContext);

  const resolvedTransition = createMemo((): AnimationOptionsWithOverrides => {
    const active = animCtx ? animCtx.isActive() : true;
    const t = local.transition;

    if (!active) {
      // Collapse to instant so the browser skips the Web Animation entirely.
      return {
        duration: 0,
        // Cast: motionone accepts cubic-bezier strings at runtime despite
        // its Easing type being a narrower union.
        easing: resolveEasing('default') as AnimationOptionsWithOverrides['easing'],
      };
    }

    const speedMultiplier = animCtx ? animCtx.config().speedMultiplier : 1;
    const durationMs = (t?.duration ?? 200) * speedMultiplier;
    const delayMs = t?.delay != null ? t.delay * speedMultiplier : undefined;

    return {
      duration: durationMs / 1000,
      easing: resolveEasing(t?.easing) as AnimationOptionsWithOverrides['easing'],
      ...(delayMs != null ? { delay: delayMs / 1000 } : {}),
    };
  });

  return (
    <MotionOne
      {...(local.as ? { tag: local.as } : {})}
      initial={local.initial}
      animate={local.animate}
      exit={local.exit}
      hover={local.hover}
      press={local.press}
      variants={local.variants}
      transition={resolvedTransition()}
      class={local.class}
      style={local.style}
      onMotionComplete={local.onMotionComplete}
      onMotionStart={local.onMotionStart}
      onHoverStart={local.onHoverStart}
      onHoverEnd={local.onHoverEnd}
      onPressStart={local.onPressStart}
      onPressEnd={local.onPressEnd}
      {...rest}
    >
      {local.children}
    </MotionOne>
  );
};
