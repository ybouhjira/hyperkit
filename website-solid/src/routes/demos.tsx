/**
 * /demos — live demo-apps gallery, ported from the Docusaurus page.
 * Every demo renders through the shared LivePlayground (editable, recompiles).
 */
import { Title, Meta } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { DEMOS } from '../data/demos';
import { EXPLORER_URL } from '../data/site-links';
import { DemoSection } from '../components/demos/DemoSection';
import '../components/demos/demos.css';

export default function Demos() {
  return (
    <>
      <Title>Demo apps — HyperKit</Title>
      <Meta
        name="description"
        content="Complete, editable, live applications built entirely from HyperKit components — issue trackers, agent dashboards, kanban boards, chat, and analytics."
      />
      <header class="demos-hero">
        <div class="demos-wrap">
          <span class="demos-badge">
            <span class="dot" />
            live &amp; editable — edit any snippet, the preview recompiles
          </span>
          <h1>Demo apps</h1>
          <p class="demos-sub">
            Not component swatches — whole application surfaces, each built entirely from HyperKit
            and running live in your browser. Edit the code and watch it recompile; switch the
            preview theme to see every value re-flow through <code>--sk-*</code> tokens.
          </p>
          <div class="demos-ctas">
            <A class="demos-btn demos-btn-primary" href="/docs/getting-started/installation">
              Get started →
            </A>
            <a
              class="demos-btn demos-btn-ghost"
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
            >
              Browse all components
            </a>
          </div>
          <nav class="demos-jump" aria-label="Jump to a demo">
            <For each={DEMOS}>{(d) => <a href={`#${d.id}`}>{d.name}</a>}</For>
          </nav>
        </div>
      </header>

      <main class="demos-main">
        <div class="demos-wrap">
          <For each={DEMOS}>{(demo, i) => <DemoSection demo={demo} index={i()} />}</For>
        </div>
      </main>
    </>
  );
}
