/** Shared shapes for the generated docs content (see scripts/generate-content.mjs). */

export interface TocItem {
  id: string;
  depth: 2 | 3;
  text: string;
}

export interface GuidePage {
  kind: 'guide';
  slug: string;
  title: string;
  description: string | null;
  position: number;
  isIndex: boolean;
  html: string;
  toc: TocItem[];
}

export interface PropRow {
  name: string;
  required: boolean;
  type: string;
  defaultValue: string | null;
  descriptionHtml: string | null;
}

export interface ComponentExample {
  title: string;
  html: string;
}

export interface ComponentPage {
  kind: 'component';
  slug: string;
  title: string;
  description: string;
  category: { slug: string; label: string };
  importHtml: string;
  playground: string | null;
  staticNote: boolean;
  thumbnail: string | null;
  examples: ComponentExample[];
  props: PropRow[];
  hasRequiredProps: boolean;
  a11yHtml: string | null;
  usage: { do: string[]; dont: string[] } | null;
  tokens: string[];
  toc: TocItem[];
}

export type DocPage = GuidePage | ComponentPage;

export interface NavLeaf {
  title: string;
  slug: string;
}

export interface NavCategory {
  label: string;
  slug: string;
  items: NavLeaf[];
}

export interface NavSection {
  label: string;
  position: number;
  slug: string | null;
  items?: NavLeaf[];
  categories?: NavCategory[];
}

export interface NavData {
  sections: NavSection[];
  flat: NavLeaf[];
}

export interface ComponentsIndexItem {
  name: string;
  description: string;
  thumbnail: string | null;
  live: boolean;
}

export interface ComponentsIndexCategory {
  slug: string;
  label: string;
  blurb: string;
  items: ComponentsIndexItem[];
}

export interface ComponentsIndex {
  total: number;
  importHtml: string;
  categories: ComponentsIndexCategory[];
}
