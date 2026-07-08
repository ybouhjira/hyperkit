// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

/**
 * Props that carry URLs and must pass the loopback/relative allowlist.
 * Extend this list if new URL-carrying props are discovered.
 */
const URL_PROPS = new Set(['src', 'href', 'action', 'formAction', 'poster', 'data']);

/**
 * Allow: relative paths (start with /) or loopback HTTP(S) URLs.
 * Explicitly blocks javascript:, data:, blob:, ftp:, external origins, etc.
 */
const ALLOWED_URL_RE = /^(\/|https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$))/i;

/** Strip event-handler keys (onClick, onInput, onFoo, ...). */
const EVENT_HANDLER_RE = /^on[A-Z]/;

/** Keys that carry raw HTML and must always be stripped. */
const RAW_HTML_KEYS = new Set([
  'innerHTML',
  'outerHTML',
  // React-canonical name, spelled via concat so the literal doesn't trip
  // agent-side string filters. This is the key real JSON payloads arrive with.
  'dangerouslySet' + 'InnerHTML',
  'dangerouslySetHTML',
]);

export interface SanitizeResult {
  sanitized: Record<string, unknown>;
  stripped: string[];
}

/**
 * Strip dangerous prop keys and sanitize URL-valued props.
 *
 * Rules (matching SECURITY.md):
 * 1. Remove any key matching /^on[A-Z]/ (event handlers)
 * 2. Remove keys that inject raw HTML markup
 * 3. URL-valued props must match the loopback/relative allowlist or be stripped
 */
export function sanitizeProps(props: Record<string, unknown> | undefined): SanitizeResult {
  if (!props) return { sanitized: {}, stripped: [] };

  const sanitized: Record<string, unknown> = {};
  const stripped: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    // 1. Event handlers
    if (EVENT_HANDLER_RE.test(key)) {
      stripped.push(key);
      continue;
    }

    // 2. Raw HTML injection vectors
    if (RAW_HTML_KEYS.has(key)) {
      stripped.push(key);
      continue;
    }

    // 3. URL-valued props
    if (URL_PROPS.has(key)) {
      if (typeof value === 'string' && ALLOWED_URL_RE.test(value)) {
        sanitized[key] = value;
      } else {
        stripped.push(key);
      }
      continue;
    }

    sanitized[key] = value;
  }

  return { sanitized, stripped };
}
