import { type Component, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/RecordButton/RecordButton.css';

/** Props for the RecordButton component. */
export interface RecordButtonProps {
  /** Whether recording is currently active.
   * @default false */
  recording?: boolean;
  /** Callback when recording state is toggled.
   * @param recording - The new recording state */
  onToggle?: (recording: boolean) => void;
  /** Disable the button.
   * @default false */
  disabled?: boolean;
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

const SIZE_MAP = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

/** Toggle button with recording state indicator. Shows a pulsing red dot when recording. */
export const RecordButton: Component<RecordButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'recording',
    'onToggle',
    'disabled',
    'size',
    'class',
    'style',
  ]);

  const size = () => local.size ?? 'md';
  const px = () => SIZE_MAP[size()];

  const handleClick = () => {
    if (!local.disabled) {
      local.onToggle?.(!local.recording);
    }
  };

  const rootClass = () =>
    [
      'sk-record-btn',
      `sk-record-btn--${size()}`,
      local.recording ? 'sk-record-btn--recording' : '',
      local.disabled ? 'sk-record-btn--disabled' : '',
      local.class ?? '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <button
      type="button"
      class={rootClass()}
      style={local.style}
      disabled={local.disabled}
      onClick={handleClick}
      aria-label={local.recording ? 'Stop recording' : 'Start recording'}
      aria-pressed={local.recording ?? false}
      data-testid="record-button"
      {...others}
    >
      <span
        class={`sk-record-btn__dot${local.recording ? ' sk-record-btn__dot--pulse' : ''}`}
        style={{ width: `${px() * 0.4}px`, height: `${px() * 0.4}px` }}
        data-testid="record-button-dot"
      />
    </button>
  );
};
