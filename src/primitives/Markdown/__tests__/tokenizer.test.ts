import { describe, it, expect } from 'vitest';
import { tokenize } from '../core/tokenizer';
import type {
  AtxHeadingToken,
  SetextHeadingToken,
  CodeFenceToken,
  BlockquoteToken,
  ListItemToken,
  ThematicBreakToken,
  TableRowToken,
  TableSeparatorToken,
  ParagraphToken,
  BlankLineToken,
  HtmlBlockToken,
  LinkReferenceDefToken,
} from '../core/types';

describe('tokenizer', () => {
  describe('ATX Headings', () => {
    it('should tokenize level 1 heading', () => {
      const tokens = tokenize('# Hello');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 1, content: 'Hello' } as AtxHeadingToken,
      ]);
    });

    it('should tokenize level 2 heading', () => {
      const tokens = tokenize('## Hello');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 2, content: 'Hello' } as AtxHeadingToken,
      ]);
    });

    it('should tokenize level 6 heading', () => {
      const tokens = tokenize('###### Hello');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 6, content: 'Hello' } as AtxHeadingToken,
      ]);
    });

    it('should strip trailing hashes', () => {
      const tokens = tokenize('# Hello #');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 1, content: 'Hello' } as AtxHeadingToken,
      ]);
    });

    it('should strip multiple trailing hashes', () => {
      const tokens = tokenize('## Hello ###');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 2, content: 'Hello' } as AtxHeadingToken,
      ]);
    });

    it('should treat ## without space as paragraph', () => {
      const tokens = tokenize('##No space');
      expect(tokens).toEqual([{ type: 'paragraph', content: '##No space' } as ParagraphToken]);
    });

    it('should treat 7 hashes as paragraph (max 6 levels)', () => {
      const tokens = tokenize('####### Seven');
      expect(tokens).toEqual([{ type: 'paragraph', content: '####### Seven' } as ParagraphToken]);
    });

    it('should handle heading with only hashes after space', () => {
      const tokens = tokenize('# #');
      expect(tokens).toEqual([{ type: 'atxHeading', level: 1, content: '#' } as AtxHeadingToken]);
    });
  });

  describe('Setext Headings', () => {
    it('should tokenize level 1 setext heading', () => {
      const tokens = tokenize('Hello\n===');
      expect(tokens).toEqual([
        { type: 'setextHeading', level: 1, content: 'Hello' } as SetextHeadingToken,
      ]);
    });

    it('should tokenize level 2 setext heading', () => {
      const tokens = tokenize('Hello\n---');
      expect(tokens).toEqual([
        { type: 'setextHeading', level: 2, content: 'Hello' } as SetextHeadingToken,
      ]);
    });

    it('should handle multiple equals signs', () => {
      const tokens = tokenize('Title\n======');
      expect(tokens).toEqual([
        { type: 'setextHeading', level: 1, content: 'Title' } as SetextHeadingToken,
      ]);
    });

    it('should handle multiple dashes', () => {
      const tokens = tokenize('Title\n------');
      expect(tokens).toEqual([
        { type: 'setextHeading', level: 2, content: 'Title' } as SetextHeadingToken,
      ]);
    });

    it('should not convert non-paragraph to setext heading', () => {
      const tokens = tokenize('# ATX Heading\n===');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 1, content: 'ATX Heading' } as AtxHeadingToken,
        { type: 'thematicBreak' } as ThematicBreakToken,
      ]);
    });
  });

  describe('Code Fences', () => {
    it('should tokenize code fence with language', () => {
      const tokens = tokenize('```js\nconsole.log("hi");\n```');
      expect(tokens).toEqual([
        { type: 'codeFence', lang: 'js', content: 'console.log("hi");' } as CodeFenceToken,
      ]);
    });

    it('should tokenize code fence without language', () => {
      const tokens = tokenize('```\ncode here\n```');
      expect(tokens).toEqual([
        { type: 'codeFence', lang: '', content: 'code here' } as CodeFenceToken,
      ]);
    });

    it('should tokenize code fence with tildes', () => {
      const tokens = tokenize('~~~\ncode here\n~~~');
      expect(tokens).toEqual([
        { type: 'codeFence', lang: '', content: 'code here' } as CodeFenceToken,
      ]);
    });

    it('should preserve whitespace in code fence', () => {
      const tokens = tokenize('```\n  indented\n    more\n```');
      expect(tokens).toEqual([
        { type: 'codeFence', lang: '', content: '  indented\n    more' } as CodeFenceToken,
      ]);
    });

    it('should preserve special chars in code fence', () => {
      const tokens = tokenize('```\n# Not a heading\n> Not a quote\n```');
      expect(tokens).toEqual([
        {
          type: 'codeFence',
          lang: '',
          content: '# Not a heading\n> Not a quote',
        } as CodeFenceToken,
      ]);
    });

    it('should handle nested code fence with different fence counts', () => {
      const tokens = tokenize('````\n```\ncode\n```\n````');
      expect(tokens).toEqual([
        { type: 'codeFence', lang: '', content: '```\ncode\n```' } as CodeFenceToken,
      ]);
    });

    it('should handle multiline code fence', () => {
      const tokens = tokenize('```python\ndef hello():\n    print("world")\n```');
      expect(tokens).toEqual([
        {
          type: 'codeFence',
          lang: 'python',
          content: 'def hello():\n    print("world")',
        } as CodeFenceToken,
      ]);
    });

    it('should handle empty code fence', () => {
      const tokens = tokenize('```\n```');
      expect(tokens).toEqual([{ type: 'codeFence', lang: '', content: '' } as CodeFenceToken]);
    });
  });

  describe('Blockquotes', () => {
    it('should tokenize simple blockquote', () => {
      const tokens = tokenize('> quoted');
      expect(tokens).toEqual([{ type: 'blockquote', content: 'quoted' } as BlockquoteToken]);
    });

    it('should tokenize nested blockquote marker', () => {
      const tokens = tokenize('>> nested');
      expect(tokens).toEqual([{ type: 'blockquote', content: '> nested' } as BlockquoteToken]);
    });

    it('should tokenize multiple blockquote lines', () => {
      const tokens = tokenize('> line1\n> line2');
      expect(tokens).toEqual([
        { type: 'blockquote', content: 'line1' } as BlockquoteToken,
        { type: 'blockquote', content: 'line2' } as BlockquoteToken,
      ]);
    });

    it('should handle blockquote with no space after marker', () => {
      const tokens = tokenize('>quoted');
      expect(tokens).toEqual([{ type: 'blockquote', content: 'quoted' } as BlockquoteToken]);
    });

    it('should handle blockquote with extra spaces', () => {
      const tokens = tokenize('>  quoted');
      expect(tokens).toEqual([{ type: 'blockquote', content: ' quoted' } as BlockquoteToken]);
    });
  });

  describe('Lists', () => {
    it('should tokenize dash list item', () => {
      const tokens = tokenize('- item');
      expect(tokens).toEqual([
        { type: 'listItem', marker: '-', content: 'item', indent: 0 } as ListItemToken,
      ]);
    });

    it('should tokenize asterisk list item', () => {
      const tokens = tokenize('* item');
      expect(tokens).toEqual([
        { type: 'listItem', marker: '*', content: 'item', indent: 0 } as ListItemToken,
      ]);
    });

    it('should tokenize plus list item', () => {
      const tokens = tokenize('+ item');
      expect(tokens).toEqual([
        { type: 'listItem', marker: '+', content: 'item', indent: 0 } as ListItemToken,
      ]);
    });

    it('should tokenize ordered list item starting with 1', () => {
      const tokens = tokenize('1. item');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: 'ordered',
          content: 'item',
          indent: 0,
          start: 1,
        } as ListItemToken,
      ]);
    });

    it('should tokenize ordered list item starting with 3', () => {
      const tokens = tokenize('3. item');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: 'ordered',
          content: 'item',
          indent: 0,
          start: 3,
        } as ListItemToken,
      ]);
    });

    it('should tokenize nested list item with 2 spaces', () => {
      const tokens = tokenize('  - nested');
      expect(tokens).toEqual([
        { type: 'listItem', marker: '-', content: 'nested', indent: 2 } as ListItemToken,
      ]);
    });

    it('should tokenize nested list item with 4 spaces', () => {
      const tokens = tokenize('    * nested');
      expect(tokens).toEqual([
        { type: 'listItem', marker: '*', content: 'nested', indent: 4 } as ListItemToken,
      ]);
    });

    it('should tokenize checked task list item', () => {
      const tokens = tokenize('- [x] done');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: '-',
          content: 'done',
          indent: 0,
          checked: true,
        } as ListItemToken,
      ]);
    });

    it('should tokenize unchecked task list item', () => {
      const tokens = tokenize('- [ ] todo');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: '-',
          content: 'todo',
          indent: 0,
          checked: false,
        } as ListItemToken,
      ]);
    });

    it('should tokenize uppercase X as checked', () => {
      const tokens = tokenize('- [X] done');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: '-',
          content: 'done',
          indent: 0,
          checked: true,
        } as ListItemToken,
      ]);
    });

    it('should handle ordered list with task checkbox', () => {
      const tokens = tokenize('1. [x] done');
      expect(tokens).toEqual([
        {
          type: 'listItem',
          marker: 'ordered',
          content: 'done',
          indent: 0,
          start: 1,
          checked: true,
        } as ListItemToken,
      ]);
    });
  });

  describe('Thematic Breaks', () => {
    it('should tokenize three dashes', () => {
      const tokens = tokenize('---');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should tokenize three asterisks', () => {
      const tokens = tokenize('***');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should tokenize three underscores', () => {
      const tokens = tokenize('___');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should tokenize thematic break with spaces', () => {
      const tokens = tokenize('- - -');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should tokenize thematic break with more than 3 chars', () => {
      const tokens = tokenize('-----');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should treat 2 dashes as paragraph', () => {
      const tokens = tokenize('--');
      expect(tokens).toEqual([{ type: 'paragraph', content: '--' } as ParagraphToken]);
    });

    it('should tokenize thematic break with trailing spaces', () => {
      const tokens = tokenize('---   ');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });

    it('should tokenize thematic break with leading spaces', () => {
      const tokens = tokenize('   ---');
      expect(tokens).toEqual([{ type: 'thematicBreak' } as ThematicBreakToken]);
    });
  });

  describe('Tables (GFM)', () => {
    it('should tokenize table row', () => {
      const tokens = tokenize('| a | b |');
      expect(tokens).toEqual([{ type: 'tableRow', cells: ['a', 'b'] } as TableRowToken]);
    });

    it('should tokenize table row without outer pipes', () => {
      const tokens = tokenize('a | b');
      expect(tokens).toEqual([{ type: 'tableRow', cells: ['a', 'b'] } as TableRowToken]);
    });

    it('should tokenize table separator with center alignment', () => {
      const tokens = tokenize('| --- | :---: |');
      expect(tokens).toEqual([
        { type: 'tableSeparator', alignments: [null, 'center'] } as TableSeparatorToken,
      ]);
    });

    it('should tokenize table separator with left and right alignment', () => {
      const tokens = tokenize('| :--- | ---: |');
      expect(tokens).toEqual([
        { type: 'tableSeparator', alignments: ['left', 'right'] } as TableSeparatorToken,
      ]);
    });

    it('should tokenize table separator with all alignments', () => {
      const tokens = tokenize('| :--- | :---: | ---: | --- |');
      expect(tokens).toEqual([
        {
          type: 'tableSeparator',
          alignments: ['left', 'center', 'right', null],
        } as TableSeparatorToken,
      ]);
    });

    it('should tokenize table separator without outer pipes', () => {
      const tokens = tokenize(':--- | :---:');
      expect(tokens).toEqual([
        { type: 'tableSeparator', alignments: ['left', 'center'] } as TableSeparatorToken,
      ]);
    });

    it('should trim whitespace in table cells', () => {
      const tokens = tokenize('|  a  |  b  |');
      expect(tokens).toEqual([{ type: 'tableRow', cells: ['a', 'b'] } as TableRowToken]);
    });
  });

  describe('Blank Lines', () => {
    it('should tokenize empty line', () => {
      const tokens = tokenize('');
      expect(tokens).toEqual([{ type: 'blankLine' } as BlankLineToken]);
    });

    it('should tokenize line with only spaces', () => {
      const tokens = tokenize('   ');
      expect(tokens).toEqual([{ type: 'blankLine' } as BlankLineToken]);
    });

    it('should tokenize line with only tabs', () => {
      const tokens = tokenize('\t\t');
      expect(tokens).toEqual([{ type: 'blankLine' } as BlankLineToken]);
    });

    it('should tokenize multiple blank lines', () => {
      const tokens = tokenize('\n\n');
      expect(tokens).toEqual([
        { type: 'blankLine' } as BlankLineToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'blankLine' } as BlankLineToken,
      ]);
    });
  });

  describe('HTML Blocks', () => {
    it('should tokenize simple HTML block', () => {
      const tokens = tokenize('<div>content</div>');
      expect(tokens).toEqual([
        { type: 'htmlBlock', content: '<div>content</div>' } as HtmlBlockToken,
      ]);
    });

    it('should tokenize HTML comment', () => {
      const tokens = tokenize('<!-- comment -->');
      expect(tokens).toEqual([
        { type: 'htmlBlock', content: '<!-- comment -->' } as HtmlBlockToken,
      ]);
    });

    it('should tokenize self-closing HTML tag', () => {
      const tokens = tokenize('<br />');
      expect(tokens).toEqual([{ type: 'htmlBlock', content: '<br />' } as HtmlBlockToken]);
    });

    it('should tokenize HTML tag with attributes', () => {
      const tokens = tokenize('<div class="test" id="main">');
      expect(tokens).toEqual([
        { type: 'htmlBlock', content: '<div class="test" id="main">' } as HtmlBlockToken,
      ]);
    });
  });

  describe('Link Reference Definitions', () => {
    it('should tokenize link reference with title', () => {
      const tokens = tokenize('[label]: http://url "title"');
      expect(tokens).toEqual([
        {
          type: 'linkReferenceDef',
          label: 'label',
          url: 'http://url',
          title: 'title',
        } as LinkReferenceDefToken,
      ]);
    });

    it('should tokenize link reference without title', () => {
      const tokens = tokenize('[label]: http://url');
      expect(tokens).toEqual([
        {
          type: 'linkReferenceDef',
          label: 'label',
          url: 'http://url',
        } as LinkReferenceDefToken,
      ]);
    });

    it('should tokenize link reference with single quotes', () => {
      const tokens = tokenize("[label]: http://url 'title'");
      expect(tokens).toEqual([
        {
          type: 'linkReferenceDef',
          label: 'label',
          url: 'http://url',
          title: 'title',
        } as LinkReferenceDefToken,
      ]);
    });

    it('should tokenize link reference with parentheses title', () => {
      const tokens = tokenize('[label]: http://url (title)');
      expect(tokens).toEqual([
        {
          type: 'linkReferenceDef',
          label: 'label',
          url: 'http://url',
          title: 'title',
        } as LinkReferenceDefToken,
      ]);
    });
  });

  describe('Paragraphs', () => {
    it('should tokenize regular text as paragraph', () => {
      const tokens = tokenize('Regular text');
      expect(tokens).toEqual([{ type: 'paragraph', content: 'Regular text' } as ParagraphToken]);
    });

    it('should tokenize multiple lines as separate paragraphs', () => {
      const tokens = tokenize('Line 1\nLine 2');
      expect(tokens).toEqual([
        { type: 'paragraph', content: 'Line 1' } as ParagraphToken,
        { type: 'paragraph', content: 'Line 2' } as ParagraphToken,
      ]);
    });
  });

  describe('Windows Line Endings', () => {
    it('should handle CRLF line endings', () => {
      const tokens = tokenize('# Hello\r\nWorld');
      expect(tokens).toEqual([
        { type: 'atxHeading', level: 1, content: 'Hello' } as AtxHeadingToken,
        { type: 'paragraph', content: 'World' } as ParagraphToken,
      ]);
    });
  });

  describe('Multi-block Documents', () => {
    it('should tokenize complex document', () => {
      const markdown = `# Title

A paragraph.

## Subtitle

- Item 1
- Item 2

\`\`\`js
code();
\`\`\`

> Quote

---

Another paragraph.`;

      const tokens = tokenize(markdown);

      expect(tokens).toEqual([
        { type: 'atxHeading', level: 1, content: 'Title' } as AtxHeadingToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'paragraph', content: 'A paragraph.' } as ParagraphToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'atxHeading', level: 2, content: 'Subtitle' } as AtxHeadingToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'listItem', marker: '-', content: 'Item 1', indent: 0 } as ListItemToken,
        { type: 'listItem', marker: '-', content: 'Item 2', indent: 0 } as ListItemToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'codeFence', lang: 'js', content: 'code();' } as CodeFenceToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'blockquote', content: 'Quote' } as BlockquoteToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'thematicBreak' } as ThematicBreakToken,
        { type: 'blankLine' } as BlankLineToken,
        { type: 'paragraph', content: 'Another paragraph.' } as ParagraphToken,
      ]);
    });

    it('should tokenize full table', () => {
      const markdown = `| Name | Age |
| --- | --- |
| Alice | 30 |
| Bob | 25 |`;

      const tokens = tokenize(markdown);

      expect(tokens).toEqual([
        { type: 'tableRow', cells: ['Name', 'Age'] } as TableRowToken,
        { type: 'tableSeparator', alignments: [null, null] } as TableSeparatorToken,
        { type: 'tableRow', cells: ['Alice', '30'] } as TableRowToken,
        { type: 'tableRow', cells: ['Bob', '25'] } as TableRowToken,
      ]);
    });
  });
});
