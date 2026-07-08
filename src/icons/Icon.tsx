import { type Component, splitProps } from 'solid-js';
import { icons } from './icons';
import './Icon.css';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  name: string;
  size?: IconSize;
  class?: string;
  color?: string;
}

export const Icon: Component<IconProps> = (props) => {
  const [local, rest] = splitProps(props, ['name', 'size', 'class', 'color']);

  const iconDefinition = () => icons[local.name];
  const size = () => local.size ?? 'md';
  const color = () => local.color ?? 'currentColor';

  return (
    <svg
      class={`sk-icon sk-icon--${size()} ${local.name === 'loading' ? 'sk-icon--loading' : ''} ${local.class || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color()}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...rest}
    >
      {iconDefinition()?.()}
    </svg>
  );
};
