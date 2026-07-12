/** Section 05 — component marquee (two counter-scrolling belts of screenshots). */
import { For } from 'solid-js';
import { EXPLORER_URL } from '../../data/site-links';

/* Served from website-solid/public/img/components/ under the /hyperkit base. */
const IMG_BASE = '/hyperkit/img/components/';

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

function MarqueeBelt(props: { names: string[]; reverse?: boolean }) {
  const doubled = () => [...props.names, ...props.names];
  return (
    <div class="mq-belt">
      <div class={props.reverse ? 'mq rev' : 'mq'}>
        <For each={doubled()}>
          {(name, i) => (
            <a class="mcard" href={EXPLORER_URL} target="_blank" rel="noreferrer">
              <img
                src={`${IMG_BASE}${name}.webp`}
                alt={i() < props.names.length ? name : ''}
                width={230}
                height={144}
              />
              <span>{name}</span>
            </a>
          )}
        </For>
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <div class="gallery">
      <div class="wrap">
        <span class="sec-label">05 — 131 components</span>
        <h2>
          From Button to KanbanBoard.
          <br />
          Feature-scaled, not fragmented.
        </h2>
        <p class="sec-sub" style={{ 'margin-bottom': '0' }}>
          Fewer, larger components that grow with props — every one themed, tested, and documented
          in the live Explorer.
        </p>
      </div>
      <div class="belt-fade">
        <MarqueeBelt names={MARQUEE_TOP} />
        <MarqueeBelt names={MARQUEE_BOTTOM} reverse />
      </div>
    </div>
  );
}
