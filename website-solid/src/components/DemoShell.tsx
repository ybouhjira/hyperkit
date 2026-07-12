/**
 * Full-viewport shell for the demo applications.
 *
 * Each demo route renders a complete HyperKit application inside this shell:
 * a slim strip identifies the demo, links back to the gallery and to the
 * demo's source on GitHub, and carries a theme changer that repaints the
 * live app through the `--sk-*` token system — scoped to the demo container
 * so the site chrome stays constant. The app itself fills the rest of the
 * viewport.
 * Owned by the coordinator — demo agents compose inside it.
 */
import { type ParentProps, createSignal, createEffect } from 'solid-js';
import { A } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { Select, useTheme, applyThemeToElement } from '@ybouhjira/hyperkit';
import './demo-shell.css';

const SOURCE_BASE =
  'https://github.com/ybouhjira/hyperkit/blob/main/website-solid/src/components/demo-apps';

export function DemoShell(
  props: ParentProps<{ name: string; tagline: string; sourceDir: string }>
) {
  const { themes, theme } = useTheme();
  let appRef: HTMLDivElement | undefined;

  const options = themes.map((t) => ({ value: t.id, label: t.name }));
  const [demoThemeId, setDemoThemeId] = createSignal(theme().id);

  // Scope the chosen theme to the demo container only: applying its `--sk-*`
  // vars to this element lets the whole app re-flow while the site nav/footer
  // keep the site theme. Runs on mount (seeds current theme) and on every pick.
  createEffect(() => {
    const next = themes.find((t) => t.id === demoThemeId());
    if (next && appRef) applyThemeToElement(next, appRef);
  });

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
        <label class="demo-shell__theme">
          <span class="demo-shell__theme-label">Theme</span>
          <Select
            options={options}
            value={demoThemeId()}
            onChange={setDemoThemeId}
            class="demo-shell__theme-select"
          />
        </label>
        <a
          class="demo-shell__source"
          href={`${SOURCE_BASE}/${props.sourceDir}`}
          target="_blank"
          rel="noreferrer"
        >
          View source ↗
        </a>
      </div>
      <div class="demo-shell__app" ref={appRef}>
        {props.children}
      </div>
    </div>
  );
}
