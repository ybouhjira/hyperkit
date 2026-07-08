import {
  createSignal,
  createEffect,
  createContext,
  useContext,
  onCleanup,
  createMemo,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import type { Component, JSX, Accessor } from 'solid-js';
import type { TourDefinition, TourStep, TourStatus, StepStatus, StepState } from './types';
import { TourPanel } from './TourPanel';
import { TourHighlight } from './TourHighlight';
import './GuidedTour.css';

interface TourContextValue {
  status: Accessor<TourStatus>;
  currentStep: Accessor<TourStep | null>;
  currentStepIndex: Accessor<number>;
  steps: Accessor<StepState[]>;
  progress: Accessor<number>;
  tourName: Accessor<string>;
  totalSteps: Accessor<number>;
  start: (tour: TourDefinition) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  skipStep: () => void;
  completeStep: () => void;
}

export interface TourProviderProps {
  children: JSX.Element;
}

const TourContext = createContext<TourContextValue>();

export const TourProvider: Component<TourProviderProps> = (props) => {
  const [tourDef, setTourDef] = createSignal<TourDefinition | null>(null);
  const [stepStates, setStepStates] = createSignal<StepState[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(-1);
  const [status, setStatus] = createSignal<TourStatus>('idle');

  const currentStep = createMemo(() => {
    const idx = currentIndex();
    const steps = stepStates();
    return idx >= 0 && idx < steps.length ? (steps[idx] as TourStep) : null;
  });

  const progress = createMemo(() => {
    const steps = stepStates();
    if (steps.length === 0) return 0;
    const completed = steps.filter(
      (s) => s.status === 'completed' || s.status === 'skipped'
    ).length;
    return (completed / steps.length) * 100;
  });

  const tourName = createMemo(() => tourDef()?.name || '');
  const totalSteps = createMemo(() => stepStates().length);

  const advanceToNext = () => {
    const idx = currentIndex();
    const steps = stepStates();
    const tour = tourDef();

    if (idx + 1 < steps.length) {
      // Move to next step
      setCurrentIndex(idx + 1);
      setStepStates((prev) =>
        prev.map((s, i) => (i === idx + 1 ? { ...s, status: 'active' as StepStatus } : s))
      );
      steps[idx + 1]?.onEnter?.();
    } else {
      // Tour completed
      setStatus('completed');
      tour?.onComplete?.();
    }
  };

  const start = (tour: TourDefinition) => {
    const initialSteps: StepState[] = tour.steps.map((step, i) => ({
      ...step,
      status: i === 0 ? 'active' : 'pending',
    }));

    setTourDef(tour);
    setStepStates(initialSteps);
    setCurrentIndex(0);
    setStatus('running');
    tour.steps[0]?.onEnter?.();
  };

  const pause = () => {
    setStatus('paused');
  };

  const resume = () => {
    setStatus('running');
  };

  const cancel = () => {
    setStatus('cancelled');
    setTourDef(null);
    setStepStates([]);
    setCurrentIndex(-1);
  };

  const skipStep = () => {
    const idx = currentIndex();
    setStepStates((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status: 'skipped' as StepStatus } : s))
    );
    advanceToNext();
  };

  const completeStep = () => {
    const idx = currentIndex();
    const step = currentStep();

    setStepStates((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status: 'completed' as StepStatus } : s))
    );

    step?.onComplete?.();
    advanceToNext();
  };

  // Validation polling effect
  createEffect(() => {
    const step = currentStep();
    const tourStatus = status();

    if (tourStatus !== 'running' || !step?.validation) {
      return;
    }

    const validation = step.validation;
    const interval = validation.interval != null ? validation.interval : 500;

    const checkValidation = () => {
      if (status() === 'running' && validation.check()) {
        completeStep();
      }
    };

    const intervalId = setInterval(checkValidation, interval);

    onCleanup(() => {
      clearInterval(intervalId);
    });
  });

  const value: TourContextValue = {
    status,
    currentStep,
    currentStepIndex: currentIndex,
    steps: stepStates,
    progress,
    tourName,
    totalSteps,
    start,
    pause,
    resume,
    cancel,
    skipStep,
    completeStep,
  };

  return (
    <TourContext.Provider value={value}>
      {props.children}
      <Portal>
        {(status() === 'running' || status() === 'paused') && (
          <>
            <TourHighlight />
            <TourPanel />
          </>
        )}
      </Portal>
    </TourContext.Provider>
  );
};

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within TourProvider');
  }
  return ctx;
}
