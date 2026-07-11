import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import LivePlayground from '@site/src/components/LivePlayground';
import { DEMOS, type DemoApp } from '@site/src/data/demos';

import './demos.css';

const EXPLORER_URL = 'https://hyperkit-explorer.vercel.app';

function DemoSection({ demo, index }: { demo: DemoApp; index: number }): ReactNode {
  const num = String(index + 1).padStart(2, '0');
  return (
    <section className="demo" id={demo.id}>
      <div className="demo-head">
        <span className="demo-num">{num}</span>
        <div className="demo-head-text">
          <h2>{demo.name}</h2>
          <p>{demo.tagline}</p>
          <div className="demo-chips">
            {demo.built.map((c) => (
              <code key={c} className="demo-chip">
                {c}
              </code>
            ))}
          </div>
        </div>
      </div>
      <div className="demo-stage">
        <LivePlayground code={demo.code} />
      </div>
    </section>
  );
}

export default function Demos(): ReactNode {
  return (
    <Layout
      title="Demo apps"
      description="Complete, editable, live applications built entirely from HyperKit components — issue trackers, agent dashboards, kanban boards, chat, and analytics."
    >
      <header className="demos-hero">
        <div className="demos-wrap">
          <span className="demos-badge">
            <span className="dot" />
            live &amp; editable — edit any snippet, the preview recompiles
          </span>
          <h1>Demo apps</h1>
          <p className="demos-sub">
            Not component swatches — whole application surfaces, each built entirely from HyperKit
            and running live in your browser. Edit the code and watch it recompile; switch the
            preview theme to see every value re-flow through <code>--sk-*</code> tokens.
          </p>
          <div className="demos-ctas">
            <Link className="demos-btn demos-btn-primary" to="/docs/getting-started/installation">
              Get started →
            </Link>
            <Link className="demos-btn demos-btn-ghost" href={EXPLORER_URL}>
              Browse all components
            </Link>
          </div>
          <nav className="demos-jump" aria-label="Jump to a demo">
            {DEMOS.map((d) => (
              <a key={d.id} href={`#${d.id}`}>
                {d.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="demos-main">
        <div className="demos-wrap">
          {DEMOS.map((demo, i) => (
            <DemoSection key={demo.id} demo={demo} index={i} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
