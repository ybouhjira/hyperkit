import { type Component, type JSX, createSignal, Show } from 'solid-js';
import { Box } from '../../primitives/Box';
import { EmptyState } from '../../primitives/EmptyState';
import { Tabs, type TabItem } from '../../primitives/Tabs';
import type { VideoSourcePickerProps, VideoSourceProvider } from './types';
import './VideoSourcePicker.css';

export { formatSize, relativeTime } from './format';

/** Tab label — prefixed with the provider's icon when one is supplied. */
function tabLabel(provider: VideoSourceProvider): JSX.Element {
  if (provider.iconPath === undefined) return provider.label;
  return (
    <span class="sk-vsp__tab-label">
      <svg class="sk-vsp__tab-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d={provider.iconPath} />
      </svg>
      {provider.label}
    </span>
  );
}

/** Render a provider's panel, or a "coming soon" placeholder when it has none. */
function providerPanel(
  provider: VideoSourceProvider,
  onSelect: VideoSourcePickerProps['onSelect'],
  onError: (e: Error) => void
): JSX.Element {
  if (provider.render !== undefined) {
    return provider.render({ onSelect, onError });
  }
  return (
    <EmptyState
      title={`${provider.label} — coming soon`}
      description={provider.comingSoon ?? `${provider.label} support is coming soon.`}
    />
  );
}

/**
 * VideoSourcePicker — a generic "where does this video come from" widget.
 *
 * It renders one tab per {@link VideoSourceProvider} the host supplies (an
 * on-disk library, a paste-URL downloader, a local-file input, Google Drive,
 * Google Photos, …) and calls `onSelect` with the chosen {@link VideoSource}.
 * Providers with no `render` show a "coming soon" placeholder, so new sources
 * can be slotted in before they're fully wired.
 */
export const VideoSourcePicker: Component<VideoSourcePickerProps> = (props): JSX.Element => {
  const providers = (): ReadonlyArray<VideoSourceProvider> => props.providers;
  const [active, setActive] = createSignal<string>(providers()[0]?.id ?? '');
  const [error, setError] = createSignal<string | null>(null);

  // Show provider errors inline and forward them to the host hook.
  const onError = (e: Error): void => {
    setError(e.message);
    props.onError?.(e);
  };
  const onSelect = (source: Parameters<VideoSourcePickerProps['onSelect']>[0]): void => {
    setError(null);
    props.onSelect(source);
  };

  const tabItems = (): TabItem[] =>
    providers().map((p) => ({
      value: p.id,
      label: tabLabel(p),
      content: providerPanel(p, onSelect, onError),
    }));

  return (
    <Box class={`sk-vsp ${props.class ?? ''}`.trim()}>
      <Show when={error()}>
        <Box class="sk-vsp__error" role="alert">
          {error()}
        </Box>
      </Show>
      <Show
        when={providers().length > 0}
        fallback={
          <EmptyState title="No video sources" description="No input sources are configured." />
        }
      >
        <Tabs items={tabItems()} value={active()} onChange={setActive} />
      </Show>
    </Box>
  );
};
