import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal } from 'solid-js';
import type { TourDefinition } from './types';
import { TourProvider, useTour } from './TourProvider';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTour(overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: 'test-tour',
    name: 'Test Tour',
    steps: [
      { id: 's1', title: 'Step One', description: 'First step description' },
      { id: 's2', title: 'Step Two', description: 'Second step description' },
      { id: 's3', title: 'Step Three', description: 'Third step description' },
    ],
    ...overrides,
  };
}

/**
 * Renders a TourProvider with a child that exposes tour context via buttons/text
 * so tests can drive the tour and inspect state without touching internals.
 */
function renderWithTourControls(tour?: TourDefinition) {
  const tourDef = tour ?? makeTour();

  function Controls() {
    const ctx = useTour();
    return (
      <div>
        <span data-testid="status">{ctx.status()}</span>
        <span data-testid="step-index">{ctx.currentStepIndex()}</span>
        <span data-testid="step-title">{ctx.currentStep()?.title ?? 'none'}</span>
        <span data-testid="progress">{Math.round(ctx.progress())}</span>
        <span data-testid="tour-name">{ctx.tourName()}</span>
        <span data-testid="total-steps">{ctx.totalSteps()}</span>
        <button data-testid="start" onClick={() => ctx.start(tourDef)}>
          Start
        </button>
        <button data-testid="complete-step" onClick={() => ctx.completeStep()}>
          Complete
        </button>
        <button data-testid="skip-step" onClick={() => ctx.skipStep()}>
          Skip
        </button>
        <button data-testid="pause" onClick={() => ctx.pause()}>
          Pause
        </button>
        <button data-testid="resume" onClick={() => ctx.resume()}>
          Resume
        </button>
        <button data-testid="cancel" onClick={() => ctx.cancel()}>
          Cancel
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

describe('TourProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Context provision ────────────────────────────────────────────────────

  it('provides context to children', () => {
    renderWithTourControls();
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('throws when useTour is called outside TourProvider', () => {
    function Orphan() {
      useTour();
      return <div />;
    }
    expect(() => render(() => <Orphan />)).toThrow('useTour must be used within TourProvider');
  });

  // ── Starting a tour ──────────────────────────────────────────────────────

  it('starts a tour and sets status to running', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));

    expect(screen.getByTestId('status')).toHaveTextContent('running');
    expect(screen.getByTestId('step-index')).toHaveTextContent('0');
    expect(screen.getByTestId('step-title')).toHaveTextContent('Step One');
    expect(screen.getByTestId('tour-name')).toHaveTextContent('Test Tour');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('3');
  });

  it('calls onEnter for the first step when starting', () => {
    const onEnter = vi.fn();
    const tour = makeTour({
      steps: [
        { id: 's1', title: 'First', description: 'desc', onEnter },
        { id: 's2', title: 'Second', description: 'desc' },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  // ── Step navigation — completeStep ───────────────────────────────────────

  it('advances to the next step on completeStep', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete-step'));

    expect(screen.getByTestId('step-index')).toHaveTextContent('1');
    expect(screen.getByTestId('step-title')).toHaveTextContent('Step Two');
  });

  it('calls onComplete callback for the completed step', () => {
    const onStepComplete = vi.fn();
    const tour = makeTour({
      steps: [
        { id: 's1', title: 'First', description: 'd', onComplete: onStepComplete },
        { id: 's2', title: 'Second', description: 'd' },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete-step'));

    expect(onStepComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onEnter for the next step when advancing', () => {
    const onEnterSecond = vi.fn();
    const tour = makeTour({
      steps: [
        { id: 's1', title: 'First', description: 'd' },
        { id: 's2', title: 'Second', description: 'd', onEnter: onEnterSecond },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete-step'));

    expect(onEnterSecond).toHaveBeenCalledTimes(1);
  });

  it('completes the tour after the last step', () => {
    const onTourComplete = vi.fn();
    const tour = makeTour({
      steps: [{ id: 's1', title: 'Only', description: 'd' }],
      onComplete: onTourComplete,
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('complete-step'));

    expect(screen.getByTestId('status')).toHaveTextContent('completed');
    expect(onTourComplete).toHaveBeenCalledTimes(1);
  });

  // ── Step navigation — skipStep ───────────────────────────────────────────

  it('skips the current step and moves to the next', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('skip-step'));

    expect(screen.getByTestId('step-index')).toHaveTextContent('1');
    expect(screen.getByTestId('step-title')).toHaveTextContent('Step Two');
  });

  it('skipping the last step completes the tour', () => {
    const onTourComplete = vi.fn();
    const tour = makeTour({
      steps: [{ id: 's1', title: 'Only', description: 'd' }],
      onComplete: onTourComplete,
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('skip-step'));

    expect(screen.getByTestId('status')).toHaveTextContent('completed');
    expect(onTourComplete).toHaveBeenCalledTimes(1);
  });

  // ── Progress tracking ────────────────────────────────────────────────────

  it('calculates progress based on completed and skipped steps', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));

    // 0 of 3 done
    expect(screen.getByTestId('progress')).toHaveTextContent('0');

    // Complete step 1 → 1/3 ≈ 33%
    fireEvent.click(screen.getByTestId('complete-step'));
    expect(screen.getByTestId('progress')).toHaveTextContent('33');

    // Skip step 2 → 2/3 ≈ 67%
    fireEvent.click(screen.getByTestId('skip-step'));
    expect(screen.getByTestId('progress')).toHaveTextContent('67');
  });

  it('returns 0 progress when no steps exist', () => {
    renderWithTourControls();
    expect(screen.getByTestId('progress')).toHaveTextContent('0');
  });

  // ── Pause / Resume ──────────────────────────────────────────────────────

  it('pauses the tour', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('pause'));

    expect(screen.getByTestId('status')).toHaveTextContent('paused');
  });

  it('resumes the tour from paused state', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('pause'));
    fireEvent.click(screen.getByTestId('resume'));

    expect(screen.getByTestId('status')).toHaveTextContent('running');
  });

  // ── Cancel ───────────────────────────────────────────────────────────────

  it('cancels the tour and resets all state', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('cancel'));

    expect(screen.getByTestId('status')).toHaveTextContent('cancelled');
    expect(screen.getByTestId('step-index')).toHaveTextContent('-1');
    expect(screen.getByTestId('step-title')).toHaveTextContent('none');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('0');
  });

  // ── Idle state accessors ─────────────────────────────────────────────────

  it('returns null currentStep and empty tourName when idle', () => {
    renderWithTourControls();
    expect(screen.getByTestId('step-title')).toHaveTextContent('none');
    expect(screen.getByTestId('tour-name')).toHaveTextContent('');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('0');
  });

  // ── Portal rendering ─────────────────────────────────────────────────────

  it('renders TourHighlight and TourPanel via Portal when running', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));

    // The panel should be in the document (rendered via Portal into body)
    expect(document.querySelector('.sk-tour__panel')).toBeInTheDocument();
  });

  it('renders TourHighlight and TourPanel when paused', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('pause'));

    expect(document.querySelector('.sk-tour__panel')).toBeInTheDocument();
  });

  it('does not render overlay when idle', () => {
    renderWithTourControls();
    expect(document.querySelector('.sk-tour__panel')).not.toBeInTheDocument();
  });

  it('does not render overlay after cancel', () => {
    renderWithTourControls();
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('cancel'));

    expect(document.querySelector('.sk-tour__panel')).not.toBeInTheDocument();
  });

  // ── Validation polling ───────────────────────────────────────────────────

  it('auto-completes step when validation check returns true', () => {
    const [valid, setValid] = createSignal(false);
    const tour = makeTour({
      steps: [
        {
          id: 's1',
          title: 'Validated',
          description: 'd',
          validation: { description: 'Waiting...', check: () => valid(), interval: 100 },
        },
        { id: 's2', title: 'Next', description: 'd' },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));

    // Not yet valid
    vi.advanceTimersByTime(200);
    expect(screen.getByTestId('step-title')).toHaveTextContent('Validated');

    // Make valid
    setValid(true);
    vi.advanceTimersByTime(150);
    expect(screen.getByTestId('step-title')).toHaveTextContent('Next');
  });

  it('does not auto-complete when tour is paused', () => {
    const tour = makeTour({
      steps: [
        {
          id: 's1',
          title: 'Validated',
          description: 'd',
          validation: { description: 'Wait', check: () => true, interval: 100 },
        },
        { id: 's2', title: 'Next', description: 'd' },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('pause'));

    vi.advanceTimersByTime(500);
    // Should still be on the first step because tour is paused
    expect(screen.getByTestId('step-title')).toHaveTextContent('Validated');
  });

  it('uses default 500ms interval when validation.interval is not set', () => {
    const check = vi.fn(() => false);
    const tour = makeTour({
      steps: [
        {
          id: 's1',
          title: 'Validated',
          description: 'd',
          validation: { description: 'Wait', check },
        },
      ],
    });
    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));

    // At 400ms, should not have been called yet (interval is 500ms)
    vi.advanceTimersByTime(400);
    expect(check).not.toHaveBeenCalled();

    // At 500ms, should fire
    vi.advanceTimersByTime(100);
    expect(check).toHaveBeenCalled();
  });

  // ── Multi-step walkthrough ───────────────────────────────────────────────

  it('walks through all steps and completes the tour', () => {
    const onTourComplete = vi.fn();
    const tour = makeTour({ onComplete: onTourComplete });

    renderWithTourControls(tour);
    fireEvent.click(screen.getByTestId('start'));

    fireEvent.click(screen.getByTestId('complete-step')); // s1 → s2
    expect(screen.getByTestId('step-title')).toHaveTextContent('Step Two');

    fireEvent.click(screen.getByTestId('complete-step')); // s2 → s3
    expect(screen.getByTestId('step-title')).toHaveTextContent('Step Three');

    fireEvent.click(screen.getByTestId('complete-step')); // s3 → done
    expect(screen.getByTestId('status')).toHaveTextContent('completed');
    expect(onTourComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('progress')).toHaveTextContent('100');
  });
});
