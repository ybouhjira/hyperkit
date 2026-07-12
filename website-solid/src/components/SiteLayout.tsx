/**
 * Shared site shell: top navigation, content slot, footer.
 * Owned by the coordinator — page agents compose inside it, not around it.
 */
import type { ParentProps } from 'solid-js';
import { A } from '@solidjs/router';
import { useTheme } from '@ybouhjira/hyperkit';
import './site-layout.css';

const NAV_LINKS = [
  { href: '/docs/getting-started/installation', label: 'Docs' },
  { href: '/docs/components', label: 'Components' },
  { href: '/demos', label: 'Demos' },
] as const;

export function SiteLayout(props: ParentProps) {
  const theme = useTheme();
  const isDark = () => !theme.theme().id?.includes('light');

  return (
    <div class="site-shell">
      <header class="site-nav">
        <A href="/" class="site-nav__brand">
          <span class="site-nav__logo" aria-hidden="true">
            H
          </span>
          HyperKit
        </A>
        <nav class="site-nav__links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <A href={link.href} class="site-nav__link" activeClass="site-nav__link--active">
              {link.label}
            </A>
          ))}
        </nav>
        <span class="site-nav__spacer" />
        <a
          class="site-nav__link"
          href="https://hyperkit-explorer.vercel.app"
          target="_blank"
          rel="noreferrer"
        >
          Explorer ↗
        </a>
        <a
          class="site-nav__link"
          href="https://github.com/ybouhjira/hyperkit"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
        <button
          type="button"
          class="site-nav__theme-toggle"
          aria-label={isDark() ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => theme.setTheme(isDark() ? 'github-light' : 'fjord')}
        >
          {isDark() ? '☾' : '☀'}
        </button>
      </header>
      <div class="site-content">{props.children}</div>
      <footer class="site-footer">
        <span class="site-footer__dot" aria-hidden="true" />
        <span>HyperKit — MIT © 2024–2026 contributors</span>
        <span class="site-nav__spacer" />
        <a
          href="https://www.npmjs.com/package/@ybouhjira/hyperkit"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
        <A href="/docs/getting-started/installation">Docs</A>
        <A href="/demos">Demos</A>
      </footer>
    </div>
  );
}
