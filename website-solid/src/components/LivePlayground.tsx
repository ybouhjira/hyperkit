/**
 * Live playground — SolidJS port of the docs playground.
 *
 * Preview: a same-origin iframe loads /playground/boot.js (the HyperKit +
 * Solid runtime bundle) and exposes `window.__playground`. Edited code is
 * compiled in the parent with Babel + babel-preset-solid, wrapped into a Blob
 * module, and mounted inside the iframe via dynamic import. The iframe keeps
 * the preview's theme application isolated from the site.
 */
import { Show, createEffect, createSignal, onCleanup, onMount, For } from 'solid-js';
import { isServer } from 'solid-js/web';
import { useTheme } from '@ybouhjira/hyperkit';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';
import './live-playground.css';

const COMPILE_DEBOUNCE_MS = 400;
const MIN_PREVIEW_HEIGHT = 140;
const MAX_PREVIEW_HEIGHT = 640;
const PLAYGROUND_BASE = '/hyperkit/playground/';

interface PlaygroundApi {
  themes: string[];
  mount(url: string): Promise<{ ok: boolean; error?: string }>;
  setTheme(id: string): void;
  dispose(): void;
}

interface PlaygroundMessage {
  source?: string;
  type?: string;
  themes?: string[];
  height?: number;
  error?: string;
}

interface PlaygroundError {
  kind: 'compile' | 'runtime';
  message: string;
}

function isDarkThemeId(id: string | undefined): boolean {
  return !id?.includes('light');
}

function defaultThemeFor(siteThemeId: string | undefined, themes: string[]): string {
  const preferred = isDarkThemeId(siteThemeId) ? 'fjord' : 'github-light';
  if (themes.includes(preferred)) return preferred;
  return themes[0] ?? preferred;
}

export function LivePlayground(props: { code: string }) {
  const theme = useTheme();
  const siteThemeId = () => theme.theme().id ?? 'fjord';

  const [themes, setThemes] = createSignal<string[]>([]);
  const [themeId, setThemeId] = createSignal(defaultThemeFor('fjord', []));
  const [error, setError] = createSignal<PlaygroundError | null>(null);
  const [mountedOnce, setMountedOnce] = createSignal(false);
  const [frameHeight, setFrameHeight] = createSignal(MIN_PREVIEW_HEIGHT);

  let iframeEl: HTMLIFrameElement | undefined;
  let editorHostEl: HTMLDivElement | undefined;
  let editorView: EditorView | null = null;
  let themeCompartment: Compartment | null = null;
  let api: PlaygroundApi | null = null;
  let blobUrl: string | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let compileSeq = 0;
  let userPickedTheme = false;
  let currentCode = props.code;
  let applyEditorTheme: (() => void) | null = null;

  const moduleMap = () => {
    const abs = (file: string) => new URL(PLAYGROUND_BASE + file, window.location.origin).href;
    return {
      '@ybouhjira/hyperkit': abs('hyperkit.js'),
      'solid-js': abs('solid-js.js'),
      'solid-js/web': abs('solid-web.js'),
      'solid-js/store': abs('solid-store.js'),
    };
  };

  const srcDoc = () => {
    const cssUrl = `${PLAYGROUND_BASE}css/style.css`;
    const bootUrl = `${PLAYGROUND_BASE}boot.js`;
    const initialTheme = defaultThemeFor(siteThemeId(), []);
    return [
      '<!doctype html>',
      `<html><head><meta charset="utf-8"><link rel="stylesheet" href="${cssUrl}">`,
      '<style>body{margin:0;padding:16px}#root{min-height:96px}</style>',
      `</head><body><div id="root"></div><script>window.__initialTheme=${JSON.stringify(initialTheme)}</script><script type="module" src="${bootUrl}"></script></body></html>`,
    ].join('');
  };

  async function compileAndMount(source: string) {
    if (!api) return;
    const seq = ++compileSeq;
    const { compile } = await import('./compiler');
    const result = compile(source, moduleMap());
    if (seq !== compileSeq) return;
    if (!result.ok || !result.code) {
      setError({ kind: 'compile', message: result.error ?? 'Unknown compile error.' });
      return;
    }
    const blob = new Blob([result.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const mountResult = await api.mount(url);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = url;
    if (seq !== compileSeq) return;
    if (!mountResult.ok) {
      setError({ kind: 'runtime', message: mountResult.error ?? 'Unknown runtime error.' });
      return;
    }
    setError(null);
    setMountedOnce(true);
  }

  function scheduleCompile(source: string) {
    currentCode = source;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void compileAndMount(source), COMPILE_DEBOUNCE_MS);
  }

  onMount(() => {
    const onMessage = (event: MessageEvent<PlaygroundMessage>) => {
      if (!iframeEl || event.source !== iframeEl.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'hyperkit-playground') return;
      if (data.type === 'ready') {
        const win = iframeEl.contentWindow as (Window & { __playground?: PlaygroundApi }) | null;
        api = win?.__playground ?? null;
        const themeList = data.themes ?? api?.themes ?? [];
        setThemes(themeList);
        if (!themeList.includes(themeId())) {
          setThemeId(defaultThemeFor(siteThemeId(), themeList));
        }
        void compileAndMount(currentCode);
      } else if (data.type === 'height' && typeof data.height === 'number') {
        setFrameHeight(
          Math.min(MAX_PREVIEW_HEIGHT, Math.max(MIN_PREVIEW_HEIGHT, Math.ceil(data.height)))
        );
      } else if (data.type === 'runtime-error' && data.error) {
        setError({ kind: 'runtime', message: data.error });
      }
    };
    window.addEventListener('message', onMessage);
    onCleanup(() => window.removeEventListener('message', onMessage));

    // Editor — created once; CodeMirror loads lazily so the (large) editor
    // payload never blocks first paint.
    void (async () => {
      const [view, state, commands, language, langJs, oneDarkMod] = await Promise.all([
        import('@codemirror/view'),
        import('@codemirror/state'),
        import('@codemirror/commands'),
        import('@codemirror/language'),
        import('@codemirror/lang-javascript'),
        import('@codemirror/theme-one-dark'),
      ]);
      if (!editorHostEl) return;
      themeCompartment = new state.Compartment();
      const editorTheme = () =>
        isDarkThemeId(siteThemeId())
          ? oneDarkMod.oneDark
          : language.syntaxHighlighting(language.defaultHighlightStyle);
      applyEditorTheme = () =>
        themeCompartment &&
        editorView?.dispatch({
          effects: themeCompartment.reconfigure(editorTheme()),
        });
      editorView = new view.EditorView({
        parent: editorHostEl,
        state: state.EditorState.create({
          doc: props.code,
          extensions: [
            view.lineNumbers(),
            view.highlightSpecialChars(),
            commands.history(),
            language.indentOnInput(),
            language.bracketMatching(),
            view.keymap.of([
              ...commands.defaultKeymap,
              ...commands.historyKeymap,
              commands.indentWithTab,
            ]),
            langJs.javascript({ jsx: true, typescript: true }),
            themeCompartment.of(editorTheme()),
            view.EditorView.updateListener.of((update) => {
              if (update.docChanged) scheduleCompile(update.state.doc.toString());
            }),
          ],
        }),
      });
    })();

    onCleanup(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      editorView?.destroy();
      editorView = null;
      api = null;
    });
  });

  // Follow live site-theme switches (fjord <-> github-light) in the editor.
  createEffect(() => {
    void siteThemeId();
    applyEditorTheme?.();
  });

  function handleThemePick(id: string) {
    userPickedTheme = true;
    setThemeId(id);
    api?.setTheme(id);
  }

  function handleReset() {
    if (editorView) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: props.code },
      });
    }
    currentCode = props.code;
    void compileAndMount(props.code);
  }

  return (
    <div class="site-playground">
      <div class="site-playground__toolbar">
        <span class="site-playground__label">Live playground</span>
        <span class="site-playground__spacer" />
        <Show when={themes().length > 0}>
          <select
            class="site-playground__theme"
            aria-label="Preview theme"
            value={themeId()}
            onChange={(e) => handleThemePick(e.currentTarget.value)}
          >
            <For each={themes()}>{(id) => <option value={id}>{id}</option>}</For>
          </select>
        </Show>
        <button type="button" class="site-playground__reset" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div class="site-playground__preview">
        <Show when={!isServer}>
          <iframe
            ref={iframeEl}
            class="site-playground__frame"
            style={{ height: `${frameHeight()}px` }}
            srcdoc={srcDoc()}
            title="Component preview"
          />
        </Show>
        <Show when={!mountedOnce() && !error()}>
          <div class="site-playground__loading">Loading preview…</div>
        </Show>
      </div>
      <Show when={error()}>
        {(err) => (
          <pre class="site-playground__error">
            {err().kind === 'compile' ? 'Compile error: ' : 'Runtime error: '}
            {err().message}
          </pre>
        )}
      </Show>
      <div class="site-playground__editor" ref={editorHostEl} />
    </div>
  );
}
