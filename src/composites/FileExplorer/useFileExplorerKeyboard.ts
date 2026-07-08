import { Accessor } from 'solid-js';
import type { FileItem } from './types';

interface KeyboardHandlerConfig {
  filteredItems: Accessor<FileItem[]>;
  focusedPath: Accessor<string | null>;
  setFocusedPath: (path: string | null) => void;
  selection: Accessor<Set<string>>;
  setInternalSelection: (sel: Set<string>) => void;
  onNavigate?: (path: string) => void;
  onSelect?: (item: FileItem) => void;
  onBack?: () => void;
  onSelectionChange?: (selectedPaths: Set<string>) => void;
  onConfirm?: (selection: FileItem[]) => void;
  items?: FileItem[];
}

export function createFileExplorerKeyboard(config: KeyboardHandlerConfig) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't interfere with input typing
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    const items = config.filteredItems();
    if (items.length === 0) return;

    const currentFocused = config.focusedPath();
    const currentIdx = currentFocused ? items.findIndex((i) => i.path === currentFocused) : -1;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIdx = Math.min(currentIdx + 1, items.length - 1);
        const nextItem = items[nextIdx];
        if (nextItem != null) {
          config.setFocusedPath(nextItem.path);
          if (!e.shiftKey) {
            config.setInternalSelection(new Set([nextItem.path]));
            config.onSelectionChange?.(new Set([nextItem.path]));
          } else {
            // Extend selection
            const newSel = new Set(config.selection());
            newSel.add(nextItem.path);
            config.setInternalSelection(newSel);
            config.onSelectionChange?.(newSel);
          }
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIdx = Math.max(currentIdx - 1, 0);
        const prevItem = items[prevIdx];
        if (prevItem != null) {
          config.setFocusedPath(prevItem.path);
          if (!e.shiftKey) {
            config.setInternalSelection(new Set([prevItem.path]));
            config.onSelectionChange?.(new Set([prevItem.path]));
          } else {
            const newSel = new Set(config.selection());
            newSel.add(prevItem.path);
            config.setInternalSelection(newSel);
            config.onSelectionChange?.(newSel);
          }
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (currentIdx >= 0) {
          const item = items[currentIdx];
          if (item != null) {
            if (item.isDirectory) {
              config.onNavigate?.(item.path);
            } else {
              config.onSelect?.(item);
              // onConfirm fires on Enter for non-directory items
              if (config.onConfirm) {
                config.onConfirm([item]);
              }
            }
          }
        }
        break;
      }
      case 'Backspace': {
        e.preventDefault();
        config.onBack?.();
        break;
      }
      case 'a': {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          const allPaths = new Set(items.map((i) => i.path));
          config.setInternalSelection(allPaths);
          config.onSelectionChange?.(allPaths);
        }
        break;
      }
      case 'Escape': {
        config.setInternalSelection(new Set<string>());
        config.onSelectionChange?.(new Set<string>());
        config.setFocusedPath(null);
        break;
      }
    }
  };

  return { handleKeyDown };
}
