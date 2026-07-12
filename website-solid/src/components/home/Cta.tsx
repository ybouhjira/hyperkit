/** Install CTA terminal window + the status-bar footer strip. */
import { A } from '@solidjs/router';
import { EXPLORER_URL, GITHUB_URL, NPM_URL } from '../../data/site-links';
import { Lights } from './Lights';

export function InstallCta() {
  return (
    <section class="cta">
      <div class="wrap">
        <div class="win">
          <div class="win-t">
            <Lights />
            <span class="name">zsh — ~/your-next-app</span>
          </div>
          <div class="cta-term">
            <span class="cmt"># peer deps (solid-js, effect) install automatically</span>
            <br />
            <span class="ps1">$</span> npm install @ybouhjira/hyperkit
            <br />
            <span class="ok">✓</span> added 1 package — 131 components, 6 systems, 40 themes
            <br />
            <span class="ps1">$</span> <span class="cursor" />
          </div>
        </div>
        <div class="cta-links">
          <A class="btn btn-primary" href="/docs/getting-started/installation">
            Read the docs
          </A>
          <a class="btn btn-ghost" href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Browse 131 components
          </a>
          <a class="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export function StatusStrip() {
  return (
    <div class="status-strip">
      <div class="foot-in">
        <span>hyperkit</span>
        <A href="/docs/getting-started/installation">docs</A>
        <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
          explorer
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          github
        </a>
        <a href={NPM_URL} target="_blank" rel="noreferrer">
          npm
        </a>
        <span class="right">
          <span class="okdot" />
          MIT · SolidJS today, React next
        </span>
      </div>
    </div>
  );
}
