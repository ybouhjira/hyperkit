import type { ContentTypeDefinition } from './types';

const contentTypes = new Map<string, ContentTypeDefinition>();

/** Register a content type with its default panel and alternatives */
export function registerContentType(def: ContentTypeDefinition): void {
  contentTypes.set(def.type, def);
}

/** Get a registered content type definition */
export function getContentType(type: string): ContentTypeDefinition | undefined {
  return contentTypes.get(type);
}

/** Get the default panel for a content type */
export function getDefaultPanel(contentType: string): string | undefined {
  return contentTypes.get(contentType)?.defaultPanel;
}

/** Get all panels that can display a content type */
export function getPanelsForContentType(contentType: string): string[] {
  const def = contentTypes.get(contentType);
  if (!def) return [];
  return [def.defaultPanel, ...(def.alternativePanels ?? [])];
}

/** Get all registered content type definitions */
export function getAllContentTypes(): ContentTypeDefinition[] {
  return Array.from(contentTypes.values());
}

/** Clear all registrations (useful for tests) */
export function clearContentTypes(): void {
  contentTypes.clear();
}
