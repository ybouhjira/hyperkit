import { Component, JSX, createSignal, onMount, onCleanup } from 'solid-js';

export interface ScrollRevealProps {
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number; // 0-1
  once?: boolean; // only animate once (default true)
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
}

export const ScrollReveal: Component<ScrollRevealProps> = (props) => {
  const [visible, setVisible] = createSignal(false);
  let ref: HTMLDivElement | undefined;

  const animation = () => props.animation || 'fade-up';
  const delay = () => props.delay ?? 0;
  const duration = () => props.duration ?? 600;
  const threshold = () => props.threshold ?? 0.1;
  const once = () => props.once !== false;

  onMount(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once()) {
              observer.unobserve(entry.target);
            }
          } else if (!once()) {
            setVisible(false);
          }
        });
      },
      { threshold: threshold(), rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(ref);

    onCleanup(() => observer.disconnect());
  });

  const getTransform = (): string => {
    switch (animation()) {
      case 'fade-up':
        return 'translateY(30px)';
      case 'scale-in':
        return 'scale(0.9)';
      case 'slide-left':
        return 'translateX(-30px)';
      case 'slide-right':
        return 'translateX(30px)';
      default:
        return 'none';
    }
  };

  const computedStyle = (): JSX.CSSProperties => ({
    ...props.style,
    opacity: visible() ? 1 : 0,
    transform: visible() ? 'none' : getTransform(),
    transition: `opacity ${duration()}ms ease-out ${delay()}ms, transform ${duration()}ms ease-out ${delay()}ms`,
  });

  return (
    <div ref={ref} class={props.class} style={computedStyle()}>
      {props.children}
    </div>
  );
};
