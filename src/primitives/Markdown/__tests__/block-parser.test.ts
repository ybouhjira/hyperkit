import { describe, it, expect } from 'vitest';
import { tokenize } from '../core/tokenizer';
import { parseBlocks } from '../core/block-parser';
import type {
  HeadingNode,
  ParagraphNode,
  CodeBlockNode,
  BlockquoteNode,
  UnorderedListNode,
  OrderedListNode,
  TableNode,
  ThematicBreakNode,
  HtmlBlockNode,
  LinkReferenceDefNode,
  Token,
} from '../core/types';

describe('block parser', () => {
  // Helper function
  function parse(md: string) {
    return parseBlocks(tokenize(md));
  }

  describe('headings', () => {
    it('parses ATX heading level 1', () => {
      const result = parse('# Hello');
      expect(result.blocks).toHaveLength(1);
      const heading = result.blocks[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(1);
      expect(heading.rawContent).toBe('Hello');
      expect(heading.children).toEqual([]);
    });

    it('parses ATX heading level 2', () => {
      const result = parse('## World');
      expect(result.blocks).toHaveLength(1);
      const heading = result.blocks[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(2);
      expect(heading.rawContent).toBe('World');
    });

    it('parses ATX heading level 3-6', () => {
      const result = parse('### Three\n#### Four\n##### Five\n###### Six');
      expect(result.blocks).toHaveLength(4);
      expect((result.blocks[0] as HeadingNode).level).toBe(3);
      expect((result.blocks[1] as HeadingNode).level).toBe(4);
      expect((result.blocks[2] as HeadingNode).level).toBe(5);
      expect((result.blocks[3] as HeadingNode).level).toBe(6);
    });

    it('parses setext heading level 1', () => {
      const result = parse('Hello\n===');
      expect(result.blocks).toHaveLength(1);
      const heading = result.blocks[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(1);
      expect(heading.rawContent).toBe('Hello');
    });

    it('parses setext heading level 2', () => {
      const result = parse('World\n---');
      expect(result.blocks).toHaveLength(1);
      const heading = result.blocks[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(2);
      expect(heading.rawContent).toBe('World');
    });
  });

  describe('paragraphs', () => {
    it('parses simple paragraph', () => {
      const result = parse('Hello world');
      expect(result.blocks).toHaveLength(1);
      const para = result.blocks[0] as ParagraphNode;
      expect(para.type).toBe('paragraph');
      expect(para.rawContent).toBe('Hello world');
      expect(para.children).toEqual([]);
    });

    it('parses two paragraphs separated by blank line', () => {
      const result = parse('para1\n\npara2');
      expect(result.blocks).toHaveLength(2);
      expect((result.blocks[0] as ParagraphNode).rawContent).toBe('para1');
      expect((result.blocks[1] as ParagraphNode).rawContent).toBe('para2');
    });

    it('merges consecutive lines into single paragraph', () => {
      const result = parse('line1\nline2\nline3');
      expect(result.blocks).toHaveLength(1);
      const para = result.blocks[0] as ParagraphNode;
      expect(para.rawContent).toBe('line1\nline2\nline3');
    });

    it('handles multiple blank lines as separator', () => {
      const result = parse('para1\n\n\n\npara2');
      expect(result.blocks).toHaveLength(2);
    });
  });

  describe('code blocks', () => {
    it('parses fenced code block with language', () => {
      const result = parse('```js\nconst x = 1;\n```');
      expect(result.blocks).toHaveLength(1);
      const code = result.blocks[0] as CodeBlockNode;
      expect(code.type).toBe('codeBlock');
      expect(code.lang).toBe('js');
      expect(code.content).toBe('const x = 1;');
    });

    it('parses fenced code block without language', () => {
      const result = parse('```\nplain code\n```');
      expect(result.blocks).toHaveLength(1);
      const code = result.blocks[0] as CodeBlockNode;
      expect(code.type).toBe('codeBlock');
      expect(code.lang).toBeUndefined();
      expect(code.content).toBe('plain code');
    });

    it('parses multi-line code block', () => {
      const result = parse('```js\nline1\nline2\nline3\n```');
      const code = result.blocks[0] as CodeBlockNode;
      expect(code.content).toBe('line1\nline2\nline3');
    });
  });

  describe('blockquotes', () => {
    it('parses simple blockquote', () => {
      const result = parse('> quoted text');
      expect(result.blocks).toHaveLength(1);
      const quote = result.blocks[0] as BlockquoteNode;
      expect(quote.type).toBe('blockquote');
      expect(quote.children).toHaveLength(1);
      expect((quote.children[0] as ParagraphNode).rawContent).toBe('quoted text');
    });

    it('parses multi-line blockquote', () => {
      const result = parse('> line1\n> line2');
      const quote = result.blocks[0] as BlockquoteNode;
      expect(quote.children).toHaveLength(1);
      expect((quote.children[0] as ParagraphNode).rawContent).toBe('line1\nline2');
    });

    it('parses nested blockquote', () => {
      const result = parse('> > deep quote');
      const quote = result.blocks[0] as BlockquoteNode;
      expect(quote.children).toHaveLength(1);
      const nested = quote.children[0] as BlockquoteNode;
      expect(nested.type).toBe('blockquote');
      expect((nested.children[0] as ParagraphNode).rawContent).toBe('deep quote');
    });

    it('parses blockquote with multiple paragraphs', () => {
      const result = parse('> para1\n>\n> para2');
      const quote = result.blocks[0] as BlockquoteNode;
      expect(quote.children).toHaveLength(2);
      expect((quote.children[0] as ParagraphNode).rawContent).toBe('para1');
      expect((quote.children[1] as ParagraphNode).rawContent).toBe('para2');
    });
  });

  describe('unordered lists', () => {
    it('parses simple unordered list', () => {
      const result = parse('- item1\n- item2');
      expect(result.blocks).toHaveLength(1);
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.type).toBe('unorderedList');
      expect(list.items).toHaveLength(2);
      expect((list.items[0].children[0] as ParagraphNode).rawContent).toBe('item1');
      expect((list.items[1].children[0] as ParagraphNode).rawContent).toBe('item2');
    });

    it('parses unordered list with * marker', () => {
      const result = parse('* item1\n* item2');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(2);
    });

    it('parses unordered list with + marker', () => {
      const result = parse('+ item1\n+ item2');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(2);
    });

    it('parses nested unordered list', () => {
      const result = parse('- outer\n  - inner');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(1);
      const outerItem = list.items[0];
      expect(outerItem.children).toHaveLength(2); // paragraph + nested list
      const nestedList = outerItem.children[1] as UnorderedListNode;
      expect(nestedList.type).toBe('unorderedList');
      expect(nestedList.items).toHaveLength(1);
    });

    it('stops nested list when indent decreases', () => {
      const result = parse('- outer\n  - inner\n- back to outer');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(2);
      expect((list.items[0].children[0] as ParagraphNode).rawContent).toBe('outer');
    });

    it('handles list items returning to lower indent after nesting', () => {
      // This tests the else { break; } in parseList at line 252
      // When processing nested items recursively, an item with lower indent breaks the loop
      const result = parse(
        '- outer\n  - nested1\n  - nested2\n    - deeply nested\n  - back to nested'
      );
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(1);
      // Outer item should have a nested list
      const nestedList = list.items[0].children[1] as UnorderedListNode;
      expect(nestedList.type).toBe('unorderedList');
      // The nested list has 3 items (nested1, nested2 with deep child, back to nested)
      expect(nestedList.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('ordered lists', () => {
    it('parses simple ordered list', () => {
      const result = parse('1. first\n2. second');
      expect(result.blocks).toHaveLength(1);
      const list = result.blocks[0] as OrderedListNode;
      expect(list.type).toBe('orderedList');
      expect(list.start).toBe(1);
      expect(list.items).toHaveLength(2);
    });

    it('parses ordered list with custom start', () => {
      const result = parse('3. item');
      const list = result.blocks[0] as OrderedListNode;
      expect(list.start).toBe(3);
      expect(list.items).toHaveLength(1);
    });

    it('parses nested ordered list', () => {
      const result = parse('1. outer\n   1. inner');
      const list = result.blocks[0] as OrderedListNode;
      expect(list.items).toHaveLength(1);
      const nestedList = list.items[0].children[1] as OrderedListNode;
      expect(nestedList.type).toBe('orderedList');
    });
  });

  describe('task lists', () => {
    it('parses task list with checked and unchecked items', () => {
      const result = parse('- [x] done\n- [ ] todo');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(2);
      expect(list.items[0].checked).toBe(true);
      expect(list.items[1].checked).toBe(false);
    });

    it('parses mixed task list', () => {
      const result = parse('- [x] done\n- regular\n- [ ] todo');
      const list = result.blocks[0] as UnorderedListNode;
      expect(list.items).toHaveLength(3);
      expect(list.items[0].checked).toBe(true);
      expect(list.items[1].checked).toBeUndefined();
      expect(list.items[2].checked).toBe(false);
    });
  });

  describe('tables', () => {
    it('parses simple table', () => {
      const result = parse('| A | B |\n|---|---|\n| 1 | 2 |');
      expect(result.blocks).toHaveLength(1);
      const table = result.blocks[0] as TableNode;
      expect(table.type).toBe('table');
      expect(table.headers).toHaveLength(2);
      expect(table.headers[0].header).toBe(true);
      expect(table.rows).toHaveLength(1); // body rows only
      expect(table.rows[0]).toHaveLength(2); // 2 cells in first row
    });

    it('parses table with alignment', () => {
      const result = parse('| L | C | R |\n|:---|:---:|---:|\n| 1 | 2 | 3 |');
      const table = result.blocks[0] as TableNode;
      expect(table.alignments[0]).toBe('left');
      expect(table.alignments[1]).toBe('center');
      expect(table.alignments[2]).toBe('right');
      expect(table.headers[0].align).toBe('left');
      expect(table.headers[1].align).toBe('center');
      expect(table.headers[2].align).toBe('right');
      expect(table.rows[0][0].align).toBe('left');
      expect(table.rows[0][1].align).toBe('center');
      expect(table.rows[0][2].align).toBe('right');
    });

    it('parses table with multiple body rows', () => {
      const result = parse('| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n| 5 | 6 |');
      const table = result.blocks[0] as TableNode;
      expect(table.rows).toHaveLength(3); // 3 body rows
      expect(table.headers).toHaveLength(2); // 2 header cells
    });
  });

  describe('thematic breaks', () => {
    it('parses thematic break with hyphens', () => {
      const result = parse('---');
      expect(result.blocks).toHaveLength(1);
      const hr = result.blocks[0] as ThematicBreakNode;
      expect(hr.type).toBe('thematicBreak');
    });

    it('parses thematic break with asterisks', () => {
      const result = parse('***');
      const hr = result.blocks[0] as ThematicBreakNode;
      expect(hr.type).toBe('thematicBreak');
    });

    it('parses thematic break with underscores', () => {
      const result = parse('___');
      const hr = result.blocks[0] as ThematicBreakNode;
      expect(hr.type).toBe('thematicBreak');
    });
  });

  describe('HTML blocks', () => {
    it('parses HTML block', () => {
      const result = parse('<div>content</div>');
      expect(result.blocks).toHaveLength(1);
      const html = result.blocks[0] as HtmlBlockNode;
      expect(html.type).toBe('htmlBlock');
      expect(html.content).toBe('<div>content</div>');
    });

    it('parses multi-line HTML block', () => {
      const result = parse('<div>\n  <p>nested</p>\n</div>');
      const html = result.blocks[0] as HtmlBlockNode;
      // Note: tokenizer trims whitespace from each line
      expect(html.content).toBe('<div>\n<p>nested</p>\n</div>');
    });

    it('collects consecutive HTML blocks into single node', () => {
      const result = parse('<div>line1</div>\n<div>line2</div>');
      expect(result.blocks).toHaveLength(1);
      const html = result.blocks[0] as HtmlBlockNode;
      expect(html.content).toBe('<div>line1</div>\n<div>line2</div>');
    });
  });

  describe('link reference definitions', () => {
    it('extracts link reference definition', () => {
      const result = parse('[ref]: http://example.com "title"');
      expect(result.definitions.size).toBe(1);
      const def = result.definitions.get('ref');
      expect(def).toBeDefined();
      expect(def?.url).toBe('http://example.com');
      expect(def?.title).toBe('title');
    });

    it('normalizes definition labels to lowercase', () => {
      const result = parse('[REF]: http://example.com');
      expect(result.definitions.has('ref')).toBe(true);
    });

    it('creates link reference def node', () => {
      const result = parse('[ref]: http://example.com');
      expect(result.blocks).toHaveLength(1);
      const def = result.blocks[0] as LinkReferenceDefNode;
      expect(def.type).toBe('linkReferenceDef');
      expect(def.label).toBe('ref');
      expect(def.url).toBe('http://example.com');
    });
  });

  describe('complex documents', () => {
    it('parses document with mixed block types', () => {
      const md = `# Title

Paragraph 1

## Subtitle

- List item 1
- List item 2

\`\`\`js
code
\`\`\`

> Quote

---`;
      const result = parse(md);
      expect(result.blocks).toHaveLength(7);
      expect(result.blocks[0].type).toBe('heading');
      expect(result.blocks[1].type).toBe('paragraph');
      expect(result.blocks[2].type).toBe('heading');
      expect(result.blocks[3].type).toBe('unorderedList');
      expect(result.blocks[4].type).toBe('codeBlock');
      expect(result.blocks[5].type).toBe('blockquote');
      expect(result.blocks[6].type).toBe('thematicBreak');
    });

    it('handles empty input', () => {
      const result = parse('');
      expect(result.blocks).toHaveLength(0);
      expect(result.definitions.size).toBe(0);
    });

    it('handles only blank lines', () => {
      const result = parse('\n\n\n');
      expect(result.blocks).toHaveLength(0);
    });

    it('parses document with definitions and content', () => {
      const md = `# Title

[ref]: http://example.com

Paragraph with [ref].`;
      const result = parse(md);
      expect(result.blocks).toHaveLength(3); // heading, definition, paragraph
      expect(result.definitions.size).toBe(1);
    });
  });

  describe('Token handling edge cases', () => {
    it('skips unrecognized token types gracefully', () => {
      // Feed tableSeparator without preceding tableRow - hits fallback skip at line 194
      const tokens: Token[] = [
        { type: 'tableSeparator', alignments: [null] },
        { type: 'paragraph', content: 'after' },
      ];
      const result = parseBlocks(tokens);
      // tableSeparator alone gets skipped, only paragraph remains
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].type).toBe('paragraph');
    });
  });
});
