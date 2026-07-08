import type { Component, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export const Table: Component<{ children: JSX.Element }> = (props) => (
  <div class="sk-markdown-table-wrapper">
    <table class="sk-markdown-table">{props.children}</table>
  </div>
);

export const TableRow: Component<{ children: JSX.Element }> = (props) => (
  <tr class="sk-markdown-table-row">{props.children}</tr>
);

export interface TableCellProps {
  header: boolean;
  align: 'left' | 'center' | 'right' | null;
  children: JSX.Element;
}

export const TableCell: Component<TableCellProps> = (props) => {
  return (
    <Dynamic
      component={props.header ? 'th' : 'td'}
      class="sk-markdown-table-cell"
      style={props.align ? { 'text-align': props.align } : undefined}
    >
      {props.children}
    </Dynamic>
  );
};
