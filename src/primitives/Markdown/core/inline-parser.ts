/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { InlineNode, LinkDefinition } from './types';

/**
 * Parse inline markdown formatting within a text string.
 * @param content - Raw text content to parse for inline elements
 * @param definitions - Map of link reference definitions for resolving reference links
 * @returns Array of inline AST nodes
 */
export function parseInline(
  content: string,
  definitions?: Map<string, LinkDefinition>
): InlineNode[] {
  if (!content) return [];

  const nodes: InlineNode[] = [];
  let i = 0;
  let textBuffer = '';

  const flushText = () => {
    if (textBuffer) {
      nodes.push({ type: 'text', content: textBuffer });
      textBuffer = '';
    }
  };

  while (i < content.length) {
    const char = content[i];

    // Priority 1: Backslash escape
    if (char === '\\' && i + 1 < content.length) {
      const next = content[i + 1]!; // Safe: bounds check guarantees i + 1 < length
      if (isEscapableChar(next)) {
        textBuffer += next;
        i += 2;
        continue;
      }
    }

    // Priority 2: Code span (backticks)
    if (char === '`') {
      const codeResult = tryParseCodeSpan(content, i);
      if (codeResult) {
        flushText();
        nodes.push({ type: 'inlineCode', content: codeResult.content });
        i = codeResult.endIndex;
        continue;
      }
    }

    // Priority 3: Autolink
    if (char === '<') {
      const autolinkResult = tryParseAutolink(content, i);
      if (autolinkResult) {
        flushText();
        nodes.push({ type: 'autolink', url: autolinkResult.url });
        i = autolinkResult.endIndex;
        continue;
      }

      // HTML inline
      const htmlResult = tryParseHtmlInline(content, i);
      if (htmlResult) {
        flushText();
        nodes.push({ type: 'htmlInline', content: htmlResult.content });
        i = htmlResult.endIndex;
        continue;
      }
    }

    // Priority 4: Image
    if (char === '!' && i + 1 < content.length && content[i + 1] === '[') {
      const imageResult = tryParseImage(content, i);
      if (imageResult) {
        flushText();
        nodes.push({
          type: 'image',
          url: imageResult.url,
          alt: imageResult.alt,
          ...(imageResult.title && { title: imageResult.title }),
        });
        i = imageResult.endIndex;
        continue;
      }
    }

    // Priority 5: Link
    if (char === '[') {
      const linkResult = tryParseLink(content, i, definitions);
      if (linkResult) {
        flushText();
        nodes.push({
          type: 'link',
          url: linkResult.url,
          ...(linkResult.title && { title: linkResult.title }),
          children: parseInline(linkResult.text, definitions),
        });
        i = linkResult.endIndex;
        continue;
      }
    }

    // Priority 6: Strikethrough
    if (char === '~' && i + 1 < content.length && content[i + 1] === '~') {
      const strikeResult = tryParseStrikethrough(content, i);
      if (strikeResult) {
        flushText();
        nodes.push({
          type: 'strikethrough',
          children: parseInline(strikeResult.content, definitions),
        });
        i = strikeResult.endIndex;
        continue;
      }
    }

    // Priority 7: Strong/Emphasis
    if (char === '*' || char === '_') {
      const emphasisResult = tryParseEmphasisOrStrong(content, i, char, definitions);
      if (emphasisResult !== null && emphasisResult.node !== undefined) {
        flushText();
        nodes.push(emphasisResult.node);
        i = emphasisResult.endIndex;
        continue;
      }
      // If no match found, consume all the opening delimiters as text
      if (
        emphasisResult !== null &&
        emphasisResult.consumedCount !== undefined &&
        emphasisResult.consumedCount > 0
      ) {
        for (let j = 0; j < emphasisResult.consumedCount; j++) {
          textBuffer += char;
        }
        i = emphasisResult.endIndex;
        continue;
      }
      // Fallback: treat as literal text and move forward by 1 char
      textBuffer += char;
      i++;
      continue;
    }

    // Priority 8: Hard break
    if (char === '\n') {
      const isHardBreak =
        (i >= 2 && content[i - 1] === ' ' && content[i - 2] === ' ') ||
        (i >= 1 && content[i - 1] === '\\');

      if (isHardBreak) {
        // Remove trailing spaces or backslash from text buffer
        if (content[i - 1] === ' ') {
          textBuffer = textBuffer.slice(0, -2);
        } else if (content[i - 1] === '\\') {
          textBuffer = textBuffer.slice(0, -1);
        }
        flushText();
        nodes.push({ type: 'hardBreak' });
        i++;
        continue;
      } else {
        // Soft break
        flushText();
        nodes.push({ type: 'softBreak' });
        i++;
        continue;
      }
    }

    // Default: accumulate text
    textBuffer += char;
    i++;
  }

  flushText();
  return nodes;
}

// ── Helper functions ──────────────────────────────────────────

export function isEscapableChar(char: string): boolean {
  return '\\`*_{}[]()#+-.!|~<>'.includes(char);
}

export function tryParseCodeSpan(
  content: string,
  start: number
): { content: string; endIndex: number } | null {
  let openCount = 0;
  let i = start;

  // Count opening backticks
  while (i < content.length && content[i] === '`') {
    openCount++;
    i++;
  }

  const searchStart = i;

  // Find matching closing backticks
  while (i < content.length) {
    if (content[i] === '`') {
      let closeCount = 0;
      const closeStart = i;

      while (i < content.length && content[i] === '`') {
        closeCount++;
        i++;
      }

      if (closeCount === openCount) {
        let codeContent = content.slice(searchStart, closeStart);

        // Strip one leading and trailing space if both present
        if (
          codeContent.length >= 2 &&
          codeContent[0] === ' ' &&
          codeContent[codeContent.length - 1] === ' '
        ) {
          codeContent = codeContent.slice(1, -1);
        }

        return { content: codeContent, endIndex: i };
      }
    } else {
      i++;
    }
  }

  return null;
}

export function tryParseAutolink(
  content: string,
  start: number
): { url: string; endIndex: number } | null {
  const closeIndex = content.indexOf('>', start + 1);
  if (closeIndex === -1) return null;

  const inner = content.slice(start + 1, closeIndex);

  // Check for URL
  if (inner.startsWith('http://') || inner.startsWith('https://') || inner.startsWith('ftp://')) {
    return { url: inner, endIndex: closeIndex + 1 };
  }

  // Check for email
  if (inner.includes('@') && !inner.includes(' ')) {
    return { url: `mailto:${inner}`, endIndex: closeIndex + 1 };
  }

  return null;
}

export function tryParseHtmlInline(
  content: string,
  start: number
): { content: string; endIndex: number } | null {
  const closeIndex = content.indexOf('>', start + 1);
  if (closeIndex === -1) return null;

  const tag = content.slice(start, closeIndex + 1);

  // Basic HTML tag pattern
  if (tag.match(/^<\/?[a-zA-Z][^>]*>$/)) {
    return { content: tag, endIndex: closeIndex + 1 };
  }

  return null;
}

export function tryParseImage(
  content: string,
  start: number
): { url: string; alt: string; title?: string; endIndex: number } | null {
  if (content[start] !== '!' || content[start + 1] !== '[') return null;

  // Find closing ]
  let i = start + 2;
  let altEnd = -1;

  while (i < content.length) {
    if (content[i] === '\\') {
      i += 2;
      continue;
    }
    if (content[i] === ']') {
      altEnd = i;
      break;
    }
    i++;
  }

  if (altEnd === -1 || content[altEnd + 1] !== '(') return null;

  const alt = content.slice(start + 2, altEnd);

  // Parse URL and optional title
  const linkInfoResult = parseLinkDestination(content, altEnd + 2);
  if (!linkInfoResult) return null;

  return {
    url: linkInfoResult.url,
    alt,
    ...(linkInfoResult.title && { title: linkInfoResult.title }),
    endIndex: linkInfoResult.endIndex,
  };
}

export function tryParseLink(
  content: string,
  start: number,
  definitions?: Map<string, LinkDefinition>
): { url: string; text: string; title?: string; endIndex: number } | null {
  // Find closing ]
  let i = start + 1;
  let depth = 1;
  let textEnd = -1;

  while (i < content.length && depth > 0) {
    if (content[i] === '\\') {
      i += 2;
      continue;
    }
    if (content[i] === '[') depth++;
    if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        textEnd = i;
        break;
      }
    }
    i++;
  }

  if (textEnd === -1) return null;

  const text = content.slice(start + 1, textEnd);

  // Check for inline link [text](url)
  if (content[textEnd + 1] === '(') {
    const linkInfoResult = parseLinkDestination(content, textEnd + 2);
    if (linkInfoResult) {
      return {
        url: linkInfoResult.url,
        text,
        ...(linkInfoResult.title && { title: linkInfoResult.title }),
        endIndex: linkInfoResult.endIndex,
      };
    }
  }

  // Check for reference link [text][ref]
  if (content[textEnd + 1] === '[') {
    const refStart = textEnd + 2;
    const refEnd = content.indexOf(']', refStart);
    if (refEnd !== -1) {
      const ref = content.slice(refStart, refEnd);
      const normalizedRef = ref.toLowerCase();

      const def = definitions?.get(normalizedRef);
      if (def) {
        return {
          url: def.url,
          text,
          ...(def.title && { title: def.title }),
          endIndex: refEnd + 1,
        };
      }

      // Unresolved reference - treat as text
      return null;
    }
  }

  return null;
}

export function parseLinkDestination(
  content: string,
  start: number
): { url: string; title?: string; endIndex: number } | null {
  let i = start;

  // Skip whitespace
  while (i < content.length && /\s/.test(content[i]!)) {
    i++;
  }

  if (i >= content.length || content[i] === ')') return null;

  // Parse URL
  let url = '';
  let urlEnd = i;

  while (urlEnd < content.length) {
    const char = content[urlEnd]!; // Safe: bounds check
    if (char === ')' || /\s/.test(char)) break;
    url += char;
    urlEnd++;
  }

  i = urlEnd;

  // Skip whitespace
  while (i < content.length && /\s/.test(content[i]!) && content[i] !== '\n') {
    i++;
  }

  // Parse optional title
  let title: string | undefined;

  if (i < content.length && (content[i] === '"' || content[i] === "'")) {
    const quote = content[i];
    i++;
    const titleStart = i;

    while (i < content.length && content[i] !== quote) {
      if (content[i] === '\\') i++;
      i++;
    }

    if (i < content.length && content[i] === quote) {
      title = content.slice(titleStart, i);
      i++;
    }

    // Skip trailing whitespace
    while (i < content.length && /\s/.test(content[i]!) && content[i] !== '\n') {
      i++;
    }
  }

  if (i >= content.length || content[i] !== ')') return null;

  return { url, ...(title && { title }), endIndex: i + 1 };
}

export function tryParseStrikethrough(
  content: string,
  start: number
): { content: string; endIndex: number } | null {
  if (content[start] !== '~' || content[start + 1] !== '~') return null;

  const closeIndex = content.indexOf('~~', start + 2);
  if (closeIndex === -1) return null;

  const innerContent = content.slice(start + 2, closeIndex);
  return { content: innerContent, endIndex: closeIndex + 2 };
}

export function tryParseEmphasisOrStrong(
  content: string,
  start: number,
  delimiter: '*' | '_',
  definitions?: Map<string, LinkDefinition>
): { node?: InlineNode; endIndex: number; consumedCount?: number } | null {
  let count = 0;
  let i = start;

  // Count opening delimiters
  while (i < content.length && content[i] === delimiter) {
    count++;
    i++;
  }

  if (count === 0) return null;

  const searchStart = i;

  // Scan for potential closers
  let scanPos = i;
  while (scanPos < content.length) {
    if (content[scanPos] === '\\') {
      scanPos += 2;
      continue;
    }

    if (content[scanPos] === delimiter) {
      let closeCount = 0;
      const closeStart = scanPos;

      while (scanPos < content.length && content[scanPos] === delimiter) {
        closeCount++;
        scanPos++;
      }

      // Match if we have at least as many closing delimiters as opening
      if (closeCount >= count) {
        // For extra delimiters, include them in inner content
        // Example: **text*** with count=2, closeCount=3
        // Inner content should include the first * of ***, so we can parse text*
        const extraDelimiters = closeCount - count;
        const innerEndPos = closeStart + extraDelimiters;
        const endIndex = scanPos; // After all closing delimiters
        const innerContent = content.slice(searchStart, innerEndPos);

        // Triple or more -> Strong(Emphasis(...))
        if (count >= 3) {
          const emphasisContent = parseInline(innerContent, definitions);
          return {
            node: {
              type: 'strong',
              children: [
                {
                  type: 'emphasis',
                  children: emphasisContent,
                },
              ],
            },
            endIndex,
          };
        }

        // Double -> Strong
        if (count === 2) {
          return {
            node: {
              type: 'strong',
              children: parseInline(innerContent, definitions),
            },
            endIndex,
          };
        }

        // Single -> Emphasis
        if (count === 1) {
          return {
            node: {
              type: 'emphasis',
              children: parseInline(innerContent, definitions),
            },
            endIndex,
          };
        }
      }

      // Not enough delimiters, keep searching
      continue;
    }

    scanPos++;
  }

  // No matching closer found - return info about how many delimiters we found
  return { node: undefined, endIndex: i, consumedCount: count };
}
