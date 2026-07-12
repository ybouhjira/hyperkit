/**
 * Iframe bootstrap for the docs live playground.
 *
 * Loaded as a module script inside the preview iframe. Exposes a tiny
 * `window.__playground` API that the parent page drives:
 *
 *   mount(url)   — dynamic-imports a compiled snippet module (a Blob URL
 *                  produced by the parent) and renders its default export
 *                  inside HyperKit's ThemeProvider.
 *   setTheme(id) — switches the active theme preset reactively.
 *   themes       — list of available theme preset ids.
 *
 * Height changes and uncaught runtime errors are reported to the parent via
 * postMessage so the host page can resize the iframe and surface errors.
 */
import { createSignal } from 'solid-js';
import { createComponent, render } from 'solid-js/web';
import { ThemeProvider, themePresets } from '../../src/index';

type MountResult = { ok: true } | { ok: false; error: string };

interface PlaygroundApi {
  themes: string[];
  mount(url: string): Promise<MountResult>;
  setTheme(id: string): void;
  dispose(): void;
}

declare global {
  interface Window {
    __playground: PlaygroundApi;
    /** Initial theme preset id, set inline by the host page's srcdoc. */
    __initialTheme?: string;
  }
}

const host = document.getElementById('root');
if (!host) throw new Error('Playground iframe is missing its #root element');

const initialTheme = window.__initialTheme;
const fallbackTheme = Object.keys(themePresets)[0];
const [themeId, setThemeId] = createSignal(
  initialTheme && themePresets[initialTheme] ? initialTheme : (fallbackTheme ?? 'github-dark')
);

let dispose: (() => void) | null = null;

function post(message: Record<string, unknown>) {
  window.parent.postMessage({ source: 'hyperkit-playground', ...message }, '*');
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

window.addEventListener('error', (event) => {
  post({ type: 'runtime-error', error: describeError(event.error ?? event.message) });
});
window.addEventListener('unhandledrejection', (event) => {
  post({ type: 'runtime-error', error: describeError(event.reason) });
});

const observer = new ResizeObserver(() => {
  post({ type: 'height', height: document.documentElement.scrollHeight });
});
observer.observe(document.body);

window.__playground = {
  themes: Object.keys(themePresets),

  async mount(url) {
    try {
      const mod: { default?: unknown } = await import(/* @vite-ignore */ url);
      const App = mod.default;
      if (typeof App !== 'function') {
        throw new Error('The snippet must `export default` a component function.');
      }
      dispose?.();
      dispose = null;
      host.innerHTML = '';
      dispose = render(
        () =>
          createComponent(ThemeProvider, {
            get theme() {
              return themePresets[themeId()];
            },
            get children() {
              return createComponent(App as (props: object) => unknown, {});
            },
          }),
        host
      );
      post({ type: 'height', height: document.documentElement.scrollHeight });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: describeError(error) };
    }
  },

  setTheme(id) {
    if (themePresets[id]) setThemeId(id);
  },

  dispose() {
    dispose?.();
    dispose = null;
    host.innerHTML = '';
  },
};

post({ type: 'ready', themes: Object.keys(themePresets) });
