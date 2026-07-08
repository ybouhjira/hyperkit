import { Component, Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { useTour } from './TourProvider';

export const TourHighlight: Component = () => {
  const tour = useTour();
  const [rect, setRect] = createSignal<DOMRect | null>(null);

  // Effect: watch currentStep, find target element, measure
  createEffect(() => {
    const step = tour.currentStep();
    if (!step?.target) {
      setRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) {
      setRect(null);
      return;
    }

    const measure = () => setRect(el.getBoundingClientRect());
    measure();

    window.addEventListener('scroll', measure, true); // capture for nested scrolls
    window.addEventListener('resize', measure);
    onCleanup(() => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    });
  });

  // Clip-path: full viewport with rectangular cutout
  const clipPath = () => {
    const r = rect();
    if (!r) return 'none';
    const pad = 8; // padding around target
    const x1 = r.left - pad;
    const y1 = r.top - pad;
    const x2 = r.right + pad;
    const y2 = r.bottom + pad;
    // Create polygon that covers viewport with hole
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px
    )`;
  };

  const ringStyle = () => {
    const r = rect();
    if (!r) return {};
    return {
      left: `${r.left - 8}px`,
      top: `${r.top - 8}px`,
      width: `${r.width + 16}px`,
      height: `${r.height + 16}px`,
    };
  };

  return (
    <Show when={rect()}>
      <div class="sk-tour__overlay" style={{ 'clip-path': clipPath() }} />
      <div class="sk-tour__spotlight-ring" style={ringStyle()} />
    </Show>
  );
};
