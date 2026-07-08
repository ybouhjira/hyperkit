import type { IconDef, IconCategory } from './types';

// Import all icon defs grouped by module
import * as transformIcons from './icons/transform';
import * as annotateIcons from './icons/annotate';
import * as convertIcons from './icons/convert';
import * as securityIcons from './icons/security';
import * as optimizeIcons from './icons/optimize';
import * as aiIcons from './icons/ai';

export interface CatalogEntry {
  def: IconDef;
  /** kebab-case identifier, e.g., "merge", "pdf-to-word" */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Icon category */
  category: IconCategory;
  /** Search tags */
  tags: string[];
}

/** Convert kebab-case id to display name with known acronym handling */
function toDisplayName(id: string): string {
  const acronyms = new Set(['pdf', 'ai', 'ocr', 'html', 'ppt', 'xlsx']);
  return id
    .split('-')
    .map((word) => (acronyms.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

/** Extract all IconDef values from a module object */
function extractDefs(module: Record<string, unknown>): IconDef[] {
  return Object.values(module).filter(
    (v): v is IconDef =>
      v !== null &&
      typeof v === 'object' &&
      'name' in v &&
      'category' in v &&
      'layers' in v &&
      'tags' in v
  );
}

/** All icon definition modules ordered by category */
const ICON_MODULES: Record<string, Record<string, unknown>> = {
  transform: transformIcons as Record<string, unknown>,
  annotate: annotateIcons as Record<string, unknown>,
  convert: convertIcons as Record<string, unknown>,
  security: securityIcons as Record<string, unknown>,
  optimize: optimizeIcons as Record<string, unknown>,
  ai: aiIcons as Record<string, unknown>,
};

/** All icons in the catalog, sorted by category then name */
export const ICON_CATALOG: CatalogEntry[] = Object.values(ICON_MODULES)
  .flatMap((module) => extractDefs(module))
  .sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  })
  .map((def) => ({
    def,
    id: def.name,
    displayName: toDisplayName(def.name),
    category: def.category,
    tags: def.tags,
  }));

/** Lookup icon by id (kebab-case name) */
export function getIconById(id: string): CatalogEntry | undefined {
  return ICON_CATALOG.find((e) => e.id === id);
}

/** Get all icons in a category */
export function getIconsByCategory(category: IconCategory): CatalogEntry[] {
  return ICON_CATALOG.filter((e) => e.category === category);
}

/** Search icons by keyword (matches id, displayName, category, tags) */
export function searchIcons(query: string): CatalogEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return ICON_CATALOG;
  return ICON_CATALOG.filter(
    (e) =>
      e.id.includes(q) ||
      e.displayName.toLowerCase().includes(q) ||
      e.category.includes(q) ||
      e.tags.some((t) => t.includes(q))
  );
}

/** Total number of icons in the catalog */
export const ICON_COUNT = ICON_CATALOG.length;
