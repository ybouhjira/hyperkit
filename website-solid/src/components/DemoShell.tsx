/**
 * Full-viewport shell for the demo applications.
 *
 * Each demo route renders a complete HyperKit application inside this shell:
 * a slim strip identifies the demo and links back to the gallery and to the
 * demo's source on GitHub; the app itself fills the rest of the viewport.
 * Owned by the coordinator — demo agents compose inside it.
 */
import type { ParentProps } from 'solid-js';
import { A } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import './demo-shell.css';

const SOURCE_BASE =
  'https://github.com/ybouhjira/hyperkit/blob/main/website-solid/src/components/demo-apps';

export function DemoShell(
  props: ParentProps<{ name: string; tagline: string; sourceDir: string }>
) {
  return (
    <div class="demo-shell">
      <Title>{`${props.name} — HyperKit demo`}</Title>
      <div class="demo-shell__strip">
        <A href="/demos" class="demo-shell__back">
          ← Demos
        </A>
        <span class="demo-shell__name">{props.name}</span>
        <span class="demo-shell__tagline">{props.tagline}</span>
        <span class="demo-shell__spacer" />
        <a
          class="demo-shell__source"
          href={`${SOURCE_BASE}/${props.sourceDir}`}
          target="_blank"
          rel="noreferrer"
        >
          View source ↗
        </a>
      </div>
      <div class="demo-shell__app">{props.children}</div>
    </div>
  );
}
