import { Accessor } from 'solid-js';
import type { FileAttachment } from './types';

interface FileHandlerConfig {
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  onFileError?: (error: string) => void;
}

interface FileHandlers {
  addFiles: (files: FileList | File[]) => void;
  removeAttachment: (id: string) => void;
  handleFileInputChange: (e: Event) => void;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
}

export function createFileHandlers(
  attachments: Accessor<FileAttachment[]>,
  setAttachments: (v: FileAttachment[]) => void,
  setIsDragging: (v: boolean) => void,
  config: FileHandlerConfig
): FileHandlers {
  const validateFile = (file: File): string | null => {
    if (config.maxFileSize != null && file.size > config.maxFileSize) {
      return `File "${file.name}" exceeds ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB limit`;
    }
    if (config.acceptedFileTypes != null && config.acceptedFileTypes.length > 0) {
      const ok = config.acceptedFileTypes.some((t) =>
        t.startsWith('.')
          ? file.name.toLowerCase().endsWith(t.toLowerCase())
          : Boolean(file.type.match(t))
      );
      if (!ok) return `File type "${file.type || file.name}" is not accepted`;
    }
    if (config.maxFiles != null && attachments().length >= config.maxFiles) {
      return `Maximum ${config.maxFiles} files allowed`;
    }
    return null;
  };

  const addFiles = (files: FileList | File[]) => {
    const added: FileAttachment[] = [];
    for (const file of Array.from(files)) {
      const err = validateFile(file);
      if (err) {
        config.onFileError?.(err);
        continue;
      }
      added.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
    if (added.length > 0) setAttachments([...attachments(), ...added]);
  };

  const removeAttachment = (id: string) => setAttachments(attachments().filter((a) => a.id !== id));

  const handleFileInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      addFiles(input.files);
      input.value = '';
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
  };

  return {
    addFiles,
    removeAttachment,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
