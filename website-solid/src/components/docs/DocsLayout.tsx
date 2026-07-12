/**
 * Docs shell: sidebar (file-tree navigation), main column, and — per page —
 * an on-page toc rendered by the routes. Also carries the `docs--dark` class
 * that switches shiki-highlighted code between its light and dark palettes.
 */
import { createSignal, createEffect, type ParentProps } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { useTheme } from '@ybouhjira/hyperkit';
import { DocsSidebar } from './DocsSidebar';
import './docs.css';

export function currentDocsSlug(pathname: string): string {
  const match = /\/docs(?:\/(.*))?$/.exec(pathname);
  return decodeURIComponent(match?.[1] ?? '').replace(/\/$/, '');
}

export function DocsLayout(props: ParentProps) {
  const theme = useTheme();
  const location = useLocation();
  const isDark = () => !theme.theme().id?.includes('light');
  const slug = () => currentDocsSlug(location.pathname);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  // Close the mobile sidebar whenever navigation happens.
  createEffect(() => {
    slug();
    setSidebarOpen(false);
  });

  return (
    <div class="docs" classList={{ 'docs--dark': isDark(), 'docs--sidebar-open': sidebarOpen() }}>
      <div class="docs-mobilebar">
        <button
          type="button"
          class="docs-mobilebar__toggle"
          aria-expanded={sidebarOpen()}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen() ? '✕ Close' : '☰ Menu'}
        </button>
        <span class="docs-mobilebar__crumb">docs/{slug() || 'overview'}</span>
      </div>
      <DocsSidebar currentSlug={slug()} />
      {props.children}
    </div>
  );
}
