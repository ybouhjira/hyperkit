/**
 * Block parser - Phase 3 of the markdown parser.
 * Transforms a flat array of tokens into a tree of block-level AST nodes.
 * @module core/block-parser
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { tokenize as tokenizeImpl } from './tokenizer';
import type {
  Token,
  BlockNode,
  OrderedListNode,
  UnorderedListNode,
  TableNode,
  ListItemNode,
  TableCellNode,
  LinkDefinition,
  CodeFenceToken,
  BlockquoteToken,
  ListItemToken,
  LinkReferenceDefToken,
  HtmlBlockToken,
  TableRowToken,
  TableSeparatorToken,
  ParagraphToken,
} from './types';

export interface ParseBlocksResult {
  blocks: BlockNode[];
  definitions: Map<string, LinkDefinition>;
}

/**
 * Parse tokens into block-level AST nodes.
 * @param tokens - Array of tokens from tokenizer
 * @returns Block nodes and link reference definitions
 */
export function parseBlocks(tokens: Token[]): ParseBlocksResult {
  const blocks: BlockNode[] = [];
  const definitions = new Map<string, LinkDefinition>();
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i]!; // Non-null assertion: i < tokens.length guarantees token exists

    // Skip blank lines
    if (token.type === 'blankLine') {
      i++;
      continue;
    }

    // ATX heading
    if (token.type === 'atxHeading') {
      blocks.push({
        type: 'heading',
        level: token.level,
        rawContent: token.content,
        children: [],
      });
      i++;
      continue;
    }

    // Setext heading
    if (token.type === 'setextHeading') {
      blocks.push({
        type: 'heading',
        level: token.level,
        rawContent: token.content,
        children: [],
      });
      i++;
      continue;
    }

    // Code fence
    if (token.type === 'codeFence') {
      const codeFenceToken = token as CodeFenceToken;
      blocks.push({
        type: 'codeBlock',
        lang: codeFenceToken.lang || undefined,
        content: codeFenceToken.content,
      });
      i++;
      continue;
    }

    // Thematic break
    if (token.type === 'thematicBreak') {
      blocks.push({
        type: 'thematicBreak',
      });
      i++;
      continue;
    }

    // HTML block - collect consecutive HTML tokens
    if (token.type === 'htmlBlock') {
      const htmlContents: string[] = [];
      while (i < tokens.length && tokens[i]!.type === 'htmlBlock') {
        htmlContents.push((tokens[i]! as HtmlBlockToken).content);
        i++;
      }

      blocks.push({
        type: 'htmlBlock',
        content: htmlContents.join('\n'),
      });
      continue;
    }

    // Link reference definition
    if (token.type === 'linkReferenceDef') {
      const linkRefToken = token as LinkReferenceDefToken;
      const normalizedLabel = linkRefToken.label.toLowerCase();
      definitions.set(normalizedLabel, {
        url: linkRefToken.url,
        title: linkRefToken.title,
      });
      blocks.push({
        type: 'linkReferenceDef',
        label: linkRefToken.label,
        url: linkRefToken.url,
        title: linkRefToken.title,
      });
      i++;
      continue;
    }

    // Blockquote - collect consecutive blockquote tokens
    if (token.type === 'blockquote') {
      const quoteContents: string[] = [];
      while (i < tokens.length && tokens[i]!.type === 'blockquote') {
        quoteContents.push((tokens[i]! as BlockquoteToken).content);
        i++;
      }

      // Join content and recursively parse
      const joinedContent = quoteContents.join('\n');
      const nestedResult = parseBlocks(tokenize(joinedContent));

      blocks.push({
        type: 'blockquote',
        children: nestedResult.blocks,
      });
      continue;
    }

    // List item - collect consecutive list items
    if (token.type === 'listItem') {
      const result = parseList(tokens, i);
      blocks.push(result.listNode);
      i = result.nextIndex;
      continue;
    }

    // Table - pattern: TableRow, TableSeparator, TableRow...
    if (
      token.type === 'tableRow' &&
      i + 1 < tokens.length &&
      tokens[i + 1]!.type === 'tableSeparator'
    ) {
      const result = parseTable(tokens, i);
      blocks.push(result.tableNode);
      i = result.nextIndex;
      continue;
    }

    // Paragraph - collect consecutive paragraph tokens
    if (token.type === 'paragraph') {
      const contents: string[] = [];
      while (i < tokens.length && tokens[i]!.type === 'paragraph') {
        contents.push((tokens[i]! as ParagraphToken).content);
        i++;

        // Stop if we hit a blank line
        if (i < tokens.length && tokens[i]!.type === 'blankLine') {
          break;
        }
      }

      blocks.push({
        type: 'paragraph',
        rawContent: contents.join('\n'),
        children: [],
      });
      continue;
    }

    // Fallback: skip unknown token
    i++;
  }

  return { blocks, definitions };
}

/**
 * Parse a list (ordered or unordered) from tokens.
 */
function parseList(
  tokens: Token[],
  startIndex: number
): { listNode: OrderedListNode | UnorderedListNode; nextIndex: number } {
  const firstItem = tokens[startIndex] as ListItemToken;
  const isOrdered = firstItem.marker === 'ordered';
  const items: ListItemNode[] = [];
  const baseIndent = firstItem.indent;
  let i = startIndex;

  while (i < tokens.length) {
    const token = tokens[i]!; // Non-null assertion: i < tokens.length guarantees token exists

    if (token.type !== 'listItem') break;

    const item = token as ListItemToken;

    // Stop if marker type changes or we go back to base indent or less with different marker
    if (isOrdered && item.marker !== 'ordered') break;
    if (!isOrdered && item.marker === 'ordered') break;

    // Same indent level = sibling item
    if (item.indent === baseIndent) {
      const itemBlocks = parseBlocks(tokenize(item.content));
      items.push({
        type: 'listItem',
        children: itemBlocks.blocks,
        checked: item.checked,
      });
      i++;
    }
    // Greater indent = nested list (belongs to previous item)
    else if (item.indent > baseIndent) {
      // Collect all nested items
      const nestedItems: ListItemToken[] = [];

      while (
        i < tokens.length &&
        tokens[i]!.type === 'listItem' &&
        (tokens[i]! as ListItemToken).indent > baseIndent
      ) {
        nestedItems.push(tokens[i]! as ListItemToken);
        i++;
      }

      // Parse nested list
      const nestedResult = parseList(nestedItems, 0);

      // Add to last item's children
      if (items.length > 0) {
        items[items.length - 1]!.children.push(nestedResult.listNode);
      }
    }
    // Less indent = we're done
    else {
      break;
    }
  }

  if (isOrdered) {
    return {
      listNode: {
        type: 'orderedList',
        start: firstItem.start ?? 1,
        items,
      },
      nextIndex: i,
    };
  } else {
    return {
      listNode: {
        type: 'unorderedList',
        items,
      },
      nextIndex: i,
    };
  }
}

/**
 * Parse a table from tokens.
 */
function parseTable(
  tokens: Token[],
  startIndex: number
): { tableNode: TableNode; nextIndex: number } {
  let i = startIndex;

  // First row = headers
  const headerRow = tokens[i] as TableRowToken;
  const headerCells = headerRow.cells;
  i++;

  // Second row = separator with alignments
  const separator = tokens[i] as TableSeparatorToken;
  const alignments = separator.alignments;
  i++;

  // Parse header cells
  const headers: TableCellNode[] = headerCells.map((cellContent, idx): TableCellNode => ({
    type: 'tableCell' as const,
    children: [{ type: 'text' as const, content: cellContent.trim() }],
    align: alignments[idx] || null,
    header: true,
  }));

  // Parse body rows
  const rows: TableCellNode[][] = [];
  while (i < tokens.length && tokens[i]!.type === 'tableRow') {
    const rowToken = tokens[i]! as TableRowToken;
    const cells: TableCellNode[] = rowToken.cells.map((cellContent, idx): TableCellNode => ({
      type: 'tableCell' as const,
      children: [{ type: 'text' as const, content: cellContent.trim() }],
      align: alignments[idx] || null,
      header: false,
    }));
    rows.push(cells);
    i++;
  }

  return {
    tableNode: {
      type: 'table',
      headers,
      rows,
      alignments,
    },
    nextIndex: i,
  };
}

/**
 * Helper function to tokenize content for recursive parsing.
 */
function tokenize(input: string): Token[] {
  return tokenizeImpl(input);
}
