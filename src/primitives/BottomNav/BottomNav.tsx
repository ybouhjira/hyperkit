import { type Component, type JSX, For, Show, splitProps } from 'solid-js';
import './BottomNav.css';

export interface BottomNavItem {
  /** Stable identifier for the item. Passed to `onSelect`. */
  id: string;
  /** Human-readable label rendered below the icon. */
  label: string;
  /** Icon — JSX element (e.g., a lucide icon), string (emoji/glyph), or undefined for label-only. */
  icon?: JSX.Element | string;
  /**
   * Route path for active detection. When `activePath` is provided on the parent
   * and it starts with this value, the tab is treated as active.
   */
  to?: string;
  /**
   * Badge count or label. Numbers render as a count pill (capped at 99+).
   * Strings render as-is (e.g., "New").
   */
  badge?: number | string;
  /** Disable interaction for this item.
   * @default false */
  disabled?: boolean;
}

export interface BottomNavProps {
  /** Array of navigation items (2–5 recommended). */
  items: BottomNavItem[];
  /** Controlled active item id. If omitted, falls back to `activePath` matching. */
  activeId?: string;
  /**
   * Current route path used for automatic active detection from `item.to`.
   * Only used when `activeId` is not provided.
   */
  activePath?: string;
  /** Called when a non-disabled item is tapped. */
  onSelect?: (id: string) => void;
  /**
   * Position variant.
   * - `'bottom'` — fixed to viewport bottom, 64px height, z-index above content.
   * - `'top'` — positioned at the top of its container (non-fixed).
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';
  /** When true, renders nothing.
   * @default false */
  hidden?: boolean;
  /** Accessible label for the `<nav>` landmark.
   * @default 'Navigation' */
  'aria-label'?: string;
  /** Additional class applied to the root `<nav>`. */
  class?: string;
  /** Inline style merged onto the root `<nav>`. */
  style?: JSX.CSSProperties;
}

const MAX_BADGE_COUNT = 99;

/**
 * Mobile bottom navigation bar (or top-positioned tab strip) for e-commerce
 * and app shell use cases. Handles icon + label + badge per tab, active state,
 * and optional route-path matching.
 *
 * Touch targets are 44×44 px minimum (WCAG AAA). The `bottom` variant honors
 * `env(safe-area-inset-bottom)` for iOS home indicator clearance.
 *
 * @example
 * ```tsx
 * import { BottomNav } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 * import { ShoppingCart, Home, User, Search } from "lucide-solid";
 *
 * const [active, setActive] = createSignal("home");
 *
 * <BottomNav
 *   activeId={active()}
 *   onSelect={setActive}
 *   items={[
 *     { id: "home",   label: "Home",   icon: <Home size={20} /> },
 *     { id: "search", label: "Search", icon: <Search size={20} /> },
 *     { id: "cart",   label: "Cart",   icon: <ShoppingCart size={20} />, badge: 3 },
 *     { id: "me",     label: "Account", icon: <User size={20} /> },
 *   ]}
 * />
 * ```
 *
 * @see MobileBottomBar - the legacy composite with the same concept
 * @see Tabs - for desktop horizontal tab switching
 */
export const BottomNav: Component<BottomNavProps> = (props) => {
  const [local] = splitProps(props, [
    'items',
    'activeId',
    'activePath',
    'onSelect',
    'position',
    'hidden',
    'aria-label',
    'class',
    'style',
  ]);

  const position = () => local.position ?? 'bottom';

  const isActive = (item: BottomNavItem) => {
    if (local.activeId != null) return item.id === local.activeId;
    if (local.activePath != null && item.to != null) {
      return local.activePath.startsWith(item.to);
    }
    return false;
  };

  const handleClick = (item: BottomNavItem) => {
    if (item.disabled) return;
    local.onSelect?.(item.id);
  };

  const renderBadge = (badge: number | string) => {
    const label =
      typeof badge === 'number'
        ? badge > MAX_BADGE_COUNT
          ? `${MAX_BADGE_COUNT}+`
          : String(badge)
        : badge;
    return (
      <span class="sk-bottom-nav__badge" aria-label={`${label} notifications`}>
        {label}
      </span>
    );
  };

  return (
    <Show when={!local.hidden}>
      <nav
        class={`sk-bottom-nav sk-bottom-nav--${position()}${local.class ? ` ${local.class}` : ''}`}
        style={local.style}
        data-testid="bottom-nav"
        aria-label={local['aria-label'] ?? 'Navigation'}
        role="navigation"
      >
        <For each={local.items}>
          {(item) => {
            const active = () => isActive(item);
            return (
              <button
                type="button"
                class={`sk-bottom-nav__item${active() ? ' sk-bottom-nav__item--active' : ''}${item.disabled ? ' sk-bottom-nav__item--disabled' : ''}`}
                data-testid={`bottom-nav-item-${item.id}`}
                data-active={active() ? '' : undefined}
                aria-current={active() ? 'page' : undefined}
                aria-label={item.label}
                disabled={item.disabled}
                onClick={() => handleClick(item)}
              >
                <Show when={item.icon != null}>
                  <span class="sk-bottom-nav__icon" data-testid={`bottom-nav-icon-${item.id}`}>
                    {item.icon}
                    <Show when={item.badge !== undefined && item.badge !== 0 && item.badge !== ''}>
                      {renderBadge(item.badge ?? 0)}
                    </Show>
                  </span>
                </Show>
                {/* Badge without icon — floats next to label */}
                <Show
                  when={
                    item.icon == null &&
                    item.badge !== undefined &&
                    item.badge !== 0 &&
                    item.badge !== ''
                  }
                >
                  {renderBadge(item.badge ?? 0)}
                </Show>
                <span class="sk-bottom-nav__label">{item.label}</span>
              </button>
            );
          }}
        </For>
      </nav>
    </Show>
  );
};
