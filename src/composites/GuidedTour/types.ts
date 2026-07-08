export type TourType = 'task-based' | 'walkthrough';
export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type TourStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface StepValidation {
  description: string;
  check: () => boolean;
  interval?: number;
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  validation?: StepValidation;
  onEnter?: () => void;
  onComplete?: () => void;
}

export interface TourDefinition {
  id: string;
  name: string;
  type?: TourType;
  description?: string;
  steps: TourStep[];
  onComplete?: () => void;
}

export interface StepState extends TourStep {
  status: StepStatus;
}
