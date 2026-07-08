import { type Component, type JSX, splitProps, createSignal, onCleanup } from 'solid-js';
import './CursorSpotlight.css';

export interface CursorSpotlightProps {
  /**
   * Spotlight diameter in pixels
   * @default 200
   */
  size?: number;
  /**
   * Spotlight opacity (0-1)
   * @default 0.15
   */
  opacity?: number;
  /**
   * Spotlight color
   * @default 'var(--sk-accent)'
   */
  color?: string;
  /**
   * CSS mix-blend-mode for the spotlight overlay
   * @default 'screen'
   */
  blend?: string;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * CursorSpotlight - A spotlight effect that follows the cursor.
 *
 * @example
 * ```tsx
 * <CursorSpotlight size={300} color="var(--sk-accent)" opacity={0.2}>
 *   <div>Content with spotlight</div>
 * </CursorSpotlight>
 * ```
 */
export const CursorSpotlight: Component<CursorSpotlightProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'size',
    'opacity',
    'color',
    'blend',
    'children',
    'class',
    'style',
  ]);

  const size = () => local.size ?? 200;
  const opacity = () => local.opacity ?? 0.15;
  const color = () => local.color ?? 'var(--sk-accent)';
  const blend = () => local.blend ?? 'screen';

  const [isInside, setIsInside] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.style.setProperty('--sk-spotlight-x', `${x}px`);
    containerRef.style.setProperty('--sk-spotlight-y', `${y}px`);
    setIsInside(true);
  };

  const handleMouseLeave = () => {
    setIsInside(false);
  };

  onCleanup(() => {
    if (containerRef) {
      containerRef.removeEventListener('mousemove', handleMouseMove);
      containerRef.removeEventListener('mouseleave', handleMouseLeave);
    }
  });

  const classes = () => ['sk-cursor-spotlight', local.class].filter(Boolean).join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-spotlight-x': '50%',
      '--sk-spotlight-y': '50%',
      '--sk-spotlight-size': `${size()}px`,
      '--sk-spotlight-opacity': String(opacity()),
      '--sk-spotlight-color': color(),
      '--sk-spotlight-blend': blend(),
      ...local.style,
    }) as JSX.CSSProperties;

  return (
    <div
      ref={containerRef}
      class={classes()}
      style={inlineStyle()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {local.children}
      <div
        class="sk-cursor-spotlight__overlay"
        style={{ opacity: isInside() ? String(opacity()) : '0' }}
      />
    </div>
  );
};
