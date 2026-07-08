import type { Component, JSX } from 'solid-js';

export interface LinkProps {
  url: string;
  title?: string;
  children: JSX.Element;
}

export const Link: Component<LinkProps> = (props) => (
  <a href={props.url} title={props.title} class="sk-markdown-link" rel="noopener noreferrer">
    {props.children}
  </a>
);
