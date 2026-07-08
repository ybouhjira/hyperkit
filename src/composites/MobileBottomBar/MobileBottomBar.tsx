import { Component, For, JSX, Show, splitProps } from 'solid-js';

/**
 * A single item in the {@link MobileBottomBar}.
 *
 * Shape is intentionally minimal and portable: `label` + `icon` map 1:1 to
 * Qt Quick `TabButton { text; icon }` and Android `BottomNavigationView`
 * menu items.
 */
export interface MobileBottomBarItem {
  /** Stable id — what {@link MobileBottomBarProps.onSelect} receives. */
  id: string;
  /** Human-readable label rendered under the icon. */
  label: string;
  /**
   * Icon node. Accepts JSX (any SolidKit Icon, SVG, or Image) or a string
   * (rendered as-is — useful for emoji or icon-font glyphs).
   */
  icon: JSX.Element | string;
  /** Optional badge — number renders as count, string renders as dot/label. */
  badge?: number | string;
  /** Disable interaction for this item.
   * @default false */
  disabled?: boolean;
}

/**
 * Props for {@link MobileBottomBar}.
 *
 * Follows the HyperKit items-array convention: parent owns selection state
 * via `activeId` + `onSelect`. This matches `Tabs`, `Accordion`, `MenuBar`.
 */
export interface MobileBottomBarProps {
  /** Navigation items rendered left-to-right. 2-5 items is the recommended range. */
  items: MobileBottomBarItem[];
  /** Currently active item id. If unset, no item is highlighted. */
  activeId?: string;
  /** Called when a user taps a non-disabled item. */
  onSelect?: (id: string) => void;
  /**
   * When true, the bar renders nothing. The primitive itself is viewport-agnostic —
   * consumers use `useBreakpoint()` (or their own logic) to decide when to hide
   * it on larger screens.
   * @default false */
  hidden?: boolean;
  /** Accessible label for the <nav> landmark.
   * @default 'Primary' */
  'aria-label'?: string;
  /** Additional class applied to the root <nav>. */
  class?: string;
  /** Inline style merged onto the root <nav>. */
  style?: JSX.CSSProperties;
}

const BAR_MIN_HEIGHT = '56px';
const TOUCH_TARGET = '44px';

/**
 * Fixed bottom navigation bar for mobile apps. Honors iOS
 * `env(safe-area-inset-bottom)` so it lifts above the home indicator and
 * Android gesture bar.
 *
 * Layout: `position: fixed; bottom: 0; left: 0; right: 0` — the same pattern
 * used by Qt `ToolBar` anchored to the window bottom and Android
 * `BottomNavigationView` inside a `CoordinatorLayout`. Every item has a
 * 44×44 touch target (WCAG AAA), 2px top indicator bar on the active item.
 *
 * The primitive is viewport-agnostic: the consumer decides when to render it
 * (typically only when `useBreakpoint()` returns `'phone'` or `'tablet'`).
 *
 * @example
 * ```tsx
 * import { MobileBottomBar, useBreakpoint } from "@ybouhjira/hyperkit";
 *
 * const bp = useBreakpoint();
 * const [active, setActive] = createSignal('home');
 *
 * <Show when={bp() === 'phone'}>
 *   <MobileBottomBar
 *     activeId={active()}
 *     onSelect={setActive}
 *     items={[
 *       { id: 'home', label: 'Home', icon: '🏠' },
 *       { id: 'chat', label: 'Chat', icon: '💬', badge: 3 },
 *       { id: 'me',   label: 'Me',   icon: '👤' },
 *     ]}
 *   />
 * </Show>
 * ```
 */
export const MobileBottomBar: Component<MobileBottomBarProps> = (props) => {
  const [local] = splitProps(props, [
    'items',
    'activeId',
    'onSelect',
    'hidden',
    'aria-label',
    'class',
    'style',
  ]);

  const rootStyle = (): JSX.CSSProperties => ({
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    'align-items': 'stretch',
    'justify-content': 'space-around',
    'min-height': BAR_MIN_HEIGHT,
    background: 'var(--sk-bg-secondary)',
    'border-top': '1px solid var(--sk-border)',
    'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
    'z-index': 'var(--sk-z-sticky, 100)',
    ...(local.style ?? {}),
  });

  const handleClick = (item: MobileBottomBarItem) => {
    if (item.disabled) return;
    local.onSelect?.(item.id);
  };

  return (
    <Show when={!local.hidden}>
      <nav
        class={local.class}
        style={rootStyle()}
        data-sk-mobile-bottom-bar=""
        data-sk-safe-area-bottom=""
        data-testid="mobile-bottom-bar"
        aria-label={local['aria-label'] ?? 'Primary'}
        role="navigation"
      >
        <For each={local.items}>
          {(item) => {
            const isActive = () => local.activeId === item.id;
            return (
              <button
                type="button"
                data-testid={`mobile-bottom-bar-item-${item.id}`}
                data-active={isActive() ? '' : undefined}
                aria-current={isActive() ? 'page' : undefined}
                aria-label={item.label}
                disabled={item.disabled}
                onClick={() => handleClick(item)}
                style={{
                  flex: '1 1 0',
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  'justify-content': 'center',
                  gap: 'var(--sk-space-2xs)',
                  'min-width': TOUCH_TARGET,
                  'min-height': TOUCH_TARGET,
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  background: 'transparent',
                  border: 'none',
                  'border-top': isActive() ? '2px solid var(--sk-accent)' : '2px solid transparent',
                  color: isActive() ? 'var(--sk-accent)' : 'var(--sk-text-secondary)',
                  'font-size': 'var(--sk-font-size-xs)',
                  'font-family': 'inherit',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  transition:
                    'color var(--sk-duration-fast) var(--sk-ease-default), border-color var(--sk-duration-fast) var(--sk-ease-default)',
                }}
              >
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'font-size': 'var(--sk-icon-lg, 20px)',
                    'line-height': '1',
                  }}
                  data-testid={`mobile-bottom-bar-icon-${item.id}`}
                >
                  {item.icon}
                  <Show when={item.badge !== undefined && item.badge !== ''}>
                    <span
                      data-testid={`mobile-bottom-bar-badge-${item.id}`}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        'min-width': 'var(--sk-space-md)',
                        height: 'var(--sk-space-md)',
                        padding: '0 var(--sk-space-2xs)',
                        'border-radius': '9999px',
                        background: 'var(--sk-error)',
                        color: 'var(--sk-text-on-accent)',
                        'font-size': 'var(--sk-font-size-xs)',
                        'font-weight': 'var(--sk-font-weight-semibold)',
                        display: 'inline-flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'line-height': '1',
                      }}
                    >
                      {item.badge}
                    </span>
                  </Show>
                </span>
                <span
                  style={{
                    'max-width': '100%',
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }}
        </For>
      </nav>
    </Show>
  );
};
