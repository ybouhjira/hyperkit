/**
 * Access layer over the generated docs content in src/content/.
 * nav + components-index are small and imported eagerly; page bodies load
 * lazily per route through import.meta.glob so each docs page ships only its
 * own JSON chunk.
 */
import navJson from '../../content/nav.json';
import componentsIndexJson from '../../content/components-index.json';
import type { ComponentsIndex, DocPage, NavData, NavLeaf } from './types';

export const nav = navJson as NavData;
export const componentsIndex = componentsIndexJson as ComponentsIndex;

const pageModules = import.meta.glob('../../content/pages/**/*.json') as Record<
  string,
  () => Promise<{ default: DocPage }>
>;

const PAGES_PREFIX = '../../content/pages/';

export async function loadPage(slug: string): Promise<DocPage | null> {
  const loader = pageModules[`${PAGES_PREFIX}${slug}.json`];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

/** Prev/next docs pages around `slug` in reading order ('' = the docs overview). */
export function pagination(slug: string): { prev: NavLeaf | null; next: NavLeaf | null } {
  const index = nav.flat.findIndex((item) => item.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? (nav.flat[index - 1] ?? null) : null,
    next: index < nav.flat.length - 1 ? (nav.flat[index + 1] ?? null) : null,
  };
}
