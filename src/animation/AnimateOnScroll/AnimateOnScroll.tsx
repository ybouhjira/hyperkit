import { type Component, type JSX, splitProps, createSignal, onMount, onCleanup } from 'solid-js';
import '@ybouhjira/hyperkit-styles/animation/AnimateOnScroll/AnimateOnScroll.css';

export interface AnimateOnScrollProps {
  /**
   * Animation preset to use
   * @default 'fadeIn'
   */
  animation?: 'fadeIn' | 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scale';

  /**
   * IntersectionObserver threshold (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Animation delay in milliseconds
   * @default 0
   */
  delay?: number;

  /**
   * Animation duration in milliseconds
   * @default 600
   */
  duration?: number;

  /**
   * Only animate once (don't re-animate on scroll back)
   * @default true
   */
  once?: boolean;

  /**
   * Content to animate
   */
  children: JSX.Element;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * Inline styles
   */
  style?: JSX.CSSProperties;
}

/**
 * AnimateOnScroll - Animate elements when they enter the viewport
 *
 * @example
 * ```tsx
 * <AnimateOnScroll animation="fadeUp" delay={200}>
 *   <Card>Content appears on scroll</Card>
 * </AnimateOnScroll>
 * ```
 */
export const AnimateOnScroll: Component<AnimateOnScrollProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'animation',
    'threshold',
    'delay',
    'duration',
    'once',
    'children',
    'class',
    'style',
  ]);

  const [isVisible, setIsVisible] = createSignal(false);
  let elementRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (local.once ?? true) {
              observer.disconnect();
            }
          } else {
            // Only re-hide if not in once mode
            if (!(local.once ?? true)) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        threshold: local.threshold ?? 0.1,
      }
    );

    observer.observe(elementRef);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  const animationToClass: Record<string, string> = {
    fadeIn: 'fade-in',
    fadeUp: 'fade-up',
    fadeDown: 'fade-down',
    slideLeft: 'slide-left',
    slideRight: 'slide-right',
    scale: 'scale',
  };

  const animationClass = () => {
    const base = 'sk-animate-on-scroll';
    const animation = local.animation ?? 'fadeIn';
    const modifier = animationToClass[animation] ?? animation;
    const visible = isVisible() ? `${base}--visible` : '';
    const custom = local.class ?? '';

    return `${base} ${base}--${modifier} ${visible} ${custom}`.trim();
  };

  const inlineStyle = (): JSX.CSSProperties => {
    return {
      '--sk-aos-delay': `${local.delay ?? 0}ms`,
      '--sk-aos-duration': `${local.duration ?? 600}ms`,
      ...local.style,
    } as JSX.CSSProperties;
  };

  return (
    <div ref={elementRef} class={animationClass()} style={inlineStyle()} {...rest}>
      {local.children}
    </div>
  );
};
