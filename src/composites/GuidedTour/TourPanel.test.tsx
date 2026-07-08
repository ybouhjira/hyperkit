import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import type { TourDefinition } from './types';
import { TourProvider, useTour } from './TourProvider';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTour(overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: 'panel-tour',
    name: 'Panel Tour',
    steps: [
      { id: 's1', title: 'Step One', description: 'First step instructions' },
      { id: 's2', title: 'Step Two', description: 'Second step instructions' },
      { id: 's3', title: 'Step Three', description: 'Third step instructions' },
    ],
    ...overrides,
  };
}

/**
 * Renders TourProvider with controls to start/navigate, and returns helpers.
 * The TourPanel is automatically rendered by TourProvider via Portal when running.
 */
function renderTourPanel(tour?: TourDefinition) {
  const tourDef = tour ?? makeTour();

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
      </div>
    );
  }

  return render(() => (
    <TourProvider>
      <Controls />
    </TourProvider>
  ));
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TourPanel', () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  it('renders the tour name in the header', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__panel-title')).toHaveTextContent('Panel Tour');
  });

  it('shows step progress as "Step X of Y"', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__panel-subtitle')).toHaveTextContent('Step 1 of 3');
  });

  it('updates step progress when navigating', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete'));

    expect(document.querySelector('.sk-tour__panel-subtitle')).toHaveTextContent('Step 2 of 3');
  });

  // ── Checklist ──────────────────────────────────────────────────────────

  it('renders checklist with all step titles', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const labels = document.querySelectorAll('.sk-tour__checklist-label');
    expect(labels).toHaveLength(3);
    expect(labels[0]).toHaveTextContent('Step One');
    expect(labels[1]).toHaveTextContent('Step Two');
    expect(labels[2]).toHaveTextContent('Step Three');
  });

  it('marks the active step in the checklist', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const items = document.querySelectorAll('.sk-tour__checklist-item');
    expect(items[0]).toHaveClass('sk-tour__checklist-item--active');
    expect(items[1]).toHaveClass('sk-tour__checklist-item--pending');
  });

  it('marks completed steps in the checklist', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete'));

    const items = document.querySelectorAll('.sk-tour__checklist-item');
    expect(items[0]).toHaveClass('sk-tour__checklist-item--completed');
    expect(items[1]).toHaveClass('sk-tour__checklist-item--active');
  });

  // ── Step detail ────────────────────────────────────────────────────────

  it('shows current step title and description', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__step-title')).toHaveTextContent('Step One');
    expect(document.querySelector('.sk-tour__step-description')).toHaveTextContent(
      'First step instructions'
    );
  });

  it('shows step number label', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__step-number')).toHaveTextContent('Step 1');
  });

  it('updates step detail when advancing', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete'));

    expect(document.querySelector('.sk-tour__step-title')).toHaveTextContent('Step Two');
    expect(document.querySelector('.sk-tour__step-description')).toHaveTextContent(
      'Second step instructions'
    );
    expect(document.querySelector('.sk-tour__step-number')).toHaveTextContent('Step 2');
  });

  // ── Validation indicator ───────────────────────────────────────────────

  it('shows validation description when step has validation', () => {
    const tour = makeTour({
      steps: [
        {
          id: 's1',
          title: 'Validated',
          description: 'd',
          validation: { description: 'Click the button', check: () => false },
        },
      ],
    });
    renderTourPanel(tour);
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__step-validation')).toBeInTheDocument();
    expect(document.querySelector('.sk-tour__step-validation')).toHaveTextContent(
      'Click the button'
    );
    expect(document.querySelector('.sk-tour__validation-spinner')).toBeInTheDocument();
  });

  it('does not show validation section when step has no validation', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    expect(document.querySelector('.sk-tour__step-validation')).not.toBeInTheDocument();
  });

  // ── Footer buttons ────────────────────────────────────────────────────

  it('renders Skip Step and End Tour buttons', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const skipBtn = document.querySelector('.sk-tour__panel-btn--skip');
    const endBtn = document.querySelector('.sk-tour__panel-btn--end');
    expect(skipBtn).toHaveTextContent('Skip Step');
    expect(endBtn).toHaveTextContent('End Tour');
  });

  it('Skip Step button advances to the next step', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const skipBtn = document.querySelector('.sk-tour__panel-btn--skip')!;
    fireEvent.click(skipBtn);

    expect(document.querySelector('.sk-tour__step-title')).toHaveTextContent('Step Two');

    // The first step should be marked as skipped
    const items = document.querySelectorAll('.sk-tour__checklist-item');
    expect(items[0]).toHaveClass('sk-tour__checklist-item--skipped');
  });

  it('End Tour button cancels the tour', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const endBtn = document.querySelector('.sk-tour__panel-btn--end')!;
    fireEvent.click(endBtn);

    // Panel should no longer be in the DOM
    expect(document.querySelector('.sk-tour__panel')).not.toBeInTheDocument();
  });

  // ── Pause / Resume button ─────────────────────────────────────────────

  it('renders pause button with correct aria-label when running', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const pauseBtn = document.querySelector('[aria-label="Pause tour"]');
    expect(pauseBtn).toBeInTheDocument();
  });

  it('toggles to resume button when paused', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const pauseBtn = document.querySelector('[aria-label="Pause tour"]')!;
    fireEvent.click(pauseBtn);

    expect(document.querySelector('[aria-label="Resume tour"]')).toBeInTheDocument();
    expect(document.querySelector('[aria-label="Pause tour"]')).not.toBeInTheDocument();
  });

  it('toggles back to pause button when resumed', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const pauseBtn = document.querySelector('[aria-label="Pause tour"]')!;
    fireEvent.click(pauseBtn);

    const resumeBtn = document.querySelector('[aria-label="Resume tour"]')!;
    fireEvent.click(resumeBtn);

    expect(document.querySelector('[aria-label="Pause tour"]')).toBeInTheDocument();
  });

  // ── Close button ──────────────────────────────────────────────────────

  it('close button cancels the tour', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const closeBtn = document.querySelector('[aria-label="Close tour"]')!;
    fireEvent.click(closeBtn);

    expect(document.querySelector('.sk-tour__panel')).not.toBeInTheDocument();
  });

  // ── ProgressBar ────────────────────────────────────────────────────────

  it('renders a ProgressBar in the footer', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const footer = document.querySelector('.sk-tour__panel-footer');
    expect(footer).toBeInTheDocument();
    // ProgressBar renders with role="progressbar"
    const progressBar = footer?.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('progress bar updates as steps are completed', () => {
    renderTourPanel();
    fireEvent.click(screen.getByTestId('start'));

    const getProgressValue = () => {
      const bar = document.querySelector('.sk-tour__panel-footer [role="progressbar"]');
      return bar?.getAttribute('aria-valuenow');
    };

    // 0 of 3 completed
    expect(getProgressValue()).toBe('0');

    // Complete step 1 → 1/3 ≈ 33.33
    fireEvent.click(screen.getByTestId('complete'));
    const val = Number(getProgressValue());
    expect(val).toBeGreaterThan(30);
    expect(val).toBeLessThan(35);
  });
});
