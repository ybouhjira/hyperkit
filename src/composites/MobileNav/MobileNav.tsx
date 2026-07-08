import { Component, Show, createSignal, createEffect } from 'solid-js';
import { Badge } from '../../primitives/Badge';
import { Select } from '../../primitives/Select';
import type { SelectOption } from '../../primitives/Select';
import { useBreakpoint } from '../../hooks';
import type { Breakpoint } from '../../hooks';
import './MobileNav.css';

export type MobileNavSessionStatus = 'idle' | 'streaming' | 'error';

export interface MobileNavSession {
  id: string;
  name: string;
  status: MobileNavSessionStatus;
  unreadCount?: number;
}

export interface MobileNavProps {
  sessions: MobileNavSession[];
  activeSessionId?: string;
  onSessionSelect?: (id: string) => void;
  hideAbove?: Breakpoint;
  class?: string;
}

export const MobileNav: Component<MobileNavProps> = (props) => {
  const breakpoint = useBreakpoint();
  const [_isOpen, setIsOpen] = createSignal(false);

  const hideAbove = () => props.hideAbove ?? 'tablet';

  const shouldHide = () => {
    const current = breakpoint();
    const hide = hideAbove();

    const breakpointOrder: Breakpoint[] = ['phone', 'tablet', 'desktop', 'wide', 'tv'];
    const currentIndex = breakpointOrder.indexOf(current);
    const hideIndex = breakpointOrder.indexOf(hide);

    return currentIndex > hideIndex;
  };

  const activeSession = () =>
    props.sessions.find((s) => s.id === props.activeSessionId) ?? props.sessions[0];

  const selectOptions = (): SelectOption[] => {
    return props.sessions.map((session) => ({
      value: session.id,
      label: session.name,
    }));
  };

  const handleSessionChange = (id: string) => {
    setIsOpen(false);
    props.onSessionSelect?.(id);
  };

  createEffect(() => {
    if (shouldHide()) {
      setIsOpen(false);
    }
  });

  return (
    <Show when={!shouldHide()}>
      <nav
        class={`sk-mobile-nav ${props.class ?? ''}`}
        data-testid="mobile-nav"
        aria-label="Mobile navigation"
      >
        <div class="sk-mobile-nav__content">
          <Show when={activeSession()}>
            {(session) => (
              <>
                <div class="sk-mobile-nav__session">
                  <span
                    class={`sk-mobile-nav__status sk-mobile-nav__status--${session().status}`}
                    data-testid="session-status"
                  />
                  <span class="sk-mobile-nav__session-name">{session().name}</span>
                  <Show when={(session().unreadCount ?? 0) > 0}>
                    <Badge variant="info" type="count" count={session().unreadCount} />
                  </Show>
                </div>

                <div class="sk-mobile-nav__selector">
                  <Select
                    options={selectOptions()}
                    value={props.activeSessionId}
                    onChange={handleSessionChange}
                    placeholder="Select session"
                  />
                </div>
              </>
            )}
          </Show>
        </div>
      </nav>
    </Show>
  );
};
