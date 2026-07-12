/**
 * Renders a build-time-rendered guide (HTML authored by our own generator, so
 * innerHTML is safe). `<!--LIVE_PLAYGROUND:base64-->` markers left by the
 * generator are swapped for the real LivePlayground component.
 */
import { For, createMemo } from 'solid-js';
import { LivePlayground } from '../LivePlayground';
import type { GuidePage } from './types';

const MARKER = /<!--LIVE_PLAYGROUND:([A-Za-z0-9+/=]+)-->/;

type Segment = { kind: 'html'; html: string } | { kind: 'playground'; code: string };

function decodeBase64(value: string): string {
  const bytes = atob(value);
  const buffer = Uint8Array.from(bytes, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(buffer);
}

export function GuideArticle(props: { page: GuidePage }) {
  const segments = createMemo<Segment[]>(() => {
    const parts = props.page.html.split(new RegExp(MARKER.source, 'g'));
    return parts.map((part, index) =>
      index % 2 === 1
        ? { kind: 'playground', code: decodeBase64(part) }
        : { kind: 'html', html: part }
    );
  });

  return (
    <article class="docs-md docs-table-scroll">
      <For each={segments()}>
        {(segment) =>
          segment.kind === 'playground' ? (
            <LivePlayground code={segment.code} />
          ) : (
            <div innerHTML={segment.html} />
          )
        }
      </For>
    </article>
  );
}
