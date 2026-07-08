import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { TourDefinition } from './types';
import { TourProvider, useTour } from './TourProvider';
import { fireEvent } from '@testing-library/dom';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTour(overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: 'hl-tour',
    name: 'Highlight Tour',
    steps: [
      { id: 's1', title: 'Step 1', description: 'First', target: '#target-el' },
      { id: 's2', title: 'Step 2', description: 'Second' },
    ],
    ...overrides,
  };
}

/**
 * Creates a target element in the DOM with a known bounding rect, starts the
 * tour, and returns cleanup + helpers.
 */
function renderHighlightScenario(tour?: TourDefinition) {
  const tourDef = tour ?? makeTour();

  // Create a target element for querySelector to find
  const targetEl = document.createElement('div');
  targetEl.id = 'target-el';
  document.body.appendChild(targetEl);

  // Mock getBoundingClientRect on the target element
  const mockRect = {
    top: 100,
    left: 200,
    bottom: 140,
    right: 360,
    width: 160,
    height: 40,
    x: 200,
    y: 100,
    toJSON: () => ({}),
  };
  vi.spyOn(targetEl, 'getBoundingClientRect').mockReturnValue(mockRect);

  function Controls() {
    const ctx = useTour();
    return (
      <div>
        <button data-testid="start" onClick={() => ctx.start(tourDef)}>
          Start
        </button>
        <button data-testid="complete" onClick={() => ctx.completeStep()}>
          Complete
        </button>
        <button data-testid="cancel" onClick={() => ctx.cancel()}>
          Cancel
        </button>
      </div>
    );
  }

  const result = render(() => (
    <TourProvider>
      <Controls />
    </TourProvider>
  ));

  return {
    ...result,
    targetEl,
    mockRect,
    cleanup: () => {
      targetEl.remove();
    },
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TourHighlight', () => {
  afterEach(() => {
    // Clean up any straggling target elements
    document.querySelectorAll('#target-el').forEach((el) => el.remove());
  });

  it('does not render overlay or spotlight when tour is idle', () => {
    const { cleanup } = renderHighlightScenario();

    expect(document.querySelector('.sk-tour__overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).not.toBeInTheDocument();
    cleanup();
  });

  it('renders overlay and spotlight ring when tour is running with a target', () => {
    const { cleanup } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    expect(document.querySelector('.sk-tour__overlay')).toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).toBeInTheDocument();
    cleanup();
  });

  it('positions spotlight ring based on target getBoundingClientRect', () => {
    const { cleanup, mockRect } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    const ring = document.querySelector('.sk-tour__spotlight-ring') as HTMLElement;
    expect(ring).toBeInTheDocument();

    // Ring should be offset by 8px padding around the target
    expect(ring.style.left).toBe(`${mockRect.left - 8}px`);
    expect(ring.style.top).toBe(`${mockRect.top - 8}px`);
    expect(ring.style.width).toBe(`${mockRect.width + 16}px`);
    expect(ring.style.height).toBe(`${mockRect.height + 16}px`);
    cleanup();
  });

  it('generates clip-path polygon with cutout around target', () => {
    const { cleanup, mockRect } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    const overlay = document.querySelector('.sk-tour__overlay') as HTMLElement;
    expect(overlay).toBeInTheDocument();

    const clipPath = overlay.style.clipPath;
    // Should contain the padded coordinates (8px padding)
    const x1 = mockRect.left - 8;
    const y1 = mockRect.top - 8;
    const x2 = mockRect.right + 8;
    const y2 = mockRect.bottom + 8;
    expect(clipPath).toContain(`${x1}px`);
    expect(clipPath).toContain(`${y1}px`);
    expect(clipPath).toContain(`${x2}px`);
    expect(clipPath).toContain(`${y2}px`);
    cleanup();
  });

  it('hides overlay when step has no target', () => {
    const tour = makeTour({
      steps: [{ id: 's1', title: 'No target', description: 'desc' }],
    });
    const { cleanup } = renderHighlightScenario(tour);
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    // Overlay should not render because there is no target and therefore no rect
    expect(document.querySelector('.sk-tour__overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).not.toBeInTheDocument();
    cleanup();
  });

  it('hides overlay when target element is not found in DOM', () => {
    const tour = makeTour({
      steps: [{ id: 's1', title: 'Missing target', description: 'desc', target: '#nonexistent' }],
    });
    const { cleanup } = renderHighlightScenario(tour);
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    expect(document.querySelector('.sk-tour__overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).not.toBeInTheDocument();
    cleanup();
  });

  it('removes highlight after cancelling the tour', () => {
    const { cleanup } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    expect(document.querySelector('.sk-tour__overlay')).toBeInTheDocument();

    fireEvent.click(document.querySelector('[data-testid="cancel"]')!);

    expect(document.querySelector('.sk-tour__overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).not.toBeInTheDocument();
    cleanup();
  });

  it('updates position on scroll events', () => {
    const { cleanup, targetEl } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    // Change the mock rect to simulate scroll
    const newRect = {
      top: 50,
      left: 200,
      bottom: 90,
      right: 360,
      width: 160,
      height: 40,
      x: 200,
      y: 50,
      toJSON: () => ({}),
    };
    vi.spyOn(targetEl, 'getBoundingClientRect').mockReturnValue(newRect);

    // Trigger scroll (capture: true was used in source)
    window.dispatchEvent(new Event('scroll'));

    const ring = document.querySelector('.sk-tour__spotlight-ring') as HTMLElement;
    expect(ring.style.top).toBe(`${newRect.top - 8}px`);
    cleanup();
  });

  it('updates position on resize events', () => {
    const { cleanup, targetEl } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    const newRect = {
      top: 100,
      left: 300,
      bottom: 140,
      right: 460,
      width: 160,
      height: 40,
      x: 300,
      y: 100,
      toJSON: () => ({}),
    };
    vi.spyOn(targetEl, 'getBoundingClientRect').mockReturnValue(newRect);

    window.dispatchEvent(new Event('resize'));

    const ring = document.querySelector('.sk-tour__spotlight-ring') as HTMLElement;
    expect(ring.style.left).toBe(`${newRect.left - 8}px`);
    cleanup();
  });

  it('clears highlight when advancing to a step without a target', () => {
    const { cleanup } = renderHighlightScenario();
    fireEvent.click(document.querySelector('[data-testid="start"]')!);

    // Step 1 has target, should show highlight
    expect(document.querySelector('.sk-tour__spotlight-ring')).toBeInTheDocument();

    // Complete step 1 → step 2 has no target
    fireEvent.click(document.querySelector('[data-testid="complete"]')!);

    expect(document.querySelector('.sk-tour__overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-tour__spotlight-ring')).not.toBeInTheDocument();
    cleanup();
  });
});
