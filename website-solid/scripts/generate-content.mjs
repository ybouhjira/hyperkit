/**
 * Docs content generator.
 *
 * Converts the hand-written markdown under content-src/{getting-started,
 * guides,systems,packages}/ and the machine-generated component pages under
 * content-src/components/ into prerenderable JSON modules consumed by
 * src/routes/docs/[...slug].tsx.
 *
 * - Guides are rendered to HTML at build time (marked + shiki dual-theme).
 * - Component pages become structured data: the playground snippet and extra
 *   examples are read from the generated .mdx files (they embed the final
 *   snippet-derivation output of website/scripts/generate-component-docs.mjs),
 *   while props/tokens/a11y/usage notes come straight from docs-manifest.json.
 *
 * Output:
 *   src/content/nav.json              sidebar tree + flat prev/next order
 *   src/content/components-index.json category overview data (text cards)
 *   src/content/pages/<slug>.json     one module per docs page
 *
 * Usage: node scripts/generate-content.mjs   (wired as `pnpm generate`)
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  rmSync,
  existsSync,
  copyFileSync,
} from 'node:fs';
import { dirname, join, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked, Marked } from 'marked';
import { createHighlighter } from 'shiki';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '..');
const repoDir = resolve(siteDir, '..');
const docsDir = join(siteDir, 'content-src');
const contentDir = join(siteDir, 'src', 'content');
const pagesDir = join(contentDir, 'pages');

/** Deploy base path — matches `baseURL` in app.config.ts. */
const BASE = '/hyperkit';
/** Route prefix for all docs pages. */
const DOCS_ROOT = '/docs';

const GUIDE_SECTIONS = ['getting-started', 'guides', 'systems', 'packages'];
const SHIKI_THEMES = { light: 'github-light', dark: 'github-dark' };
const SHIKI_LANGS = ['tsx', 'jsx', 'typescript', 'javascript', 'css', 'bash', 'json', 'html'];
const LANG_ALIASES = { ts: 'typescript', js: 'javascript', sh: 'bash', shell: 'bash' };

const highlighter = await createHighlighter({
  themes: Object.values(SHIKI_THEMES),
  langs: SHIKI_LANGS,
});

// --- small helpers -----------------------------------------------------------

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlight(code, lang) {
  const resolved = LANG_ALIASES[lang] ?? lang;
  const language = SHIKI_LANGS.includes(resolved) ? resolved : 'text';
  return highlighter.codeToHtml(code.replace(/\n$/, ''), {
    lang: language,
    themes: SHIKI_THEMES,
    defaultColor: false,
  });
}

/** GitHub-style heading slugger with per-document deduplication. */
function createSlugger() {
  const seen = new Map();
  return (text) => {
    const base = String(text)
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s+/g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** Parses `---` frontmatter; returns { data, body }. */
function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return { data, body: source.slice(match[0].length) };
}

/** Strips inline markdown to plain text (for titles). */
function stripInline(text) {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .trim();
}

/** Decodes the entities marked emits in inline HTML back to plain text. */
function decodeEntities(text) {
  return String(text)
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Rewrites a markdown link target to a site URL.
 * Relative `.md`/`.mdx` links resolve against the source doc's directory and
 * map to `/hyperkit/docs/...` routes; absolute `/img/...` assets get the base
 * prefix; external URLs and pure anchors pass through.
 */
function rewriteHref(href, fromDirSlug) {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('#')) {
    return href;
  }
  if (href.startsWith('/img/')) return BASE + href;
  if (href.startsWith('/')) return BASE + href;
  const [pathPart, hash] = href.split('#');
  const resolved = posix
    .normalize(posix.join('/', fromDirSlug, pathPart))
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '');
  return `${BASE}${DOCS_ROOT}${resolved}${hash ? `#${hash}` : ''}`;
}

// --- markdown → HTML pipeline ------------------------------------------------

const ADMONITION_TITLES = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  caution: 'Caution',
  danger: 'Danger',
};

/**
 * Converts Docusaurus `:::type[Title]` admonitions into styled div wrappers
 * marked treats as raw block HTML. Fenced code blocks are left untouched.
 */
function transformAdmonitions(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) {
      out.push(line);
      continue;
    }
    const open = /^:::(\w+)(?:\[(.*?)\])?\s*$/.exec(line);
    if (open && ADMONITION_TITLES[open[1]]) {
      const type = open[1];
      const title = open[2] || ADMONITION_TITLES[type];
      out.push(
        `<div class="docs-admonition docs-admonition--${type}">`,
        `<p class="docs-admonition__title">${escapeHtml(title)}</p>`,
        ''
      );
      continue;
    }
    if (/^:::\s*$/.test(line)) {
      out.push('', '</div>');
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/**
 * Strips MDX-only syntax from a guide: `import ... from '@site/...'` lines and
 * `<LivePlayground code={...} />` usages, the latter replaced by an HTML
 * comment marker the docs renderer swaps for the real component.
 */
function transformMdxArtifacts(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence) {
      if (/^import\s.+from\s+['"]@site\//.test(line)) continue;
      const playground = /^<LivePlayground\s+code=\{(".*")\}\s*\/>\s*$/.exec(line.trim());
      if (playground) {
        const code = JSON.parse(playground[1]);
        out.push(`<!--LIVE_PLAYGROUND:${Buffer.from(code, 'utf8').toString('base64')}-->`);
        continue;
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

/**
 * Renders a markdown document to HTML with shiki-highlighted code, heading
 * anchors, a collected table of contents, and rewritten internal links.
 */
function renderMarkdown(markdown, fromDirSlug) {
  const slugger = createSlugger();
  const toc = [];
  const md = new Marked({
    gfm: true,
    renderer: {
      code({ text, lang }) {
        return highlight(text, lang ?? 'text');
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const plain = decodeEntities(stripInline(inner.replace(/<[^>]+>/g, '')));
        const id = slugger(plain);
        if (depth === 2 || depth === 3) {
          toc.push({ id, depth, text: plain });
        }
        return `<h${depth} id="${id}"><a class="docs-anchor" href="#${id}" aria-label="Direct link">#</a>${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const url = rewriteHref(href, fromDirSlug);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const external = /^(https?:)?\/\//.test(url);
        const rel = external ? ' target="_blank" rel="noreferrer"' : '';
        return `<a href="${url}"${titleAttr}${rel}>${inner}</a>`;
      },
      image({ href, title, text }) {
        const url = rewriteHref(href, fromDirSlug);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${url}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" />`;
      },
    },
  });
  const prepared = transformAdmonitions(transformMdxArtifacts(markdown));
  const html = md.parse(prepared);
  return { html, toc };
}

/** Renders trusted inline markdown (prop descriptions, notes) to HTML. */
function renderInline(text) {
  return marked.parseInline(String(text));
}

// --- guides -------------------------------------------------------------------

function readCategoryMeta(dir) {
  const file = join(dir, '_category_.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}

function loadGuideSection(section) {
  const dir = join(docsDir, section);
  const meta = readCategoryMeta(dir);
  const pages = [];
  for (const file of readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = readFileSync(join(dir, file), 'utf8');
    const { data, body } = parseFrontmatter(source);
    const name = file.replace(/\.mdx?$/, '');
    const slug = name === 'index' ? section : `${section}/${name}`;
    const heading = /^#\s+(.+)$/m.exec(body);
    const title = data.title ?? (heading ? stripInline(heading[1]) : name);
    const { html, toc } = renderMarkdown(body, section);
    pages.push({
      kind: 'guide',
      slug,
      title,
      description: data.description ?? null,
      position: data.sidebar_position !== undefined ? Number(data.sidebar_position) : 999,
      isIndex: name === 'index',
      html,
      toc,
    });
  }
  pages.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
  return { section, label: meta.label ?? section, position: meta.position ?? 999, pages };
}

// --- components ----------------------------------------------------------------

const manifest = JSON.parse(readFileSync(join(repoDir, 'docs-manifest.json'), 'utf8'));
const manifestByName = new Map(manifest.entries.map((entry) => [entry.name, entry]));

/**
 * Parses one generated component .mdx page. The format is machine-written by
 * website/scripts/generate-component-docs.mjs, so the extraction is exact:
 * frontmatter description, the LivePlayground snippet (final derivation
 * output), extra example sections, and the static-fallback marker.
 */
function parseComponentMdx(source) {
  const { data, body } = parseFrontmatter(source);
  const playgroundMatch = /<LivePlayground code=\{(".*")\} \/>/.exec(body);
  const playground = playgroundMatch ? JSON.parse(playgroundMatch[1]) : null;
  const staticNote = body.includes(':::note[Static examples]');

  const examples = [];
  const sectionMatch = /^## (More Examples|Examples)$\n([\s\S]*?)(?=^## |\n*$(?![\s\S]))/m.exec(
    body
  );
  if (sectionMatch) {
    const exampleRe = /^### (.+)$\n\n```tsx\n([\s\S]*?)```/gm;
    let m;
    while ((m = exampleRe.exec(sectionMatch[2])) !== null) {
      examples.push({ title: m[1].trim(), code: m[2] });
    }
  }
  return { description: data.description ?? '', playground, staticNote, examples };
}

function loadComponentCategories() {
  const componentsDir = join(docsDir, 'components');
  const categories = [];
  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(componentsDir, entry.name);
    const meta = readCategoryMeta(dir);
    const index = parseFrontmatter(readFileSync(join(dir, 'index.md'), 'utf8'));
    const components = readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
      .sort((a, b) => a.localeCompare(b));
    categories.push({
      slug: entry.name,
      label: index.data.title ?? meta.label ?? entry.name,
      blurb: index.data.description ?? '',
      position: meta.position ?? 999,
      components,
    });
  }
  categories.sort((a, b) => a.position - b.position);
  return categories;
}

function buildComponentPage(category, name) {
  const source = readFileSync(join(docsDir, 'components', category.slug, `${name}.mdx`), 'utf8');
  const parsed = parseComponentMdx(source);
  const entry = manifestByName.get(name);
  if (!entry) throw new Error(`No docs-manifest entry for component ${name}`);

  const props = (entry.props ?? []).map((p) => ({
    name: p.name,
    required: Boolean(p.required),
    type: p.type ?? '',
    defaultValue: p.defaultValue ?? null,
    descriptionHtml: p.description ? renderInline(p.description) : null,
  }));

  const usage = entry.dosAndDonts
    ? {
        do: (entry.dosAndDonts.do ?? []).map(renderInline),
        dont: (entry.dosAndDonts.dont ?? []).map(renderInline),
      }
    : null;
  const hasUsage = usage !== null && (usage.do.length > 0 || usage.dont.length > 0);

  const toc = [];
  if (parsed.playground) toc.push({ id: 'playground', depth: 2, text: 'Playground' });
  if (parsed.examples.length > 0) {
    toc.push({
      id: 'examples',
      depth: 2,
      text: parsed.playground ? 'More Examples' : 'Examples',
    });
  }
  if (props.length > 0) toc.push({ id: 'props', depth: 2, text: 'Props' });
  if (entry.a11y) toc.push({ id: 'accessibility', depth: 2, text: 'Accessibility' });
  if (hasUsage) toc.push({ id: 'usage-notes', depth: 2, text: 'Usage Notes' });
  if ((entry.tokens ?? []).length > 0) {
    toc.push({ id: 'design-tokens', depth: 2, text: 'Design Tokens' });
  }

  return {
    kind: 'component',
    slug: `components/${category.slug}/${name}`,
    title: name,
    description: parsed.description,
    category: { slug: category.slug, label: category.label },
    importHtml: highlight(`import { ${name} } from '@ybouhjira/hyperkit';`, 'tsx'),
    playground: parsed.playground,
    staticNote: parsed.staticNote,
    examples: parsed.examples.map((ex) => ({ title: ex.title, html: highlight(ex.code, 'tsx') })),
    props,
    hasRequiredProps: props.some((p) => p.required),
    a11yHtml: entry.a11y ? renderInline(entry.a11y) : null,
    usage: hasUsage ? usage : null,
    tokens: entry.tokens ?? [],
    toc,
  };
}

// --- emit ----------------------------------------------------------------------

rmSync(contentDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });

function writePage(page) {
  const file = join(pagesDir, `${page.slug}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(page));
}

const guideSections = GUIDE_SECTIONS.map(loadGuideSection);
const componentCategories = loadComponentCategories();
const componentsMeta = readCategoryMeta(join(docsDir, 'components'));

let liveCount = 0;
let staticCount = 0;
const componentPagesByCategory = new Map();
for (const category of componentCategories) {
  const pages = category.components.map((name) => buildComponentPage(category, name));
  for (const page of pages) {
    if (page.playground) liveCount++;
    else staticCount++;
    writePage(page);
  }
  componentPagesByCategory.set(category.slug, pages);
}

for (const section of guideSections) {
  for (const page of section.pages) writePage(page);
}

// Sidebar tree + flat prev/next order (Docusaurus section order by position).
const sidebarSections = [];
const flat = [{ title: 'Overview', slug: '' }];

const componentsSection = {
  label: componentsMeta.label ?? 'Components',
  position: componentsMeta.position ?? 3,
  slug: 'components',
  categories: componentCategories.map((category) => ({
    label: category.label,
    slug: `components/${category.slug}`,
    items: category.components.map((name) => ({
      title: name,
      slug: `components/${category.slug}/${name}`,
    })),
  })),
};

const allSections = [
  ...guideSections.map((section) => ({
    label: section.label,
    position: section.position,
    slug: section.pages.some((p) => p.isIndex) ? section.section : null,
    items: section.pages.filter((p) => !p.isIndex).map((p) => ({ title: p.title, slug: p.slug })),
  })),
  componentsSection,
].sort((a, b) => a.position - b.position);

for (const section of allSections) {
  sidebarSections.push(section);
  if (section.categories) {
    flat.push({ title: section.label, slug: section.slug });
    for (const category of section.categories) {
      flat.push({ title: category.label, slug: category.slug });
      flat.push(...category.items);
    }
  } else {
    if (section.slug) flat.push({ title: section.label, slug: section.slug });
    flat.push(...section.items);
  }
}

writeFileSync(
  join(contentDir, 'nav.json'),
  JSON.stringify({ sections: sidebarSections, flat }, null, 1)
);

// Components overview data (native text cards).
writeFileSync(
  join(contentDir, 'components-index.json'),
  JSON.stringify(
    {
      total: componentCategories.reduce((sum, c) => sum + c.components.length, 0),
      importHtml: highlight("import { Button, Card, Table } from '@ybouhjira/hyperkit';", 'tsx'),
      categories: componentCategories.map((category) => ({
        slug: category.slug,
        label: category.label,
        blurb: category.blurb,
        items: componentPagesByCategory.get(category.slug).map((page) => ({
          name: page.title,
          description: page.description,
          live: Boolean(page.playground),
        })),
      })),
    },
    null,
    1
  )
);

// Site-level image assets (favicon, logo, social card) → public/img/.
const imgSrcDir = join(siteDir, 'assets-src');
for (const file of readdirSync(imgSrcDir)) {
  const source = join(imgSrcDir, file);
  if (!/\.(svg|png|webp|ico)$/.test(file)) continue;
  copyFileSync(source, join(siteDir, 'public', 'img', file));
}

const guideCount = guideSections.reduce((sum, s) => sum + s.pages.length, 0);
console.log(
  `Generated ${guideCount} guide pages, ${liveCount + staticCount} component pages ` +
    `(${liveCount} live playgrounds, ${staticCount} static), ` +
    `${componentCategories.length} categories, ${flat.length} nav entries.`
);
