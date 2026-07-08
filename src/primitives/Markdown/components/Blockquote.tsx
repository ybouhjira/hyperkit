import type { Component, JSX } from 'solid-js';

export const Blockquote: Component<{ children: JSX.Element }> = (props) => (
  <blockquote class="sk-markdown-blockquote">{props.children}</blockquote>
);
