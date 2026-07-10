/**
 * Component thumbnail generator.
 *
 * Drives the HyperKit Explorer (packages/explorer) — NOT Storybook.
 *
 * Pipeline:
 *   1. Serves `packages/explorer/dist` (build it first with
 *      `pnpm --filter @ybouhjira/explorer build`) on a tiny static server
 *      with SPA fallback so deep links resolve to index.html.
 *   2. Loads the app once and reads `window.__SK_EXPLORER_STORIES__`
 *      (the story index the Explorer exposes for tooling) to map each
 *      component to its "Default"-like story id.
 *   3. For every component: navigates to `/?story=<id>`, forces the theme
 *      via `localStorage['sk-explorer-theme']`, measures the rendered story
 *      content inside `[data-sk-story-canvas]` (unioned with any portal
 *      overlays such as dialogs/toasts), screenshots that region at 2x,
 *      and encodes a 240x160 webp (quality 80) via sharp.
 *   4. Writes `thumbnails/manifest.json` with the actual Explorer story ids.
 *
 * Usage:
 *   npm run thumbnails                     # all components, default theme
 *   tsx scripts/generate-thumbnails.ts --theme=zed-dark --only=Button,Table
 */
import { chromium } from '@playwright/test';
import type { Browser, BrowserContext } from '@playwright/test';
import sharp from 'sharp';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
  createReadStream,
} from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

const PORT = 6099;
const EXPLORER_DIST = 'packages/explorer/dist';
const THUMBNAILS_DIR = 'thumbnails';
const THEME_STORAGE_KEY = 'sk-explorer-theme';
const DEFAULT_THEME = 'zed-dark';
const THUMB_WIDTH = 240;
const THUMB_HEIGHT = 160;
const ASPECT = THUMB_WIDTH / THUMB_HEIGHT;
const VIEWPORT = { width: 1280, height: 1000 };
const DEVICE_SCALE = 2;
const SETTLE_DELAY = 700;
const WEBP_QUALITY = 80;
const CONTENT_PADDING = 24;
/**
 * The story canvas is resized to this fixed 3:2 "stage" before measuring so
 * responsive components lay out at a thumbnail-appropriate width instead of
 * stretching across the full explorer preview pane.
 */
const STAGE = { width: 720, height: 480 };

/**
 * Components that need thumbnails but are not yet in the previous manifest
 * (newly added to the library since the last generation run).
 */
const ADDITIONS: readonly string[] = ['IssueBoard'];

interface StoryIndexEntry {
  id: string;
  title: string;
  category: string;
}

interface ThumbnailManifestEntry {
  name: string;
  file: string;
  storyId: string;
  category: string;
}

interface ThumbnailManifest {
  generated: string;
  theme: string;
  components: ThumbnailManifestEntry[];
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

/** Static server with SPA fallback: unknown paths serve index.html. */
function createStaticServer(rootDir: string): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    const urlPath = (req.url ?? '/').split('?')[0] ?? '/';
    let fullPath = resolve(rootDir, urlPath.replace(/^\/+/, ''));

    if (!fullPath.startsWith(resolve(rootDir))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!existsSync(fullPath) || statSync(fullPath).isDirectory()) {
      // SPA fallback — deep links must serve the app shell.
      fullPath = resolve(rootDir, 'index.html');
    }

    const mimeType = MIME_TYPES[extname(fullPath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    createReadStream(fullPath).pipe(res);
  });
}

/**
 * Showcase overrides for components without a Default/Primary story whose
 * alphabetically-first story is a poor thumbnail (empty/closed/error states).
 * Values are story names as shown in the Explorer title ("<Component> - <Name>").
 */
const STORY_OVERRIDES: Record<string, string> = {
  Dialog: 'Default Open',
  FileExplorer: 'List',
  Sidebar: 'Open',
  SubagentTracker: 'Multiple Agents',
  SessionIndicator: 'Streaming',
  ToolExecution: 'Success',
  Input: 'Default Input',
  Skeleton: 'Text Many Lines',
  TagInput: 'With Default Tags',
  ModelSelector: 'With Selection',
};

/**
 * Pre-capture interactions for components whose showcase state only exists
 * behind a user action (e.g. palettes/menus that open on click). The
 * selector is clicked once after render, before measuring.
 */
const INTERACTIONS: Record<string, { selector: string; button?: 'left' | 'right' }> = {
  CommandPalette: { selector: 'text=Open Command Palette' },
  ModelSelector: { selector: '.sk-model-selector button' },
  ContextMenu: { selector: 'text=Right-click here', button: 'right' },
};

/** Pick the "Default"-like story for a component from the Explorer index. */
function pickStory(componentName: string, stories: StoryIndexEntry[]): StoryIndexEntry | null {
  // CSF titles are "<Component> - <Story Name>" (exact component name prefix).
  const prefix = `${componentName} - `;
  const candidates = stories.filter((s) => s.title.startsWith(prefix) || s.title === componentName);
  if (candidates.length === 0) return null;

  const byName = (storyName: string) => candidates.find((s) => s.title === `${prefix}${storyName}`);

  const override = STORY_OVERRIDES[componentName];
  return (
    (override ? byName(override) : undefined) ??
    byName('Default') ??
    byName('Primary') ??
    byName('Basic') ??
    candidates[0] ??
    null
  );
}

/**
 * Measure the region to capture, in CSS pixels.
 * Union of the story content inside the canvas and any visible portal
 * overlays (dialogs, toasts, menus render outside the canvas).
 *
 * Kept as a plain JS source string (not a function reference) so the
 * transpiler cannot inject Node-only helpers (esbuild's `__name`) into
 * code that runs inside the browser.
 */
const MEASURE_CAPTURE_RECT = `(() => {
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };

  const union = (a, b) => {
    if (!a) return b;
    if (!b) return a;
    const x1 = Math.min(a.x, b.x);
    const y1 = Math.min(a.y, b.y);
    const x2 = Math.max(a.x + a.width, b.x + b.width);
    const y2 = Math.max(a.y + a.height, b.y + b.height);
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  };

  const canvasEl = document.querySelector('[data-sk-story-canvas]');
  const canvas = canvasEl ? rectOf(canvasEl) : null;

  let content = null;
  if (canvasEl) {
    for (const child of Array.from(canvasEl.children)) {
      content = union(content, rectOf(child));
    }
  }

  // Portal overlays: visible body children outside the app root
  // (dialogs, drawers, toasts). Measured separately — when a portal is
  // open it IS the subject, and unioning it with the canvas would drag
  // explorer chrome into the crop.
  const root = document.getElementById('root');
  let portal = null;
  for (const el of Array.from(document.body.children)) {
    if (el === root || !(el instanceof HTMLElement)) continue;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    // Measure the portal's visible descendants, not the wrapper — kobalte
    // wrappers are often zero-size or full-viewport backdrops.
    const leaves = el.querySelectorAll('*');
    let inner = null;
    for (const leaf of Array.from(leaves)) {
      const style = getComputedStyle(leaf);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      if (style.position === 'fixed' && leaf.clientWidth >= window.innerWidth - 2) continue;
      inner = union(inner, rectOf(leaf));
    }
    portal = union(portal, inner ?? rectOf(el));
  }
  if (portal && portal.width * portal.height < 400) portal = null;

  return { canvas, content, portal };
})()`;

/**
 * Compute the final crop: content padded, at least THUMB size, expanded to
 * the 3:2 aspect where possible, clamped to the given bounds.
 */
function computeCrop(content: CropRect, bounds: CropRect, expandToAspect: boolean): CropRect {
  let x = content.x - CONTENT_PADDING;
  let y = content.y - CONTENT_PADDING;
  let w = content.width + CONTENT_PADDING * 2;
  let h = content.height + CONTENT_PADDING * 2;

  w = Math.max(w, THUMB_WIDTH);
  h = Math.max(h, THUMB_HEIGHT);

  // Expand the short side toward the 3:2 aspect around the content center.
  // Skipped for portal overlays (tall dialogs would pull surrounding chrome
  // into frame); the final top-anchored cover-crop frames those instead.
  if (expandToAspect) {
    if (w / h > ASPECT) {
      const targetH = w / ASPECT;
      y -= (targetH - h) / 2;
      h = targetH;
    } else {
      const targetW = h * ASPECT;
      x -= (targetW - w) / 2;
      w = targetW;
    }
  }

  // Clamp to bounds.
  w = Math.min(w, bounds.width);
  h = Math.min(h, bounds.height);
  x = Math.min(Math.max(x, bounds.x), bounds.x + bounds.width - w);
  y = Math.min(Math.max(y, bounds.y), bounds.y + bounds.height - h);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
  };
}

async function captureComponent(
  context: BrowserContext,
  componentName: string,
  story: StoryIndexEntry
): Promise<void> {
  const page = await context.newPage();
  try {
    await page.goto(`http://localhost:${PORT}/?story=${encodeURIComponent(story.id)}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector('[data-sk-story-canvas]', { state: 'visible', timeout: 15000 });
    // Pin the canvas to the fixed stage size (plain JS string — see
    // MEASURE_CAPTURE_RECT for why this is not a function reference).
    await page.evaluate(
      `((w, h) => {
        const el = document.querySelector('[data-sk-story-canvas]');
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.flex = 'none';
      })(${STAGE.width}, ${STAGE.height})`
    );
    await page.evaluate('document.fonts.ready');
    await page.waitForTimeout(SETTLE_DELAY);

    const interaction = INTERACTIONS[componentName];
    if (interaction) {
      await page.click(interaction.selector, {
        button: interaction.button ?? 'left',
        timeout: 5000,
      });
      await page.waitForTimeout(SETTLE_DELAY);
    }

    const { canvas, content, portal } = (await page.evaluate(MEASURE_CAPTURE_RECT)) as {
      canvas: CropRect | null;
      content: CropRect | null;
      portal: CropRect | null;
    };
    if (!canvas) {
      throw new Error('story canvas not found after render');
    }

    const viewportBounds: CropRect = { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height };
    // An open portal overlay (dialog/drawer/toast) is the subject; otherwise
    // capture the story content and stay inside the canvas so explorer
    // chrome never leaks into the thumbnail.
    const contentRect = portal ?? content ?? canvas;
    const bounds = portal ? viewportBounds : canvas;

    const crop = computeCrop(contentRect, bounds, !portal);
    if (process.env['DEBUG_THUMBS']) {
      console.log(`  canvas=${JSON.stringify(canvas)}`);
      console.log(`  content=${JSON.stringify(content)} portal=${JSON.stringify(portal)}`);
      console.log(`  crop=${JSON.stringify(crop)}`);
    }
    const screenshot = await page.screenshot({ type: 'png', clip: crop });

    await sharp(screenshot)
      // 'left top' — story content anchors top-left, so clamped crops keep
      // headers/first columns instead of losing both edges to a center crop.
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover', position: 'left top' })
      .webp({ quality: WEBP_QUALITY })
      .toFile(join(THUMBNAILS_DIR, `${componentName}.webp`));
  } finally {
    await page.close();
  }
}

function parseArgs(): { theme: string; only: Set<string> | null } {
  let theme = DEFAULT_THEME;
  let only: Set<string> | null = null;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--theme=')) theme = arg.slice('--theme='.length);
    if (arg.startsWith('--only=')) only = new Set(arg.slice('--only='.length).split(','));
  }
  return { theme, only };
}

async function main() {
  const startTime = Date.now();
  const { theme, only } = parseArgs();

  const distDir = resolve(EXPLORER_DIST);
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error(
      `Error: ${distDir}/index.html not found.\n` +
        'Build the explorer first: pnpm --filter @ybouhjira/explorer build'
    );
    process.exit(1);
  }

  const manifestPath = join(THUMBNAILS_DIR, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`Error: ${manifestPath} not found — it defines the component list.`);
    process.exit(1);
  }
  const previousManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as ThumbnailManifest;
  const componentNames = [
    ...previousManifest.components.map((c) => c.name),
    ...ADDITIONS.filter((name) => !previousManifest.components.some((c) => c.name === name)),
  ].filter((name) => !only || only.has(name));

  mkdirSync(THUMBNAILS_DIR, { recursive: true });

  const server = createStaticServer(distDir);
  await new Promise<void>((done) => {
    server.listen(PORT, () => {
      console.log(`Serving ${EXPLORER_DIST} on http://localhost:${PORT} (theme: ${theme})`);
      done();
    });
  });

  let browser: Browser | null = null;
  const failed: string[] = [];
  const manifest: ThumbnailManifest = {
    generated: new Date().toISOString(),
    theme,
    components: [],
  };

  try {
    browser = await chromium.launch({
      args: ['--font-render-hinting=none', '--disable-skia-runtime-opts'],
    });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE,
    });
    await context.addInitScript(
      ([key, value]) => localStorage.setItem(key as string, value as string),
      [THEME_STORAGE_KEY, theme]
    );

    // Load the app once to read the story index.
    const indexPage = await context.newPage();
    await indexPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await indexPage.waitForFunction(() => '__SK_EXPLORER_STORIES__' in window, undefined, {
      timeout: 20000,
    });
    const stories = (await indexPage.evaluate(
      () => (window as unknown as Record<string, unknown>)['__SK_EXPLORER_STORIES__']
    )) as StoryIndexEntry[];
    await indexPage.close();
    console.log(`Explorer story index: ${stories.length} stories`);

    let processed = 0;
    for (const componentName of componentNames) {
      processed++;
      const story = pickStory(componentName, stories);
      if (!story) {
        console.warn(`[${processed}/${componentNames.length}] ${componentName} — NO STORY FOUND`);
        failed.push(componentName);
        continue;
      }

      try {
        await captureComponent(context, componentName, story);
        manifest.components.push({
          name: componentName,
          file: `${componentName}.webp`,
          storyId: story.id,
          category: story.category,
        });
        console.log(`[${processed}/${componentNames.length}] ${componentName} (${story.title})`);
      } catch (error) {
        console.warn(`[${processed}/${componentNames.length}] ${componentName} — FAILED:`, error);
        failed.push(componentName);
      }
    }
  } finally {
    await browser?.close();
    server.close();
  }

  // Partial runs (--only) must not clobber the full manifest.
  if (!only) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `\nGenerated ${manifest.components.length}/${componentNames.length} thumbnails ` +
      `in ${elapsedSeconds}s (theme: ${theme})`
  );
  if (failed.length > 0) {
    console.error(`Failed components: ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
