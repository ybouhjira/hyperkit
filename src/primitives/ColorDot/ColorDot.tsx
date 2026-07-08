import { type Component, splitProps } from 'solid-js';
import './ColorDot.css';

/** Props for the ColorDot component. */
export interface ColorDotProps {
  /** Color value in any CSS format (hex, rgb, hsl, etc). */
  color: string;
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
}

/** Small circular indicator displaying a color. Useful for color swatches or status indicators. */
export const ColorDot: Component<ColorDotProps> = (props) => {
  const [local, others] = splitProps(props, ['color', 'size', 'class']);

  const size = () => local.size ?? 'md';

  return (
    <span
      class={`sk-color-dot sk-color-dot--${size()} ${local.class ?? ''}`}
      style={{ 'background-color': local.color }}
      {...others}
    />
  );
};
