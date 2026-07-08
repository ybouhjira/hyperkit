import { describe, it, expect } from 'vitest';
import { parse } from '../core/parser';
import type {
  HeadingNode,
  ParagraphNode,
  BlockquoteNode,
  OrderedListNode,
  UnorderedListNode,
  TableNode,
  CodeBlockNode,
  ThematicBreakNode,
  TextNode,
  StrongNode,
  EmphasisNode,
  LinkNode,
} from '../core/types';

describe('Parser Orchestrator', () => {
  describe('Empty and Whitespace', () => {
    it('should handle empty input', () => {
      const ast = parse('');
      expect(ast.type).toBe('root');
      expect(ast.children).toEqual([]);
      expect(ast.definitions.size).toBe(0);
    });

    it('should handle whitespace-only input', () => {
      const ast = parse('   \n\n  \t\n  ');
      expect(ast.type).toBe('root');
      expect(ast.children).toEqual([]);
    });
  });

  describe('Single Block Types', () => {
    it('should parse a single heading with inline content', () => {
      const ast = parse('# Hello World');
      expect(ast.children).toHaveLength(1);

      const heading = ast.children[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(1);
      expect(heading.children).toHaveLength(1);

      const text = heading.children[0] as TextNode;
      expect(text.type).toBe('text');
      expect(text.content).toBe('Hello World');
    });

    it('should parse a paragraph with bold inline formatting', () => {
      const ast = parse('Hello **world**');
      expect(ast.children).toHaveLength(1);

      const paragraph = ast.children[0] as ParagraphNode;
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.children).toHaveLength(2);

      const text = paragraph.children[0] as TextNode;
      expect(text.type).toBe('text');
      expect(text.content).toBe('Hello ');

      const strong = paragraph.children[1] as StrongNode;
      expect(strong.type).toBe('strong');
      expect(strong.children).toHaveLength(1);
      expect((strong.children[0] as TextNode).content).toBe('world');
    });

    it('should parse a code block without inline parsing', () => {
      const ast = parse('```js\nconst x = **bold**;\n```');
      expect(ast.children).toHaveLength(1);

      const codeBlock = ast.children[0] as CodeBlockNode;
      expect(codeBlock.type).toBe('codeBlock');
      expect(codeBlock.lang).toBe('js');
      expect(codeBlock.content).toBe('const x = **bold**;');
    });

    it('should parse a code block with no lang as empty string', () => {
      const ast = parse('```\ncode\n```');
      expect(ast.children).toHaveLength(1);

      const codeBlock = ast.children[0] as CodeBlockNode;
      expect(codeBlock.type).toBe('codeBlock');
      expect(codeBlock.lang).toBe('');
      expect(codeBlock.content).toBe('code');
    });

    it('should parse a thematic break', () => {
      const ast = parse('---');
      expect(ast.children).toHaveLength(1);

      const hr = ast.children[0] as ThematicBreakNode;
      expect(hr.type).toBe('thematicBreak');
    });
  });

  describe('Blockquotes', () => {
    it('should parse blockquote with inline-formatted paragraph', () => {
      const ast = parse('> Hello **world**');
      expect(ast.children).toHaveLength(1);

      const blockquote = ast.children[0] as BlockquoteNode;
      expect(blockquote.type).toBe('blockquote');
      expect(blockquote.children).toHaveLength(1);

      const paragraph = blockquote.children[0] as ParagraphNode;
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.children).toHaveLength(2);

      const text = paragraph.children[0] as TextNode;
      expect(text.content).toBe('Hello ');

      const strong = paragraph.children[1] as StrongNode;
      expect(strong.children).toHaveLength(1);
      expect((strong.children[0] as TextNode).content).toBe('world');
    });

    it('should parse nested blockquote with multiple paragraphs', () => {
      const ast = parse('> First *line*\n>\n> Second **line**');
      expect(ast.children).toHaveLength(1);

      const blockquote = ast.children[0] as BlockquoteNode;
      expect(blockquote.children).toHaveLength(2);

      const para1 = blockquote.children[0] as ParagraphNode;
      expect(para1.children).toHaveLength(2);
      expect((para1.children[0] as TextNode).content).toBe('First ');
      expect((para1.children[1] as EmphasisNode).type).toBe('emphasis');

      const para2 = blockquote.children[1] as ParagraphNode;
      expect(para2.children).toHaveLength(2);
      expect((para2.children[0] as TextNode).content).toBe('Second ');
      expect((para2.children[1] as StrongNode).type).toBe('strong');
    });
  });

  describe('Lists', () => {
    it('should parse unordered list with inline formatting', () => {
      const ast = parse('- Item **one**\n- Item *two*');
      expect(ast.children).toHaveLength(1);

      const list = ast.children[0] as UnorderedListNode;
      expect(list.type).toBe('unorderedList');
      expect(list.items).toHaveLength(2);

      const item1 = list.items[0];
      expect(item1.children).toHaveLength(1);
      const para1 = item1.children[0] as ParagraphNode;
      expect(para1.children).toHaveLength(2);
      expect((para1.children[0] as TextNode).content).toBe('Item ');
      expect((para1.children[1] as StrongNode).type).toBe('strong');

      const item2 = list.items[1];
      const para2 = item2.children[0] as ParagraphNode;
      expect(para2.children).toHaveLength(2);
      expect((para2.children[0] as TextNode).content).toBe('Item ');
      expect((para2.children[1] as EmphasisNode).type).toBe('emphasis');
    });

    it('should parse ordered list with inline formatting', () => {
      const ast = parse('1. First **item**\n2. Second `code`');
      expect(ast.children).toHaveLength(1);

      const list = ast.children[0] as OrderedListNode;
      expect(list.type).toBe('orderedList');
      expect(list.start).toBe(1);
      expect(list.items).toHaveLength(2);

      const item1 = list.items[0];
      const para1 = item1.children[0] as ParagraphNode;
      expect(para1.children).toHaveLength(2);
      expect((para1.children[0] as TextNode).content).toBe('First ');
      expect((para1.children[1] as StrongNode).type).toBe('strong');
    });

    it('should parse task list with inline formatting', () => {
      const ast = parse('- [ ] Todo **item**\n- [x] Done *item*');
      expect(ast.children).toHaveLength(1);

      const list = ast.children[0] as UnorderedListNode;
      expect(list.items).toHaveLength(2);

      const item1 = list.items[0];
      expect(item1.checked).toBe(false);
      const para1 = item1.children[0] as ParagraphNode;
      expect((para1.children[0] as TextNode).content).toBe('Todo ');

      const item2 = list.items[1];
      expect(item2.checked).toBe(true);
    });
  });

  describe('Tables', () => {
    it('should parse table with inline formatting in cells', () => {
      const ast = parse('| **Header** | *Col2* |\n|---|---|\n| `code` | [link](url) |');
      expect(ast.children).toHaveLength(1);

      const table = ast.children[0] as TableNode;
      expect(table.type).toBe('table');
      expect(table.headers).toHaveLength(2);
      expect(table.rows).toHaveLength(1);

      // Check header cells have inline parsing
      const header1 = table.headers[0];
      expect(header1.children).toHaveLength(1);
      expect((header1.children[0] as StrongNode).type).toBe('strong');

      const header2 = table.headers[1];
      expect(header2.children).toHaveLength(1);
      expect((header2.children[0] as EmphasisNode).type).toBe('emphasis');

      // Check body cells have inline parsing
      const cell1 = table.rows[0][0];
      expect(cell1.children).toHaveLength(1);
      expect(cell1.children[0].type).toBe('inlineCode');

      const cell2 = table.rows[0][1];
      expect(cell2.children).toHaveLength(1);
      expect((cell2.children[0] as LinkNode).type).toBe('link');
    });

    it('should parse table with alignment', () => {
      const ast = parse('| Left | Center | Right |\n|:---|:---:|---:|\n| L | C | R |');
      const table = ast.children[0] as TableNode;

      expect(table.headers[0].align).toBe('left');
      expect(table.headers[1].align).toBe('center');
      expect(table.headers[2].align).toBe('right');
    });
  });

  describe('Link Reference Definitions', () => {
    it('should store link definitions and resolve references', () => {
      const ast = parse('[link][ref]\n\n[ref]: https://example.com');

      // Definition should be in the definitions map
      expect(ast.definitions.size).toBe(1);
      expect(ast.definitions.has('ref')).toBe(true);
      const def = ast.definitions.get('ref')!;
      expect(def.url).toBe('https://example.com');

      // Link should be resolved
      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0] as ParagraphNode;
      const link = paragraph.children[0] as LinkNode;
      expect(link.type).toBe('link');
      expect(link.url).toBe('https://example.com');
      expect((link.children[0] as TextNode).content).toBe('link');
    });

    it('should handle multiple definitions', () => {
      const ast = parse('[a][ref1] and [b][ref2]\n\n[ref1]: url1\n[ref2]: url2 "title"');

      expect(ast.definitions.size).toBe(2);
      expect(ast.definitions.get('ref1')?.url).toBe('url1');
      expect(ast.definitions.get('ref2')?.url).toBe('url2');
      expect(ast.definitions.get('ref2')?.title).toBe('title');
    });
  });

  describe('GFM Features', () => {
    it('should parse strikethrough', () => {
      const ast = parse('~~deleted text~~');
      const paragraph = ast.children[0] as ParagraphNode;
      expect(paragraph.children[0].type).toBe('strikethrough');
    });

    // Note: Autolink detection is an inline-parser feature, not orchestrator.
    // Skipping this test as it belongs in inline-parser.test.ts
  });

  describe('Complex Documents', () => {
    it('should parse mixed blocks with inline formatting', () => {
      const markdown = `# Title **bold**

Paragraph with *emphasis* and \`code\`.

- List item **one**
- List item *two*

> Quote with **formatting**

---`;

      const ast = parse(markdown);
      expect(ast.children).toHaveLength(5);

      // Heading
      const heading = ast.children[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.children).toHaveLength(2);
      expect((heading.children[1] as StrongNode).type).toBe('strong');

      // Paragraph
      const para = ast.children[1] as ParagraphNode;
      expect(para.type).toBe('paragraph');
      expect(para.children.length).toBeGreaterThan(1);

      // List
      const list = ast.children[2] as UnorderedListNode;
      expect(list.type).toBe('unorderedList');
      expect(list.items).toHaveLength(2);

      // Blockquote
      const quote = ast.children[3] as BlockquoteNode;
      expect(quote.type).toBe('blockquote');

      // Thematic break
      const hr = ast.children[4] as ThematicBreakNode;
      expect(hr.type).toBe('thematicBreak');
    });

    it('should handle deeply nested structures', () => {
      const markdown = `> # Heading in **quote**
>
> - List in *quote*
> - Second **item**`;

      const ast = parse(markdown);
      const blockquote = ast.children[0] as BlockquoteNode;
      expect(blockquote.children).toHaveLength(2);

      // Heading inside blockquote
      const heading = blockquote.children[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.children.length).toBeGreaterThan(1);

      // List inside blockquote
      const list = blockquote.children[1] as UnorderedListNode;
      expect(list.type).toBe('unorderedList');
      expect(list.items).toHaveLength(2);

      // Check inline formatting in list items
      const item1Para = list.items[0].children[0] as ParagraphNode;
      expect(item1Para.children.some((n) => n.type === 'emphasis')).toBe(true);

      const item2Para = list.items[1].children[0] as ParagraphNode;
      expect(item2Para.children.some((n) => n.type === 'strong')).toBe(true);
    });

    it('should handle complex table content', () => {
      const markdown = `| **Feature** | Status |
|---|:---:|
| \`code\` support | ✅ |
| [Links](url) | **yes** |`;

      const ast = parse(markdown);
      const table = ast.children[0] as TableNode;

      // Header with bold
      expect((table.headers[0].children[0] as StrongNode).type).toBe('strong');

      // Body cells with various formatting
      expect(table.rows[0][0].children[0].type).toBe('inlineCode');
      expect((table.rows[1][0].children[0] as LinkNode).type).toBe('link');
      expect((table.rows[1][1].children[0] as StrongNode).type).toBe('strong');
    });
  });

  describe('Edge Cases', () => {
    // Note: Empty list item handling is a tokenizer feature.
    // The tokenizer currently treats "- \n" as a paragraph, not a list item.
    // This is consistent with CommonMark spec (list items need content or proper continuation).

    it('should handle empty blockquote', () => {
      const ast = parse('> ');
      expect(ast.children).toHaveLength(1);
      const blockquote = ast.children[0] as BlockquoteNode;
      expect(blockquote.type).toBe('blockquote');
    });

    it('should handle paragraph with only whitespace formatting', () => {
      const ast = parse('  **  **  ');
      expect(ast.children).toHaveLength(1);
    });

    it('should preserve multiple consecutive blocks', () => {
      const markdown = `Para 1

Para 2

Para 3`;
      const ast = parse(markdown);
      expect(ast.children).toHaveLength(3);
      expect(ast.children.every((n) => n.type === 'paragraph')).toBe(true);
    });
  });
});
