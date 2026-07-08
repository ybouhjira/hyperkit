/**
 * Shared highlight.js instance + helper. Centralizes language registration so
 * every syntax-highlighted primitive (CodeBlock, DiffView, …) uses one configured
 * core build instead of duplicating the registration block.
 */

import hljs from 'highlight.js/lib/core';
// Common languages imported individually for tree-shaking.
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);

export { hljs };

/** Escape HTML metacharacters so a fallback (un-highlighted) string is safe as innerHTML. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Return highlighted HTML for `code`. When `language` is given and registered,
 * highlight as that language; otherwise auto-detect. On any failure (e.g. an
 * unknown language id) fall back to the HTML-escaped raw code so the markup is
 * always safe to assign via innerHTML.
 */
export function highlightCode(code: string, language?: string): string {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
}
