import type { Component } from 'solid-js';

export const InlineCode: Component<{ content: string }> = (props) => (
  <code class="sk-markdown-inline-code">{props.content}</code>
);
