/**
 * Built-in {@link VideoSourceProvider} factories — generic, backend-agnostic.
 *
 *  - {@link libraryVideoProvider} — grid of a host library (history), via adapter
 *  - {@link urlVideoProvider}     — paste a URL → download (cached) via adapter
 *  - {@link localVideoProvider}   — native local-file input
 *  - {@link comingSoonVideoProvider} — a placeholder tab for a not-yet-wired source
 *
 * The host composes these (plus its own) into the picker's `providers` list.
 */

import { createSignal, onMount, For, Show, type Component } from 'solid-js';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { Badge } from '../../primitives/Badge';
import { Spinner } from '../../primitives/Spinner';
import { EmptyState } from '../../primitives/EmptyState';
import { formatSize, relativeTime } from './format';
import type {
  VideoLibraryItem,
  VideoSourceAdapter,
  VideoSourceProvider,
  VideoSourceProviderContext,
} from './types';

/** Normalize an unknown throw into an Error for the provider context. */
function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

/* ── Library / History ─────────────────────────────────────────────────── */

interface LibraryPanelProps {
  readonly adapter: VideoSourceAdapter;
  readonly ctx: VideoSourceProviderContext;
}

const LibraryPanel: Component<LibraryPanelProps> = (props) => {
  const [items, setItems] = createSignal<ReadonlyArray<VideoLibraryItem>>([]);
  const [loading, setLoading] = createSignal(false);

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      setItems(await props.adapter.list());
    } catch (e) {
      props.ctx.onError(toError(e));
    } finally {
      setLoading(false);
    }
  };

  onMount(() => void load());

  const pick = (item: VideoLibraryItem): void =>
    props.ctx.onSelect({ type: 'library', item, url: props.adapter.fileUrl(item.id) });

  const remove = async (
    rm: (id: string) => Promise<void>,
    id: string,
    ev: MouseEvent
  ): Promise<void> => {
    ev.stopPropagation();
    try {
      await rm(id);
      await load();
    } catch (e) {
      props.ctx.onError(toError(e));
    }
  };

  return (
    <Show when={!loading()} fallback={<Spinner aria-label="Loading library" />}>
      <Show
        when={items().length > 0}
        fallback={
          <EmptyState title="No videos yet" description="Paste a URL or add a local file." />
        }
      >
        <Flex wrap="wrap" gap="sm" class="sk-vsp__grid">
          <For each={items()}>
            {(item) => (
              <button
                type="button"
                class="sk-vsp__item"
                onClick={() => pick(item)}
                aria-label={`Use ${item.title}`}
              >
                <span class="sk-vsp__item-title">{item.title}</span>
                <span class="sk-vsp__item-meta">
                  <Text size="xs" color="muted">
                    {formatSize(item.sizeBytes)} · {relativeTime(item.addedAt, Date.now())}
                  </Text>
                  <Show when={item.cached}>
                    <Badge variant="soft" size="xs">
                      cached
                    </Badge>
                  </Show>
                </span>
                <Show when={props.adapter.remove}>
                  {(rm) => (
                    <span
                      class="sk-vsp__item-remove"
                      role="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={(e) => void remove(rm(), item.id, e)}
                    >
                      ✕
                    </span>
                  )}
                </Show>
              </button>
            )}
          </For>
        </Flex>
      </Show>
    </Show>
  );
};

/* ── Paste URL → download (cached on repeat) ───────────────────────────── */

interface UrlPanelProps {
  readonly adapter: VideoSourceAdapter;
  readonly ctx: VideoSourceProviderContext;
}

const UrlPanel: Component<UrlPanelProps> = (props) => {
  const [url, setUrl] = createSignal('');
  const [downloading, setDownloading] = createSignal(false);

  const download = async (): Promise<void> => {
    // The Download button is disabled while empty, so `u` is always non-blank.
    const u = url().trim();
    setDownloading(true);
    try {
      const item = await props.adapter.download(u);
      setUrl('');
      props.ctx.onSelect({ type: 'library', item, url: props.adapter.fileUrl(item.id) });
    } catch (e) {
      props.ctx.onError(toError(e));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Flex gap="sm" align="center" class="sk-vsp__url">
      <Input
        value={url()}
        onInput={setUrl}
        placeholder="Paste a video URL…"
        aria-label="Video URL"
      />
      <Button
        variant="primary"
        size="sm"
        disabled={downloading() || url().trim().length === 0}
        onClick={() => void download()}
      >
        <Show when={downloading()} fallback={<>Download</>}>
          <Spinner size="sm" aria-label="Downloading" /> Downloading…
        </Show>
      </Button>
    </Flex>
  );
};

/* ── Local file ────────────────────────────────────────────────────────── */

interface LocalPanelProps {
  readonly accept: string;
  readonly ctx: VideoSourceProviderContext;
}

const LocalPanel: Component<LocalPanelProps> = (props) => {
  const onChange = (e: Event & { currentTarget: HTMLInputElement }): void => {
    const file = e.currentTarget.files?.[0];
    if (file !== undefined) props.ctx.onSelect({ type: 'local', file });
  };
  return (
    <input
      type="file"
      class="sk-vsp__file"
      accept={props.accept}
      onChange={onChange}
      aria-label="Choose a local video"
    />
  );
};

/* ── Factories ─────────────────────────────────────────────────────────── */

/** Options shared by the built-in provider factories. */
export interface VideoProviderOptions {
  readonly id?: string;
  readonly label?: string;
  readonly iconPath?: string;
}

/** A provider that lists the host's video library/history. */
export function libraryVideoProvider(
  adapter: VideoSourceAdapter,
  opts: VideoProviderOptions = {}
): VideoSourceProvider {
  return {
    id: opts.id ?? 'library',
    label: opts.label ?? 'Library',
    ...(opts.iconPath !== undefined ? { iconPath: opts.iconPath } : {}),
    render: (ctx) => <LibraryPanel adapter={adapter} ctx={ctx} />,
  };
}

/** A provider that downloads a pasted URL into the host library (cached). */
export function urlVideoProvider(
  adapter: VideoSourceAdapter,
  opts: VideoProviderOptions = {}
): VideoSourceProvider {
  return {
    id: opts.id ?? 'url',
    label: opts.label ?? 'Paste URL',
    ...(opts.iconPath !== undefined ? { iconPath: opts.iconPath } : {}),
    render: (ctx) => <UrlPanel adapter={adapter} ctx={ctx} />,
  };
}

/** A provider that takes a local file from the user's machine. */
export function localVideoProvider(
  opts: VideoProviderOptions & { readonly accept?: string } = {}
): VideoSourceProvider {
  return {
    id: opts.id ?? 'local',
    label: opts.label ?? 'Local file',
    ...(opts.iconPath !== undefined ? { iconPath: opts.iconPath } : {}),
    render: (ctx) => <LocalPanel accept={opts.accept ?? 'video/*'} ctx={ctx} />,
  };
}

/** A placeholder tab for a source that isn't wired up yet (Drive, Photos, …). */
export function comingSoonVideoProvider(p: {
  readonly id: string;
  readonly label: string;
  readonly iconPath?: string;
  readonly message?: string;
}): VideoSourceProvider {
  return {
    id: p.id,
    label: p.label,
    ...(p.iconPath !== undefined ? { iconPath: p.iconPath } : {}),
    comingSoon: p.message ?? `${p.label} support is coming soon.`,
  };
}
