/** Hero (badge, headline, CTAs, IDE window) + the stats strip below it. */
import { A } from '@solidjs/router';
import { EXPLORER_URL } from '../../data/site-links';
import { IdeWindow } from './IdeWindow';

export function Hero() {
  return (
    <header class="hk-hero">
      <div class="wrap">
        <span class="hero-badge">
          <span class="dot" />
          v-latest on npm&nbsp;&nbsp;·&nbsp;&nbsp;131 components&nbsp;&nbsp;·&nbsp;&nbsp;MIT
        </span>
        <h1>
          Build <span class="hl">IDE-grade</span> apps,
          <br />
          not just interfaces.
          <span class="caret" />
        </h1>
        <p class="hero-sub">
          HyperKit is an <b>application platform for SolidJS</b> — 131 components, resizable panel
          layouts, a navigation/action registry, 40 themes, a diagram engine, typed Effect services,
          and an MCP server so your AI tools read the docs like a teammate.
        </p>
        <div class="hero-ctas">
          <A class="btn btn-primary" href="/docs/getting-started/installation">
            Get started →
          </A>
          <a class="btn btn-ghost" href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Open the Explorer <kbd>⌘K</kbd>
          </a>
        </div>

        <IdeWindow />
      </div>
    </header>
  );
}

export function Stats() {
  return (
    <div class="stats">
      <div class="wrap">
        <div class="stats-in">
          <div class="stat">
            <b>131</b>
            <span>components</span>
          </div>
          <div class="stat">
            <b>
              5,015<em>+</em>
            </b>
            <span>tests in one gate</span>
          </div>
          <div class="stat">
            <b>39</b>
            <span>theme presets</span>
          </div>
          <div class="stat">
            <b>16</b>
            <span>workspace packages</span>
          </div>
          <div class="stat">
            <b>MIT</b>
            <span>license, on npm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
