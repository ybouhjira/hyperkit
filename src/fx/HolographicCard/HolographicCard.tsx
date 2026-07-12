import { type Component, type JSX, splitProps, createSignal } from 'solid-js';
import '@ybouhjira/hyperkit-styles/fx/HolographicCard/HolographicCard.css';

export interface HolographicCardProps {
  /**
   * Effect intensity (0-1)
   * @default 0.5
   */
  intensity?: number;
  /**
   * Gradient angle in degrees
   * @default 135
   */
  angle?: number;
  /**
   * Auto-animate the holographic effect
   * @default true
   */
  animated?: boolean;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * HolographicCard - Rainbow holographic shimmer effect on hover.
 *
 * @example
 * ```tsx
 * <HolographicCard intensity={0.7} animated>
 *   <p>Holographic content</p>
 * </HolographicCard>
 * ```
 */
export const HolographicCard: Component<HolographicCardProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'intensity',
    'angle',
    'animated',
    'children',
    'class',
    'style',
  ]);

  const intensity = () => local.intensity ?? 0.5;
  const angle = () => local.angle ?? 135;
  const animated = () => local.animated ?? true;

  const [hoverPos, setHoverPos] = createSignal({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = createSignal(false);

  let cardRef: HTMLDivElement | undefined;

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverPos({ x: 50, y: 50 });
  };

  const classes = () =>
    [
      'sk-holographic-card',
      animated() && 'sk-holographic-card--animated',
      isHovered() && 'sk-holographic-card--hovered',
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-holo-intensity': String(intensity()),
      '--sk-holo-angle': `${angle()}deg`,
      '--sk-holo-x': `${hoverPos().x}%`,
      '--sk-holo-y': `${hoverPos().y}%`,
      ...local.style,
    }) as JSX.CSSProperties;

  return (
    <div
      ref={cardRef}
      class={classes()}
      style={inlineStyle()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div class="sk-holographic-card__shimmer" />
      <div class="sk-holographic-card__content">{local.children}</div>
    </div>
  );
};
