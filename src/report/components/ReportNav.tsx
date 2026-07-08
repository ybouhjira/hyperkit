import { type Component, splitProps, For, createSignal, onMount, onCleanup } from 'solid-js';

export interface ReportNavLink {
  id: string;
  label: string;
}

export interface ReportNavProps {
  brand: string;
  links: ReportNavLink[];
  activeId?: string;
  onLinkClick?: (id: string) => void;
}

export const ReportNav: Component<ReportNavProps> = (props) => {
  const [local, others] = splitProps(props, ['brand', 'links', 'activeId', 'onLinkClick']);
  const [scrolled, setScrolled] = createSignal(false);
  let sentinelRef!: HTMLDivElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinelRef);
    onCleanup(() => observer.disconnect());
  });

  return (
    <>
      <div ref={sentinelRef} style={{ height: '1px', 'margin-bottom': '-1px' }} />
      <nav class={`sk-report-nav ${scrolled() ? 'sk-report-nav--scrolled' : ''}`} {...others}>
        <div class="sk-report-nav__inner">
          <div class="sk-report-nav__brand">{local.brand}</div>
          <div class="sk-report-nav__links">
            <For each={local.links}>
              {(link) => (
                <button
                  class={`sk-report-nav__link ${local.activeId === link.id ? 'sk-report-nav__link--active' : ''}`}
                  onClick={() => local.onLinkClick?.(link.id)}
                >
                  {link.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </nav>
    </>
  );
};
