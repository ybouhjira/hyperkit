import { createContext, useContext } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import type { HeadingProps } from './components/Heading';
import type { CodeBlockProps } from './components/CodeBlock';
import type { LinkProps } from './components/Link';
import type { ImageProps } from './components/Image';
import type { ListProps } from './components/List';
import type { TableCellProps } from './components/Table';

export interface MarkdownComponents {
  heading?: Component<HeadingProps>;
  paragraph?: Component<{ children: JSX.Element }>;
  codeBlock?: Component<CodeBlockProps>;
  inlineCode?: Component<{ content: string }>;
  link?: Component<LinkProps>;
  image?: Component<ImageProps>;
  list?: Component<ListProps>;
  listItem?: Component<{ checked?: boolean; children: JSX.Element }>;
  table?: Component<{ children: JSX.Element }>;
  tableRow?: Component<{ children: JSX.Element }>;
  tableCell?: Component<TableCellProps>;
  blockquote?: Component<{ children: JSX.Element }>;
  thematicBreak?: Component;
}

export const MarkdownComponentsContext = createContext<MarkdownComponents>({});

export function useMarkdownComponents(): MarkdownComponents {
  return useContext(MarkdownComponentsContext);
}
