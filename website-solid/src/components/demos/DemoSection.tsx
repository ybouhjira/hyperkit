/** One demo app: numbered heading, tagline, component chips, live playground. */
import { For } from 'solid-js';
import { LivePlayground } from '../LivePlayground';
import type { DemoApp } from '../../data/demos';

export function DemoSection(props: { demo: DemoApp; index: number }) {
  const num = () => String(props.index + 1).padStart(2, '0');
  return (
    <section class="demo" id={props.demo.id}>
      <div class="demo-head">
        <span class="demo-num">{num()}</span>
        <div class="demo-head-text">
          <h2>{props.demo.name}</h2>
          <p>{props.demo.tagline}</p>
          <div class="demo-chips">
            <For each={props.demo.built}>{(c) => <code class="demo-chip">{c}</code>}</For>
          </div>
        </div>
      </div>
      <div class="demo-stage">
        <LivePlayground code={props.demo.code} />
      </div>
    </section>
  );
}
