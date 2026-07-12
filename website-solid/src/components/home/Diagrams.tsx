/** Section 04 — diagram engine: dagre pipeline canvas + package list. */
import { Lights } from './Lights';

export function Diagrams() {
  return (
    <section id="diagrams">
      <div class="wrap">
        <span class="sec-label">04 — diagram engine</span>
        <h2>
          A framework-agnostic graph core.
          <br />
          Rendered by anything.
        </h2>
        <p class="sec-sub">
          <code>diagram-core</code> owns layout and state; <code>diagram-svg</code> and{' '}
          <code>diagram-solid</code> render it. Dagre layouts, minimap, controls — DAGs, flows, and
          pipelines out of the box.
        </p>

        <div class="dia-wrap">
          <div class="win dia-win">
            <div class="win-t">
              <Lights />
              <span class="name">pipeline.diagram — dagreLayout</span>
              <span class="pan-hint">drag to pan →</span>
            </div>
            <div class="dia-canvas">
              <div class="dia-stage">
                <svg aria-hidden="true">
                  <path class="edge live" d="M 182 122 C 238 122 242 98 296 98" />
                  <path class="edge" d="M 182 122 C 238 122 242 188 296 188" />
                  <path class="edge live" d="M 444 98 C 498 98 496 146 552 146" />
                  <path class="edge" d="M 444 188 C 498 188 496 146 552 146" />
                </svg>
                <div class="dnode" style={{ left: '34px', top: '92px' }}>
                  <div class="nh">
                    <i style={{ background: '#79c0ff' }} />
                    source
                  </div>
                  <div class="nb">llms-full.txt · 131 docs</div>
                </div>
                <div class="dnode run" style={{ left: '296px', top: '68px' }}>
                  <div class="nh">
                    <i />
                    parse
                  </div>
                  <div class="nb">running · 42ms</div>
                </div>
                <div class="dnode" style={{ left: '296px', top: '158px' }}>
                  <div class="nh">
                    <i style={{ background: '#ffa657' }} />
                    validate
                  </div>
                  <div class="nb">schema · zod</div>
                </div>
                <div class="dnode run" style={{ left: '552px', top: '116px' }}>
                  <div class="nh">
                    <i />
                    render
                  </div>
                  <div class="nb">diagram-solid · 60fps</div>
                </div>
                <div class="dia-mini" aria-hidden="true">
                  <i style={{ left: '8px', top: '17px' }} />
                  <i class="on" style={{ left: '29px', top: '10px' }} />
                  <i style={{ left: '29px', top: '26px' }} />
                  <i class="on" style={{ left: '50px', top: '18px' }} />
                </div>
              </div>
            </div>
          </div>

          <div class="dia-side">
            <div class="win">
              <div class="win-t">
                <Lights />
                <span class="name">packages/</span>
              </div>
              <div class="win-b dia-list">
                <b>diagram-core</b> &nbsp;zero deps, pure TS
                <br />
                <b>diagram-svg</b> &nbsp;&nbsp;static rendering
                <br />
                <b>diagram-solid</b> &nbsp;interactive, pan/zoom
                <br />
                <span style={{ color: 'var(--muted)' }}>+ gantt, sequence-diagram, timeline</span>
              </div>
            </div>
            <div class="win">
              <div class="win-t">
                <Lights />
                <span class="name">controls</span>
              </div>
              <div class="win-b" style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
                <span class="chip">MiniMap</span>
                <span class="chip">Controls</span>
                <span class="chip">dagreLayout</span>
                <span class="chip ok">pan / zoom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
