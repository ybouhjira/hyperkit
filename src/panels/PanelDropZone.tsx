import { Component, onMount, onCleanup, JSX } from 'solid-js';
import type { PanelPosition } from './types';

export interface PanelDropZoneProps {
  position: PanelPosition;
  active: boolean;
  visible: boolean;
  onRegister: (position: PanelPosition, el: HTMLElement) => void;
  onUnregister: (position: PanelPosition) => void;
  style?: JSX.CSSProperties;
}

export const PanelDropZone: Component<PanelDropZoneProps> = (props) => {
  let elementRef: HTMLDivElement | undefined;

  onMount(() => {
    if (elementRef) {
      props.onRegister(props.position, elementRef);
    }
  });

  onCleanup(() => {
    props.onUnregister(props.position);
  });

  const getClasses = () => ({
    'sk-drop-zone': true,
    [`sk-drop-zone--${props.position}`]: true,
    'sk-drop-zone--active': props.visible && props.active,
    'sk-drop-zone--inactive': props.visible && !props.active,
    'sk-drop-zone--hidden': !props.visible,
  });

  return <div ref={elementRef} classList={getClasses()} style={props.style} />;
};
