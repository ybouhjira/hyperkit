import type { Component, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export interface ListProps {
  ordered: boolean;
  start?: number;
  children: JSX.Element;
}

export const List: Component<ListProps> = (props) => {
  return (
    <Dynamic
      component={props.ordered ? 'ol' : 'ul'}
      class="sk-markdown-list"
      start={props.ordered ? props.start : undefined}
    >
      {props.children}
    </Dynamic>
  );
};

export const ListItem: Component<{ checked?: boolean; children: JSX.Element }> = (props) => (
  <li class={`sk-markdown-list-item${props.checked !== undefined ? ' sk-markdown-task-item' : ''}`}>
    {props.checked !== undefined && (
      <input type="checkbox" checked={props.checked} disabled class="sk-markdown-checkbox" />
    )}
    {props.children}
  </li>
);
