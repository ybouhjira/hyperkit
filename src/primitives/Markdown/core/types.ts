/**
 * Core AST type definitions for SolidKit's markdown parser.
 * @module core/types
 */

// ── Token types (output of tokenizer) ──────────────────────

/**
 * ATX-style heading token (e.g., `# Heading`, `## Heading`).
 */
export interface AtxHeadingToken {
  /** Token type discriminator */
  type: 'atxHeading';
  /** Heading level from 1-6 */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Raw text content after the hash marks */
  content: string;
}

/**
 * Setext-style heading token (underlined with `===` or `---`).
 */
export interface SetextHeadingToken {
  /** Token type discriminator */
  type: 'setextHeading';
  /** Heading level: 1 for `===`, 2 for `---` */
  level: 1 | 2;
  /** Raw text content of the heading */
  content: string;
}

/**
 * Fenced code block token (triple backticks or tildes).
 */
export interface CodeFenceToken {
  /** Token type discriminator */
  type: 'codeFence';
  /** Programming language identifier (e.g., `typescript`, `bash`) */
  lang: string;
  /** Raw code content inside the fence */
  content: string;
}

/**
 * Blockquote token (lines starting with `>`).
 */
export interface BlockquoteToken {
  /** Token type discriminator */
  type: 'blockquote';
  /** Raw content after the `>` marker */
  content: string;
}

/**
 * List item token (ordered or unordered).
 */
export interface ListItemToken {
  /** Token type discriminator */
  type: 'listItem';
  /** List marker character or 'ordered' for numbered lists */
  marker: '-' | '*' | '+' | 'ordered';
  /** Raw content after the marker */
  content: string;
  /** Indentation level (number of spaces) */
  indent: number;
  /** Starting number for ordered lists */
  start?: number;
  /** Checked state for GFM task lists: true = [x], false = [ ] */
  checked?: boolean;
}

/**
 * Thematic break token (horizontal rule: `---`, `***`, `___`).
 */
export interface ThematicBreakToken {
  /** Token type discriminator */
  type: 'thematicBreak';
}

/**
 * Table row token (pipe-separated cells).
 */
export interface TableRowToken {
  /** Token type discriminator */
  type: 'tableRow';
  /** Array of cell contents */
  cells: string[];
}

/**
 * Table separator token (defines column alignments).
 * @remarks Appears between header and body rows in GFM tables
 */
export interface TableSeparatorToken {
  /** Token type discriminator */
  type: 'tableSeparator';
  /** Alignment for each column: left, center, right, or null for default */
  alignments: ('left' | 'center' | 'right' | null)[];
}

/**
 * Paragraph token (regular text block).
 */
export interface ParagraphToken {
  /** Token type discriminator */
  type: 'paragraph';
  /** Raw text content */
  content: string;
}

/**
 * Blank line token (empty or whitespace-only line).
 */
export interface BlankLineToken {
  /** Token type discriminator */
  type: 'blankLine';
}

/**
 * HTML block token (raw HTML content).
 */
export interface HtmlBlockToken {
  /** Token type discriminator */
  type: 'htmlBlock';
  /** Raw HTML content */
  content: string;
}

/**
 * Link reference definition token (e.g., `[label]: url "title"`).
 */
export interface LinkReferenceDefToken {
  /** Token type discriminator */
  type: 'linkReferenceDef';
  /** Reference label (case-insensitive identifier) */
  label: string;
  /** Destination URL */
  url: string;
  /** Optional title text */
  title?: string;
}

/**
 * Union of all tokenizer output types.
 * @example
 * ```typescript
 * const token: Token = { type: 'atxHeading', level: 1, content: 'Title' };
 * ```
 */
export type Token =
  | AtxHeadingToken
  | SetextHeadingToken
  | CodeFenceToken
  | BlockquoteToken
  | ListItemToken
  | ThematicBreakToken
  | TableRowToken
  | TableSeparatorToken
  | ParagraphToken
  | BlankLineToken
  | HtmlBlockToken
  | LinkReferenceDefToken;

// ── Block Nodes (output of block parser) ──────────────────

/**
 * Heading block node.
 */
export interface HeadingNode {
  /** Node type discriminator */
  type: 'heading';
  /** Heading level from 1-6 */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Parsed inline content */
  children: InlineNode[];
  /** Original raw content before inline parsing */
  rawContent: string;
}

/**
 * Paragraph block node.
 */
export interface ParagraphNode {
  /** Node type discriminator */
  type: 'paragraph';
  /** Parsed inline content */
  children: InlineNode[];
  /** Original raw content before inline parsing */
  rawContent: string;
}

/**
 * Code block node (fenced or indented).
 */
export interface CodeBlockNode {
  /** Node type discriminator */
  type: 'codeBlock';
  /** Programming language identifier (undefined if not specified) */
  lang?: string;
  /** Raw code content */
  content: string;
}

/**
 * Blockquote block node.
 */
export interface BlockquoteNode {
  /** Node type discriminator */
  type: 'blockquote';
  /** Nested block-level content */
  children: BlockNode[];
}

/**
 * Ordered (numbered) list node.
 */
export interface OrderedListNode {
  /** Node type discriminator */
  type: 'orderedList';
  /** Starting number (default: 1) */
  start: number;
  /** List items */
  items: ListItemNode[];
}

/**
 * Unordered (bulleted) list node.
 */
export interface UnorderedListNode {
  /** Node type discriminator */
  type: 'unorderedList';
  /** List items */
  items: ListItemNode[];
}

/**
 * GFM table node.
 */
export interface TableNode {
  /** Node type discriminator */
  type: 'table';
  /** Header row cells */
  headers: TableCellNode[];
  /** Body rows (each row is an array of cells) */
  rows: TableCellNode[][];
  /** Column alignments */
  alignments: ('left' | 'center' | 'right' | null)[];
}

/**
 * Thematic break node (horizontal rule).
 */
export interface ThematicBreakNode {
  /** Node type discriminator */
  type: 'thematicBreak';
}

/**
 * HTML block node (raw HTML content).
 */
export interface HtmlBlockNode {
  /** Node type discriminator */
  type: 'htmlBlock';
  /** Raw HTML content */
  content: string;
}

/**
 * Link reference definition node.
 * @remarks These are typically stored in the document's definitions map
 */
export interface LinkReferenceDefNode {
  /** Node type discriminator */
  type: 'linkReferenceDef';
  /** Reference label */
  label: string;
  /** Destination URL */
  url: string;
  /** Optional title text */
  title?: string;
}

/**
 * Union of all block-level AST nodes.
 * @example
 * ```typescript
 * const block: BlockNode = {
 *   type: 'paragraph',
 *   children: [{ type: 'text', content: 'Hello' }],
 *   rawContent: 'Hello'
 * };
 * ```
 */
export type BlockNode =
  | HeadingNode
  | ParagraphNode
  | CodeBlockNode
  | BlockquoteNode
  | OrderedListNode
  | UnorderedListNode
  | TableNode
  | ThematicBreakNode
  | HtmlBlockNode
  | LinkReferenceDefNode;

// ── Inline Nodes (output of inline parser) ─────────────────

/**
 * Plain text inline node.
 */
export interface TextNode {
  /** Node type discriminator */
  type: 'text';
  /** Text content */
  content: string;
}

/**
 * Emphasis inline node (italic text: `*text*` or `_text_`).
 */
export interface EmphasisNode {
  /** Node type discriminator */
  type: 'emphasis';
  /** Emphasized content */
  children: InlineNode[];
}

/**
 * Strong emphasis inline node (bold text: `**text**` or `__text__`).
 */
export interface StrongNode {
  /** Node type discriminator */
  type: 'strong';
  /** Strong content */
  children: InlineNode[];
}

/**
 * Strikethrough inline node (GFM: `~~text~~`).
 */
export interface StrikethroughNode {
  /** Node type discriminator */
  type: 'strikethrough';
  /** Strikethrough content */
  children: InlineNode[];
}

/**
 * Inline code node (backtick-delimited: `` `code` ``).
 */
export interface InlineCodeNode {
  /** Node type discriminator */
  type: 'inlineCode';
  /** Code content (without backticks) */
  content: string;
}

/**
 * Hyperlink inline node (`[text](url "title")`).
 */
export interface LinkNode {
  /** Node type discriminator */
  type: 'link';
  /** Destination URL */
  url: string;
  /** Optional title attribute */
  title?: string;
  /** Link text content */
  children: InlineNode[];
}

/**
 * Image inline node (`![alt](url "title")`).
 */
export interface ImageNode {
  /** Node type discriminator */
  type: 'image';
  /** Destination URL */
  url: string;
  /** Alt text */
  alt: string;
  /** Optional title attribute */
  title?: string;
}

/**
 * Autolink inline node (raw URL: `<http://example.com>`).
 */
export interface AutolinkNode {
  /** Node type discriminator */
  type: 'autolink';
  /** Destination URL */
  url: string;
}

/**
 * Hard line break inline node (two spaces or backslash at end of line).
 */
export interface HardBreakNode {
  /** Node type discriminator */
  type: 'hardBreak';
}

/**
 * Soft line break inline node (newline within paragraph text).
 */
export interface SoftBreakNode {
  /** Node type discriminator */
  type: 'softBreak';
}

/**
 * Inline HTML node (raw HTML tags or entities).
 */
export interface HtmlInlineNode {
  /** Node type discriminator */
  type: 'htmlInline';
  /** Raw HTML content */
  content: string;
}

/**
 * Union of all inline-level AST nodes.
 * @example
 * ```typescript
 * const inline: InlineNode = { type: 'text', content: 'Hello world' };
 * const bold: InlineNode = {
 *   type: 'strong',
 *   children: [{ type: 'text', content: 'Bold' }]
 * };
 * ```
 */
export type InlineNode =
  | TextNode
  | EmphasisNode
  | StrongNode
  | StrikethroughNode
  | InlineCodeNode
  | LinkNode
  | ImageNode
  | AutolinkNode
  | HardBreakNode
  | SoftBreakNode
  | HtmlInlineNode;

// ── Compound ─────────────────────────────────────────────

/**
 * List item node (can contain multiple block-level elements).
 */
export interface ListItemNode {
  /** Node type discriminator */
  type: 'listItem';
  /** Block-level content of the list item */
  children: BlockNode[];
  /**
   * GFM task list checkbox state.
   * @remarks `true` = checked, `false` = unchecked, `undefined` = not a task item
   */
  checked?: boolean;
}

/**
 * Table cell node (appears in table headers and rows).
 */
export interface TableCellNode {
  /** Node type discriminator */
  type: 'tableCell';
  /** Inline content of the cell */
  children: InlineNode[];
  /** Column alignment */
  align: 'left' | 'center' | 'right' | null;
  /** Whether this cell is in the header row */
  header: boolean;
}

// ── Link Definition ──────────────────────────────────────

/**
 * Link reference definition (stored in document's definitions map).
 * @remarks Used for reference-style links: `[text][label]`
 */
export interface LinkDefinition {
  /** Destination URL */
  url: string;
  /** Optional title text */
  title?: string;
}

// ── Root ─────────────────────────────────────────────────

/**
 * Root AST node representing the entire markdown document.
 */
export interface MarkdownAST {
  /** Node type discriminator */
  type: 'root';
  /** Top-level block nodes */
  children: BlockNode[];
  /** Link reference definitions (keyed by normalized label) */
  definitions: Map<string, LinkDefinition>;
}
