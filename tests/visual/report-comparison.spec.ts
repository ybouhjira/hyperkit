/* eslint-disable no-console */
import { test, expect, type Page, type Locator } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/*──────────────────────────────────────────────────────────────
 * Section-to-selector mapping
 * Each entry maps a logical component to its CSS selector in
 * the SolidKit render vs the reference HTML.
 *──────────────────────────────────────────────────────────────*/
interface SectionMapping {
  name: string;
  hyperkit: string;
  reference: string;
}

const SECTIONS: SectionMapping[] = [
  { name: 'nav', hyperkit: '.sk-report-nav', reference: '.nav' },
  { name: 'hero', hyperkit: '.sk-report-hero', reference: '.hero' },
  { name: 'score', hyperkit: '.sk-report-score', reference: '.score-card' },
  { name: 'summary', hyperkit: '#summary', reference: '#summary' },
  { name: 'libraries', hyperkit: '#libraries', reference: '#libraries' },
  { name: 'architecture', hyperkit: '#architecture', reference: '#architecture' },
  { name: 'theming', hyperkit: '#theming', reference: '#theming' },
  { name: 'gaps', hyperkit: '#gaps', reference: '#gaps' },
  { name: 'issues', hyperkit: '#issues', reference: '#issues' },
  { name: 'roadmap', hyperkit: '#roadmap', reference: '#roadmap' },
  { name: 'sources', hyperkit: '#sources', reference: '#sources' },
  { name: 'footer', hyperkit: '.sk-report-footer', reference: '.footer' },
];

const STORYBOOK_URL =
  'http://localhost:6006/iframe.html?id=report-report--architecture-review&viewMode=story';
const REFERENCE_URL = 'http://localhost:8081/';

const MAX_DIFF_PIXEL_RATIO = 0.01; // 1% tolerance
const DIFF_DIR = join(import.meta.dirname, '__diffs__');

/*──────────────────────────────────────────────────────────────
 * Helpers
 *──────────────────────────────────────────────────────────────*/
async function waitForPage(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

async function screenshotElement(page: Page, selector: string): Promise<Buffer> {
  const el: Locator = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return (await el.screenshot()) as Buffer;
}

function resizeToMatch(img: PNG, targetWidth: number, targetHeight: number): PNG {
  const resized = new PNG({ width: targetWidth, height: targetHeight });
  // Copy overlapping region, fill rest with transparent
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      if (x < img.width && y < img.height) {
        const srcIdx = (y * img.width + x) * 4;
        resized.data[idx] = img.data[srcIdx];
        resized.data[idx + 1] = img.data[srcIdx + 1];
        resized.data[idx + 2] = img.data[srcIdx + 2];
        resized.data[idx + 3] = img.data[srcIdx + 3];
      } else {
        resized.data[idx] = 255;
        resized.data[idx + 1] = 0;
        resized.data[idx + 2] = 255;
        resized.data[idx + 3] = 255;
      }
    }
  }
  return resized;
}

function compareImages(
  skBuffer: Buffer,
  refBuffer: Buffer,
  name: string
): { diffCount: number; totalPixels: number; diffRatio: number } {
  let skImg = PNG.sync.read(skBuffer);
  let refImg = PNG.sync.read(refBuffer);

  // Normalize to same dimensions (use the larger of each)
  const width = Math.max(skImg.width, refImg.width);
  const height = Math.max(skImg.height, refImg.height);

  if (skImg.width !== width || skImg.height !== height) {
    skImg = resizeToMatch(skImg, width, height);
  }
  if (refImg.width !== width || refImg.height !== height) {
    refImg = resizeToMatch(refImg, width, height);
  }

  const diff = new PNG({ width, height });
  const diffCount = pixelmatch(skImg.data, refImg.data, diff.data, width, height, {
    threshold: 0.1,
  });
  const totalPixels = width * height;

  // Save diff image
  writeFileSync(join(DIFF_DIR, `${name}-diff.png`), PNG.sync.write(diff));
  writeFileSync(join(DIFF_DIR, `${name}-hyperkit.png`), skBuffer);
  writeFileSync(join(DIFF_DIR, `${name}-reference.png`), refBuffer);

  return { diffCount, totalPixels, diffRatio: diffCount / totalPixels };
}

/*──────────────────────────────────────────────────────────────
 * Results tracker
 *──────────────────────────────────────────────────────────────*/
interface ComparisonResult {
  section: string;
  status: 'pass' | 'fail' | 'skip';
  diffPixels: number;
  totalPixels: number;
  diffPercent: string;
  message: string;
}

const results: ComparisonResult[] = [];

/*──────────────────────────────────────────────────────────────
 * Tests
 *──────────────────────────────────────────────────────────────*/
test.describe('Report Visual Comparison', () => {
  let storybookPage: Page;
  let referencePage: Page;

  test.beforeAll(async ({ browser }) => {
    mkdirSync(DIFF_DIR, { recursive: true });

    storybookPage = await browser.newPage();
    referencePage = await browser.newPage();

    await Promise.all([
      waitForPage(storybookPage, STORYBOOK_URL),
      waitForPage(referencePage, REFERENCE_URL),
    ]);
  });

  test.afterAll(async () => {
    console.log('\n' + '═'.repeat(72));
    console.log(' VISUAL COMPARISON: SolidKit vs Reference HTML');
    console.log('═'.repeat(72));
    console.log(
      `${'Component'.padEnd(16)} ${'Diff px'.padStart(9)} ${'Total px'.padStart(10)} ${'Diff %'.padStart(8)}  Status`
    );
    console.log('─'.repeat(72));

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const r of results) {
      const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
      console.log(
        `${r.section.padEnd(16)} ${String(r.diffPixels).padStart(9)} ${String(r.totalPixels).padStart(10)} ${r.diffPercent.padStart(8)}  ${icon} ${r.status}`
      );
      if (r.status === 'pass') passed++;
      else if (r.status === 'fail') failed++;
      else skipped++;
    }

    console.log('─'.repeat(72));
    console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    console.log(`Diff images saved to: tests/visual/__diffs__/`);
    console.log('═'.repeat(72) + '\n');

    await storybookPage.close();
    await referencePage.close();
  });

  for (const section of SECTIONS) {
    test(`Section: ${section.name}`, async () => {
      const skCount = await storybookPage.locator(section.hyperkit).count();
      const refCount = await referencePage.locator(section.reference).count();

      if (skCount === 0 || refCount === 0) {
        results.push({
          section: section.name,
          status: 'skip',
          diffPixels: 0,
          totalPixels: 0,
          diffPercent: '-',
          message: `Selector missing — SK:${skCount} REF:${refCount}`,
        });
        test.skip();
        return;
      }

      const skScreenshot = await screenshotElement(storybookPage, section.hyperkit);
      const refScreenshot = await screenshotElement(referencePage, section.reference);

      const { diffCount, totalPixels, diffRatio } = compareImages(
        skScreenshot,
        refScreenshot,
        section.name
      );

      const diffPercent = (diffRatio * 100).toFixed(2) + '%';
      const passed = diffRatio <= MAX_DIFF_PIXEL_RATIO;

      results.push({
        section: section.name,
        status: passed ? 'pass' : 'fail',
        diffPixels: diffCount,
        totalPixels,
        diffPercent,
        message: passed
          ? `Within ${MAX_DIFF_PIXEL_RATIO * 100}% tolerance`
          : `${diffPercent} exceeds ${MAX_DIFF_PIXEL_RATIO * 100}% threshold`,
      });

      expect(
        diffRatio,
        `${section.name}: ${diffCount}/${totalPixels} pixels differ (${diffPercent}). See tests/visual/__diffs__/${section.name}-diff.png`
      ).toBeLessThanOrEqual(MAX_DIFF_PIXEL_RATIO);
    });
  }
});
