export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface MentionItem {
  id: string;
  name: string;
  avatar?: string;
}

export interface MessageInputProps {
  onSend?: (message: string, attachments?: FileAttachment[]) => void;
  onInterrupt?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  class?: string;

  maxLength?: number;
  showCharCount?: boolean;

  enableAttachments?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  onFileError?: (error: string) => void;

  slashCommands?: SlashCommand[];
  onSlashCommand?: (command: SlashCommand) => void;

  mentions?: MentionItem[];

  messageHistory?: string[];

  enableVoice?: boolean;
  enableMarkdownToolbar?: boolean;
  showShortcutHints?: boolean;

  /**
   * Prefill the composer. Whenever this changes to a non-empty string, the
   * value replaces the current draft, the textarea is focused with the caret
   * at the end, and `onDraftApplied` fires. Hosts should clear their draft
   * source in `onDraftApplied` so re-sending the same text applies again.
   */
  draft?: string;
  /** Called after a `draft` value has been applied to the textarea. */
  onDraftApplied?: () => void;
}
