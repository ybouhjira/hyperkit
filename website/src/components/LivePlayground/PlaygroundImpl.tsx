/**
 * Client-only implementation of the live playground.
 *
 * Preview: a same-origin iframe loads /playground/boot.js (the HyperKit +
 * Solid runtime bundle) and exposes `window.__playground`. Edited code is
 * compiled in the parent with Babel + babel-preset-solid, wrapped into a Blob
 * module, and mounted inside the iframe via dynamic import. The iframe keeps
 * HyperKit's global stylesheet and theme application fully isolated from the
 * Docusaurus page.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { EditorView, keymap, lineNumbers, highlightSpecialChars } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './styles.module.css';

const COMPILE_DEBOUNCE_MS = 400;
const MIN_PREVIEW_HEIGHT = 140;
const MAX_PREVIEW_HEIGHT = 640;

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

function defaultThemeFor(colorMode: string, themes: string[]): string {
  const preferred = colorMode === 'dark' ? 'github-dark' : 'github-light';
  if (themes.includes(preferred)) return preferred;
  return themes[0] ?? preferred;
}

export default function PlaygroundImpl({ code }: { code: string }): React.ReactElement {
  const { colorMode } = useColorMode();
  const playgroundBase = useBaseUrl('/playground/');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef(new Compartment());
  const apiRef = useRef<PlaygroundApi | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compileSeqRef = useRef(0);
  const userPickedThemeRef = useRef(false);
  const codeRef = useRef(code);

  const [themes, setThemes] = useState<string[]>([]);
  const [themeId, setThemeId] = useState<string>(() => defaultThemeFor(colorMode, []));
  const [error, setError] = useState<PlaygroundError | null>(null);
  const [mountedOnce, setMountedOnce] = useState(false);
  const [frameHeight, setFrameHeight] = useState(MIN_PREVIEW_HEIGHT);

  const moduleMap = useMemo(() => {
    const abs = (file: string) => new URL(playgroundBase + file, window.location.origin).href;
    return {
      '@ybouhjira/hyperkit': abs('hyperkit.js'),
      'solid-js': abs('solid-js.js'),
      'solid-js/web': abs('solid-web.js'),
      'solid-js/store': abs('solid-store.js'),
    };
  }, [playgroundBase]);

  const srcDoc = useMemo(() => {
    const cssUrl = `${playgroundBase}css/style.css`;
    const bootUrl = `${playgroundBase}boot.js`;
    const initialTheme = defaultThemeFor(colorMode, []);
    return [
      '<!doctype html>',
      `<html><head><meta charset="utf-8"><link rel="stylesheet" href="${cssUrl}">`,
      '<style>body{margin:0;padding:16px}#root{min-height:96px}</style>',
      `</head><body><div id="root"></div><script>window.__initialTheme=${JSON.stringify(initialTheme)}</script><script type="module" src="${bootUrl}"></script></body></html>`,
    ].join('');
    // The srcdoc is intentionally built once — theme switching afterwards goes
    // through the __playground API instead of reloading the iframe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundBase]);

  const compileAndMount = useCallback(
    async (source: string) => {
      const api = apiRef.current;
      if (!api) return;
      const seq = ++compileSeqRef.current;
      const { compile } = await import('./compiler');
      const result = compile(source, moduleMap);
      if (seq !== compileSeqRef.current) return;
      if (!result.ok || !result.code) {
        setError({ kind: 'compile', message: result.error ?? 'Unknown compile error.' });
        return;
      }
      const blob = new Blob([result.code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const mountResult = await api.mount(url);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = url;
      if (seq !== compileSeqRef.current) return;
      if (!mountResult.ok) {
        setError({ kind: 'runtime', message: mountResult.error ?? 'Unknown runtime error.' });
        return;
      }
      setError(null);
      setMountedOnce(true);
    },
    [moduleMap]
  );

  const scheduleCompile = useCallback(
    (source: string) => {
      codeRef.current = source;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void compileAndMount(source);
      }, COMPILE_DEBOUNCE_MS);
    },
    [compileAndMount]
  );

  // Messages from the preview iframe: ready, height reports, runtime errors.
  useEffect(() => {
    const onMessage = (event: MessageEvent<PlaygroundMessage>) => {
      const frame = iframeRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'hyperkit-playground') return;
      if (data.type === 'ready') {
        const win = frame.contentWindow as (Window & { __playground?: PlaygroundApi }) | null;
        apiRef.current = win?.__playground ?? null;
        const themeList = data.themes ?? apiRef.current?.themes ?? [];
        setThemes(themeList);
        setThemeId((current) =>
          themeList.includes(current) ? current : defaultThemeFor(colorMode, themeList)
        );
        void compileAndMount(codeRef.current);
      } else if (data.type === 'height' && typeof data.height === 'number') {
        setFrameHeight(
          Math.min(MAX_PREVIEW_HEIGHT, Math.max(MIN_PREVIEW_HEIGHT, Math.ceil(data.height)))
        );
      } else if (data.type === 'runtime-error' && data.error) {
        setError({ kind: 'runtime', message: data.error });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compileAndMount]);

  // Editor lifecycle.
  useEffect(() => {
    const host = editorHostRef.current;
    if (!host) return undefined;
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: code,
        extensions: [
          lineNumbers(),
          highlightSpecialChars(),
          history(),
          indentOnInput(),
          bracketMatching(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          javascript({ jsx: true, typescript: true }),
          themeCompartmentRef.current.of(
            colorMode === 'dark' ? oneDark : syntaxHighlighting(defaultHighlightStyle)
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) scheduleCompile(update.state.doc.toString());
          }),
        ],
      }),
    });
    editorViewRef.current = view;
    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
    // The editor is created once; doc resets go through the Reset button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the Docusaurus color mode in the editor and (until the user picks
  // a theme manually) in the preview.
  useEffect(() => {
    editorViewRef.current?.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        colorMode === 'dark' ? oneDark : syntaxHighlighting(defaultHighlightStyle)
      ),
    });
    if (!userPickedThemeRef.current && themes.length > 0) {
      setThemeId(defaultThemeFor(colorMode, themes));
    }
  }, [colorMode, themes]);

  // Push theme changes into the iframe.
  useEffect(() => {
    apiRef.current?.setTheme(themeId);
  }, [themeId]);

  // Cleanup.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      apiRef.current = null;
    },
    []
  );

  const handleReset = () => {
    const view = editorViewRef.current;
    if (view) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    }
    codeRef.current = code;
    void compileAndMount(code);
  };

  return (
    <div className={styles.playground}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Live playground</span>
        <span className={styles.toolbarSpacer} />
        {themes.length > 0 && (
          <select
            className={styles.themeSelect}
            aria-label="Preview theme"
            value={themeId}
            onChange={(event) => {
              userPickedThemeRef.current = true;
              setThemeId(event.target.value);
            }}
          >
            {themes.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        )}
        <button type="button" className={styles.resetButton} onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className={styles.previewWrap}>
        <iframe
          ref={iframeRef}
          className={styles.previewFrame}
          style={{ height: `${frameHeight}px` }}
          srcDoc={srcDoc}
          title="Component preview"
        />
        {!mountedOnce && !error && <div className={styles.previewLoading}>Loading preview…</div>}
      </div>
      {error && (
        <pre className={styles.errorPanel}>
          {error.kind === 'compile' ? 'Compile error: ' : 'Runtime error: '}
          {error.message}
        </pre>
      )}
      <div className={styles.editorWrap} ref={editorHostRef} />
    </div>
  );
}
