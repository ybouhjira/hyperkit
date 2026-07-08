import { render, screen } from '@solidjs/testing-library';
import { renderAST, renderBlockNode, renderInlineNode } from '../renderer';
import type {
  MarkdownAST,
  HeadingNode,
  ParagraphNode,
  CodeBlockNode,
  LinkNode,
  ImageNode,
  UnorderedListNode,
  OrderedListNode,
  TableNode,
  BlockquoteNode,
  ThematicBreakNode,
  TextNode,
  EmphasisNode,
  StrongNode,
  StrikethroughNode,
  InlineCodeNode,
  HardBreakNode,
  SoftBreakNode,
  AutolinkNode,
  HtmlInlineNode,
  HtmlBlockNode,
  LinkReferenceDefNode,
} from '../core/types';

describe('Markdown Renderer', () => {
  describe('Inline Nodes', () => {
    it('renders text nodes', () => {
      const node: TextNode = { type: 'text', content: 'Hello World' };
      render(() => renderInlineNode(node));
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders emphasis nodes', () => {
      const node: EmphasisNode = {
        type: 'emphasis',
        children: [{ type: 'text', content: 'italic text' }],
      };
      render(() => renderInlineNode(node));
      const em = screen.getByText('italic text');
      expect(em.tagName).toBe('EM');
    });

    it('renders strong nodes', () => {
      const node: StrongNode = {
        type: 'strong',
        children: [{ type: 'text', content: 'bold text' }],
      };
      render(() => renderInlineNode(node));
      const strong = screen.getByText('bold text');
      expect(strong.tagName).toBe('STRONG');
    });

    it('renders strikethrough nodes', () => {
      const node: StrikethroughNode = {
        type: 'strikethrough',
        children: [{ type: 'text', content: 'deleted text' }],
      };
      render(() => renderInlineNode(node));
      const del = screen.getByText('deleted text');
      expect(del.tagName).toBe('DEL');
    });

    it('renders inline code nodes', () => {
      const node: InlineCodeNode = {
        type: 'inlineCode',
        content: 'const x = 1;',
      };
      render(() => renderInlineNode(node));
      const code = screen.getByText('const x = 1;');
      expect(code.tagName).toBe('CODE');
      expect(code.className).toBe('sk-markdown-inline-code');
    });

    it('renders link nodes', () => {
      const node: LinkNode = {
        type: 'link',
        url: 'https://example.com',
        title: 'Example',
        children: [{ type: 'text', content: 'Click here' }],
      };
      render(() => renderInlineNode(node));
      const link = screen.getByText('Click here') as HTMLAnchorElement;
      expect(link.tagName).toBe('A');
      expect(link.href).toBe('https://example.com/');
      expect(link.title).toBe('Example');
      expect(link.className).toBe('sk-markdown-link');
    });

    it('renders image nodes', () => {
      const node: ImageNode = {
        type: 'image',
        url: 'https://example.com/image.png',
        alt: 'Test image',
        title: 'Image title',
      };
      render(() => renderInlineNode(node));
      const img = screen.getByAltText('Test image') as HTMLImageElement;
      expect(img.tagName).toBe('IMG');
      expect(img.src).toBe('https://example.com/image.png');
      expect(img.title).toBe('Image title');
      expect(img.className).toBe('sk-markdown-image');
    });

    it('renders hard break nodes', () => {
      const node: HardBreakNode = { type: 'hardBreak' };
      const { container } = render(() => renderInlineNode(node));
      const br = container.querySelector('br');
      expect(br).toBeInTheDocument();
    });

    it('renders soft break as space', () => {
      const node: SoftBreakNode = { type: 'softBreak' };
      const { container } = render(() => renderInlineNode(node));
      expect(container.textContent).toBe(' ');
    });

    it('renders autolink nodes', () => {
      const node: AutolinkNode = { type: 'autolink', url: 'https://example.com' };
      render(() => renderInlineNode(node));
      const link = screen.getByText('https://example.com') as HTMLAnchorElement;
      expect(link.tagName).toBe('A');
      expect(link.href).toBe('https://example.com/');
    });

    it('renders HTML inline nodes as TEXT (no innerHTML pass-through)', () => {
      // SAFE BY DEFAULT: htmlInline content renders as visible text inside
      // a `.sk-markdown__html-inline` span. Earlier the renderer passed
      // node.content straight to innerHTML, which (a) opened an XSS
      // surface for any consumer rendering user/LLM markdown, and (b) let
      // a literal `<Table>` promote to a real <table> + close the
      // surrounding <p> + auto-fill cells with each subsequent character
      // ("vertical character text" bug).
      const node: HtmlInlineNode = { type: 'htmlInline', content: '<b>bold</b>' };
      const { container } = render(() => renderInlineNode(node));
      const span = container.querySelector('span.sk-markdown__html-inline');
      expect(span).toBeInTheDocument();
      // The raw markup is visible text — NOT a real <b> child element.
      expect(span?.textContent).toBe('<b>bold</b>');
      expect(span?.querySelector('b')).toBeNull();
    });
  });

  describe('Block Nodes', () => {
    it('renders heading level 1', () => {
      const node: HeadingNode = {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', content: 'Heading 1' }],
      };
      render(() => renderBlockNode(node));
      const h1 = screen.getByText('Heading 1');
      expect(h1.tagName).toBe('H1');
      expect(h1.className).toBe('sk-markdown-heading');
    });

    it('renders heading level 3', () => {
      const node: HeadingNode = {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', content: 'Heading 3' }],
      };
      render(() => renderBlockNode(node));
      const h3 = screen.getByText('Heading 3');
      expect(h3.tagName).toBe('H3');
      expect(h3.className).toBe('sk-markdown-heading');
    });

    it('renders paragraph with inline children', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        children: [
          { type: 'text', content: 'This is ' },
          { type: 'strong', children: [{ type: 'text', content: 'bold' }] },
          { type: 'text', content: ' text' },
        ],
      };
      render(() => renderBlockNode(node));
      const p = screen.getByText(/This is/).closest('p');
      expect(p).toBeInTheDocument();
      expect(p?.className).toBe('sk-markdown-paragraph');
      expect(screen.getByText('bold').tagName).toBe('STRONG');
    });

    it('renders code block with language', () => {
      const node: CodeBlockNode = {
        type: 'codeBlock',
        lang: 'javascript',
        content: 'const x = 1;',
      };
      render(() => renderBlockNode(node));
      const code = screen.getByText('const x = 1;');
      expect(code.tagName).toBe('CODE');
      expect(code.className).toBe('language-javascript');
      const pre = code.closest('pre');
      expect(pre?.className).toBe('sk-markdown-code-block');
    });

    it('renders unordered list', () => {
      const node: UnorderedListNode = {
        type: 'unorderedList',
        items: [
          {
            type: 'listItem',
            checked: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Item 1' }],
              },
            ],
          },
          {
            type: 'listItem',
            checked: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Item 2' }],
              },
            ],
          },
        ],
      };
      render(() => renderBlockNode(node));
      const ul = screen.getByText('Item 1').closest('ul');
      expect(ul).toBeInTheDocument();
      expect(ul?.className).toBe('sk-markdown-list');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders ordered list with start attribute', () => {
      const node: OrderedListNode = {
        type: 'orderedList',
        start: 5,
        items: [
          {
            type: 'listItem',
            checked: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Fifth item' }],
              },
            ],
          },
        ],
      };
      render(() => renderBlockNode(node));
      const ol = screen.getByText('Fifth item').closest('ol') as HTMLOListElement;
      expect(ol).toBeInTheDocument();
      expect(ol.className).toBe('sk-markdown-list');
      expect(ol.start).toBe(5);
    });

    it('renders table with headers and rows', () => {
      const node: TableNode = {
        type: 'table',
        align: [null, 'center', 'right'],
        headers: [
          {
            type: 'tableCell',
            header: true,
            align: null,
            children: [{ type: 'text', content: 'Col 1' }],
          },
          {
            type: 'tableCell',
            header: true,
            align: 'center',
            children: [{ type: 'text', content: 'Col 2' }],
          },
          {
            type: 'tableCell',
            header: true,
            align: 'right',
            children: [{ type: 'text', content: 'Col 3' }],
          },
        ],
        rows: [
          [
            {
              type: 'tableCell',
              header: false,
              align: null,
              children: [{ type: 'text', content: 'A1' }],
            },
            {
              type: 'tableCell',
              header: false,
              align: 'center',
              children: [{ type: 'text', content: 'B1' }],
            },
            {
              type: 'tableCell',
              header: false,
              align: 'right',
              children: [{ type: 'text', content: 'C1' }],
            },
          ],
        ],
      };
      render(() => renderBlockNode(node));
      const table = screen.getByText('Col 1').closest('table');
      expect(table).toBeInTheDocument();
      expect(table?.className).toBe('sk-markdown-table');
      const thead = table?.querySelector('thead');
      const tbody = table?.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
      expect(screen.getByText('Col 1')).toBeInTheDocument();
      expect(screen.getByText('A1')).toBeInTheDocument();
    });

    it('renders blockquote', () => {
      const node: BlockquoteNode = {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', content: 'Quoted text' }],
          },
        ],
      };
      render(() => renderBlockNode(node));
      const blockquote = screen.getByText('Quoted text').closest('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote?.className).toBe('sk-markdown-blockquote');
    });

    it('renders thematic break', () => {
      const node: ThematicBreakNode = { type: 'thematicBreak' };
      const { container } = render(() => renderBlockNode(node));
      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
      expect(hr?.className).toBe('sk-markdown-thematic-break');
    });

    it('renders HTML block as TEXT (no innerHTML pass-through)', () => {
      // Same safe-by-default policy as htmlInline above — block-level
      // raw HTML renders inside a `<pre.sk-markdown__html-block>` so the
      // markup stays inspectable but never executes.
      const node: HtmlBlockNode = { type: 'htmlBlock', content: '<div class="custom">HTML</div>' };
      const { container } = render(() => renderBlockNode(node));
      const pre = container.querySelector('pre.sk-markdown__html-block');
      expect(pre).toBeInTheDocument();
      expect(pre?.textContent).toBe('<div class="custom">HTML</div>');
      // No real <div.custom> child was created.
      expect(container.querySelector('.custom')).toBeNull();
    });

    it('renders linkReferenceDef as empty fragment', () => {
      const node: LinkReferenceDefNode = {
        type: 'linkReferenceDef',
        label: 'ref',
        url: 'http://example.com',
      };
      const { container } = render(() => renderBlockNode(node));
      expect(container.innerHTML).toBe('');
    });

    it('renders task list items with checkboxes', () => {
      const node: UnorderedListNode = {
        type: 'unorderedList',
        items: [
          {
            type: 'listItem',
            checked: true,
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Done' }],
                rawContent: 'Done',
              },
            ],
          },
          {
            type: 'listItem',
            checked: false,
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', content: 'Todo' }],
                rawContent: 'Todo',
              },
            ],
          },
        ],
      };
      render(() => renderBlockNode(node));
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    });

    it('renders code block without language', () => {
      const node: CodeBlockNode = { type: 'codeBlock', content: 'plain code' };
      render(() => renderBlockNode(node));
      const code = screen.getByText('plain code');
      expect(code.tagName).toBe('CODE');
      expect(code.className).toBeFalsy();
    });
  });

  describe('renderAST', () => {
    it('renders complete AST', () => {
      const ast: MarkdownAST = {
        type: 'root',
        children: [
          {
            type: 'heading',
            level: 1,
            children: [{ type: 'text', content: 'Title' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', content: 'First paragraph' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', content: 'Second paragraph' }],
          },
        ],
      };
      render(() => renderAST(ast));
      expect(screen.getByText('Title').tagName).toBe('H1');
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });
});
