/**
 * Hero IDE window — the "site is an IDE" centerpiece.
 * Tab switching is the original pure-CSS radio hack: hidden radio inputs +
 * label[for] tabs; `:checked ~` selectors in home.css swap panes/previews.
 */
import { Lights } from './Lights';

export function IdeWindow() {
  return (
    <div class="ide">
      <input class="tsel" type="radio" name="hk-tabs" id="hk-t1" checked />
      <input class="tsel" type="radio" name="hk-tabs" id="hk-t2" />
      <input class="tsel" type="radio" name="hk-tabs" id="hk-t3" />

      <div class="ide-title">
        <Lights />
        <div class="ide-menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Run</span>
          <span>Terminal</span>
          <span>Help</span>
        </div>
        <span class="doc">hyperkit — zed-dark</span>
      </div>

      <div class="ide-tabs">
        <label class="ide-tab" for="hk-t1">
          <i class="fdot tsx" />
          App.tsx
        </label>
        <label class="ide-tab" for="hk-t2">
          <i class="fdot tsx" />
          dashboard.tsx
        </label>
        <label class="ide-tab" for="hk-t3">
          <i class="fdot ts" />
          actions.ts
        </label>
      </div>

      <div class="ide-body">
        {/* file tree */}
        <aside class="ide-side">
          <div class="side-h">Explorer</div>
          <div class="tree">
            <details open>
              <summary>hyperkit</summary>
              <details open>
                <summary>packages</summary>
                <span class="leaf">diagram-core</span>
                <span class="leaf">diagram-solid</span>
                <span class="leaf">editor</span>
                <span class="leaf">mcp</span>
              </details>
              <details open>
                <summary>src</summary>
                <details open>
                  <summary>primitives</summary>
                  <span class="leaf on">
                    <i class="fdot tsx" />
                    Button
                  </span>
                  <span class="leaf">
                    <i class="fdot tsx" />
                    Card
                  </span>
                  <span class="leaf">
                    <i class="fdot tsx" />
                    Dialog
                  </span>
                </details>
                <span class="leaf">composites</span>
                <span class="leaf">navigation</span>
                <span class="leaf">panels</span>
                <span class="leaf">
                  <i class="fdot ts" />
                  theme/presets.ts
                </span>
              </details>
              <span class="leaf">
                <i class="fdot ts" />
                llms.txt
              </span>
            </details>
          </div>
        </aside>

        {/* code panes */}
        <div class="ide-code">
          <div class="pane pane-1">
            <div class="cl">
              <span class="ln">1</span>
              <span class="cd">
                <span class="k">import</span> &#123; <span class="f">Button</span>,{' '}
                <span class="f">ThemeProvider</span>, <span class="f">themePresets</span> &#125;{' '}
                <span class="k">from</span> <span class="s">'@ybouhjira/hyperkit'</span>;
              </span>
            </div>
            <div class="cl">
              <span class="ln">2</span>
              <span class="cd">
                <span class="k">import</span>{' '}
                <span class="s">'@ybouhjira/hyperkit/dist/index.css'</span>;
              </span>
            </div>
            <div class="cl">
              <span class="ln">3</span>
              <span class="cd"> </span>
            </div>
            <div class="cl">
              <span class="ln">4</span>
              <span class="cd">
                <span class="k">function</span> <span class="f">App</span>() &#123;
              </span>
            </div>
            <div class="cl">
              <span class="ln">5</span>
              <span class="cd">
                {' '}
                <span class="k">return</span> (
              </span>
            </div>
            <div class="cl">
              <span class="ln">6</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">ThemeProvider</span> <span class="p">theme</span>
                =&#123;themePresets[<span class="s">'zed-dark'</span>]&#125;&gt;
              </span>
            </div>
            <div class="cl hlrow">
              <span class="ln">7</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">Button</span> <span class="p">variant</span>=
                <span class="s">"primary"</span> <span class="p">size</span>=
                <span class="s">"md"</span>&gt;
                <span class="cursor" />
              </span>
            </div>
            <div class="cl">
              <span class="ln">8</span>
              <span class="cd"> Get Started</span>
            </div>
            <div class="cl">
              <span class="ln">9</span>
              <span class="cd">
                {' '}
                &lt;/<span class="c">Button</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">10</span>
              <span class="cd">
                {' '}
                &lt;/<span class="c">ThemeProvider</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">11</span>
              <span class="cd"> );</span>
            </div>
            <div class="cl">
              <span class="ln">12</span>
              <span class="cd">&#125;</span>
            </div>
            <div class="cl">
              <span class="ln">13</span>
              <span class="cd"> </span>
            </div>
            <div class="cl">
              <span class="ln">14</span>
              <span class="cd">
                <span class="m">{'// SSR works out of the box — see docs/SSR.md'}</span>
              </span>
            </div>
          </div>

          <div class="pane pane-2">
            <div class="cl">
              <span class="ln">1</span>
              <span class="cd">
                <span class="k">import</span> &#123; <span class="f">PanelContainer</span>,{' '}
                <span class="f">PanelGroup</span>, <span class="f">FileExplorer</span>,{' '}
                <span class="f">KanbanBoard</span> &#125; <span class="k">from</span>{' '}
                <span class="s">'@ybouhjira/hyperkit'</span>;
              </span>
            </div>
            <div class="cl">
              <span class="ln">2</span>
              <span class="cd"> </span>
            </div>
            <div class="cl">
              <span class="ln">3</span>
              <span class="cd">
                <span class="m">{'// IDE-style resizable, dockable panel layout'}</span>
              </span>
            </div>
            <div class="cl">
              <span class="ln">4</span>
              <span class="cd">
                &lt;<span class="c">PanelContainer</span> <span class="p">persistKey</span>=
                <span class="s">"workspace"</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">5</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">PanelGroup</span> <span class="p">direction</span>=
                <span class="s">"row"</span>&gt;
              </span>
            </div>
            <div class="cl hlrow">
              <span class="ln">6</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">Panel</span> <span class="p">minSize</span>=&#123;180&#125;{' '}
                <span class="p">collapsible</span>&gt;
                <span class="cursor" />
              </span>
            </div>
            <div class="cl">
              <span class="ln">7</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">FileExplorer</span> <span class="p">mode</span>=
                <span class="s">"two-pane"</span> <span class="p">preview</span> /&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">8</span>
              <span class="cd">
                {' '}
                &lt;/<span class="c">Panel</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">9</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">PanelResizeHandle</span> /&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">10</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">Panel</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">11</span>
              <span class="cd">
                {' '}
                &lt;<span class="c">KanbanBoard</span> <span class="p">columns</span>
                =&#123;columns&#125; <span class="p">onMove</span>=&#123;dispatch&#125; /&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">12</span>
              <span class="cd">
                {' '}
                &lt;/<span class="c">Panel</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">13</span>
              <span class="cd">
                {' '}
                &lt;/<span class="c">PanelGroup</span>&gt;
              </span>
            </div>
            <div class="cl">
              <span class="ln">14</span>
              <span class="cd">
                &lt;/<span class="c">PanelContainer</span>&gt;
              </span>
            </div>
          </div>

          <div class="pane pane-3">
            <div class="cl">
              <span class="ln">1</span>
              <span class="cd">
                <span class="k">import</span> &#123; <span class="f">createNavigable</span>,{' '}
                <span class="f">dispatchAction</span>, <span class="f">generateMCPTools</span>{' '}
                &#125; <span class="k">from</span> <span class="s">'@ybouhjira/hyperkit'</span>;
              </span>
            </div>
            <div class="cl">
              <span class="ln">2</span>
              <span class="cd"> </span>
            </div>
            <div class="cl">
              <span class="ln">3</span>
              <span class="cd">
                <span class="m">
                  {'// Register UI actions once — keyboard, palette, and agents all reuse them'}
                </span>
              </span>
            </div>
            <div class="cl">
              <span class="ln">4</span>
              <span class="cd">
                <span class="k">const</span> board = <span class="f">createNavigable</span>(
                <span class="s">'kanban'</span>, &#123;
              </span>
            </div>
            <div class="cl">
              <span class="ln">5</span>
              <span class="cd">
                {' '}
                <span class="p">actions</span>: &#123; <span class="f">moveCard</span>,{' '}
                <span class="f">addColumn</span>, <span class="f">archive</span> &#125;,
              </span>
            </div>
            <div class="cl">
              <span class="ln">6</span>
              <span class="cd">
                {' '}
                <span class="p">middleware</span>: [<span class="f">undoRedo</span>(),{' '}
                <span class="f">permissions</span>(role), <span class="f">rateLimit</span>(60)],
              </span>
            </div>
            <div class="cl">
              <span class="ln">7</span>
              <span class="cd">&#125;);</span>
            </div>
            <div class="cl">
              <span class="ln">8</span>
              <span class="cd"> </span>
            </div>
            <div class="cl hlrow">
              <span class="ln">9</span>
              <span class="cd">
                <span class="m">{'// Expose the same actions to AI agents as MCP tools'}</span>
                <span class="cursor" />
              </span>
            </div>
            <div class="cl">
              <span class="ln">10</span>
              <span class="cd">
                <span class="k">export</span> <span class="k">const</span> tools ={' '}
                <span class="f">generateMCPTools</span>(board);
              </span>
            </div>
            <div class="cl">
              <span class="ln">11</span>
              <span class="cd"> </span>
            </div>
            <div class="cl">
              <span class="ln">12</span>
              <span class="cd">
                <span class="f">dispatchAction</span>(<span class="s">'kanban.moveCard'</span>,
                &#123; <span class="p">id</span>, <span class="p">to</span>:{' '}
                <span class="s">'done'</span> &#125;);
              </span>
            </div>
          </div>
        </div>

        {/* live preview */}
        <aside class="ide-prev">
          <div class="prev-h">
            Preview{' '}
            <span class="live">
              <i />
              live
            </span>
          </div>

          <div class="prev-body pv-1">
            <div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
              <span class="rb rb-primary">Get Started</span>
              <span class="rb rb-secondary">Docs</span>
            </div>
            <div class="rcard">
              <h4>zed-dark</h4>
              <p>One of 40 presets. Every visual value flows through --sk-* tokens.</p>
              <div class="meta">
                <span class="chip ok">a11y ✓</span>
                <span class="chip">SSR ✓</span>
                <span class="chip">tokens</span>
              </div>
            </div>
            <div class="rterm" style={{ flex: '0 0 auto', 'margin-top': 'auto' }}>
              <span class="ok">✓</span> 5,015 tests passed <span class="dim">(vitest)</span>
              <br />
              <span class="ok">✓</span> visual regression <span class="dim">(playwright)</span>
            </div>
          </div>

          <div class="prev-body pv-2">
            <div class="mini-panels">
              <div class="mp-s">
                <div class="bar a" />
                <div class="bar" />
                <div class="bar" />
                <div class="bar" />
              </div>
              <div class="mp-m mini-handle">
                files · board
                <span class="glow">drop panel here</span>
              </div>
              <div class="mp-t mini-handle">terminal — pnpm test ✓</div>
            </div>
            <div class="rcard">
              <h4>Persisted layout</h4>
              <p>
                Drag to rearrange, sizes saved under{' '}
                <code style={{ 'font-family': 'var(--mono)', 'font-size': '.9em' }}>
                  persistKey
                </code>
                . Keyboard-resizable.
              </p>
            </div>
          </div>

          <div class="prev-body pv-3">
            <div class="rterm">
              <span class="dim">$</span> mcp tools/list
              <br />
              <span class="ok">→</span> kanban.moveCard
              <br />
              <span class="ok">→</span> kanban.addColumn
              <br />
              <span class="ok">→</span> kanban.archive
              <br />
              <span class="dim">3 tools generated from registry</span>
            </div>
            <div class="rcard">
              <h4>Undo / redo built in</h4>
              <p>Middleware wraps every dispatch — permissions, logging, rate limits, replay.</p>
            </div>
          </div>
        </aside>
      </div>

      <div class="ide-status">
        <span class="seg">
          <svg class="branch-ico" viewBox="0 0 12 12">
            <circle cx="3" cy="3" r="1.6" />
            <circle cx="3" cy="9" r="1.6" />
            <circle cx="9" cy="6" r="1.6" />
            <path d="M3 4.6v2.8M4.6 9c2.6 0 2.8-1.4 2.9-3" />
          </svg>
          <b>main</b>
        </span>
        <span class="seg">
          <b>131</b> components
        </span>
        <span class="seg">
          <b>5,015</b> tests
        </span>
        <span class="seg">
          <b>40</b> themes
        </span>
        <span class="seg">MIT</span>
        <span class="right seg">
          <span class="okdot" />
          TypeScript · SolidJS
        </span>
      </div>
    </div>
  );
}
