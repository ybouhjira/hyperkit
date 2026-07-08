import { Component, JSX } from 'solid-js';

export const PaperclipIcon: Component = (): JSX.Element => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M10.5 4.5L5.5 9.5a2.12 2.12 0 1 0 3 3l5-5a3.54 3.54 0 0 0-5-5l-5 5a4.95 4.95 0 0 0 7 7l4.5-4.5" />
  </svg>
);

export const BoldIcon: Component = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M4 2h5a3.5 3.5 0 0 1 2.5 6A3.5 3.5 0 0 1 9 14H4V2zm2 5h3a1.5 1.5 0 1 0 0-3H6v3zm0 2v3h3a1.5 1.5 0 1 0 0-3H6z" />
  </svg>
);

export const ItalicIcon: Component = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M6 2h6v2h-2l-2 8h2v2H4v-2h2l2-8H6V2z" />
  </svg>
);

export const CodeIcon: Component = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 11L2 8l3-3M11 5l3 3-3 3" />
  </svg>
);

export const LinkIcon: Component = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
  </svg>
);

export const MicIcon: Component = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="6" y="1" width="4" height="8" rx="2" />
    <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v3" />
  </svg>
);

export const SendIcon: Component = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8 12V4M4 8l4-4 4 4" />
  </svg>
);

export const StopIcon: Component = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <rect x="3" y="3" width="10" height="10" rx="2" />
  </svg>
);

export const CloseIcon: Component = () => (
  <svg
    viewBox="0 0 16 16"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  >
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
