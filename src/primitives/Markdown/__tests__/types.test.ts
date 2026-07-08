import { describe, it, expect } from 'vitest';
import type {
  // Token types
  Token,
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
  // Block nodes
  BlockNode,
  HeadingNode,
  ParagraphNode,
  CodeBlockNode,
  BlockquoteNode,
  OrderedListNode,
  UnorderedListNode,
  TableNode,
  ThematicBreakNode,
  HtmlBlockNode,
  LinkReferenceDefNode,
  ListItemNode,
  TableCellNode,
  // Inline nodes
  InlineNode,
  TextNode,
  EmphasisNode,
  StrongNode,
  StrikethroughNode,
  InlineCodeNode,
  LinkNode,
  ImageNode,
  AutolinkNode,
  HardBreakNode,
  SoftBreakNode,
  HtmlInlineNode,
  // Root
  MarkdownAST,
  LinkDefinition,
} from '../core/types';

describe('Markdown Token Types', () => {
  describe('AtxHeadingToken', () => {
    it('should construct an ATX heading token', () => {
      const token: AtxHeadingToken = {
        type: 'atxHeading',
        level: 1,
        content: 'Hello World',
      };
      expect(token.type).toBe('atxHeading');
      expect(token.level).toBe(1);
      expect(token.content).toBe('Hello World');
    });

    it('should accept all valid heading levels', () => {
      const levels: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];
      levels.forEach((level) => {
        const token: AtxHeadingToken = {
          type: 'atxHeading',
          level,
          content: 'Test',
        };
        expect(token.level).toBe(level);
      });
    });
  });

  describe('SetextHeadingToken', () => {
    it('should construct a setext heading token', () => {
      const token: SetextHeadingToken = {
        type: 'setextHeading',
        level: 1,
        content: 'Underlined Heading',
      };
      expect(token.type).toBe('setextHeading');
      expect(token.level).toBe(1);
      expect(token.content).toBe('Underlined Heading');
    });
  });

  describe('CodeFenceToken', () => {
    it('should construct a code fence token', () => {
      const token: CodeFenceToken = {
        type: 'codeFence',
        lang: 'typescript',
        content: 'const x = 42;',
      };
      expect(token.type).toBe('codeFence');
      expect(token.lang).toBe('typescript');
      expect(token.content).toBe('const x = 42;');
    });
  });

  describe('BlockquoteToken', () => {
    it('should construct a blockquote token', () => {
      const token: BlockquoteToken = {
        type: 'blockquote',
        content: 'This is a quote',
      };
      expect(token.type).toBe('blockquote');
      expect(token.content).toBe('This is a quote');
    });
  });

  describe('ListItemToken', () => {
    it('should construct an unordered list item token', () => {
      const token: ListItemToken = {
        type: 'listItem',
        marker: '-',
        content: 'Item 1',
        indent: 0,
      };
      expect(token.type).toBe('listItem');
      expect(token.marker).toBe('-');
      expect(token.content).toBe('Item 1');
      expect(token.indent).toBe(0);
    });

    it('should construct an ordered list item token', () => {
      const token: ListItemToken = {
        type: 'listItem',
        marker: 'ordered',
        content: 'First item',
        indent: 0,
        start: 1,
      };
      expect(token.type).toBe('listItem');
      expect(token.marker).toBe('ordered');
      expect(token.start).toBe(1);
    });

    it('should support GFM task list items', () => {
      const checkedToken: ListItemToken = {
        type: 'listItem',
        marker: '-',
        content: 'Done task',
        indent: 0,
        checked: true,
      };
      expect(checkedToken.checked).toBe(true);

      const uncheckedToken: ListItemToken = {
        type: 'listItem',
        marker: '-',
        content: 'Todo task',
        indent: 0,
        checked: false,
      };
      expect(uncheckedToken.checked).toBe(false);
    });
  });

  describe('ThematicBreakToken', () => {
    it('should construct a thematic break token', () => {
      const token: ThematicBreakToken = {
        type: 'thematicBreak',
      };
      expect(token.type).toBe('thematicBreak');
    });
  });

  describe('TableRowToken', () => {
    it('should construct a table row token', () => {
      const token: TableRowToken = {
        type: 'tableRow',
        cells: ['Cell 1', 'Cell 2', 'Cell 3'],
      };
      expect(token.type).toBe('tableRow');
      expect(token.cells).toEqual(['Cell 1', 'Cell 2', 'Cell 3']);
    });
  });

  describe('TableSeparatorToken', () => {
    it('should construct a table separator token', () => {
      const token: TableSeparatorToken = {
        type: 'tableSeparator',
        alignments: ['left', 'center', 'right', null],
      };
      expect(token.type).toBe('tableSeparator');
      expect(token.alignments).toEqual(['left', 'center', 'right', null]);
    });
  });

  describe('ParagraphToken', () => {
    it('should construct a paragraph token', () => {
      const token: ParagraphToken = {
        type: 'paragraph',
        content: 'This is a paragraph.',
      };
      expect(token.type).toBe('paragraph');
      expect(token.content).toBe('This is a paragraph.');
    });
  });

  describe('BlankLineToken', () => {
    it('should construct a blank line token', () => {
      const token: BlankLineToken = {
        type: 'blankLine',
      };
      expect(token.type).toBe('blankLine');
    });
  });

  describe('HtmlBlockToken', () => {
    it('should construct an HTML block token', () => {
      const token: HtmlBlockToken = {
        type: 'htmlBlock',
        content: '<div>Hello</div>',
      };
      expect(token.type).toBe('htmlBlock');
      expect(token.content).toBe('<div>Hello</div>');
    });
  });

  describe('LinkReferenceDefToken', () => {
    it('should construct a link reference definition token', () => {
      const token: LinkReferenceDefToken = {
        type: 'linkReferenceDef',
        label: 'ref',
        url: 'https://example.com',
        title: 'Example',
      };
      expect(token.type).toBe('linkReferenceDef');
      expect(token.label).toBe('ref');
      expect(token.url).toBe('https://example.com');
      expect(token.title).toBe('Example');
    });
  });

  describe('Token union', () => {
    it('should narrow token type in switch statement', () => {
      const tokens: Token[] = [
        { type: 'atxHeading', level: 1, content: 'Title' },
        { type: 'paragraph', content: 'Text' },
        { type: 'codeFence', lang: 'js', content: 'code' },
        { type: 'thematicBreak' },
      ];

      const results = tokens.map((token) => {
        switch (token.type) {
          case 'atxHeading':
            return `h${token.level}`;
          case 'setextHeading':
            return `setext-h${token.level}`;
          case 'paragraph':
            return 'p';
          case 'codeFence':
            return `code-${token.lang}`;
          case 'thematicBreak':
            return 'hr';
          case 'blockquote':
            return 'blockquote';
          case 'listItem':
            return 'li';
          case 'tableRow':
            return 'tr';
          case 'tableSeparator':
            return 'sep';
          case 'blankLine':
            return 'blank';
          case 'htmlBlock':
            return 'html';
          case 'linkReferenceDef':
            return 'ref';
        }
      });

      expect(results).toEqual(['h1', 'p', 'code-js', 'hr']);
    });
  });
});

describe('Markdown Block Node Types', () => {
  describe('HeadingNode', () => {
    it('should construct a heading node', () => {
      const node: HeadingNode = {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', content: 'Hello' }],
        rawContent: 'Hello',
      };
      expect(node.type).toBe('heading');
      expect(node.level).toBe(2);
      expect(node.children).toHaveLength(1);
      expect(node.rawContent).toBe('Hello');
    });
  });

  describe('ParagraphNode', () => {
    it('should construct a paragraph node', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        children: [
          { type: 'text', content: 'Hello ' },
          { type: 'strong', children: [{ type: 'text', content: 'world' }] },
        ],
        rawContent: 'Hello **world**',
      };
      expect(node.type).toBe('paragraph');
      expect(node.children).toHaveLength(2);
      expect(node.rawContent).toBe('Hello **world**');
    });
  });

  describe('CodeBlockNode', () => {
    it('should construct a code block node', () => {
      const node: CodeBlockNode = {
        type: 'codeBlock',
        lang: 'python',
        content: 'print("Hello")',
      };
      expect(node.type).toBe('codeBlock');
      expect(node.lang).toBe('python');
      expect(node.content).toBe('print("Hello")');
    });
  });

  describe('BlockquoteNode', () => {
    it('should construct a blockquote node', () => {
      const node: BlockquoteNode = {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', content: 'Quote' }],
            rawContent: 'Quote',
          },
        ],
      };
      expect(node.type).toBe('blockquote');
      expect(node.children).toHaveLength(1);
    });
  });

  describe('OrderedListNode', () => {
    it('should construct an ordered list node', () => {
      const node: OrderedListNode = {
        type: 'orderedList',
        start: 1,
        items: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'First' }],
                rawContent: 'First',
              },
            ],
          },
        ],
      };
      expect(node.type).toBe('orderedList');
      expect(node.start).toBe(1);
      expect(node.items).toHaveLength(1);
    });
  });

  describe('UnorderedListNode', () => {
    it('should construct an unordered list node', () => {
      const node: UnorderedListNode = {
        type: 'unorderedList',
        items: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Item' }],
                rawContent: 'Item',
              },
            ],
          },
        ],
      };
      expect(node.type).toBe('unorderedList');
      expect(node.items).toHaveLength(1);
    });
  });

  describe('TableNode', () => {
    it('should construct a table node', () => {
      const node: TableNode = {
        type: 'table',
        headers: [
          {
            type: 'tableCell',
            children: [{ type: 'text', content: 'Header 1' }],
            align: 'left',
            header: true,
          },
        ],
        rows: [
          [
            {
              type: 'tableCell',
              children: [{ type: 'text', content: 'Cell 1' }],
              align: 'left',
              header: false,
            },
          ],
        ],
        alignments: ['left', 'center', 'right'],
      };
      expect(node.type).toBe('table');
      expect(node.headers).toHaveLength(1);
      expect(node.rows).toHaveLength(1);
      expect(node.alignments).toEqual(['left', 'center', 'right']);
    });
  });

  describe('ThematicBreakNode', () => {
    it('should construct a thematic break node', () => {
      const node: ThematicBreakNode = {
        type: 'thematicBreak',
      };
      expect(node.type).toBe('thematicBreak');
    });
  });

  describe('HtmlBlockNode', () => {
    it('should construct an HTML block node', () => {
      const node: HtmlBlockNode = {
        type: 'htmlBlock',
        content: '<div>Content</div>',
      };
      expect(node.type).toBe('htmlBlock');
      expect(node.content).toBe('<div>Content</div>');
    });
  });

  describe('LinkReferenceDefNode', () => {
    it('should construct a link reference definition node', () => {
      const node: LinkReferenceDefNode = {
        type: 'linkReferenceDef',
        label: 'myref',
        url: 'https://example.com',
        title: 'Title',
      };
      expect(node.type).toBe('linkReferenceDef');
      expect(node.label).toBe('myref');
      expect(node.url).toBe('https://example.com');
      expect(node.title).toBe('Title');
    });
  });

  describe('BlockNode union', () => {
    it('should narrow block node type in switch statement', () => {
      const nodes: BlockNode[] = [
        { type: 'heading', level: 1, children: [], rawContent: 'Title' },
        { type: 'paragraph', children: [], rawContent: 'Text' },
        { type: 'codeBlock', lang: 'js', content: 'code' },
        { type: 'thematicBreak' },
      ];

      const results = nodes.map((node) => {
        switch (node.type) {
          case 'heading':
            return `h${node.level}`;
          case 'paragraph':
            return 'p';
          case 'codeBlock':
            return `code-${node.lang}`;
          case 'blockquote':
            return 'blockquote';
          case 'orderedList':
            return `ol-${node.start}`;
          case 'unorderedList':
            return 'ul';
          case 'table':
            return 'table';
          case 'thematicBreak':
            return 'hr';
          case 'htmlBlock':
            return 'html';
          case 'linkReferenceDef':
            return 'ref';
        }
      });

      expect(results).toEqual(['h1', 'p', 'code-js', 'hr']);
    });
  });
});

describe('Markdown Inline Node Types', () => {
  describe('TextNode', () => {
    it('should construct a text node', () => {
      const node: TextNode = {
        type: 'text',
        content: 'Hello world',
      };
      expect(node.type).toBe('text');
      expect(node.content).toBe('Hello world');
    });
  });

  describe('EmphasisNode', () => {
    it('should construct an emphasis node', () => {
      const node: EmphasisNode = {
        type: 'emphasis',
        children: [{ type: 'text', content: 'italic' }],
      };
      expect(node.type).toBe('emphasis');
      expect(node.children).toHaveLength(1);
    });
  });

  describe('StrongNode', () => {
    it('should construct a strong node', () => {
      const node: StrongNode = {
        type: 'strong',
        children: [{ type: 'text', content: 'bold' }],
      };
      expect(node.type).toBe('strong');
      expect(node.children).toHaveLength(1);
    });
  });

  describe('StrikethroughNode', () => {
    it('should construct a strikethrough node', () => {
      const node: StrikethroughNode = {
        type: 'strikethrough',
        children: [{ type: 'text', content: 'deleted' }],
      };
      expect(node.type).toBe('strikethrough');
      expect(node.children).toHaveLength(1);
    });
  });

  describe('InlineCodeNode', () => {
    it('should construct an inline code node', () => {
      const node: InlineCodeNode = {
        type: 'inlineCode',
        content: 'const x = 42',
      };
      expect(node.type).toBe('inlineCode');
      expect(node.content).toBe('const x = 42');
    });
  });

  describe('LinkNode', () => {
    it('should construct a link node', () => {
      const node: LinkNode = {
        type: 'link',
        url: 'https://example.com',
        title: 'Example',
        children: [{ type: 'text', content: 'Click here' }],
      };
      expect(node.type).toBe('link');
      expect(node.url).toBe('https://example.com');
      expect(node.title).toBe('Example');
      expect(node.children).toHaveLength(1);
    });

    it('should construct a link node without title', () => {
      const node: LinkNode = {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', content: 'Link' }],
      };
      expect(node.type).toBe('link');
      expect(node.url).toBe('https://example.com');
      expect(node.title).toBeUndefined();
    });
  });

  describe('ImageNode', () => {
    it('should construct an image node', () => {
      const node: ImageNode = {
        type: 'image',
        url: 'https://example.com/image.png',
        alt: 'Alt text',
        title: 'Image title',
      };
      expect(node.type).toBe('image');
      expect(node.url).toBe('https://example.com/image.png');
      expect(node.alt).toBe('Alt text');
      expect(node.title).toBe('Image title');
    });

    it('should construct an image node without title', () => {
      const node: ImageNode = {
        type: 'image',
        url: 'https://example.com/image.png',
        alt: 'Alt text',
      };
      expect(node.type).toBe('image');
      expect(node.title).toBeUndefined();
    });
  });

  describe('AutolinkNode', () => {
    it('should construct an autolink node', () => {
      const node: AutolinkNode = {
        type: 'autolink',
        url: 'https://example.com',
      };
      expect(node.type).toBe('autolink');
      expect(node.url).toBe('https://example.com');
    });
  });

  describe('HardBreakNode', () => {
    it('should construct a hard break node', () => {
      const node: HardBreakNode = {
        type: 'hardBreak',
      };
      expect(node.type).toBe('hardBreak');
    });
  });

  describe('SoftBreakNode', () => {
    it('should construct a soft break node', () => {
      const node: SoftBreakNode = {
        type: 'softBreak',
      };
      expect(node.type).toBe('softBreak');
    });
  });

  describe('HtmlInlineNode', () => {
    it('should construct an HTML inline node', () => {
      const node: HtmlInlineNode = {
        type: 'htmlInline',
        content: '<span>HTML</span>',
      };
      expect(node.type).toBe('htmlInline');
      expect(node.content).toBe('<span>HTML</span>');
    });
  });

  describe('InlineNode union', () => {
    it('should narrow inline node type in switch statement', () => {
      const nodes: InlineNode[] = [
        { type: 'text', content: 'Hello' },
        { type: 'emphasis', children: [{ type: 'text', content: 'italic' }] },
        { type: 'strong', children: [{ type: 'text', content: 'bold' }] },
        { type: 'inlineCode', content: 'code' },
        { type: 'hardBreak' },
      ];

      const results = nodes.map((node) => {
        switch (node.type) {
          case 'text':
            return `text(${node.content})`;
          case 'emphasis':
            return 'em';
          case 'strong':
            return 'strong';
          case 'strikethrough':
            return 'del';
          case 'inlineCode':
            return `code(${node.content})`;
          case 'link':
            return `link(${node.url})`;
          case 'image':
            return `img(${node.alt})`;
          case 'autolink':
            return `autolink(${node.url})`;
          case 'hardBreak':
            return 'br';
          case 'softBreak':
            return 'soft-br';
          case 'htmlInline':
            return 'html-inline';
        }
      });

      expect(results).toEqual(['text(Hello)', 'em', 'strong', 'code(code)', 'br']);
    });

    it('should distinguish all inline node types', () => {
      const types = new Set<string>();

      const nodes: InlineNode[] = [
        { type: 'text', content: '' },
        { type: 'emphasis', children: [] },
        { type: 'strong', children: [] },
        { type: 'strikethrough', children: [] },
        { type: 'inlineCode', content: '' },
        { type: 'link', url: '', children: [] },
        { type: 'image', url: '', alt: '' },
        { type: 'autolink', url: '' },
        { type: 'hardBreak' },
        { type: 'softBreak' },
        { type: 'htmlInline', content: '' },
      ];

      nodes.forEach((node) => types.add(node.type));

      expect(types.size).toBe(11);
    });
  });
});

describe('Compound Node Types', () => {
  describe('ListItemNode', () => {
    it('should construct a list item node', () => {
      const node: ListItemNode = {
        type: 'listItem',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', content: 'Item content' }],
            rawContent: 'Item content',
          },
        ],
      };
      expect(node.type).toBe('listItem');
      expect(node.children).toHaveLength(1);
      expect(node.checked).toBeUndefined();
    });

    it('should support GFM task list items', () => {
      const checkedNode: ListItemNode = {
        type: 'listItem',
        children: [],
        checked: true,
      };
      expect(checkedNode.checked).toBe(true);

      const uncheckedNode: ListItemNode = {
        type: 'listItem',
        children: [],
        checked: false,
      };
      expect(uncheckedNode.checked).toBe(false);

      const normalNode: ListItemNode = {
        type: 'listItem',
        children: [],
      };
      expect(normalNode.checked).toBeUndefined();
    });
  });

  describe('TableCellNode', () => {
    it('should construct a table cell node', () => {
      const node: TableCellNode = {
        type: 'tableCell',
        children: [{ type: 'text', content: 'Cell content' }],
        align: 'center',
        header: true,
      };
      expect(node.type).toBe('tableCell');
      expect(node.children).toHaveLength(1);
      expect(node.align).toBe('center');
      expect(node.header).toBe(true);
    });

    it('should support all alignment options', () => {
      const alignments: Array<'left' | 'center' | 'right' | null> = [
        'left',
        'center',
        'right',
        null,
      ];

      alignments.forEach((align) => {
        const node: TableCellNode = {
          type: 'tableCell',
          children: [],
          align,
          header: false,
        };
        expect(node.align).toBe(align);
      });
    });
  });
});

describe('Link Definition', () => {
  it('should construct a link definition', () => {
    const def: LinkDefinition = {
      url: 'https://example.com',
      title: 'Example Site',
    };
    expect(def.url).toBe('https://example.com');
    expect(def.title).toBe('Example Site');
  });

  it('should construct a link definition without title', () => {
    const def: LinkDefinition = {
      url: 'https://example.com',
    };
    expect(def.url).toBe('https://example.com');
    expect(def.title).toBeUndefined();
  });
});

describe('MarkdownAST Root', () => {
  it('should construct a markdown AST root', () => {
    const ast: MarkdownAST = {
      type: 'root',
      children: [
        {
          type: 'heading',
          level: 1,
          children: [{ type: 'text', content: 'Title' }],
          rawContent: 'Title',
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', content: 'Content' }],
          rawContent: 'Content',
        },
      ],
      definitions: new Map([['ref', { url: 'https://example.com' }]]),
    };

    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(2);
    expect(ast.definitions.size).toBe(1);
    expect(ast.definitions.get('ref')?.url).toBe('https://example.com');
  });

  it('should support empty document', () => {
    const ast: MarkdownAST = {
      type: 'root',
      children: [],
      definitions: new Map(),
    };

    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(0);
    expect(ast.definitions.size).toBe(0);
  });

  it('should support complex nested structure', () => {
    const ast: MarkdownAST = {
      type: 'root',
      children: [
        {
          type: 'heading',
          level: 1,
          children: [
            { type: 'text', content: 'Hello ' },
            { type: 'strong', children: [{ type: 'text', content: 'World' }] },
          ],
          rawContent: 'Hello **World**',
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', content: 'Quoted text' }],
              rawContent: 'Quoted text',
            },
            {
              type: 'unorderedList',
              items: [
                {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ type: 'text', content: 'Item 1' }],
                      rawContent: 'Item 1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      definitions: new Map([
        ['link1', { url: 'https://example.com', title: 'Example' }],
        ['link2', { url: 'https://test.com' }],
      ]),
    };

    expect(ast.children).toHaveLength(2);
    expect(ast.definitions.size).toBe(2);

    const blockquote = ast.children[1] as BlockquoteNode;
    expect(blockquote.type).toBe('blockquote');
    expect(blockquote.children).toHaveLength(2);
  });
});
