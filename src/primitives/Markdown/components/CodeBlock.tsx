import type { Component } from 'solid-js';

export interface CodeBlockProps {
  lang?: string;
  content: string;
}

export const CodeBlock: Component<CodeBlockProps> = (props) => (
  <pre class="sk-markdown-code-block">
    <code class={props.lang ? `language-${props.lang}` : undefined}>{props.content}</code>
  </pre>
);
