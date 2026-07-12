/** Section 02 — AI-native: MCP session terminal + the three AI points. */
import { Lights } from './Lights';

export function AiSection() {
  return (
    <section id="ai">
      <div class="wrap">
        <span class="sec-label">02 — AI-native by design</span>
        <h2>
          Your AI assistant reads the docs
          <br />
          like a teammate would.
        </h2>
        <p class="sec-sub">
          HyperKit ships an MCP server, <code>llms.txt</code> / <code>llms-full.txt</code>, and a
          registry that exposes your app's actions as tools agents can call.
        </p>

        <div class="ai-grid">
          <div class="win">
            <div class="win-t">
              <Lights />
              <span class="name">claude — mcp session</span>
            </div>
            <div class="term-b">
              <span class="ps1">$</span>{' '}
              <span class="hi type-line">claude mcp add hyperkit-docs</span>
              <br />
              <span class="dim">✓ connected · 2 tools registered</span>
              <br />
              <br />
              <span class="dim">&gt;</span> <span class="out">search_components("kanban")</span>
              <br />
              <span class="hi">KanbanBoard</span>{' '}
              <span class="dim">— drag-drop columns, swimlanes,</span>
              <br />
              <span class="dim">&nbsp;&nbsp;WIP limits, onMove dispatch …</span>
              <br />
              <br />
              <span class="dim">&gt;</span> <span class="out">get_component("CommandPalette")</span>
              <br />
              <span class="hi">CommandPalette</span>{' '}
              <span class="dim">— props, slots, shortcuts,</span>
              <br />
              <span class="dim">&nbsp;&nbsp;a11y notes, 4 usage examples</span>
            </div>
          </div>

          <div class="ai-points">
            <div class="ai-point">
              <span class="ico">⌕</span>
              <div>
                <h3>MCP doc server</h3>
                <p>
                  <code>search_components</code> and <code>get_component</code> give agents the
                  exact API — no hallucinated props.
                </p>
              </div>
            </div>
            <div class="ai-point">
              <span class="ico">txt</span>
              <div>
                <h3>llms.txt shipped in the repo</h3>
                <p>
                  The whole catalog in machine-readable form — index and full API, versioned with
                  the code.
                </p>
              </div>
            </div>
            <div class="ai-point">
              <span class="ico">⚡</span>
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
