import { type JSX, type Component, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/FilterChip/FilterChip.css';

/** Props for the FilterChip component. */
export interface FilterChipProps {
  /** Text label displayed in the chip. */
  label: string;
  /** Whether the chip is in selected/active state.
   * @default false */
  selected?: boolean;
  /** Callback fired when the chip is toggled.
   * @param selected - The new selected state */
  onToggle?: (selected: boolean) => void;
  /** Custom accent color for the selected state (CSS color value). */
  color?: string;
  /** Icon element rendered before the label. */
  icon?: JSX.Element;
  /** Disable chip interaction.
   * @default false */
  disabled?: boolean;
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md';
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

/** Toggleable filter pill button for selecting/deselecting filter categories. */
export const FilterChip: Component<FilterChipProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'selected',
    'onToggle',
    'color',
    'icon',
    'disabled',
    'size',
    'class',
    'style',
  ]);

  const handleClick = () => {
    if (!local.disabled) {
      local.onToggle?.(!local.selected);
    }
  };

  const rootClass = () =>
    [
      'sk-filter-chip',
      `sk-filter-chip--${local.size ?? 'md'}`,
      local.selected ? 'sk-filter-chip--selected' : '',
      local.disabled ? 'sk-filter-chip--disabled' : '',
      local.class ?? '',
    ]
      .filter(Boolean)
      .join(' ');

  const colorStyle = (): JSX.CSSProperties => {
    const base = local.style ?? {};
    if (local.color && local.selected) {
      return { ...base, '--sk-filter-chip-accent': local.color } as JSX.CSSProperties;
    }
    return base;
  };

  return (
    <button
      aria-pressed={local.selected ?? false}
      aria-disabled={local.disabled}
      disabled={local.disabled}
      class={rootClass()}
      style={colorStyle()}
      onClick={handleClick}
      type="button"
      data-testid="filter-chip"
      {...others}
    >
      {local.icon !== undefined && <span class="sk-filter-chip__icon">{local.icon}</span>}
      <span class="sk-filter-chip__label">{local.label}</span>
    </button>
  );
};
