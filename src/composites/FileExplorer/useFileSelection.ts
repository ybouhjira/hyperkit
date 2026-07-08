import { Accessor } from 'solid-js';
import type { FileItem } from './types';

interface SelectionHandlerConfig {
  sortedItems: Accessor<FileItem[]>;
  selection: Accessor<Set<string>>;
  setInternalSelection: (sel: Set<string>) => void;
  onNavigate?: (path: string) => void;
  onSelect?: (item: FileItem) => void;
  onSelectionChange?: (selectedPaths: Set<string>) => void;
  onConfirm?: (selection: FileItem[]) => void;
  items?: FileItem[];
}

export function createSelectionHandler(config: SelectionHandlerConfig) {
  const handleItemClick = (item: FileItem, e: MouseEvent) => {
    const currentSelection = config.selection();
    let newSelection: Set<string>;

    if (e.metaKey || e.ctrlKey) {
      // Toggle individual item
      newSelection = new Set(currentSelection);
      if (newSelection.has(item.path)) {
        newSelection.delete(item.path);
      } else {
        newSelection.add(item.path);
      }
    } else if (e.shiftKey && config.sortedItems().length > 0) {
      // Range select
      const items = config.sortedItems();
      const lastSelected = [...currentSelection].pop();
      const lastIdx = lastSelected ? items.findIndex((i) => i.path === lastSelected) : 0;
      const currentIdx = items.findIndex((i) => i.path === item.path);
      const [start, end] = [Math.min(lastIdx, currentIdx), Math.max(lastIdx, currentIdx)];
      newSelection = new Set(currentSelection);
      for (let i = start; i <= end; i++) {
        const fileItem = items[i];
        if (fileItem != null) {
          newSelection.add(fileItem.path);
        }
      }
    } else {
      // Single select (also opens directory if it's a directory)
      if (item.isDirectory) {
        config.onNavigate?.(item.path);
        return;
      }
      newSelection = new Set([item.path]);
      config.onSelect?.(item);

      // Double-click: fire onConfirm
      if (config.onConfirm && e.detail >= 2) {
        config.onConfirm([item]);
      }
    }

    config.setInternalSelection(newSelection);
    config.onSelectionChange?.(newSelection);
  };

  return { handleItemClick };
}
