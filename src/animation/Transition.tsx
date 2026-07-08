import { Component, JSX, onMount, createSignal } from 'solid-js';
import { TransitionPreset } from './types';
import { enterAnimation } from './presets';
import { useAnimation } from './useAnimation';

export interface TransitionProps {
  preset?: TransitionPreset;
  duration?: number;
  children: JSX.Element;
}

export const Transition: Component<TransitionProps> = (props) => {
  const animation = useAnimation();
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  const getStyles = (): JSX.CSSProperties => {
    if (!animation.isActive() || !props.preset) {
      return {};
    }

    const duration = props.duration ?? 200;

    if (!mounted()) {
      // Apply "from" state before mount
      const presetMap = {
        fade: { opacity: 0 },
        'slide-up': { opacity: 0, transform: 'translateY(8px)' },
        'slide-down': { opacity: 0, transform: 'translateY(-8px)' },
        'slide-left': { opacity: 0, transform: 'translateX(8px)' },
        'slide-right': { opacity: 0, transform: 'translateX(-8px)' },
        scale: { opacity: 0, transform: 'scale(0.95)' },
        'scale-fade': { opacity: 0, transform: 'scale(0.97)' },
        none: {},
      };
      return presetMap[props.preset] != null ? presetMap[props.preset] : {};
    }

    return enterAnimation(props.preset, duration);
  };

  return <div style={getStyles()}>{props.children}</div>;
};
