import { tokenize } from './tokenizer';
import { parseBlocks } from './block-parser';
import { parseInline } from './inline-parser';
import type { MarkdownAST, BlockNode, LinkDefinition, ListItemNode, TableCellNode } from './types';

/**
 * Parse markdown string into a complete AST.
 *
 * This is the main orchestrator that coordinates the three parsing phases:
 * 1. **Tokenization**: Lexical analysis to identify block-level structures
 * 2. **Block parsing**: Build the block-level AST tree (pass 1)
 * 3. **Inline parsing**: Process inline content within blocks (pass 2)
 *
 * @param markdown - Raw markdown string to parse
 * @returns Complete AST with inline content resolved and link definitions stored
 *
 * @example
 * ```typescript
 * const ast = parse('# Hello **world**\n\nA paragraph with [link][ref]\n\n[ref]: url');
 * // Returns AST with:
 * // - Heading node with inline-parsed children (text + strong)
 * // - Paragraph node with inline-parsed link
 * // - Link definition stored in definitions map
 * ```
 */
export function parse(markdown: string): MarkdownAST {
  // Step 1: Tokenize - break markdown into block-level tokens
  const tokens = tokenize(markdown);

  // Step 2: Parse blocks - build block-level AST structure
  const { blocks, definitions } = parseBlocks(tokens);

  // Step 3: Process inline content - walk AST and apply inline parsing
  // Note: Filter out link reference definition nodes - they belong only in the definitions map
  const processedBlocks = blocks
    .filter((block) => block.type !== 'linkReferenceDef')
    .map((block) => processBlock(block, definitions));

  return {
    type: 'root',
    children: processedBlocks,
    definitions,
  };
}

/**
 * Recursively process a block node to apply inline parsing.
 *
 * This function walks the block AST and applies inline parsing where needed:
 * - **HeadingNode**: Parses rawContent into inline children
 * - **ParagraphNode**: Parses rawContent into inline children
 * - **CodeBlockNode**: No processing (code is literal)
 * - **BlockquoteNode**: Recursively processes child blocks
 * - **OrderedListNode / UnorderedListNode**: Recursively processes list items
 * - **TableNode**: Applies inline parsing to cell content
 * - **ThematicBreakNode / HtmlBlockNode / LinkReferenceDefNode**: No processing
 *
 * @param block - Block node to process
 * @param definitions - Link reference definitions for resolving references
 * @returns Processed block node with inline content parsed
 */
export function processBlock(
  block: BlockNode,
  definitions: Map<string, LinkDefinition>
): BlockNode {
  switch (block.type) {
    case 'heading': {
      // Parse heading text content into inline nodes
      const children = parseInline(block.rawContent, definitions);
      return { ...block, children };
    }

    case 'paragraph': {
      // Parse paragraph text content into inline nodes
      const children = parseInline(block.rawContent, definitions);
      return { ...block, children };
    }

    case 'codeBlock': {
      // Normalize lang field: undefined -> empty string
      return {
        ...block,
        lang: block.lang || '',
      };
    }

    case 'blockquote': {
      // Recursively process nested blocks
      const children = block.children.map((child) => processBlock(child, definitions));
      return { ...block, children };
    }

    case 'orderedList':
    case 'unorderedList': {
      // Process each list item
      const items = block.items.map((item) => processListItem(item, definitions));
      return { ...block, items };
    }

    case 'table': {
      // Process header cells
      const headers = block.headers.map((cell) => processTableCell(cell, definitions));
      // Process body rows
      const rows = block.rows.map((row) => row.map((cell) => processTableCell(cell, definitions)));
      return { ...block, headers, rows };
    }

    case 'thematicBreak':
    case 'htmlBlock':
    case 'linkReferenceDef':
      // No processing needed for these node types
      return block;

    default: {
      // Exhaustiveness check
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/**
 * Process a list item node by recursively processing its child blocks.
 *
 * @param item - List item node to process
 * @param definitions - Link reference definitions
 * @returns Processed list item with inline content parsed
 */
export function processListItem(
  item: ListItemNode,
  definitions: Map<string, LinkDefinition>
): ListItemNode {
  const children = item.children.map((child) => processBlock(child, definitions));
  return { ...item, children };
}

/**
 * Process a table cell by applying inline parsing to its text content.
 *
 * The block-parser outputs table cells with a single TextNode child containing
 * the raw cell text. This function extracts that text and replaces it with
 * inline-parsed content (links, emphasis, code, etc.).
 *
 * @param cell - Table cell node to process
 * @param definitions - Link reference definitions
 * @returns Processed table cell with inline content parsed
 */
export function processTableCell(
  cell: TableCellNode,
  definitions: Map<string, LinkDefinition>
): TableCellNode {
  // Extract raw text from the TextNode child (placed by block-parser)
  const firstChild = cell.children[0];
  const rawText =
    cell.children.length > 0 && firstChild && firstChild.type === 'text' ? firstChild.content : '';

  // Apply inline parsing to the raw text
  const children = parseInline(rawText, definitions);

  return { ...cell, children };
}
