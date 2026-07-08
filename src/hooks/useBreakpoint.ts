import { createSignal, onCleanup, onMount } from 'solid-js';

export type Breakpoint = 'phone' | 'tablet' | 'desktop' | 'wide' | 'tv';

const BREAKPOINTS: Record<Breakpoint, number> = {
  phone: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
  tv: 1920,
};

const ORDERED: Breakpoint[] = ['tv', 'wide', 'desktop', 'tablet', 'phone'];

function getBreakpoint(width: number): Breakpoint {
  for (const bp of ORDERED) {
    if (width >= BREAKPOINTS[bp]) return bp;
  }
  return 'phone';
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = createSignal<Breakpoint>(
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop'
  );

  onMount(() => {
    const handler = () => setBreakpoint(getBreakpoint(window.innerWidth));
    window.addEventListener('resize', handler);
    onCleanup(() => window.removeEventListener('resize', handler));
  });

  return breakpoint;
}
