import { type Component, type JSX, splitProps, createSignal, onCleanup } from 'solid-js';
import '@ybouhjira/hyperkit-styles/fx/TiltCard/TiltCard.css';

export interface TiltCardProps {
  /**
   * Maximum tilt angle in degrees
   * @default 15
   */
  maxTilt?: number;
  /**
   * CSS perspective value in pixels
   * @default 1000
   */
  perspective?: number;
  /**
   * Scale factor on hover
   * @default 1.02
   */
  scale?: number;
  /**
   * Transition speed in milliseconds
   * @default 400
   */
  speed?: number;
  /**
   * Show glare effect following the cursor
   * @default false
   */
  glare?: boolean;
  /**
   * Glare overlay opacity (0-1)
   * @default 0.2
   */
  glareOpacity?: number;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * TiltCard - A card that tilts in 3D based on mouse position.
 *
 * @example
 * ```tsx
 * <TiltCard maxTilt={10} glare>
 *   <p>Hover over me!</p>
 * </TiltCard>
 * ```
 */
export const TiltCard: Component<TiltCardProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'maxTilt',
    'perspective',
    'scale',
    'speed',
    'glare',
    'glareOpacity',
    'children',
    'class',
    'style',
  ]);

  const [glarePos, setGlarePos] = createSignal({ x: 50, y: 50 });
  let cardRef: HTMLDivElement | undefined;

  const maxTilt = () => local.maxTilt ?? 15;
  const perspective = () => local.perspective ?? 1000;
  const scale = () => local.scale ?? 1.02;
  const speed = () => local.speed ?? 400;
  const glareOpacity = () => local.glareOpacity ?? 0.2;

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotateY = dx * maxTilt();
    const rotateX = -dy * maxTilt();

    cardRef.style.setProperty('--sk-tilt-x', `${rotateX}deg`);
    cardRef.style.setProperty('--sk-tilt-y', `${rotateY}deg`);
    cardRef.style.setProperty('--sk-tilt-scale', `${scale()}`);
    cardRef.style.setProperty('--sk-tilt-speed', `${speed()}ms`);

    if (local.glare) {
      const gx = ((e.clientX - rect.left) / rect.width) * 100;
      const gy = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: gx, y: gy });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef) return;
    cardRef.style.setProperty('--sk-tilt-x', '0deg');
    cardRef.style.setProperty('--sk-tilt-y', '0deg');
    cardRef.style.setProperty('--sk-tilt-scale', '1');
    cardRef.style.setProperty('--sk-tilt-speed', `${speed()}ms`);
  };

  onCleanup(() => {
    if (cardRef) {
      cardRef.removeEventListener('mousemove', handleMouseMove);
      cardRef.removeEventListener('mouseleave', handleMouseLeave);
    }
  });

  const classes = () => ['sk-tilt-card', local.class].filter(Boolean).join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-tilt-perspective': `${perspective()}px`,
      '--sk-tilt-x': '0deg',
      '--sk-tilt-y': '0deg',
      '--sk-tilt-scale': '1',
      '--sk-tilt-speed': `${speed()}ms`,
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
      <div class="sk-tilt-card__inner">{local.children}</div>
      {local.glare && (
        <div
          class="sk-tilt-card__glare"
          style={{
            background: `radial-gradient(circle at ${glarePos().x}% ${glarePos().y}%, rgba(255,255,255,${glareOpacity()}) 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
};
