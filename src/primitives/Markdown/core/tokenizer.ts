/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Token } from './types';

/**
 * Tokenize raw markdown into line-level tokens.
 * @param input - Raw markdown string
 * @returns Array of tokens representing the markdown structure
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  // Normalize line endings (strip \r for Windows compatibility)
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  let inCodeFence = false;
  let codeFenceChar = '';
  let codeFenceCount = 0;
  let codeFenceLang = '';
  let codeFenceLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!; // Safe: i < lines.length guarantees this exists

    // Handle code fence state
    if (inCodeFence) {
      const closingFenceMatch = line.match(/^(`{3,}|~{3,})\s*$/);
      if (
        closingFenceMatch &&
        closingFenceMatch[1]![0] === codeFenceChar &&
        closingFenceMatch[1]!.length >= codeFenceCount
      ) {
        // Closing fence found
        tokens.push({
          type: 'codeFence',
          lang: codeFenceLang,
          content: codeFenceLines.join('\n'),
        });
        inCodeFence = false;
        codeFenceChar = '';
        codeFenceCount = 0;
        codeFenceLang = '';
        codeFenceLines = [];
        continue;
      } else {
        // Inside code fence - collect line as-is
        codeFenceLines.push(line);
        continue;
      }
    }

    // Check for opening code fence
    const openingFenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (openingFenceMatch) {
      inCodeFence = true;
      codeFenceChar = openingFenceMatch[1]![0]!;
      codeFenceCount = openingFenceMatch[1]!.length;
      codeFenceLang = openingFenceMatch[2]!.trim();
      codeFenceLines = [];
      continue;
    }

    // Check for HTML block (lines starting with <)
    if (line.trim().startsWith('<')) {
      tokens.push({ type: 'htmlBlock', content: line.trim() });
      continue;
    }

    // Check for ATX heading (# followed by space)
    const atxMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);
    if (atxMatch) {
      tokens.push({
        type: 'atxHeading',
        level: atxMatch[1]!.length as 1 | 2 | 3 | 4 | 5 | 6,
        content: atxMatch[2]!.trim(),
      });
      continue;
    }

    // Check for setext heading underline (=== or --- after a paragraph)
    // Must check BEFORE thematic break since --- can be both
    const setextMatch = line.match(/^(=+|-+)\s*$/);
    if (setextMatch) {
      // If previous token is a paragraph, convert to setext heading
      if (tokens.length > 0) {
        const lastToken = tokens[tokens.length - 1]!;
        if (lastToken.type === 'paragraph') {
          const level = setextMatch[1]![0] === '=' ? 1 : 2;
          tokens[tokens.length - 1] = {
            type: 'setextHeading',
            level: level as 1 | 2,
            content: lastToken.content,
          };
          continue;
        }
      }
      // If not converting to setext, check if it's a thematic break (3+ chars)
      if (setextMatch[1]!.length >= 3) {
        tokens.push({ type: 'thematicBreak' });
        continue;
      }
    }

    // Check for thematic break (3+ of ---, ***, ___)
    // Must check BEFORE table separator since ----- can be both
    const thematicBreakMatch = line.match(/^\s*([-*_])(\s*\1){2,}[\s]*$/);
    if (thematicBreakMatch) {
      tokens.push({ type: 'thematicBreak' });
      continue;
    }

    // Check for blockquote (> )
    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      tokens.push({ type: 'blockquote', content: blockquoteMatch[1]! });
      continue;
    }

    // Check for unordered list item (-, *, +)
    const unorderedListMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (unorderedListMatch) {
      const indent = unorderedListMatch[1]!.length;
      const marker = unorderedListMatch[2]! as '-' | '*' | '+';
      let content = unorderedListMatch[3]!;
      let checked: boolean | undefined;

      // Check for GFM task list checkbox
      const taskMatch = content.match(/^\[([ xX])\]\s+(.+)$/);
      if (taskMatch) {
        checked = taskMatch[1]!.toLowerCase() === 'x';
        content = taskMatch[2]!;
      }

      tokens.push({
        type: 'listItem',
        marker,
        content,
        indent,
        ...(checked !== undefined && { checked }),
      });
      continue;
    }

    // Check for ordered list item (1., 2., etc.)
    const orderedListMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (orderedListMatch) {
      const indent = orderedListMatch[1]!.length;
      const start = parseInt(orderedListMatch[2]!, 10);
      let content = orderedListMatch[3]!;
      let checked: boolean | undefined;

      // Check for GFM task list checkbox
      const taskMatch = content.match(/^\[([ xX])\]\s+(.+)$/);
      if (taskMatch) {
        checked = taskMatch[1]!.toLowerCase() === 'x';
        content = taskMatch[2]!;
      }

      tokens.push({
        type: 'listItem',
        marker: 'ordered',
        content,
        indent,
        start,
        ...(checked !== undefined && { checked }),
      });
      continue;
    }

    // Check for table separator (| --- | or similar)
    // Must have pipe character to be table separator
    const tableSeparatorMatch = line.includes('|') ? line.match(/^\|?(.+?)\|?\s*$/) : null;
    if (tableSeparatorMatch) {
      const cells = tableSeparatorMatch[1]!.split('|').map((cell) => cell.trim());
      const isSeparator = cells.every((cell) => /^:?-+:?$/.test(cell));

      if (isSeparator) {
        const alignments = cells.map((cell) => {
          const hasLeft = cell.startsWith(':');
          const hasRight = cell.endsWith(':');
          if (hasLeft && hasRight) return 'center';
          if (hasLeft) return 'left';
          if (hasRight) return 'right';
          return null;
        }) as ('left' | 'center' | 'right' | null)[];

        tokens.push({ type: 'tableSeparator', alignments });
        continue;
      }
    }

    // Check for table row (| ... |)
    if (line.includes('|')) {
      const trimmed = line.trim();
      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

      tokens.push({ type: 'tableRow', cells });
      continue;
    }

    // Check for link reference definition ([label]: url "title")
    const linkRefMatch = line.match(/^\[([^\]]+)\]:\s+(\S+)(?:\s+["'(]([^"')]+)["')])?$/);
    if (linkRefMatch) {
      tokens.push({
        type: 'linkReferenceDef',
        label: linkRefMatch[1]!,
        url: linkRefMatch[2]!,
        ...(linkRefMatch[3] && { title: linkRefMatch[3] }),
      });
      continue;
    }

    // Check for blank line
    if (line.trim() === '') {
      tokens.push({ type: 'blankLine' });
      continue;
    }

    // Default: paragraph
    tokens.push({ type: 'paragraph', content: line.trim() });
  }

  return tokens;
}
