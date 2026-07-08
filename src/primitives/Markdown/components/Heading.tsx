import type { Component, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: JSX.Element;
}

export const Heading: Component<HeadingProps> = (props) => {
  return (
    <Dynamic
      component={`h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}
      class="sk-markdown-heading"
    >
      {props.children}
    </Dynamic>
  );
};
