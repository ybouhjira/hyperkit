/**
 * Smart typography transformations for text content.
 * Pure functions that can be applied as pre-processing before markdown parsing.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Segment type: either a code segment (content that must not be transformed)
 * or a text segment (safe to transform).
 */
type Segment = { kind: 'code'; raw: string } | { kind: 'text'; raw: string };

/**
 * Split a string into alternating text and code segments.
 * Code segments are: fenced code blocks (``` or ~~~) and inline code (`...`).
 * Only text segments should be transformed.
 */
function splitCodeSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  // Matches fenced blocks first (``` or ~~~), then inline code (`)
  const codePattern = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codePattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', raw: input.slice(lastIndex, match.index) });
    }
    segments.push({ kind: 'code', raw: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ kind: 'text', raw: input.slice(lastIndex) });
  }

  return segments;
}

/**
 * Apply a transform function only to text (non-code) segments and rejoin.
 */
function transformText(input: string, fn: (text: string) => string): string {
  if (input === '') return input;
  return splitCodeSegments(input)
    .map((seg) => (seg.kind === 'text' ? fn(seg.raw) : seg.raw))
    .join('');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Convert straight quotes to curly/smart quotes. */
export function smartQuotes(text: string): string {
  return transformText(text, (s) => {
    // Order matters: process double quotes before single to avoid cross-interference.

    // --- Double quotes ---

    // Left double: after start-of-string, whitespace, or opening brackets/punctuation
    s = s.replace(/(^|[\s([{<])"(\S)/g, '$1\u201C$2');
    // Right double: before whitespace, punctuation, closing brackets, or end-of-string
    s = s.replace(/(\S)"([\s.,;:!?\])}>'"]|$)/g, '$1\u201D$2');
    // Remaining straight double quotes at string boundaries
    s = s.replace(/"$/, '\u201D');
    s = s.replace(/^"/, '\u201C');

    // --- Single quotes / apostrophes ---

    // Contractions and possessives: letter + apostrophe + letter -> right single
    s = s.replace(/(\w)'(\w)/g, '$1\u2019$2');
    // Left single: after start-of-string, whitespace, or opening brackets
    s = s.replace(/(^|[\s([{<])'(\S)/g, '$1\u2018$2');
    // Right single / closing: before whitespace, punctuation, or end-of-string
    s = s.replace(/(\S)'([\s.,;:!?\])}>'"]|$)/g, '$1\u2019$2');

    return s;
  });
}

/** Convert common character sequences to proper typographic characters. */
export function smartDashes(text: string): string {
  return transformText(text, (s) => {
    // Replace --- before -- to prevent partial matching
    s = s.replace(/---/g, '\u2014'); // em-dash
    s = s.replace(/--/g, '\u2013'); // en-dash
    s = s.replace(/\.\.\./g, '\u2026'); // ellipsis
    return s;
  });
}

/** Add thin spaces (U+2009) around em-dashes for better readability. */
export function smartSpacing(text: string): string {
  return transformText(text, (s) => {
    // Only add thin spaces when the em-dash has no surrounding whitespace/thin-space
    s = s.replace(/(?<![\s\u2009])\u2014(?![\s\u2009])/g, '\u2009\u2014\u2009');
    return s;
  });
}

/**
 * Prevent widows by inserting a non-breaking space before the last word
 * when it is short (< 8 chars) and the text is long enough (> 30 chars).
 */
export function preventWidows(text: string): string {
  if (text.length <= 30) return text;
  // Replace the last regular space before a short final word
  return text.replace(/\s(\S{1,7})$/, (_, lastWord) => `\u00A0${lastWord}`);
}

/** Apply all smart typography transformations. */
export function smartTypography(
  text: string,
  options?: {
    quotes?: boolean;
    dashes?: boolean;
    spacing?: boolean;
    widows?: boolean;
  }
): string {
  const { quotes = true, dashes = true, spacing = true, widows = true } = options ?? {};

  let result = text;
  // Apply dashes first so em/en-dashes are present before spacing is added
  if (dashes) result = smartDashes(result);
  if (quotes) result = smartQuotes(result);
  if (spacing) result = smartSpacing(result);
  if (widows) result = preventWidows(result);
  return result;
}
