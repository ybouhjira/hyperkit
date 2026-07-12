import { Component } from 'solid-js';
import { getFileType } from './fileTypes';
import type { FileItem } from './FileExplorer';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface FileIconItem extends FileItem {
  typeColor?: string;
}

export interface FileIconProps {
  item: FileIconItem;
  size?: 'sm' | 'md' | 'lg';
}

export const FileIcon: Component<FileIconProps> = (props) => {
  const fileType = () => getFileType(props.item.name, props.item.isDirectory);

  // If user explicitly set typeColor prop, use inline style (user override takes precedence)
  // Otherwise use the CSS class for the file type category
  const categoryClass = () => {
    if (props.item.typeColor) return '';
    return `sk-fe-icon--${fileType().category}`;
  };

  const inlineColor = () => {
    if (props.item.typeColor) return { color: props.item.typeColor };
    return {};
  };

  return (
    <div
      class={`sk-file-icon sk-file-icon--${props.size ?? 'sm'} ${categoryClass()}`}
      style={inlineColor()}
      data-testid="file-icon"
    >
      {fileType().category === 'folder' ? (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      ) : fileType().category === 'code' ? (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      ) : (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clip-rule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};
