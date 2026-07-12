/** Section 01 — panel system / navigation registry / Effect services. */
import { Lights } from './Lights';

export function Systems() {
  return (
    <section id="systems">
      <div class="wrap">
        <span class="sec-label">01 — systems, not widgets</span>
        <h2>
          The parts other libraries
          <br />
          tell you to build yourself.
        </h2>
        <p class="sec-sub">
          Most kits stop at buttons. HyperKit ships the hard layers — the ones every serious app
          ends up hand-rolling.
        </p>

        <div class="sys-grid">
          <div class="win">
            <div class="win-t">
              <Lights />
              <span class="name">panel-layout.tsx</span>
            </div>
            <div class="win-b">
              <div class="pan-demo">
                <div class="pd-a">
                  tree
                  <span class="h hv" />
                </div>
                <div class="pd-b">
                  editor
                  <span class="h hh" />
                </div>
                <div class="pd-c">inspect</div>
                <div class="pd-d">terminal</div>
              </div>
            </div>
            <div class="sys-body">
              <h3>Panel system</h3>
              <p>
                Resizable, dockable, drag-to-rearrange IDE layouts with layout persistence —{' '}
                <code>PanelContainer</code>, <code>PanelGroup</code>, <code>PanelResizeHandle</code>
                .
              </p>
            </div>
          </div>

          <div class="win">
            <div class="win-t">
              <Lights />
              <span class="name">navigation — registry</span>
            </div>
            <div class="win-b">
              <div class="nav-demo">
                <div class="nrow">
                  <span>⌘K palette</span>
                  <span class="arr">─→</span>
                  <span>dispatchAction()</span>
                </div>
                <div class="nrow">
                  <span>keyboard</span>
                  <span class="arr">─→</span>
                  <span class="tag on">undo/redo</span>
                  <span class="tag">perms</span>
                  <span class="tag">rate-limit</span>
                </div>
                <div class="nrow">
                  <span>AI agent</span>
                  <span class="arr">─→</span>
                  <span>generateMCPTools()</span>
                </div>
                <div class="nrow">
                  <span class="tag">record</span>
                  <span class="tag">replay</span>
                  <span class="tag">websocket</span>
                  <span class="tag">tauri</span>
                </div>
              </div>
            </div>
            <div class="sys-body">
              <h3>Navigation registry</h3>
              <p>
                One action registry drives the command palette, shortcuts, and agents — with 5
                middleware, transports, and recording/replay.
              </p>
            </div>
          </div>

          <div class="win">
            <div class="win-t">
              <Lights />
              <span class="name">services.ts — Effect</span>
            </div>
            <div class="win-b">
              <div class="fx-demo">
                WebSocketService <span class="ok">· typed</span>
                <br />
                FileSystemService <span class="ok">· typed</span>
                <br />
                ClipboardService <span class="ok">· typed</span>
                <br />
                <span class="err">catch (e: any)</span>{' '}
                <span style={{ 'text-decoration': 'line-through' }}>soup</span> → Effect errors
              </div>
            </div>
            <div class="sys-body">
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
