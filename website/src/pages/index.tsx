import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import LivePlayground from '@site/src/components/LivePlayground';
import { getDemo } from '@site/src/data/demos';

import './home.css';

const EXPLORER_URL = 'https://hyperkit-explorer.vercel.app';
const NPM_URL = 'https://www.npmjs.com/package/@ybouhjira/hyperkit';

const STATS: { value: string; label: string }[] = [
  { value: '131', label: 'components' },
  { value: '5,015+', label: 'tests in one gate' },
  { value: '40', label: 'theme presets' },
  { value: '16', label: 'workspace packages' },
  { value: 'MIT', label: 'licensed, on npm' },
];

const SYSTEMS: { icon: string; title: string; body: ReactNode; tags: string[] }[] = [
  {
    icon: '▤',
    title: 'Panel system',
    body: (
      <>
        Resizable, dockable, drag-to-rearrange IDE layouts with persistence —{' '}
        <code>PanelContainer</code>, <code>PanelGroup</code>, <code>PanelResizeHandle</code>.
      </>
    ),
    tags: ['dock', 'resize', 'persist'],
  },
  {
    icon: '⌘',
    title: 'Navigation registry',
    body: (
      <>
        One action registry drives the command palette, shortcuts, and AI agents — with 5
        middleware, transports, and record/replay.
      </>
    ),
    tags: ['⌘K', 'undo/redo', 'mcp'],
  },
  {
    icon: '◑',
    title: '40 theme presets',
    body: (
      <>
        Every visual value flows through <code>--sk-*</code> tokens. Swap one preset and the whole
        tree re-skins — light or dark.
      </>
    ),
    tags: ['tokens', 'light', 'dark'],
  },
  {
    icon: '◈',
    title: 'Diagram engine',
    body: (
      <>
        A framework-agnostic graph core with Dagre + force layouts, edge routing, pan/zoom, and
        SolidJS bindings.
      </>
    ),
    tags: ['dagre', 'force', 'svg'],
  },
  {
    icon: 'ƒ',
    title: 'Effect services',
    body: (
      <>
        Typed WebSocket, Session, FileSystem, Clipboard, and Logging services — errors modelled in
        the type system, not swallowed.
      </>
    ),
    tags: ['typed', 'ws', 'logging'],
  },
  {
    icon: '⌗',
    title: 'MCP server',
    body: (
      <>
        Ships an MCP server so your AI tools read the component docs like a teammate —{' '}
        <code>search_components</code>, <code>get_component</code>.
      </>
    ),
    tags: ['ai', 'tools', 'docs'],
  },
];

function Hero(): ReactNode {
  return (
    <header className="hk2-hero">
      <div className="hk2-wrap">
        <span className="hk2-badge">
          <span className="dot" />
          latest on npm&nbsp;·&nbsp;131 components&nbsp;·&nbsp;MIT
        </span>
        <h1 className="hk2-title">
          Build <span className="hk2-hl">IDE-grade</span> apps,
          <br />
          not just interfaces.
        </h1>
        <p className="hk2-sub">
          HyperKit is an <b>application platform for SolidJS</b> — 131 components, resizable panel
          layouts, a navigation / action registry, 40 themes, a diagram engine, typed Effect
          services, and an MCP server. This whole site is built with it.
        </p>
        <div className="hk2-ctas">
          <Link className="hk2-btn hk2-btn-primary" to="/docs/getting-started/installation">
            Get started →
          </Link>
          <Link className="hk2-btn hk2-btn-ghost" to="/demos">
            See live demos
          </Link>
          <Link className="hk2-btn hk2-btn-quiet" href={NPM_URL}>
            npm i @ybouhjira/hyperkit
          </Link>
        </div>
      </div>
    </header>
  );
}

function Stats(): ReactNode {
  return (
    <div className="hk2-stats">
      <div className="hk2-wrap hk2-stats-in">
        {STATS.map((s) => (
          <div className="hk2-stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedDemo(): ReactNode {
  const demo = getDemo('issue-tracker');
  if (!demo) return null;
  return (
    <section className="hk2-section">
      <div className="hk2-wrap">
        <span className="hk2-label">01 — real apps, running live</span>
        <h2 className="hk2-h2">
          Not swatches. Whole surfaces,
          <br />
          built entirely from HyperKit.
        </h2>
        <p className="hk2-sec-sub">
          Every demo below is a real application composed from HyperKit and running live in your
          browser — edit the code and it recompiles. Here&apos;s a GitHub-style issue tracker in{' '}
          <b>one component</b>.
        </p>
        <div className="hk2-stage">
          <LivePlayground code={demo.code} />
        </div>
      </div>
    </section>
  );
}

function MoreDemos(): ReactNode {
  const ids = ['agent-sessions', 'kanban'] as const;
  return (
    <section className="hk2-section hk2-section-alt">
      <div className="hk2-wrap">
        <span className="hk2-label">02 — more live demos</span>
        <h2 className="hk2-h2">Dashboards, boards, chat — all live.</h2>
        <div className="hk2-demo-grid">
          {ids.map((id) => {
            const demo = getDemo(id);
            if (!demo) return null;
            return (
              <div className="hk2-demo-card" key={id}>
                <div className="hk2-demo-card-head">
                  <h3>{demo.name}</h3>
                  <div className="hk2-chips">
                    {demo.built.map((c) => (
                      <code key={c}>{c}</code>
                    ))}
                  </div>
                </div>
                <div className="hk2-stage">
                  <LivePlayground code={demo.code} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="hk2-demo-cta">
          <Link className="hk2-btn hk2-btn-ghost" to="/demos">
            Explore all 5 demos →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Systems(): ReactNode {
  return (
    <section className="hk2-section">
      <div className="hk2-wrap">
        <span className="hk2-label">03 — systems, not widgets</span>
        <h2 className="hk2-h2">
          The parts other libraries
          <br />
          tell you to build yourself.
        </h2>
        <p className="hk2-sec-sub">
          Most kits stop at buttons. HyperKit ships the hard layers — the ones every serious app
          ends up hand-rolling.
        </p>
        <div className="hk2-sys-grid">
          {SYSTEMS.map((s) => (
            <div className="hk2-sys-card" key={s.title}>
              <span className="hk2-sys-icon" aria-hidden>
                {s.icon}
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <div className="hk2-chips">
                {s.tags.map((t) => (
                  <code key={t}>{t}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta(): ReactNode {
  return (
    <section className="hk2-final">
      <div className="hk2-wrap">
        <h2>Ship the app, not the plumbing.</h2>
        <p>
          Install once, compose the systems, theme with tokens. Everything on this page is in the
          box.
        </p>
        <div className="hk2-ctas hk2-ctas-center">
          <Link className="hk2-btn hk2-btn-primary" to="/docs/getting-started/installation">
            Get started →
          </Link>
          <Link className="hk2-btn hk2-btn-ghost" href={EXPLORER_URL}>
            Browse all components
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="IDE-grade apps for SolidJS"
      description="HyperKit — 131 SolidJS components, resizable panels, a navigation/action registry, 40 themes, a diagram engine, typed Effect services, and an MCP server. See it running live."
    >
      <div className="hk2">
        <Hero />
        <Stats />
        <FeaturedDemo />
        <MoreDemos />
        <Systems />
        <FinalCta />
      </div>
    </Layout>
  );
}
