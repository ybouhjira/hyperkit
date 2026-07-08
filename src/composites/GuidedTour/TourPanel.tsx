import { Component, For, Show } from 'solid-js';
import { useTour } from './TourProvider';
import { ProgressBar } from '../../primitives/ProgressBar';
import { Icon } from '../../icons';

export const TourPanel: Component = () => {
  const tour = useTour();

  const isPaused = () => tour.status() === 'paused';

  const handlePlayPause = () => {
    if (isPaused()) {
      tour.resume();
    } else {
      tour.pause();
    }
  };

  return (
    <div class="sk-tour__panel">
      <div class="sk-tour__panel-header">
        <div class="sk-tour__panel-header-text">
          <div class="sk-tour__panel-title">{tour.tourName()}</div>
          <div class="sk-tour__panel-subtitle">
            Step {tour.currentStepIndex() + 1} of {tour.totalSteps()}
          </div>
        </div>
        <div class="sk-tour__panel-actions">
          <button
            class="sk-tour__panel-action-btn"
            onClick={handlePlayPause}
            aria-label={isPaused() ? 'Resume tour' : 'Pause tour'}
          >
            <Icon name={isPaused() ? 'play' : 'pause'} size="sm" />
          </button>
          <button
            class="sk-tour__panel-action-btn"
            onClick={() => tour.cancel()}
            aria-label="Close tour"
          >
            <Icon name="x" size="sm" />
          </button>
        </div>
      </div>

      <div class="sk-tour__panel-body">
        <div class="sk-tour__checklist">
          <For each={tour.steps()}>
            {(step, index) => (
              <div class={`sk-tour__checklist-item sk-tour__checklist-item--${step.status}`}>
                <div class="sk-tour__checklist-dot">
                  <Show
                    when={step.status === 'completed'}
                    fallback={
                      <Show when={step.status === 'skipped'} fallback={index() + 1}>
                        <Icon name="x" size="xs" />
                      </Show>
                    }
                  >
                    <Icon name="check" size="xs" />
                  </Show>
                </div>
                <div class="sk-tour__checklist-label">{step.title}</div>
              </div>
            )}
          </For>
        </div>

        <Show when={tour.currentStep()}>
          {(step) => (
            <div class="sk-tour__step-detail">
              <div class="sk-tour__step-number">Step {tour.currentStepIndex() + 1}</div>
              <div class="sk-tour__step-title">{step().title}</div>
              <div class="sk-tour__step-description">{step().description}</div>
              <Show when={step().validation}>
                {(validation) => (
                  <div class="sk-tour__step-validation">
                    <div class="sk-tour__validation-spinner" />
                    <span>{validation().description}</span>
                  </div>
                )}
              </Show>
            </div>
          )}
        </Show>
      </div>

      <div class="sk-tour__panel-footer">
        <ProgressBar value={tour.progress()} size="sm" />
        <div class="sk-tour__panel-buttons">
          <button
            class="sk-tour__panel-btn sk-tour__panel-btn--skip"
            onClick={() => tour.skipStep()}
          >
            Skip Step
          </button>
          <button class="sk-tour__panel-btn sk-tour__panel-btn--end" onClick={() => tour.cancel()}>
            End Tour
          </button>
        </div>
      </div>
    </div>
  );
};
