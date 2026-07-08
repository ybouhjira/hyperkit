import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { useDragDropFiles } from './useDragDropFiles';

function makeDragEvent(overrides: Partial<DragEvent> = {}): DragEvent {
  return {
    preventDefault: vi.fn(),
    dataTransfer: null,
    ...overrides,
  } as unknown as DragEvent;
}

describe('useDragDropFiles', () => {
  it('starts with isDragOver false and empty droppedFiles', () => {
    createRoot((dispose) => {
      const { isDragOver, droppedFiles } = useDragDropFiles();
      expect(isDragOver()).toBe(false);
      expect(droppedFiles()).toHaveLength(0);
      dispose();
    });
  });

  it('sets isDragOver true on dragEnter', () => {
    createRoot((dispose) => {
      const { isDragOver, dragHandlers } = useDragDropFiles();
      dragHandlers.onDragEnter(makeDragEvent());
      expect(isDragOver()).toBe(true);
      dispose();
    });
  });

  it('clears isDragOver on dragLeave after matching enter', () => {
    createRoot((dispose) => {
      const { isDragOver, dragHandlers } = useDragDropFiles();
      dragHandlers.onDragEnter(makeDragEvent());
      dragHandlers.onDragLeave(makeDragEvent());
      expect(isDragOver()).toBe(false);
      dispose();
    });
  });

  it('stays true on dragLeave if multiple enters', () => {
    createRoot((dispose) => {
      const { isDragOver, dragHandlers } = useDragDropFiles();
      dragHandlers.onDragEnter(makeDragEvent());
      dragHandlers.onDragEnter(makeDragEvent()); // nested child enters
      dragHandlers.onDragLeave(makeDragEvent()); // child leaves
      expect(isDragOver()).toBe(true);
      dispose();
    });
  });

  it('calls onDragOver preventDefault', () => {
    createRoot((dispose) => {
      const { dragHandlers } = useDragDropFiles();
      const e = makeDragEvent();
      dragHandlers.onDragOver(e);
      expect(e.preventDefault).toHaveBeenCalled();
      dispose();
    });
  });

  it('clears isDragOver on drop', () => {
    createRoot((dispose) => {
      const { isDragOver, dragHandlers } = useDragDropFiles();
      dragHandlers.onDragEnter(makeDragEvent());
      dragHandlers.onDrop(
        makeDragEvent({
          dataTransfer: {
            items: { length: 0 } as unknown as DataTransferItemList,
            files: { length: 0 } as unknown as FileList,
          } as DataTransfer,
        })
      );
      expect(isDragOver()).toBe(false);
      dispose();
    });
  });

  it('calls onDrop callback with empty list when no files', () => {
    createRoot((dispose) => {
      const cb = vi.fn();
      const { dragHandlers } = useDragDropFiles(cb);
      dragHandlers.onDrop(
        makeDragEvent({
          dataTransfer: {
            items: { length: 0 } as unknown as DataTransferItemList,
            files: { length: 0 } as unknown as FileList,
          } as DataTransfer,
        })
      );
      expect(cb).toHaveBeenCalledWith([]);
      dispose();
    });
  });

  it('does not throw when dataTransfer is null', () => {
    createRoot((dispose) => {
      const { dragHandlers } = useDragDropFiles();
      expect(() => dragHandlers.onDrop(makeDragEvent({ dataTransfer: null }))).not.toThrow();
      dispose();
    });
  });
});
