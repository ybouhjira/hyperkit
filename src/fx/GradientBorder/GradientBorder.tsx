import { type Component, type JSX, splitProps } from 'solid-js';
import './GradientBorder.css';

export interface GradientBorderProps {
  /**
   * Gradient stop colors
   * @default ['var(--sk-accent)', 'var(--sk-success)', 'var(--sk-info)']
   */
  colors?: string[];
  /**
   * Border width in pixels
   * @default 2
   */
  width?: number;
  /**
   * Rotate the gradient continuously
   * @default true
   */
  animated?: boolean;
  /**
   * Gradient rotation speed in seconds
   * @default 3
   */
  speed?: number;
  /**
   * Border radius CSS value
   * @default 'var(--sk-radius-md)'
   */
  radius?: string;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * GradientBorder - Animated gradient border around any element.
 *
 * @example
 * ```tsx
 * <GradientBorder colors={['#f00', '#0f0', '#00f']} width={3} animated>
 *   <Card>Fancy border!</Card>
 * </GradientBorder>
 * ```
 */
export const GradientBorder: Component<GradientBorderProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'colors',
    'width',
    'animated',
    'speed',
    'radius',
    'children',
    'class',
    'style',
  ]);

  const colors = () => local.colors ?? ['var(--sk-accent)', 'var(--sk-success)', 'var(--sk-info)'];
  const width = () => local.width ?? 2;
  const animated = () => local.animated ?? true;
  const speed = () => local.speed ?? 3;
  const radius = () => local.radius ?? 'var(--sk-radius-md)';

  const gradientColors = () => colors().join(', ');

  const classes = () =>
    ['sk-gradient-border', animated() && 'sk-gradient-border--animated', local.class]
      .filter(Boolean)
      .join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-gb-width': `${width()}px`,
      '--sk-gb-radius': radius(),
      '--sk-gb-colors': gradientColors(),
      '--sk-gb-speed': `${speed()}s`,
      ...local.style,
    }) as JSX.CSSProperties;

  return (
    <div class={classes()} style={inlineStyle()} {...rest}>
      <div class="sk-gradient-border__inner">{local.children}</div>
    </div>
  );
};
