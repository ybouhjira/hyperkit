import type { Component } from 'solid-js';

export interface ImageProps {
  url: string;
  alt: string;
  title?: string;
}

export const Image: Component<ImageProps> = (props) => (
  <img src={props.url} alt={props.alt} title={props.title} class="sk-markdown-image" />
);
