import { Component, Show } from 'solid-js';
import { Button } from '../../primitives/Button';
import { FileExplorer, type FileItem } from '../FileExplorer';
import '../FileExplorer/FileExplorer.css';

export interface DirectoryPickerProps {
  items: FileItem[];
  currentPath: string;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  onSelect?: (path: string) => void;
  loading?: boolean;
  title?: string;
  description?: string;
  class?: string;
}

export const DirectoryPicker: Component<DirectoryPickerProps> = (props) => {
  return (
    <div class={`sk-dir-picker ${props.class ?? ''}`} data-testid="directory-picker">
      <div class="sk-dir-picker__inner">
        {/* Header */}
        <div class="sk-dir-picker__header">
          <h1 class="sk-dir-picker__title">{props.title ?? 'Select Working Directory'}</h1>
          <Show when={props.description}>
            <p class="sk-dir-picker__desc">{props.description}</p>
          </Show>
        </div>

        {/* File explorer */}
        <FileExplorer
          items={props.items.filter((i) => i.isDirectory)}
          currentPath={props.currentPath}
          onNavigate={props.onNavigate}
          onBack={props.onBack}
          loading={props.loading}
          class="sk-dir-picker__explorer"
        />

        {/* Action */}
        <div class="sk-dir-picker__actions">
          <span class="sk-dir-picker__path">{props.currentPath}</span>
          <Button variant="primary" onClick={() => props.onSelect?.(props.currentPath)}>
            Select This Directory
          </Button>
        </div>
      </div>
    </div>
  );
};
