import { Component, Show, Switch, Match, createMemo, JSX } from 'solid-js';
import type { FileItem } from './types';
import { getFileType } from './fileTypes';
import { FileIcon } from './FileIcon';
import { formatSize } from './FileExplorer';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface FilePreviewProps {
  item: FileItem;
  class?: string;
  style?: JSX.CSSProperties;
  unstyled?: boolean;
}

const PREVIEW_IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif']);
const PREVIEW_VIDEO_EXTS = new Set(['mp4', 'mov', 'webm', 'ogg']);
const PREVIEW_AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']);
const PREVIEW_TEXT_EXTS = new Set([
  'txt',
  'md',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'yaml',
  'yml',
  'toml',
  'css',
  'html',
  'xml',
  'sh',
  'bash',
  'env',
  'gitignore',
  'dockerfile',
]);

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/**
 * Composable preview pane that auto-detects file type and renders appropriately.
 *
 * Supported types:
 * - Images: renders `<img>` with object-fit contain
 * - Video: renders `<video>` with controls
 * - Audio: renders `<audio>` with controls
 * - Text/code: renders raw text (consumer provides `src` as `item.thumbnailUrl` or path)
 * - PDF: stub with EmptyState
 * - Unknown: file icon + metadata
 *
 * @example
 * <FilePreview item={selectedItem} />
 */
export const FilePreview: Component<FilePreviewProps> = (props) => {
  const ext = createMemo(() => getExt(props.item.name));
  const fileType = createMemo(() => getFileType(props.item.name, props.item.isDirectory));
  const previewUrl = createMemo(() => props.item.thumbnailUrl ?? '');

  const mtime = createMemo(() => props.item.mtime ?? props.item.modifiedAt);
  const mtimeStr = createMemo(() => {
    const d = mtime();
    return d ? d.toLocaleString() : '';
  });

  return (
    <div
      class={`sk-fe-preview${props.unstyled ? ' sk-fe-preview--unstyled' : ''} ${props.class ?? ''}`}
      style={props.style}
      data-testid="file-preview"
    >
      <Switch
        fallback={
          // Unknown / no URL: show icon + metadata
          <div class="sk-fe-preview__meta" data-testid="file-preview-meta">
            <FileIcon item={props.item} size="lg" />
            <span class="sk-fe-preview__name">{props.item.name}</span>
            <Show when={props.item.size !== undefined}>
              <span class="sk-fe-preview__detail">{formatSize(props.item.size)}</span>
            </Show>
            <Show when={mtimeStr()}>
              <span class="sk-fe-preview__detail">{mtimeStr()}</span>
            </Show>
            <Show when={fileType().label}>
              <span class="sk-fe-preview__type-label">{fileType().label}</span>
            </Show>
            <Show when={props.item.mimeType}>
              <span class="sk-fe-preview__mime">{props.item.mimeType}</span>
            </Show>
          </div>
        }
      >
        {/* Directory */}
        <Match when={props.item.isDirectory}>
          <div class="sk-fe-preview__meta" data-testid="file-preview-meta">
            <FileIcon item={props.item} size="lg" />
            <span class="sk-fe-preview__name">{props.item.name}</span>
            <span class="sk-fe-preview__type-label">Folder</span>
          </div>
        </Match>

        {/* Image */}
        <Match when={PREVIEW_IMAGE_EXTS.has(ext()) && previewUrl()}>
          <div class="sk-fe-preview__image-wrap" data-testid="file-preview-image">
            <img src={previewUrl()} alt={props.item.name} class="sk-fe-preview__image" />
          </div>
        </Match>

        {/* Video */}
        <Match when={PREVIEW_VIDEO_EXTS.has(ext()) && previewUrl()}>
          <div class="sk-fe-preview__video-wrap" data-testid="file-preview-video">
            <video src={previewUrl()} controls class="sk-fe-preview__video" />
          </div>
        </Match>

        {/* Audio */}
        <Match when={PREVIEW_AUDIO_EXTS.has(ext()) && previewUrl()}>
          <div class="sk-fe-preview__audio-wrap" data-testid="file-preview-audio">
            <div class="sk-fe-preview__meta">
              <FileIcon item={props.item} size="lg" />
              <span class="sk-fe-preview__name">{props.item.name}</span>
            </div>
            <audio src={previewUrl()} controls class="sk-fe-preview__audio" />
          </div>
        </Match>

        {/* PDF stub */}
        <Match when={ext() === 'pdf'}>
          <div class="sk-fe-preview__stub" data-testid="file-preview-pdf-stub">
            <FileIcon item={props.item} size="lg" />
            <span class="sk-fe-preview__name">{props.item.name}</span>
            <span class="sk-fe-preview__stub-msg">PDF preview coming soon</span>
          </div>
        </Match>

        {/* Text/code: show content if thumbnailUrl used as text content URL  */}
        <Match when={PREVIEW_TEXT_EXTS.has(ext()) && previewUrl()}>
          <div class="sk-fe-preview__text-wrap" data-testid="file-preview-text">
            <div class="sk-fe-preview__text-header">
              <FileIcon item={props.item} size="sm" />
              <span class="sk-fe-preview__name sk-fe-preview__name--sm">{props.item.name}</span>
            </div>
            <iframe
              src={previewUrl()}
              class="sk-fe-preview__iframe"
              title={`Preview of ${props.item.name}`}
              sandbox="allow-same-origin"
            />
          </div>
        </Match>
      </Switch>
    </div>
  );
};
