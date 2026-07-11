import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import './home.css';

const EXPLORER_URL = 'https://hyperkit-explorer.vercel.app';
const GITHUB_URL = 'https://github.com/ybouhjira/hyperkit';
const NPM_URL = 'https://www.npmjs.com/package/@ybouhjira/hyperkit';

function Lights() {
  return (
    <div className="lights">
      <i />
      <i />
      <i />
    </div>
  );
}

function IdeWindow() {
  return (
    <div className="ide">
      <input className="tsel" type="radio" name="hk-tabs" id="hk-t1" defaultChecked />
      <input className="tsel" type="radio" name="hk-tabs" id="hk-t2" />
      <input className="tsel" type="radio" name="hk-tabs" id="hk-t3" />

      <div className="ide-title">
        <Lights />
        <div className="ide-menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Run</span>
          <span>Terminal</span>
          <span>Help</span>
        </div>
        <span className="doc">hyperkit — zed-dark</span>
      </div>

      <div className="ide-tabs">
        <label className="ide-tab" htmlFor="hk-t1">
          <i className="fdot tsx" />
          App.tsx
        </label>
        <label className="ide-tab" htmlFor="hk-t2">
          <i className="fdot tsx" />
          dashboard.tsx
        </label>
        <label className="ide-tab" htmlFor="hk-t3">
          <i className="fdot ts" />
          actions.ts
        </label>
      </div>

      <div className="ide-body">
        {/* file tree */}
        <aside className="ide-side">
          <div className="side-h">Explorer</div>
          <div className="tree">
            <details open>
              <summary>hyperkit</summary>
              <details open>
                <summary>packages</summary>
                <span className="leaf">diagram-core</span>
                <span className="leaf">diagram-solid</span>
                <span className="leaf">editor</span>
                <span className="leaf">mcp</span>
              </details>
              <details open>
                <summary>src</summary>
                <details open>
                  <summary>primitives</summary>
                  <span className="leaf on"><i className="fdot tsx" />Button</span>
                  <span className="leaf"><i className="fdot tsx" />Card</span>
                  <span className="leaf"><i className="fdot tsx" />Dialog</span>
                </details>
                <span className="leaf">composites</span>
                <span className="leaf">navigation</span>
                <span className="leaf">panels</span>
                <span className="leaf"><i className="fdot ts" />theme/presets.ts</span>
              </details>
              <span className="leaf"><i className="fdot ts" />llms.txt</span>
            </details>
          </div>
        </aside>

        {/* code panes */}
        <div className="ide-code">
          <div className="pane pane-1">
            <div className="cl"><span className="ln">1</span><span className="cd"><span className="k">import</span> &#123; <span className="f">Button</span>, <span className="f">ThemeProvider</span>, <span className="f">themePresets</span> &#125; <span className="k">from</span> <span className="s">'@ybouhjira/hyperkit'</span>;</span></div>
            <div className="cl"><span className="ln">2</span><span className="cd"><span className="k">import</span> <span className="s">'@ybouhjira/hyperkit/dist/index.css'</span>;</span></div>
            <div className="cl"><span className="ln">3</span><span className="cd"> </span></div>
            <div className="cl"><span className="ln">4</span><span className="cd"><span className="k">function</span> <span className="f">App</span>() &#123;</span></div>
            <div className="cl"><span className="ln">5</span><span className="cd">  <span className="k">return</span> (</span></div>
            <div className="cl"><span className="ln">6</span><span className="cd">    &lt;<span className="c">ThemeProvider</span> <span className="p">theme</span>=&#123;themePresets[<span className="s">'zed-dark'</span>]&#125;&gt;</span></div>
            <div className="cl hlrow"><span className="ln">7</span><span className="cd">      &lt;<span className="c">Button</span> <span className="p">variant</span>=<span className="s">"primary"</span> <span className="p">size</span>=<span className="s">"md"</span>&gt;<span className="cursor" /></span></div>
            <div className="cl"><span className="ln">8</span><span className="cd">        Get Started</span></div>
            <div className="cl"><span className="ln">9</span><span className="cd">      &lt;/<span className="c">Button</span>&gt;</span></div>
            <div className="cl"><span className="ln">10</span><span className="cd">    &lt;/<span className="c">ThemeProvider</span>&gt;</span></div>
            <div className="cl"><span className="ln">11</span><span className="cd">  );</span></div>
            <div className="cl"><span className="ln">12</span><span className="cd">&#125;</span></div>
            <div className="cl"><span className="ln">13</span><span className="cd"> </span></div>
            <div className="cl"><span className="ln">14</span><span className="cd"><span className="m">{'// SSR works out of the box — see docs/SSR.md'}</span></span></div>
          </div>

          <div className="pane pane-2">
            <div className="cl"><span className="ln">1</span><span className="cd"><span className="k">import</span> &#123; <span className="f">PanelContainer</span>, <span className="f">PanelGroup</span>, <span className="f">FileExplorer</span>, <span className="f">KanbanBoard</span> &#125; <span className="k">from</span> <span className="s">'@ybouhjira/hyperkit'</span>;</span></div>
            <div className="cl"><span className="ln">2</span><span className="cd"> </span></div>
            <div className="cl"><span className="ln">3</span><span className="cd"><span className="m">{'// IDE-style resizable, dockable panel layout'}</span></span></div>
            <div className="cl"><span className="ln">4</span><span className="cd">&lt;<span className="c">PanelContainer</span> <span className="p">persistKey</span>=<span className="s">"workspace"</span>&gt;</span></div>
            <div className="cl"><span className="ln">5</span><span className="cd">  &lt;<span className="c">PanelGroup</span> <span className="p">direction</span>=<span className="s">"row"</span>&gt;</span></div>
            <div className="cl hlrow"><span className="ln">6</span><span className="cd">    &lt;<span className="c">Panel</span> <span className="p">minSize</span>=&#123;180&#125; <span className="p">collapsible</span>&gt;<span className="cursor" /></span></div>
            <div className="cl"><span className="ln">7</span><span className="cd">      &lt;<span className="c">FileExplorer</span> <span className="p">mode</span>=<span className="s">"two-pane"</span> <span className="p">preview</span> /&gt;</span></div>
            <div className="cl"><span className="ln">8</span><span className="cd">    &lt;/<span className="c">Panel</span>&gt;</span></div>
            <div className="cl"><span className="ln">9</span><span className="cd">    &lt;<span className="c">PanelResizeHandle</span> /&gt;</span></div>
            <div className="cl"><span className="ln">10</span><span className="cd">    &lt;<span className="c">Panel</span>&gt;</span></div>
            <div className="cl"><span className="ln">11</span><span className="cd">      &lt;<span className="c">KanbanBoard</span> <span className="p">columns</span>=&#123;columns&#125; <span className="p">onMove</span>=&#123;dispatch&#125; /&gt;</span></div>
            <div className="cl"><span className="ln">12</span><span className="cd">    &lt;/<span className="c">Panel</span>&gt;</span></div>
            <div className="cl"><span className="ln">13</span><span className="cd">  &lt;/<span className="c">PanelGroup</span>&gt;</span></div>
            <div className="cl"><span className="ln">14</span><span className="cd">&lt;/<span className="c">PanelContainer</span>&gt;</span></div>
          </div>

          <div className="pane pane-3">
            <div className="cl"><span className="ln">1</span><span className="cd"><span className="k">import</span> &#123; <span className="f">createNavigable</span>, <span className="f">dispatchAction</span>, <span className="f">generateMCPTools</span> &#125; <span className="k">from</span> <span className="s">'@ybouhjira/hyperkit'</span>;</span></div>
            <div className="cl"><span className="ln">2</span><span className="cd"> </span></div>
            <div className="cl"><span className="ln">3</span><span className="cd"><span className="m">{'// Register UI actions once — keyboard, palette, and agents all reuse them'}</span></span></div>
            <div className="cl"><span className="ln">4</span><span className="cd"><span className="k">const</span> board = <span className="f">createNavigable</span>(<span className="s">'kanban'</span>, &#123;</span></div>
            <div className="cl"><span className="ln">5</span><span className="cd">  <span className="p">actions</span>: &#123; <span className="f">moveCard</span>, <span className="f">addColumn</span>, <span className="f">archive</span> &#125;,</span></div>
            <div className="cl"><span className="ln">6</span><span className="cd">  <span className="p">middleware</span>: [<span className="f">undoRedo</span>(), <span className="f">permissions</span>(role), <span className="f">rateLimit</span>(60)],</span></div>
            <div className="cl"><span className="ln">7</span><span className="cd">&#125;);</span></div>
            <div className="cl"><span className="ln">8</span><span className="cd"> </span></div>
            <div className="cl hlrow"><span className="ln">9</span><span className="cd"><span className="m">{'// Expose the same actions to AI agents as MCP tools'}</span><span className="cursor" /></span></div>
            <div className="cl"><span className="ln">10</span><span className="cd"><span className="k">export</span> <span className="k">const</span> tools = <span className="f">generateMCPTools</span>(board);</span></div>
            <div className="cl"><span className="ln">11</span><span className="cd"> </span></div>
            <div className="cl"><span className="ln">12</span><span className="cd"><span className="f">dispatchAction</span>(<span className="s">'kanban.moveCard'</span>, &#123; <span className="p">id</span>, <span className="p">to</span>: <span className="s">'done'</span> &#125;);</span></div>
          </div>
        </div>

        {/* live preview */}
        <aside className="ide-prev">
          <div className="prev-h">
            Preview{' '}
            <span className="live">
              <i />
              live
            </span>
          </div>

          <div className="prev-body pv-1">
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <span className="rb rb-primary">Get Started</span>
              <span className="rb rb-secondary">Docs</span>
            </div>
            <div className="rcard">
              <h4>zed-dark</h4>
              <p>One of 40 presets. Every visual value flows through --sk-* tokens.</p>
              <div className="meta">
                <span className="chip ok">a11y ✓</span>
                <span className="chip">SSR ✓</span>
                <span className="chip">tokens</span>
              </div>
            </div>
            <div className="rterm" style={{flex: '0 0 auto', marginTop: 'auto'}}>
              <span className="ok">✓</span> 5,015 tests passed <span className="dim">(vitest)</span>
              <br />
              <span className="ok">✓</span> visual regression <span className="dim">(playwright)</span>
            </div>
          </div>

          <div className="prev-body pv-2">
            <div className="mini-panels">
              <div className="mp-s">
                <div className="bar a" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
              <div className="mp-m mini-handle">
                files · board
                <span className="glow">drop panel here</span>
              </div>
              <div className="mp-t mini-handle">terminal — pnpm test ✓</div>
            </div>
            <div className="rcard">
              <h4>Persisted layout</h4>
              <p>
                Drag to rearrange, sizes saved under{' '}
                <code style={{fontFamily: 'var(--mono)', fontSize: '.9em'}}>persistKey</code>.
                Keyboard-resizable.
              </p>
            </div>
          </div>

          <div className="prev-body pv-3">
            <div className="rterm">
              <span className="dim">$</span> mcp tools/list
              <br />
              <span className="ok">→</span> kanban.moveCard
              <br />
              <span className="ok">→</span> kanban.addColumn
              <br />
              <span className="ok">→</span> kanban.archive
              <br />
              <span className="dim">3 tools generated from registry</span>
            </div>
            <div className="rcard">
              <h4>Undo / redo built in</h4>
              <p>Middleware wraps every dispatch — permissions, logging, rate limits, replay.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="ide-status">
        <span className="seg">
          <svg className="branch-ico" viewBox="0 0 12 12">
            <circle cx="3" cy="3" r="1.6" />
            <circle cx="3" cy="9" r="1.6" />
            <circle cx="9" cy="6" r="1.6" />
            <path d="M3 4.6v2.8M4.6 9c2.6 0 2.8-1.4 2.9-3" />
          </svg>
          <b>main</b>
        </span>
        <span className="seg">
          <b>131</b> components
        </span>
        <span className="seg">
          <b>5,015</b> tests
        </span>
        <span className="seg">
          <b>40</b> themes
        </span>
        <span className="seg">MIT</span>
        <span className="right seg">
          <span className="okdot" />
          TypeScript · SolidJS
        </span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="hk-hero">
      <div className="wrap">
        <span className="hero-badge">
          <span className="dot" />
          v-latest on npm&nbsp;&nbsp;·&nbsp;&nbsp;131 components&nbsp;&nbsp;·&nbsp;&nbsp;MIT
        </span>
        <h1>
          Build <span className="hl">IDE-grade</span> apps,
          <br />
          not just interfaces.<span className="caret" />
        </h1>
        <p className="hero-sub">
          HyperKit is an <b>application platform for SolidJS</b> — 131 components, resizable panel
          layouts, a navigation/action registry, 40 themes, a diagram engine, typed Effect
          services, and an MCP server so your AI tools read the docs like a teammate.
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" to="/docs/getting-started/installation">
            Get started →
          </Link>
          <Link className="btn btn-ghost" href={EXPLORER_URL}>
            Open the Explorer <kbd>⌘K</kbd>
          </Link>
        </div>

        <IdeWindow />
      </div>
    </header>
  );
}

function Stats() {
  return (
    <div className="stats">
      <div className="wrap">
        <div className="stats-in">
          <div className="stat">
            <b>131</b>
            <span>components</span>
          </div>
          <div className="stat">
            <b>
              5,015<em>+</em>
            </b>
            <span>tests in one gate</span>
          </div>
          <div className="stat">
            <b>39</b>
            <span>theme presets</span>
          </div>
          <div className="stat">
            <b>16</b>
            <span>workspace packages</span>
          </div>
          <div className="stat">
            <b>MIT</b>
            <span>license, on npm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Systems() {
  return (
    <section id="systems">
      <div className="wrap">
        <span className="sec-label">01 — systems, not widgets</span>
        <h2>
          The parts other libraries
          <br />
          tell you to build yourself.
        </h2>
        <p className="sec-sub">
          Most kits stop at buttons. HyperKit ships the hard layers — the ones every serious app
          ends up hand-rolling.
        </p>

        <div className="sys-grid">
          <div className="win">
            <div className="win-t">
              <Lights />
              <span className="name">panel-layout.tsx</span>
            </div>
            <div className="win-b">
              <div className="pan-demo">
                <div className="pd-a">
                  tree
                  <span className="h hv" />
                </div>
                <div className="pd-b">
                  editor
                  <span className="h hh" />
                </div>
                <div className="pd-c">inspect</div>
                <div className="pd-d">terminal</div>
              </div>
            </div>
            <div className="sys-body">
              <h3>Panel system</h3>
              <p>
                Resizable, dockable, drag-to-rearrange IDE layouts with layout persistence —{' '}
                <code>PanelContainer</code>, <code>PanelGroup</code>, <code>PanelResizeHandle</code>
                .
              </p>
            </div>
          </div>

          <div className="win">
            <div className="win-t">
              <Lights />
              <span className="name">navigation — registry</span>
            </div>
            <div className="win-b">
              <div className="nav-demo">
                <div className="nrow">
                  <span>⌘K palette</span>
                  <span className="arr">─→</span>
                  <span>dispatchAction()</span>
                </div>
                <div className="nrow">
                  <span>keyboard</span>
                  <span className="arr">─→</span>
                  <span className="tag on">undo/redo</span>
                  <span className="tag">perms</span>
                  <span className="tag">rate-limit</span>
                </div>
                <div className="nrow">
                  <span>AI agent</span>
                  <span className="arr">─→</span>
                  <span>generateMCPTools()</span>
                </div>
                <div className="nrow">
                  <span className="tag">record</span>
                  <span className="tag">replay</span>
                  <span className="tag">websocket</span>
                  <span className="tag">tauri</span>
                </div>
              </div>
            </div>
            <div className="sys-body">
              <h3>Navigation registry</h3>
              <p>
                One action registry drives the command palette, shortcuts, and agents — with 5
                middleware, transports, and recording/replay.
              </p>
            </div>
          </div>

          <div className="win">
            <div className="win-t">
              <Lights />
              <span className="name">services.ts — Effect</span>
            </div>
            <div className="win-b">
              <div className="fx-demo">
                WebSocketService <span className="ok">· typed</span>
                <br />
                FileSystemService <span className="ok">· typed</span>
                <br />
                ClipboardService <span className="ok">· typed</span>
                <br />
                <span className="err">catch (e: any)</span>{' '}
                <span style={{textDecoration: 'line-through'}}>soup</span> → Effect errors
              </div>
            </div>
            <div className="sys-body">
              <h3>Effect-TS services</h3>
              <p>
                WebSocket, Session, FileSystem, Clipboard, and Logging services with typed errors —
                failures live in the type system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AiSection() {
  return (
    <section id="ai">
      <div className="wrap">
        <span className="sec-label">02 — AI-native by design</span>
        <h2>
          Your AI assistant reads the docs
          <br />
          like a teammate would.
        </h2>
        <p className="sec-sub">
          HyperKit ships an MCP server, <code>llms.txt</code> / <code>llms-full.txt</code>, and a
          registry that exposes your app's actions as tools agents can call.
        </p>

        <div className="ai-grid">
          <div className="win">
            <div className="win-t">
              <Lights />
              <span className="name">claude — mcp session</span>
            </div>
            <div className="term-b">
              <span className="ps1">$</span>{' '}
              <span className="hi type-line">claude mcp add hyperkit-docs</span>
              <br />
              <span className="dim">✓ connected · 2 tools registered</span>
              <br />
              <br />
              <span className="dim">&gt;</span> <span className="out">search_components("kanban")</span>
              <br />
              <span className="hi">KanbanBoard</span>{' '}
              <span className="dim">— drag-drop columns, swimlanes,</span>
              <br />
              <span className="dim">&nbsp;&nbsp;WIP limits, onMove dispatch …</span>
              <br />
              <br />
              <span className="dim">&gt;</span>{' '}
              <span className="out">get_component("CommandPalette")</span>
              <br />
              <span className="hi">CommandPalette</span>{' '}
              <span className="dim">— props, slots, shortcuts,</span>
              <br />
              <span className="dim">&nbsp;&nbsp;a11y notes, 4 usage examples</span>
            </div>
          </div>

          <div className="ai-points">
            <div className="ai-point">
              <span className="ico">⌕</span>
              <div>
                <h3>MCP doc server</h3>
                <p>
                  <code>search_components</code> and <code>get_component</code> give agents the
                  exact API — no hallucinated props.
                </p>
              </div>
            </div>
            <div className="ai-point">
              <span className="ico">txt</span>
              <div>
                <h3>llms.txt shipped in the repo</h3>
                <p>
                  The whole catalog in machine-readable form — index and full API, versioned with
                  the code.
                </p>
              </div>
            </div>
            <div className="ai-point">
              <span className="ico">⚡</span>
              <div>
                <h3>Agents can drive your UI</h3>
                <p>
                  <code>generateMCPTools</code> turns the navigation registry into callable tools —
                  permissions and undo included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ThemeSwatch = {
  name: string;
  bg: string;
  side: string;
  sideBorder: string;
  bars: {color: string; width: string}[];
};

const THEME_SWATCHES: ThemeSwatch[] = [
  {
    name: 'zed-dark',
    bg: '#0e1419',
    side: '#171d24',
    sideBorder: '#232a33',
    bars: [
      {color: '#2472f2', width: '55%'},
      {color: '#232a33', width: '80%'},
      {color: '#232a33', width: '65%'},
    ],
  },
  {
    name: 'github-dark',
    bg: '#0d1117',
    side: '#010409',
    sideBorder: '#21262d',
    bars: [
      {color: '#f78166', width: '50%'},
      {color: '#21262d', width: '75%'},
      {color: '#21262d', width: '60%'},
    ],
  },
  {
    name: 'macos-light',
    bg: '#f5f5f7',
    side: '#e8e8ed',
    sideBorder: '#d2d2d7',
    bars: [
      {color: '#0071e3', width: '55%'},
      {color: '#d2d2d7', width: '80%'},
      {color: '#d2d2d7', width: '62%'},
    ],
  },
  {
    name: 'ubuntu-dark',
    bg: '#2c2226',
    side: '#3b3036',
    sideBorder: '#4a3d44',
    bars: [
      {color: '#e95420', width: '52%'},
      {color: '#4a3d44', width: '78%'},
      {color: '#4a3d44', width: '64%'},
    ],
  },
  {
    name: 'cyber-max',
    bg: '#07090e',
    side: '#0c1018',
    sideBorder: '#1d2635',
    bars: [
      {color: '#00ffd5', width: '58%'},
      {color: '#ff2d78', width: '40%'},
      {color: '#1d2635', width: '70%'},
    ],
  },
  {
    name: 'neon-studio',
    bg: '#111014',
    side: '#1a1820',
    sideBorder: '#2a2734',
    bars: [
      {color: '#c4ff4d', width: '52%'},
      {color: '#2a2734', width: '82%'},
      {color: '#2a2734', width: '58%'},
    ],
  },
  {
    name: 'ink-mono-dark',
    bg: '#101214',
    side: '#17191c',
    sideBorder: '#26292e',
    bars: [
      {color: '#e6e8ea', width: '48%'},
      {color: '#26292e', width: '76%'},
      {color: '#26292e', width: '60%'},
    ],
  },
  {
    name: 'ink-warm-light',
    bg: '#fbfaf8',
    side: '#f2efe9',
    sideBorder: '#e3ded4',
    bars: [
      {color: '#b3541e', width: '54%'},
      {color: '#e3ded4', width: '78%'},
      {color: '#e3ded4', width: '63%'},
    ],
  },
  {
    name: 'cursor-dark',
    bg: '#1e1e2a',
    side: '#26263a',
    sideBorder: '#35354e',
    bars: [
      {color: '#5e6ad2', width: '56%'},
      {color: '#35354e', width: '80%'},
      {color: '#35354e', width: '61%'},
    ],
  },
  {
    name: 'github-light',
    bg: '#ffffff',
    side: '#f6f8fa',
    sideBorder: '#e7ebef',
    bars: [
      {color: '#0969da', width: '52%'},
      {color: '#e7ebef', width: '79%'},
      {color: '#e7ebef', width: '60%'},
    ],
  },
  {
    name: 'productivity-blue',
    bg: '#1b2229',
    side: '#232c35',
    sideBorder: '#32404d',
    bars: [
      {color: '#4d9de0', width: '55%'},
      {color: '#32404d', width: '81%'},
      {color: '#32404d', width: '59%'},
    ],
  },
];

function Themes() {
  return (
    <section id="themes">
      <div className="wrap">
        <span className="sec-label">03 — token-first theming</span>
        <h2>
          40 presets. One variable away
          <br />
          from yours.
        </h2>
        <p className="sec-sub">
          Every visual value flows through <code>--sk-*</code> custom properties — enforced by
          HyperKit's own ESLint plugin in CI. Swap a theme, the whole app follows.
        </p>

        <div className="theme-grid">
          {THEME_SWATCHES.map((theme) => (
            <Link key={theme.name} className="tswatch" href={EXPLORER_URL}>
              <span className="tsw-win" style={{background: theme.bg}}>
                <span
                  className="tsw-side"
                  style={{background: theme.side, borderRight: `1px solid ${theme.sideBorder}`}}
                />
                <span className="tsw-main">
                  {theme.bars.map((bar, i) => (
                    <i key={i} style={{background: bar.color, width: bar.width}} />
                  ))}
                </span>
              </span>
              <span className="tsw-name">{theme.name}</span>
            </Link>
          ))}
          <Link className="tmore" href={EXPLORER_URL}>
            + 28 more →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Diagrams() {
  return (
    <section id="diagrams">
      <div className="wrap">
        <span className="sec-label">04 — diagram engine</span>
        <h2>
          A framework-agnostic graph core.
          <br />
          Rendered by anything.
        </h2>
        <p className="sec-sub">
          <code>diagram-core</code> owns layout and state; <code>diagram-svg</code> and{' '}
          <code>diagram-solid</code> render it. Dagre layouts, minimap, controls — DAGs, flows, and
          pipelines out of the box.
        </p>

        <div className="dia-wrap">
          <div className="win dia-win">
            <div className="win-t">
              <Lights />
              <span className="name">pipeline.diagram — dagreLayout</span>
              <span className="pan-hint">drag to pan →</span>
            </div>
            <div className="dia-canvas">
              <div className="dia-stage">
                <svg aria-hidden="true">
                  <path className="edge live" d="M 182 122 C 238 122 242 98 296 98" />
                  <path className="edge" d="M 182 122 C 238 122 242 188 296 188" />
                  <path className="edge live" d="M 444 98 C 498 98 496 146 552 146" />
                  <path className="edge" d="M 444 188 C 498 188 496 146 552 146" />
                </svg>
                <div className="dnode" style={{left: '34px', top: '92px'}}>
                  <div className="nh">
                    <i style={{background: '#79c0ff'}} />
                    source
                  </div>
                  <div className="nb">llms-full.txt · 131 docs</div>
                </div>
                <div className="dnode run" style={{left: '296px', top: '68px'}}>
                  <div className="nh">
                    <i />
                    parse
                  </div>
                  <div className="nb">running · 42ms</div>
                </div>
                <div className="dnode" style={{left: '296px', top: '158px'}}>
                  <div className="nh">
                    <i style={{background: '#ffa657'}} />
                    validate
                  </div>
                  <div className="nb">schema · zod</div>
                </div>
                <div className="dnode run" style={{left: '552px', top: '116px'}}>
                  <div className="nh">
                    <i />
                    render
                  </div>
                  <div className="nb">diagram-solid · 60fps</div>
                </div>
                <div className="dia-mini" aria-hidden="true">
                  <i style={{left: '8px', top: '17px'}} />
                  <i className="on" style={{left: '29px', top: '10px'}} />
                  <i style={{left: '29px', top: '26px'}} />
                  <i className="on" style={{left: '50px', top: '18px'}} />
                </div>
              </div>
            </div>
          </div>

          <div className="dia-side">
            <div className="win">
              <div className="win-t">
                <Lights />
                <span className="name">packages/</span>
              </div>
              <div className="win-b dia-list">
                <b>diagram-core</b> &nbsp;zero deps, pure TS
                <br />
                <b>diagram-svg</b> &nbsp;&nbsp;static rendering
                <br />
                <b>diagram-solid</b> &nbsp;interactive, pan/zoom
                <br />
                <span style={{color: 'var(--muted)'}}>+ gantt, sequence-diagram, timeline</span>
              </div>
            </div>
            <div className="win">
              <div className="win-t">
                <Lights />
                <span className="name">controls</span>
              </div>
              <div className="win-b" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                <span className="chip">MiniMap</span>
                <span className="chip">Controls</span>
                <span className="chip">dagreLayout</span>
                <span className="chip ok">pan / zoom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MARQUEE_TOP = [
  'ChatWindow',
  'CommandPalette',
  'KanbanBoard',
  'FileExplorer',
  'ThemeBuilder',
  'Table',
  'Timeline',
];
const MARQUEE_BOTTOM = [
  'Dialog',
  'ModelSelector',
  'CodeBlock',
  'SettingsPanel',
  'Sidebar',
  'TerminalOutput',
  'CostTracker',
];

function MarqueeBelt({names, reverse, imgBase}: {names: string[]; reverse?: boolean; imgBase: string}) {
  return (
    <div className="mq-belt">
      <div className={reverse ? 'mq rev' : 'mq'}>
        {[...names, ...names].map((name, i) => (
          <Link key={`${name}-${i}`} className="mcard" href={EXPLORER_URL}>
            <img
              src={`${imgBase}${name}.webp`}
              alt={i < names.length ? name : ''}
              width={230}
              height={144}
            />
            <span>{name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Gallery() {
  const imgBase = useBaseUrl('/img/components/');
  return (
    <div className="gallery">
      <div className="wrap">
        <span className="sec-label">05 — 131 components</span>
        <h2>
          From Button to KanbanBoard.
          <br />
          Feature-scaled, not fragmented.
        </h2>
        <p className="sec-sub" style={{marginBottom: 0}}>
          Fewer, larger components that grow with props — every one themed, tested, and documented
          in the live Explorer.
        </p>
      </div>
      <div className="belt-fade">
        <MarqueeBelt names={MARQUEE_TOP} imgBase={imgBase} />
        <MarqueeBelt names={MARQUEE_BOTTOM} reverse imgBase={imgBase} />
      </div>
    </div>
  );
}

function InstallCta() {
  return (
    <section className="cta">
      <div className="wrap">
        <div className="win">
          <div className="win-t">
            <Lights />
            <span className="name">zsh — ~/your-next-app</span>
          </div>
          <div className="cta-term">
            <span className="cmt"># peer deps (solid-js, effect) install automatically</span>
            <br />
            <span className="ps1">$</span> npm install @ybouhjira/hyperkit
            <br />
            <span className="ok">✓</span> added 1 package — 131 components, 6 systems, 40 themes
            <br />
            <span className="ps1">$</span> <span className="cursor" />
          </div>
        </div>
        <div className="cta-links">
          <Link className="btn btn-primary" to="/docs/getting-started/installation">
            Read the docs
          </Link>
          <Link className="btn btn-ghost" href={EXPLORER_URL}>
            Browse 131 components
          </Link>
          <Link className="btn btn-ghost" href={GITHUB_URL}>
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatusStrip() {
  return (
    <div className="status-strip">
      <div className="foot-in">
        <span>hyperkit</span>
        <Link to="/docs/getting-started/installation">docs</Link>
        <Link href={EXPLORER_URL}>explorer</Link>
        <Link href={GITHUB_URL}>github</Link>
        <Link href={NPM_URL}>npm</Link>
        <span className="right">
          <span className="okdot" />
          MIT · SolidJS today, React next
        </span>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="HyperKit — SolidJS component library"
      description={siteConfig.tagline}>
      <div className="hkHome">
        <div className="backdrop" />
        <Hero />
        <Stats />
        <main>
          <Systems />
          <AiSection />
          <Themes />
          <Diagrams />
          <Gallery />
          <InstallCta />
        </main>
        <StatusStrip />
      </div>
    </Layout>
  );
}
