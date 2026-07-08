import { describe, it, expect } from 'vitest';
import { parseInline } from '../core/inline-parser';
import type { LinkDefinition } from '../core/types';

describe('parseInline', () => {
  describe('Plain text', () => {
    it('should parse plain text', () => {
      const result = parseInline('hello world');
      expect(result).toEqual([{ type: 'text', content: 'hello world' }]);
    });

    it('should handle empty string', () => {
      const result = parseInline('');
      expect(result).toEqual([]);
    });
  });

  describe('Emphasis (italic)', () => {
    it('should parse single asterisk emphasis', () => {
      const result = parseInline('*italic*');
      expect(result).toEqual([
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'italic' }],
        },
      ]);
    });

    it('should parse single underscore emphasis', () => {
      const result = parseInline('_italic_');
      expect(result).toEqual([
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'italic' }],
        },
      ]);
    });

    it('should parse emphasis within text', () => {
      const result = parseInline('hello *world*');
      expect(result).toEqual([
        { type: 'text', content: 'hello ' },
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'world' }],
        },
      ]);
    });

    it('should parse multi-word emphasis', () => {
      const result = parseInline('*multi word emphasis*');
      expect(result).toEqual([
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'multi word emphasis' }],
        },
      ]);
    });
  });

  describe('Strong (bold)', () => {
    it('should parse double asterisk strong', () => {
      const result = parseInline('**bold**');
      expect(result).toEqual([
        {
          type: 'strong',
          children: [{ type: 'text', content: 'bold' }],
        },
      ]);
    });

    it('should parse double underscore strong', () => {
      const result = parseInline('__bold__');
      expect(result).toEqual([
        {
          type: 'strong',
          children: [{ type: 'text', content: 'bold' }],
        },
      ]);
    });

    it('should parse strong within text', () => {
      const result = parseInline('hello **world**');
      expect(result).toEqual([
        { type: 'text', content: 'hello ' },
        {
          type: 'strong',
          children: [{ type: 'text', content: 'world' }],
        },
      ]);
    });
  });

  describe('Bold + Italic', () => {
    it('should parse triple asterisk as strong emphasis', () => {
      const result = parseInline('***bold italic***');
      expect(result).toEqual([
        {
          type: 'strong',
          children: [
            {
              type: 'emphasis',
              children: [{ type: 'text', content: 'bold italic' }],
            },
          ],
        },
      ]);
    });

    it('should parse nested bold and italic', () => {
      const result = parseInline('**bold *and italic***');
      expect(result).toEqual([
        {
          type: 'strong',
          children: [
            { type: 'text', content: 'bold ' },
            {
              type: 'emphasis',
              children: [{ type: 'text', content: 'and italic' }],
            },
          ],
        },
      ]);
    });
  });

  describe('Strikethrough (GFM)', () => {
    it('should parse strikethrough', () => {
      const result = parseInline('~~struck~~');
      expect(result).toEqual([
        {
          type: 'strikethrough',
          children: [{ type: 'text', content: 'struck' }],
        },
      ]);
    });

    it('should parse strikethrough within text', () => {
      const result = parseInline('hello ~~world~~');
      expect(result).toEqual([
        { type: 'text', content: 'hello ' },
        {
          type: 'strikethrough',
          children: [{ type: 'text', content: 'world' }],
        },
      ]);
    });
  });

  describe('Inline code', () => {
    it('should parse inline code', () => {
      const result = parseInline('`code`');
      expect(result).toEqual([{ type: 'inlineCode', content: 'code' }]);
    });

    it('should parse inline code within text', () => {
      const result = parseInline('hello `code` world');
      expect(result).toEqual([
        { type: 'text', content: 'hello ' },
        { type: 'inlineCode', content: 'code' },
        { type: 'text', content: ' world' },
      ]);
    });

    it('should parse code with double backticks and embedded backtick', () => {
      const result = parseInline('``code with ` backtick``');
      expect(result).toEqual([{ type: 'inlineCode', content: 'code with ` backtick' }]);
    });

    it('should not parse formatting inside code', () => {
      const result = parseInline('`code with **no bold**`');
      expect(result).toEqual([{ type: 'inlineCode', content: 'code with **no bold**' }]);
    });

    it('should strip one leading and trailing space from code span', () => {
      const result = parseInline('` code `');
      expect(result).toEqual([{ type: 'inlineCode', content: 'code' }]);
    });
  });

  describe('Links', () => {
    it('should parse basic link', () => {
      const result = parseInline('[text](url)');
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });

    it('should parse link with title', () => {
      const result = parseInline('[text](url "title")');
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          title: 'title',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });

    it('should parse link with formatted text', () => {
      const result = parseInline('[**bold** link](url)');
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          children: [
            {
              type: 'strong',
              children: [{ type: 'text', content: 'bold' }],
            },
            { type: 'text', content: ' link' },
          ],
        },
      ]);
    });
  });

  describe('Reference links', () => {
    it('should resolve reference link', () => {
      const definitions = new Map<string, LinkDefinition>();
      definitions.set('ref', { url: 'http://example.com' });

      const result = parseInline('[text][ref]', definitions);
      expect(result).toEqual([
        {
          type: 'link',
          url: 'http://example.com',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });

    it('should treat unresolved reference as text', () => {
      const result = parseInline('[text][unknown]');
      expect(result).toEqual([{ type: 'text', content: '[text][unknown]' }]);
    });

    it('should resolve reference link case-insensitively', () => {
      const definitions = new Map<string, LinkDefinition>();
      definitions.set('ref', { url: 'http://example.com' });

      const result = parseInline('[text][REF]', definitions);
      expect(result).toEqual([
        {
          type: 'link',
          url: 'http://example.com',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });
  });

  describe('Images', () => {
    it('should parse basic image', () => {
      const result = parseInline('![alt](url)');
      expect(result).toEqual([{ type: 'image', url: 'url', alt: 'alt' }]);
    });

    it('should parse image with title', () => {
      const result = parseInline('![alt](url "title")');
      expect(result).toEqual([{ type: 'image', url: 'url', alt: 'alt', title: 'title' }]);
    });
  });

  describe('Autolinks', () => {
    it('should parse URL autolink', () => {
      const result = parseInline('<http://example.com>');
      expect(result).toEqual([{ type: 'autolink', url: 'http://example.com' }]);
    });

    it('should parse email autolink', () => {
      const result = parseInline('<user@example.com>');
      expect(result).toEqual([{ type: 'autolink', url: 'mailto:user@example.com' }]);
    });
  });

  describe('Hard breaks', () => {
    it('should parse hard break with two trailing spaces', () => {
      const result = parseInline('line1  \nline2');
      expect(result).toEqual([
        { type: 'text', content: 'line1' },
        { type: 'hardBreak' },
        { type: 'text', content: 'line2' },
      ]);
    });

    it('should parse hard break with backslash', () => {
      const result = parseInline('line1\\\nline2');
      expect(result).toEqual([
        { type: 'text', content: 'line1' },
        { type: 'hardBreak' },
        { type: 'text', content: 'line2' },
      ]);
    });
  });

  describe('Soft breaks', () => {
    it('should parse soft break', () => {
      const result = parseInline('line1\nline2');
      expect(result).toEqual([
        { type: 'text', content: 'line1' },
        { type: 'softBreak' },
        { type: 'text', content: 'line2' },
      ]);
    });
  });

  describe('HTML inline', () => {
    it('should parse HTML inline tags', () => {
      const result = parseInline('<span>text</span>');
      expect(result).toEqual([
        { type: 'htmlInline', content: '<span>' },
        { type: 'text', content: 'text' },
        { type: 'htmlInline', content: '</span>' },
      ]);
    });
  });

  describe('Escaped characters', () => {
    it('should escape asterisks', () => {
      const result = parseInline('\\*not italic\\*');
      expect(result).toEqual([{ type: 'text', content: '*not italic*' }]);
    });

    it('should escape brackets', () => {
      const result = parseInline('\\[not a link\\]');
      expect(result).toEqual([{ type: 'text', content: '[not a link]' }]);
    });
  });

  describe('Mixed formatting', () => {
    it('should parse mixed inline elements', () => {
      const result = parseInline('Hello **bold** and *italic* with `code`');
      expect(result).toEqual([
        { type: 'text', content: 'Hello ' },
        {
          type: 'strong',
          children: [{ type: 'text', content: 'bold' }],
        },
        { type: 'text', content: ' and ' },
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'italic' }],
        },
        { type: 'text', content: ' with ' },
        { type: 'inlineCode', content: 'code' },
      ]);
    });

    it('should parse complex mixed formatting', () => {
      const result = parseInline('[**bold link**](url) and ~~strike~~');
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          children: [
            {
              type: 'strong',
              children: [{ type: 'text', content: 'bold link' }],
            },
          ],
        },
        { type: 'text', content: ' and ' },
        {
          type: 'strikethrough',
          children: [{ type: 'text', content: 'strike' }],
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should treat unclosed emphasis as text', () => {
      const result = parseInline('*unclosed');
      expect(result).toEqual([{ type: 'text', content: '*unclosed' }]);
    });

    it('should treat mismatched delimiters as text', () => {
      const result = parseInline('**partial*');
      expect(result).toEqual([{ type: 'text', content: '**partial*' }]);
    });

    it('should handle empty input', () => {
      const result = parseInline('');
      expect(result).toEqual([]);
    });

    it('should handle link with empty parentheses', () => {
      const result = parseInline('[text]()');
      // Empty URL in parens - parseLinkDestination returns null
      expect(result).toEqual([{ type: 'text', content: '[text]()' }]);
    });

    it('should treat multiple unclosed delimiters as text', () => {
      const result = parseInline('***unclosed');
      expect(result).toEqual([{ type: 'text', content: '***unclosed' }]);
    });

    it('should treat unclosed double delimiters as text', () => {
      const result = parseInline('**unclosed');
      expect(result).toEqual([{ type: 'text', content: '**unclosed' }]);
    });

    it('should treat non-HTML angle brackets as text', () => {
      const result = parseInline('5 < 10 and 10 > 5');
      // The < doesn't match HTML pattern, falls through as text
      expect(result).toEqual([{ type: 'text', content: '5 < 10 and 10 > 5' }]);
    });

    it('should parse FTP autolink', () => {
      const result = parseInline('<ftp://files.example.com>');
      expect(result).toEqual([{ type: 'autolink', url: 'ftp://files.example.com' }]);
    });

    it('should parse link with single-quote title', () => {
      const result = parseInline("[text](url 'title')");
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          title: 'title',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });

    it('should parse image with escaped bracket in alt', () => {
      const result = parseInline('![alt \\] text](url)');
      // Escape handling may preserve the backslash depending on implementation
      expect(result).toEqual([{ type: 'image', url: 'url', alt: 'alt \\] text' }]);
    });

    it('should parse link with escaped closing bracket in text', () => {
      const result = parseInline('[text with \\] bracket](url)');
      // Tests line 327 - continue after escape in parseLinkText
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          children: [{ type: 'text', content: 'text with ] bracket' }],
        },
      ]);
    });

    it('should handle link with title followed by whitespace', () => {
      const result = parseInline('[text](url "title"  )');
      // Tests line 438 - skip trailing whitespace after title
      expect(result).toEqual([
        {
          type: 'link',
          url: 'url',
          title: 'title',
          children: [{ type: 'text', content: 'text' }],
        },
      ]);
    });

    it('should handle link with only whitespace in parens', () => {
      const result = parseInline('[text](   )');
      // parseLinkDestination hits the ')' after skipping whitespace (line 394)
      expect(result).toEqual([{ type: 'text', content: '[text](   )' }]);
    });

    it('should handle link with unclosed title', () => {
      const result = parseInline('[text](url "unclosed title');
      // parseLinkDestination can't find closing paren after title (line 442)
      expect(result).toEqual([{ type: 'text', content: '[text](url "unclosed title' }]);
    });

    it('should treat unclosed triple emphasis followed by text as literal', () => {
      const result = parseInline('***unclosed then more text');
      // Hits consumedCount path (lines 483-484, 131-136)
      expect(result[0]).toEqual({ type: 'text', content: '***unclosed then more text' });
    });

    it('should handle unclosed underscore emphasis', () => {
      const result = parseInline('__not closed');
      // Hits consumedCount path for unclosed emphasis
      expect(result[0]).toEqual({ type: 'text', content: '__not closed' });
    });

    it('should handle unclosed inline code', () => {
      const result = parseInline('`unclosed code');
      // Tests line 230 - tryParseInlineCode returns null when no closing backticks
      expect(result).toEqual([{ type: 'text', content: '`unclosed code' }]);
    });

    it('should handle unclosed double backtick code', () => {
      const result = parseInline('``unclosed code');
      // Tests line 230 with multiple opening backticks
      expect(result).toEqual([{ type: 'text', content: '``unclosed code' }]);
    });

    it('should parse emphasis with escaped delimiter inside', () => {
      const result = parseInline('*text with \\* asterisk*');
      // Tests lines 483-484 - escape handling in tryParseEmphasisOrStrong
      expect(result).toEqual([
        {
          type: 'emphasis',
          children: [{ type: 'text', content: 'text with * asterisk' }],
        },
      ]);
    });

    it('should parse strong with escaped delimiter inside', () => {
      const result = parseInline('**text with \\** asterisks**');
      // Tests escape handling in strong emphasis scanning
      expect(result).toEqual([
        {
          type: 'strong',
          children: [{ type: 'text', content: 'text with ** asterisks' }],
        },
      ]);
    });
  });
});
