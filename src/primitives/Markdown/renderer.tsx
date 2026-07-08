import { For } from 'solid-js';
import type { JSX } from 'solid-js';
import type { BlockNode, InlineNode, ListItemNode, TableCellNode, MarkdownAST } from './core/types';
import { useMarkdownComponents } from './context';
import * as DefaultComponents from './components';

export function renderInlineNode(node: InlineNode): JSX.Element {
  const components = useMarkdownComponents();

  switch (node.type) {
    case 'text':
      return <>{node.content}</>;
    case 'emphasis':
      return <em>{node.children.map(renderInlineNode)}</em>;
    case 'strong':
      return <strong>{node.children.map(renderInlineNode)}</strong>;
    case 'strikethrough':
      return <del>{node.children.map(renderInlineNode)}</del>;
    case 'inlineCode': {
      const InlineCode = components.inlineCode ?? DefaultComponents.InlineCode;
      return <InlineCode content={node.content} />;
    }
    case 'link': {
      const Link = components.link ?? DefaultComponents.Link;
      return (
        <Link url={node.url} title={node.title}>
          {node.children.map(renderInlineNode)}
        </Link>
      );
    }
    case 'image': {
      const Image = components.image ?? DefaultComponents.Image;
      return <Image url={node.url} alt={node.alt} title={node.title} />;
    }
    case 'autolink': {
      const Link = components.link ?? DefaultComponents.Link;
      return <Link url={node.url}>{node.url}</Link>;
    }
    case 'hardBreak':
      return <br />;
    case 'softBreak':
      return <> </>;
    case 'htmlInline':
      // SAFE BY DEFAULT: render the raw HTML as text rather than passing
      // it to innerHTML. Two reasons:
      //   1. Security — any consumer rendering user/LLM-generated markdown
      //      would otherwise expose an XSS surface to literal `<script>` etc.
      //   2. Layout safety — a literal `<Table>` or `<table>` in inline
      //      position promotes to a real <table>, closes the surrounding
      //      <p>, and stuffs every following character into auto-generated
      //      cells (the "vertical character text" bug).
      //   Apps that genuinely need raw HTML pass-through can implement a
      //   custom `htmlInline` renderer via the `components` prop.
      return <span class="sk-markdown__html-inline">{node.content}</span>;
  }
}

export function renderBlockNode(node: BlockNode): JSX.Element {
  const components = useMarkdownComponents();

  switch (node.type) {
    case 'heading': {
      const Heading = components.heading ?? DefaultComponents.Heading;
      return <Heading level={node.level}>{node.children.map(renderInlineNode)}</Heading>;
    }
    case 'paragraph': {
      const Paragraph = components.paragraph ?? DefaultComponents.Paragraph;
      return <Paragraph>{node.children.map(renderInlineNode)}</Paragraph>;
    }
    case 'codeBlock': {
      const CodeBlock = components.codeBlock ?? DefaultComponents.CodeBlock;
      return <CodeBlock lang={node.lang} content={node.content} />;
    }
    case 'blockquote': {
      const Blockquote = components.blockquote ?? DefaultComponents.Blockquote;
      return <Blockquote>{node.children.map(renderBlockNode)}</Blockquote>;
    }
    case 'orderedList': {
      const List = components.list ?? DefaultComponents.List;
      return (
        <List ordered={true} start={node.start}>
          <For each={node.items}>{(item) => renderListItem(item)}</For>
        </List>
      );
    }
    case 'unorderedList': {
      const List = components.list ?? DefaultComponents.List;
      return (
        <List ordered={false}>
          <For each={node.items}>{(item) => renderListItem(item)}</For>
        </List>
      );
    }
    case 'table': {
      const Table = components.table ?? DefaultComponents.Table;
      const TableRow = components.tableRow ?? DefaultComponents.TableRow;
      return (
        <Table>
          <thead>
            <TableRow>
              <For each={node.headers}>{(cell) => renderTableCell(cell)}</For>
            </TableRow>
          </thead>
          <tbody>
            <For each={node.rows}>
              {(row) => (
                <TableRow>
                  <For each={row}>{(cell) => renderTableCell(cell)}</For>
                </TableRow>
              )}
            </For>
          </tbody>
        </Table>
      );
    }
    case 'thematicBreak': {
      const ThematicBreak = components.thematicBreak ?? DefaultComponents.ThematicBreak;
      return <ThematicBreak />;
    }
    case 'htmlBlock':
      // SAFE BY DEFAULT — see htmlInline above for the full rationale.
      // Block-level raw HTML blocks render as <pre> text so the source
      // stays visible and inspectable, never executes.
      return <pre class="sk-markdown__html-block">{node.content}</pre>;
    case 'linkReferenceDef':
      return <></>;
  }
}

function renderListItem(item: ListItemNode): JSX.Element {
  const components = useMarkdownComponents();
  const LI = components.listItem ?? DefaultComponents.ListItem;
  return <LI checked={item.checked}>{item.children.map(renderBlockNode)}</LI>;
}

function renderTableCell(cell: TableCellNode): JSX.Element {
  const components = useMarkdownComponents();
  const Cell = components.tableCell ?? DefaultComponents.TableCell;
  return (
    <Cell header={cell.header} align={cell.align}>
      {cell.children.map(renderInlineNode)}
    </Cell>
  );
}

export function renderAST(ast: MarkdownAST): JSX.Element {
  return <>{ast.children.map(renderBlockNode)}</>;
}
