import { type Component, type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import './GlowElement.css';

export interface GlowElementProps {
  /**
   * Glow color (CSS color value)
   * @default 'var(--sk-accent)'
   */
  color?: string;
  /**
   * Glow intensity (0-1)
   * @default 0.5
   */
  intensity?: number;
  /**
   * Blur radius in pixels
   * @default 20
   */
  size?: number;
  /**
   * Animate glow with a pulsing effect
   * @default false
   */
  pulse?: boolean;
  /**
   * Pulse animation duration in seconds
   * @default 2
   */
  pulseSpeed?: number;
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: string;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * GlowElement - An element with an animated glow/shadow effect.
 *
 * @example
 * ```tsx
 * <GlowElement color="var(--sk-accent)" intensity={0.7} pulse>
 *   <Button>Click me</Button>
 * </GlowElement>
 * ```
 */
export const GlowElement: Component<GlowElementProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'color',
    'intensity',
    'size',
    'pulse',
    'pulseSpeed',
    'as',
    'children',
    'class',
    'style',
  ]);

  const color = () => local.color ?? 'var(--sk-accent)';
  const intensity = () => local.intensity ?? 0.5;
  const size = () => local.size ?? 20;
  const pulseSpeed = () => local.pulseSpeed ?? 2;
  const tag = () => local.as ?? 'div';

  const classes = () =>
    ['sk-glow-element', local.pulse && 'sk-glow-element--pulse', local.class]
      .filter(Boolean)
      .join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-glow-color': color(),
      '--sk-glow-intensity': String(intensity()),
      '--sk-glow-size': `${size()}px`,
      '--sk-glow-pulse-speed': `${pulseSpeed()}s`,
      ...local.style,
    }) as JSX.CSSProperties;

  return (
    <Dynamic component={tag()} class={classes()} style={inlineStyle()} {...rest}>
      {local.children}
    </Dynamic>
  );
};
