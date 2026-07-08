import { type JSX, type Component, splitProps, createMemo, createSignal, For, DEV } from 'solid-js';
import { validateProps } from '../../utils/validateProps';
import './SegmentedControl.css';

/** A single option within a SegmentedControl. */
export interface SegmentedControlOption {
  /** Display label for this option. */
  label: string;
  /** Value returned when this option is selected. */
  value: string;
  /** Disable this individual option.
   * @default false */
  disabled?: boolean;
}

/** Props for the SegmentedControl component. */
export interface SegmentedControlProps {
  /** Options to display in the control. */
  options: SegmentedControlOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled mode. */
  defaultValue?: string;
  /** Called when the selected option changes. */
  onChange?: (value: string) => void;
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the full width of the container.
   * @default false */
  fullWidth?: boolean;
  /** Disable all options.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
  /** Strip default styling classes.
   * @default false */
  unstyled?: boolean;
  /** Accessible label for the radiogroup. */
  'aria-label'?: string;
}

/**
 * Segmented control for selecting a single option from a small, mutually-exclusive set.
 * Renders as a radiogroup with keyboard navigation (ArrowLeft/ArrowRight).
 *
 * @example
 * ```tsx
 * import { SegmentedControl } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Uncontrolled
 * <SegmentedControl
 *   options={[
 *     { label: 'Day', value: 'day' },
 *     { label: 'Week', value: 'week' },
 *     { label: 'Month', value: 'month' },
 *   ]}
 *   defaultValue="week"
 *   onChange={(v) => console.log(v)}
 * />
 *
 * // Controlled
 * const [view, setView] = createSignal('list');
 * <SegmentedControl
 *   options={[{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }]}
 *   value={view()}
 *   onChange={setView}
 * />
 * ```
 *
 * @see Tabs - for larger content sections
 * @see FilterChip - for multi-select filtering
 */
export const SegmentedControl: Component<SegmentedControlProps> = (props) => {
  if (DEV) {
    validateProps('SegmentedControl', props, {
      size: { oneOf: ['sm', 'md', 'lg'] as const },
    });
  }

  const [local, others] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'size',
    'fullWidth',
    'disabled',
    'class',
    'style',
    'unstyled',
    'aria-label',
  ]);

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = createSignal<string | undefined>(local.defaultValue);

  // Resolved selected value — controlled takes precedence
  const selectedValue = createMemo(() => local.value ?? internalValue());

  const size = createMemo(() => local.size ?? 'md');

  const enabledOptions = createMemo(() => local.options.filter((o) => !o.disabled));

  const selectedIndex = createMemo(() =>
    local.options.findIndex((o) => o.value === selectedValue())
  );

  const enabledSelectedIndex = createMemo(() =>
    enabledOptions().findIndex((o) => o.value === selectedValue())
  );

  const indicatorStyle = createMemo((): JSX.CSSProperties => {
    const idx = selectedIndex();
    const total = local.options.length;
    if (idx === -1 || total === 0) return { display: 'none' };
    const pct = 100 / total;
    return {
      width: `${pct}%`,
      transform: `translateX(${idx * 100}%)`,
    };
  });

  const selectOption = (option: SegmentedControlOption) => {
    if (local.disabled || option.disabled) return;
    const val = option.value;
    // Update internal state for uncontrolled mode
    if (local.value === undefined) {
      setInternalValue(val);
    }
    local.onChange?.(val);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;
    const enabled = enabledOptions();
    if (enabled.length === 0) return;

    let nextIndex = enabledSelectedIndex();

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (nextIndex + 1) % enabled.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (nextIndex - 1 + enabled.length) % enabled.length;
    } else {
      return;
    }

    const next = enabled[nextIndex];
    if (next) selectOption(next);
  };

  const rootClass = createMemo(() => {
    if (local.unstyled) return local.class ?? '';
    return [
      'sk-segmented-control',
      `sk-segmented-control--${size()}`,
      local.fullWidth ? 'sk-segmented-control--full-width' : '',
      local.disabled ? 'sk-segmented-control--disabled' : '',
      local.class ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  return (
    <div
      role="radiogroup"
      aria-label={local['aria-label']}
      aria-disabled={local.disabled}
      class={rootClass()}
      style={local.style}
      onKeyDown={handleKeyDown}
      data-testid="segmented-control"
      {...others}
    >
      {/* Sliding indicator */}
      {!local.unstyled && (
        <div class="sk-segmented-control__indicator" style={indicatorStyle()} aria-hidden="true" />
      )}

      <For each={local.options}>
        {(option) => {
          const isSelected = createMemo(() => option.value === selectedValue());
          const isDisabled = createMemo(() => !!(local.disabled || option.disabled));

          const optionClass = createMemo(() => {
            if (local.unstyled) return '';
            return [
              'sk-segmented-control__option',
              isSelected() ? 'sk-segmented-control__option--selected' : '',
            ]
              .filter(Boolean)
              .join(' ');
          });

          return (
            <button
              role="radio"
              aria-checked={isSelected()}
              aria-disabled={isDisabled()}
              disabled={isDisabled()}
              tabIndex={isSelected() ? 0 : -1}
              class={optionClass()}
              data-selected={isSelected() ? '' : undefined}
              data-disabled={isDisabled() ? '' : undefined}
              onClick={() => selectOption(option)}
              type="button"
            >
              <span class={local.unstyled ? '' : 'sk-segmented-control__option-label'}>
                {option.label}
              </span>
            </button>
          );
        }}
      </For>
    </div>
  );
};
