import { JSX } from 'solid-js';
import { TransitionPreset } from './types';

export const fadeIn = { from: { opacity: 0 }, to: { opacity: 1 } };

export const slideUp = {
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
};

export const slideDown = {
  from: { opacity: 0, transform: 'translateY(-8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
};

export const slideLeft = {
  from: { opacity: 0, transform: 'translateX(8px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
};

export const slideRight = {
  from: { opacity: 0, transform: 'translateX(-8px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
};

export const scaleIn = {
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
};

export const scaleFade = {
  from: { opacity: 0, transform: 'scale(0.97)' },
  to: { opacity: 1, transform: 'scale(1)' },
};

const presetMap = {
  fade: fadeIn,
  'slide-up': slideUp,
  'slide-down': slideDown,
  'slide-left': slideLeft,
  'slide-right': slideRight,
  scale: scaleIn,
  'scale-fade': scaleFade,
  none: { from: {}, to: {} },
};

/**
 * Returns inline style object for enter animation
 */
export function enterAnimation(
  preset: TransitionPreset,
  durationMs: number = 200
): JSX.CSSProperties {
  const animation = presetMap[preset];
  if (animation == null || preset === 'none') {
    return {};
  }

  return {
    ...animation.to,
    transition: `all ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };
}

/**
 * Returns class name for CSS animation
 */
export function animationClass(preset: TransitionPreset): string {
  return `sk-animation-${preset}`;
}
