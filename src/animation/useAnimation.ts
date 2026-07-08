import { Accessor } from 'solid-js';
import { useAnimationContext } from './AnimationProvider';
import { AnimationConfig, TransitionConfig } from './types';

export interface UseAnimationReturn {
  config: Accessor<AnimationConfig>;
  setEnabled: (enabled: boolean) => void;
  setSpeedMultiplier: (multiplier: number) => void;
  /** Get CSS transition string for a property */
  transition: (property?: string, config?: TransitionConfig) => string;
  /** Whether animations are currently active (enabled AND not reduced-motion) */
  isActive: Accessor<boolean>;
}

export function useAnimation(): UseAnimationReturn {
  const ctx = useAnimationContext();

  const transition = (property: string = 'all', config?: TransitionConfig): string => {
    if (!ctx.isActive()) {
      return 'none';
    }

    const cfg = ctx.config();
    const duration = (config?.duration ?? 200) * cfg.speedMultiplier;
    const easing = config?.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = config?.delay ?? 0;

    if (delay > 0) {
      return `${property} ${duration}ms ${easing} ${delay}ms`;
    }

    return `${property} ${duration}ms ${easing}`;
  };

  return {
    config: ctx.config,
    setEnabled: ctx.setEnabled,
    setSpeedMultiplier: ctx.setSpeedMultiplier,
    transition,
    isActive: ctx.isActive,
  };
}
