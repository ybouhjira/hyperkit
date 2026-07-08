/**
 * VideoSourcePicker types.
 *
 * The picker is a generic SHELL: it renders one tab per {@link VideoSourceProvider}
 * the host supplies and hands back a {@link VideoSource} when the user picks one.
 * Concrete sources (an on-disk library, Google Drive, Google Photos, a local
 * file, …) are provided by the host — HyperKit ships only generic, backend-
 * agnostic provider factories (library / url / local / coming-soon).
 */

import type { JSX } from 'solid-js';

/** One downloaded/cached video in a host's library (history). */
export interface VideoLibraryItem {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly sizeBytes: number;
  /** Epoch ms when it was added to the library. */
  readonly addedAt: number;
  /** True when a download request resolved from the cache (no re-download). */
  readonly cached?: boolean;
}

/** A host-supplied library/download backend (drives the library + url providers). */
export interface VideoSourceAdapter {
  /** The library/history, newest first. */
  list: () => Promise<ReadonlyArray<VideoLibraryItem>>;
  /** Download a URL (or return the cached entry). Resolves to the library item. */
  download: (url: string) => Promise<VideoLibraryItem>;
  /** A playable/seekable URL for a library item id. */
  fileUrl: (id: string) => string;
  /** Optional: remove an item from the library. Enables the delete affordance. */
  remove?: (id: string) => Promise<void>;
}

/** What the picker hands back when the user chooses a video. */
export type VideoSource =
  | { readonly type: 'local'; readonly file: File }
  | { readonly type: 'library'; readonly item: VideoLibraryItem; readonly url: string };

/** Callbacks a provider uses to report a pick or an error to the picker. */
export interface VideoSourceProviderContext {
  readonly onSelect: (source: VideoSource) => void;
  readonly onError: (error: Error) => void;
}

/**
 * A pluggable video source — one tab in the picker. Supply `render` for a live
 * panel, or omit it and set `comingSoon` for a not-yet-available placeholder.
 */
export interface VideoSourceProvider {
  /** Stable id (also the tab value). */
  readonly id: string;
  /** Tab label. */
  readonly label: string;
  /** Optional tab/placeholder icon (SVG path, 24×24 viewBox). */
  readonly iconPath?: string;
  /** Render the provider's panel. Omit (with `comingSoon`) for a placeholder. */
  readonly render?: (ctx: VideoSourceProviderContext) => JSX.Element;
  /** Placeholder description shown when `render` is omitted. */
  readonly comingSoon?: string;
}

export interface VideoSourcePickerProps {
  /** The sources to offer, in tab order. */
  readonly providers: ReadonlyArray<VideoSourceProvider>;
  /** Called with the chosen video source. */
  readonly onSelect: (source: VideoSource) => void;
  /** Surface provider errors (download/list failures). */
  readonly onError?: (error: Error) => void;
  readonly class?: string;
}
