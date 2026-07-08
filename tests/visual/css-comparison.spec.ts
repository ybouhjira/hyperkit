/* eslint-disable no-console */
import { test, expect, type Page } from '@playwright/test';

// Expanded CSS properties - 35 total (added layout-critical properties)
const CSS_PROPERTIES = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'font-family',
  'line-height',
  'letter-spacing',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border-radius',
  'border-width',
  'border-color',
  'border-left-color',
  'border-style',
  'gap',
  'opacity',
  'box-shadow',
  'backdrop-filter',
  // New layout properties
  'width',
  'max-width',
  'min-height',
  'display',
  'flex-direction',
  'align-items',
  'justify-content',
  'grid-template-columns',
  'text-align',
  'text-transform',
  'white-space',
  'position',
  'overflow',
];

// Flat element mapping (~80 pairs)
interface ElementPair {
  name: string;
  sk: string;
  ref: string;
  group: string;
}

const ELEMENT_MAP: ElementPair[] = [
  // ── nav ──
  { name: 'nav', sk: '.sk-report-nav', ref: '.nav', group: 'nav' },
  { name: 'nav-inner', sk: '.sk-report-nav__inner', ref: '.nav-inner', group: 'nav' },
  { name: 'nav-brand', sk: '.sk-report-nav__brand', ref: '.nav-brand', group: 'nav' },
  { name: 'nav-links', sk: '.sk-report-nav__links', ref: '.nav-links', group: 'nav' },
  // nav-link by index - compare ALL links
  {
    name: 'nav-link-1',
    sk: '.sk-report-nav__link:nth-child(1)',
    ref: '.nav-link:nth-child(1)',
    group: 'nav',
  },
  {
    name: 'nav-link-2',
    sk: '.sk-report-nav__link:nth-child(2)',
    ref: '.nav-link:nth-child(2)',
    group: 'nav',
  },
  {
    name: 'nav-link-3',
    sk: '.sk-report-nav__link:nth-child(3)',
    ref: '.nav-link:nth-child(3)',
    group: 'nav',
  },
  {
    name: 'nav-link-4',
    sk: '.sk-report-nav__link:nth-child(4)',
    ref: '.nav-link:nth-child(4)',
    group: 'nav',
  },
  {
    name: 'nav-link-5',
    sk: '.sk-report-nav__link:nth-child(5)',
    ref: '.nav-link:nth-child(5)',
    group: 'nav',
  },
  {
    name: 'nav-link-6',
    sk: '.sk-report-nav__link:nth-child(6)',
    ref: '.nav-link:nth-child(6)',
    group: 'nav',
  },
  {
    name: 'nav-link-7',
    sk: '.sk-report-nav__link:nth-child(7)',
    ref: '.nav-link:nth-child(7)',
    group: 'nav',
  },
  {
    name: 'nav-link-8',
    sk: '.sk-report-nav__link:nth-child(8)',
    ref: '.nav-link:nth-child(8)',
    group: 'nav',
  },
  {
    name: 'nav-link-9',
    sk: '.sk-report-nav__link:nth-child(9)',
    ref: '.nav-link:nth-child(9)',
    group: 'nav',
  },
  {
    name: 'nav-link-10',
    sk: '.sk-report-nav__link:nth-child(10)',
    ref: '.nav-link:nth-child(10)',
    group: 'nav',
  },

  // ── hero ──
  { name: 'hero', sk: '.sk-report-hero', ref: '.hero', group: 'hero' },
  { name: 'hero-badge', sk: '.sk-report-hero__badge', ref: '.hero-badge', group: 'hero' },
  { name: 'hero-title', sk: '.sk-report-hero__title', ref: '.hero h1', group: 'hero' },
  { name: 'hero-subtitle', sk: '.sk-report-hero__subtitle', ref: '.subtitle', group: 'hero' },
  { name: 'hero-meta', sk: '.sk-report-hero__meta', ref: '.hero-meta', group: 'hero' },

  // ── score ──
  { name: 'score-card', sk: '.sk-report-score', ref: '.score-card', group: 'score' },
  { name: 'score-ring', sk: '.sk-report-score__ring', ref: '.score-ring', group: 'score' },
  {
    name: 'score-details-h3',
    sk: '.sk-report-score__details h3',
    ref: '.score-details h3',
    group: 'score',
  },
  {
    name: 'score-details-p',
    sk: '.sk-report-score__details p',
    ref: '.score-details p',
    group: 'score',
  },
  {
    name: 'chip-done',
    sk: '.sk-report-score__chip--done',
    ref: '.score-chip.done',
    group: 'score',
  },
  {
    name: 'chip-partial',
    sk: '.sk-report-score__chip--partial',
    ref: '.score-chip.partial',
    group: 'score',
  },
  {
    name: 'chip-missing',
    sk: '.sk-report-score__chip--missing',
    ref: '.score-chip.missing',
    group: 'score',
  },

  // ── summary ──
  { name: 'section', sk: '#summary.sk-report-section', ref: '#summary.section', group: 'summary' },
  {
    name: 'label',
    sk: '#summary .sk-report-section__label',
    ref: '#summary .section-label',
    group: 'summary',
  },
  {
    name: 'title',
    sk: '#summary .sk-report-section__title',
    ref: '#summary .section-title',
    group: 'summary',
  },
  {
    name: 'desc',
    sk: '#summary .sk-report-section__desc',
    ref: '#summary .section-desc',
    group: 'summary',
  },
  { name: 'summary-grid', sk: '.sk-report-summary-grid', ref: '.summary-grid', group: 'summary' },
  { name: 'summary-card', sk: '.sk-report-summary-card', ref: '.summary-card', group: 'summary' },
  {
    name: 'card-icon',
    sk: '.sk-report-summary-card__icon',
    ref: '.summary-card .icon',
    group: 'summary',
  },
  {
    name: 'card-title',
    sk: '.sk-report-summary-card__title',
    ref: '.summary-card h4',
    group: 'summary',
  },
  {
    name: 'card-desc',
    sk: '.sk-report-summary-card__desc',
    ref: '.summary-card p',
    group: 'summary',
  },

  // ── libraries ──
  {
    name: 'section',
    sk: '#libraries.sk-report-section',
    ref: '#libraries.section',
    group: 'libraries',
  },
  {
    name: 'label',
    sk: '#libraries .sk-report-section__label',
    ref: '#libraries .section-label',
    group: 'libraries',
  },
  {
    name: 'title',
    sk: '#libraries .sk-report-section__title',
    ref: '#libraries .section-title',
    group: 'libraries',
  },
  {
    name: 'table-wrap',
    sk: '#libraries .sk-report-table',
    ref: '#libraries .table-wrap',
    group: 'libraries',
  },
  {
    name: 'table-th',
    sk: '#libraries .sk-report-table th',
    ref: '#libraries .table-wrap th',
    group: 'libraries',
  },
  {
    name: 'table-td',
    sk: '#libraries .sk-report-table td',
    ref: '#libraries .table-wrap td',
    group: 'libraries',
  },
  {
    name: 'lib-name',
    sk: '#libraries .sk-report-table .lib-name',
    ref: '#libraries .lib-name',
    group: 'libraries',
  },

  // ── architecture ──
  {
    name: 'section',
    sk: '#architecture.sk-report-section',
    ref: '#architecture.section',
    group: 'architecture',
  },
  {
    name: 'label',
    sk: '#architecture .sk-report-section__label',
    ref: '#architecture .section-label',
    group: 'architecture',
  },
  {
    name: 'title',
    sk: '#architecture .sk-report-section__title',
    ref: '#architecture .section-title',
    group: 'architecture',
  },
  { name: 'arch-diagram', sk: '.sk-report-flow', ref: '.arch-diagram', group: 'architecture' },
  { name: 'dep-flow', sk: '.sk-report-flow__layers', ref: '.dep-flow', group: 'architecture' },
  { name: 'dep-layer', sk: '.sk-report-flow__layer', ref: '.dep-layer', group: 'architecture' },
  {
    name: 'layer-title',
    sk: '.sk-report-flow__layer-title',
    ref: '.layer-title',
    group: 'architecture',
  },
  { name: 'pkg-grid', sk: '.sk-report-pkg-grid', ref: '.pkg-grid', group: 'architecture' },
  { name: 'pkg-box', sk: '.sk-report-pkg-box', ref: '.pkg-box', group: 'architecture' },
  { name: 'pkg-name', sk: '.sk-report-pkg-box__name', ref: '.pkg-name', group: 'architecture' },
  {
    name: 'code-block',
    sk: '#architecture .sk-report-code',
    ref: '#architecture .code-block',
    group: 'architecture',
  },

  // ── theming ──
  { name: 'section', sk: '#theming.sk-report-section', ref: '#theming.section', group: 'theming' },
  {
    name: 'label',
    sk: '#theming .sk-report-section__label',
    ref: '#theming .section-label',
    group: 'theming',
  },
  {
    name: 'title',
    sk: '#theming .sk-report-section__title',
    ref: '#theming .section-title',
    group: 'theming',
  },
  { name: 'theme-layers', sk: '.sk-report-layer-stack', ref: '.theme-layers', group: 'theming' },
  { name: 'theme-layer', sk: '.sk-report-layer', ref: '.theme-layer', group: 'theming' },
  { name: 'layer-num', sk: '.sk-report-layer__num', ref: '.layer-num', group: 'theming' },
  { name: 'layer-name', sk: '.sk-report-layer__name', ref: '.layer-name', group: 'theming' },
  { name: 'presets-grid', sk: '.sk-report-preset-grid', ref: '.presets-grid', group: 'theming' },
  { name: 'preset-card', sk: '.sk-report-preset-card', ref: '.preset-card', group: 'theming' },
  {
    name: 'preset-swatch',
    sk: '.sk-report-preset-swatch',
    ref: '.preset-swatch',
    group: 'theming',
  },
  { name: 'preset-name', sk: '.sk-report-preset-name', ref: '.preset-name', group: 'theming' },

  // ── gaps ──
  { name: 'section', sk: '#gaps.sk-report-section', ref: '#gaps.section', group: 'gaps' },
  {
    name: 'label',
    sk: '#gaps .sk-report-section__label',
    ref: '#gaps .section-label',
    group: 'gaps',
  },
  {
    name: 'title',
    sk: '#gaps .sk-report-section__title',
    ref: '#gaps .section-title',
    group: 'gaps',
  },
  { name: 'gap-section', sk: '.sk-report-gap-analysis', ref: '.gap-section', group: 'gaps' },
  { name: 'gap-header', sk: '.sk-report-gap-analysis__header', ref: '.gap-header', group: 'gaps' },
  { name: 'gap-count', sk: '.sk-report-gap-count', ref: '.gap-count', group: 'gaps' },
  {
    name: 'severity-label',
    sk: '.sk-report-severity-label',
    ref: '.severity-label',
    group: 'gaps',
  },
  { name: 'gap-card', sk: '.sk-report-gap-card', ref: '.gap-card', group: 'gaps' },
  { name: 'gap-num', sk: '.sk-report-gap-card__id', ref: '.gap-num', group: 'gaps' },
  { name: 'gap-tag', sk: '.sk-report-gap-card__tag', ref: '.gap-tag', group: 'gaps' },
  { name: 'gap-text', sk: '.sk-report-gap-card__text', ref: '.gap-text', group: 'gaps' },

  // ── issues ──
  { name: 'section', sk: '#issues.sk-report-section', ref: '#issues.section', group: 'issues' },
  {
    name: 'label',
    sk: '#issues .sk-report-section__label',
    ref: '#issues .section-label',
    group: 'issues',
  },
  {
    name: 'title',
    sk: '#issues .sk-report-section__title',
    ref: '#issues .section-title',
    group: 'issues',
  },
  { name: 'issue-item', sk: '.sk-report-issue-item', ref: '.issue-item', group: 'issues' },
  { name: 'issue-icon', sk: '.sk-report-issue-icon', ref: '.issue-icon', group: 'issues' },

  // ── roadmap ──
  { name: 'section', sk: '#roadmap.sk-report-section', ref: '#roadmap.section', group: 'roadmap' },
  {
    name: 'label',
    sk: '#roadmap .sk-report-section__label',
    ref: '#roadmap .section-label',
    group: 'roadmap',
  },
  {
    name: 'title',
    sk: '#roadmap .sk-report-section__title',
    ref: '#roadmap .section-title',
    group: 'roadmap',
  },
  { name: 'roadmap-grid', sk: '#roadmap .sk-report-pkg-grid', ref: '.roadmap', group: 'roadmap' },

  // ── sources ──
  { name: 'section', sk: '#sources.sk-report-section', ref: '#sources.section', group: 'sources' },
  {
    name: 'label',
    sk: '#sources .sk-report-section__label',
    ref: '#sources .section-label',
    group: 'sources',
  },
  {
    name: 'title',
    sk: '#sources .sk-report-section__title',
    ref: '#sources .section-title',
    group: 'sources',
  },
  { name: 'source-group', sk: '.sk-report-source-group', ref: '.source-group', group: 'sources' },
  {
    name: 'source-group-title',
    sk: '.sk-report-source-group__title',
    ref: '.source-group h4',
    group: 'sources',
  },

  // ── footer ──
  { name: 'footer', sk: '.sk-report-footer', ref: '.footer', group: 'footer' },
];

const STORYBOOK_URL =
  'http://localhost:6006/iframe.html?id=report-report--architecture-review&viewMode=story';
const REFERENCE_URL = 'http://localhost:8081/';

// Helper functions
function normalizeColor(value: string): string {
  const v = value.trim();

  // Normalize rgba with alpha=1 to rgb
  const rgbaMatch = v.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*1\)$/);
  if (rgbaMatch) {
    return `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`;
  }

  // Convert color(srgb r g b) or color(srgb r g b / a) to rgb/rgba
  const srgbMatch = v.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/
  );
  if (srgbMatch) {
    const r = Math.round(parseFloat(srgbMatch[1]) * 255);
    const g = Math.round(parseFloat(srgbMatch[2]) * 255);
    const b = Math.round(parseFloat(srgbMatch[3]) * 255);
    const a = srgbMatch[4] !== undefined ? parseFloat(srgbMatch[4]) : 1;
    if (a === 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return v;
}

function normalizeFontFamily(family: string): string {
  return family
    .split(',')
    .map((f) =>
      f
        .trim()
        .replace(/^["']|["']$/g, '')
        .toLowerCase()
    )
    .join(', ');
}

function parsePx(value: string): number | null {
  const match = value.match(/^([\d.]+)px$/);
  return match ? parseFloat(match[1]) : null;
}

// Tolerance sets - font-size REMOVED from SIZE_PROPS (must be exact)
const COLOR_PROPS = new Set(['color', 'background-color', 'border-color', 'border-left-color']);
const FONT_FAMILY_PROPS = new Set(['font-family']);
const SIZE_PROPS = new Set([
  'line-height',
  'letter-spacing',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'gap',
  'border-radius',
  'border-width',
]);

function valuesMatch(property: string, refVal: string, skVal: string): boolean {
  if (COLOR_PROPS.has(property)) {
    return normalizeColor(refVal) === normalizeColor(skVal);
  }
  if (FONT_FAMILY_PROPS.has(property)) {
    return normalizeFontFamily(refVal) === normalizeFontFamily(skVal);
  }
  if (SIZE_PROPS.has(property)) {
    const refPx = parsePx(refVal);
    const skPx = parsePx(skVal);
    if (refPx !== null && skPx !== null) {
      return Math.abs(refPx - skPx) <= 1;
    }
  }
  return refVal === skVal;
}

async function waitForPage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

// Bulk extraction
async function bulkExtractStyles(
  page: Page,
  selectors: string[],
  properties: string[]
): Promise<Map<string, Record<string, string> | null>> {
  const results = await page.evaluate(
    ([sels, props]) => {
      return sels.map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { selector: sel, found: false, styles: {} };
        const s = getComputedStyle(el);
        const styles: Record<string, string> = {};
        for (const p of props) styles[p] = s.getPropertyValue(p);
        return { selector: sel, found: true, styles };
      });
    },
    [selectors, properties] as const
  );

  const map = new Map<string, Record<string, string> | null>();
  for (const r of results) {
    map.set(r.selector, r.found ? r.styles : null);
  }
  return map;
}

// Result interfaces
interface PropertyResult {
  property: string;
  refVal: string;
  skVal: string;
  match: boolean;
}

interface ElementResult {
  name: string;
  found: boolean;
  mismatches: PropertyResult[];
}

interface GroupResult {
  group: string;
  tested: number;
  notFound: number;
  mismatched: number;
  elements: ElementResult[];
}

interface MismatchPattern {
  property: string;
  refVal: string;
  skVal: string;
  count: number;
  elements: string[];
}

test.describe('CSS Comparison', () => {
  test('should match computed styles between SolidKit Report and reference HTML', async ({
    page: storybookPage,
    context,
  }) => {
    const referencePage = await context.newPage();

    try {
      // Load both pages
      await Promise.all([
        waitForPage(storybookPage, STORYBOOK_URL),
        waitForPage(referencePage, REFERENCE_URL),
      ]);

      // Scroll reference page to trigger IntersectionObserver for nav links
      await referencePage.evaluate(() => {
        const el = document.querySelector('#summary');
        if (el) el.scrollIntoView();
      });
      await referencePage.waitForTimeout(500);
      // Scroll back to top
      await referencePage.evaluate(() => window.scrollTo(0, 0));
      await referencePage.waitForTimeout(300);

      // Bulk extract ALL styles (2 calls total)
      const skSelectors = ELEMENT_MAP.map((e) => e.sk);
      const refSelectors = ELEMENT_MAP.map((e) => e.ref);
      const [skStyleMap, refStyleMap] = await Promise.all([
        bulkExtractStyles(storybookPage, skSelectors, CSS_PROPERTIES),
        bulkExtractStyles(referencePage, refSelectors, CSS_PROPERTIES),
      ]);

      const groupResults: GroupResult[] = [];
      const allMismatches: Array<{
        property: string;
        refVal: string;
        skVal: string;
        elementName: string;
      }> = [];

      // Group elements by group
      const groups = [...new Set(ELEMENT_MAP.map((e) => e.group))];

      for (const group of groups) {
        await test.step(`CSS: ${group}`, () => {
          const elements = ELEMENT_MAP.filter((e) => e.group === group);
          const groupResult: GroupResult = {
            group,
            tested: 0,
            notFound: 0,
            mismatched: 0,
            elements: [],
          };

          for (const elem of elements) {
            const refStyles = refStyleMap.get(elem.ref);
            const skStyles = skStyleMap.get(elem.sk);

            if (!refStyles || !skStyles) {
              groupResult.notFound++;
              groupResult.elements.push({
                name: elem.name,
                found: false,
                mismatches: [],
              });
              continue;
            }

            groupResult.tested++;
            const mismatches: PropertyResult[] = [];

            for (const property of CSS_PROPERTIES) {
              const refVal = refStyles[property];
              const skVal = skStyles[property];

              if (!valuesMatch(property, refVal, skVal)) {
                mismatches.push({ property, refVal, skVal, match: false });
                allMismatches.push({
                  property,
                  refVal,
                  skVal,
                  elementName: `${group}/${elem.name}`,
                });
              }
            }

            if (mismatches.length > 0) {
              groupResult.mismatched++;
            }

            groupResult.elements.push({
              name: elem.name,
              found: true,
              mismatches,
            });

            // Soft assertions
            for (const m of mismatches) {
              expect
                .soft(
                  m.skVal,
                  `${group}/${elem.name}: ${m.property} mismatch (ref: "${m.refVal}", sk: "${m.skVal}")`
                )
                .toBe(m.refVal);
            }
          }

          groupResults.push(groupResult);
        });
      }

      // Print per-group report
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('CSS COMPARISON REPORT');
      console.log('═══════════════════════════════════════════════════════\n');

      for (const gr of groupResults) {
        const hasIssues = gr.notFound > 0 || gr.mismatched > 0;
        const symbol = hasIssues ? '✗' : '✓';
        console.log(`${symbol} ${gr.group.toUpperCase()}`);
        console.log(`  Elements: ${gr.tested} tested, ${gr.notFound} not found`);
        if (gr.mismatched > 0) {
          console.log(`  Mismatches: ${gr.mismatched} elements with differences\n`);
          for (const el of gr.elements) {
            if (el.found && el.mismatches.length > 0) {
              console.log(`    ${el.name}:`);
              for (const m of el.mismatches) {
                console.log(`      ${m.property}: "${m.refVal}" vs "${m.skVal}"`);
              }
            }
          }
        } else {
          console.log('  All properties match ✓');
        }
        console.log('');
      }

      // Common mismatch summary
      if (allMismatches.length > 0) {
        console.log('───────────────────────────────────────────────────────');
        console.log('COMMON MISMATCHES (grouped by pattern)');
        console.log('───────────────────────────────────────────────────────\n');

        const patternMap = new Map<string, MismatchPattern>();
        for (const m of allMismatches) {
          const key = `${m.property}: "${m.refVal}" vs "${m.skVal}"`;
          if (!patternMap.has(key)) {
            patternMap.set(key, {
              property: m.property,
              refVal: m.refVal,
              skVal: m.skVal,
              count: 0,
              elements: [],
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- key was just set above
          const pattern = patternMap.get(key)!;
          pattern.count++;
          pattern.elements.push(m.elementName);
        }

        const sortedPatterns = [...patternMap.values()].sort((a, b) => b.count - a.count);
        for (const pattern of sortedPatterns) {
          console.log(`  ${pattern.property}: "${pattern.refVal}" vs "${pattern.skVal}"`);
          if (pattern.count === 1) {
            console.log(`    └─ 1 element (${pattern.elements[0]})`);
          } else {
            console.log(`    └─ ${pattern.count} elements`);
            for (const el of pattern.elements) {
              console.log(`       • ${el}`);
            }
          }
          console.log('');
        }
      }

      // Grand total
      const totalTested = groupResults.reduce((sum, gr) => sum + gr.tested, 0);
      const totalNotFound = groupResults.reduce((sum, gr) => sum + gr.notFound, 0);
      const totalMismatched = groupResults.reduce((sum, gr) => sum + gr.mismatched, 0);
      const totalMismatchCount = allMismatches.length;

      console.log('═══════════════════════════════════════════════════════');
      console.log('SUMMARY');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Total elements: ${totalTested + totalNotFound}`);
      console.log(`  Tested: ${totalTested}`);
      console.log(`  Not found: ${totalNotFound}`);
      console.log(`  Elements with mismatches: ${totalMismatched}`);
      console.log(`  Total property mismatches: ${totalMismatchCount}`);
      console.log('═══════════════════════════════════════════════════════\n');
    } finally {
      await referencePage.close();
    }
  });
});
