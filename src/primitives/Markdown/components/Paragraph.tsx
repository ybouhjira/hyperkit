import type { Component, JSX } from 'solid-js';

export const Paragraph: Component<{ children: JSX.Element }> = (props) => (
  <p class="sk-markdown-paragraph">{props.children}</p>
);
