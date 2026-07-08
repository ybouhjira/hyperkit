export interface AnimationConfig {
  /** Whether animations are enabled globally */
  enabled: boolean;
  /** Duration multiplier (1 = normal, 0.5 = fast, 2 = slow) */
  speedMultiplier: number;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion: boolean;
}

export type TransitionPreset =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'scale-fade'
  | 'none';

export interface TransitionConfig {
  /** Duration in milliseconds, default 200 */
  duration?: number;
  /** CSS easing function, default 'cubic-bezier(0.4, 0, 0.2, 1)' */
  easing?: string;
  /** Delay in milliseconds */
  delay?: number;
  /** Preset animation */
  preset?: TransitionPreset;
}
