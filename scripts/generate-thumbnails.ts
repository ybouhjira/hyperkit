import { chromium } from '@playwright/test';
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
const STORYBOOK_DIR = 'storybook-static';
const THUMBNAILS_DIR = 'thumbnails';
const VIEWPORT_WIDTH = 240;
const VIEWPORT_HEIGHT = 160;
const SETTLE_DELAY = 500;
const WEBP_QUALITY = 80;

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  importPath: string;
  type: 'story' | 'docs';
}

interface Component {
  name: string;
  path: string;
  hasStories: boolean;
}

interface ThumbnailManifestEntry {
  name: string;
  file: string;
  storyId: string;
  category: string;
}

interface ThumbnailManifest {
  generated: string;
  components: ThumbnailManifestEntry[];
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
};

function createStaticServer(rootDir: string): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    let filePath = req.url === '/' ? '/index.html' : req.url || '/index.html';

    if (filePath.includes('?')) {
      filePath = filePath.split('?')[0];
    }

    const fullPath = resolve(rootDir, filePath.substring(1));

    if (!existsSync(fullPath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    if (statSync(fullPath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    createReadStream(fullPath).pipe(res);
  });
}

function matchComponentToImportPath(
  componentPath: string,
  importPath: string,
): boolean {
  const normalizedComponentPath = componentPath.replace(/^src\//, '');
  const normalizedImportPath = importPath
    .replace(/^\.\/src\//, '')
    .replace(/\.stories\.tsx$/, '')
    .replace(/\/[^/]+$/, '');

  return normalizedComponentPath === normalizedImportPath;
}

async function main() {
  const startTime = Date.now();

  const indexPath = resolve(STORYBOOK_DIR, 'index.json');
  if (!existsSync(indexPath)) {
    console.error(`Error: ${indexPath} not found. Run "npm run build-storybook" first.`);
    process.exit(1);
  }

  const componentsPath = resolve('COMPONENTS.json');
  if (!existsSync(componentsPath)) {
    console.error(`Error: ${componentsPath} not found.`);
    process.exit(1);
  }

  const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
  const components: Component[] = JSON.parse(readFileSync(componentsPath, 'utf-8'));

  const stories = Object.values(indexData.entries).filter(
    (entry: any): entry is StoryEntry =>
      entry.type === 'story' && typeof entry.importPath === 'string',
  );

  const componentsWithStories = components.filter((c) => c.hasStories);

  const componentStoryMap = new Map<string, StoryEntry[]>();

  for (const component of componentsWithStories) {
    const matchingStories = stories.filter((story) =>
      matchComponentToImportPath(component.path, story.importPath),
    );

    if (matchingStories.length > 0) {
      componentStoryMap.set(component.name, matchingStories);
    }
  }

  if (componentStoryMap.size === 0) {
    console.warn('Warning: No matching stories found for any components.');
    return;
  }

  if (!existsSync(THUMBNAILS_DIR)) {
    mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }

  const server = createStaticServer(resolve(STORYBOOK_DIR));
  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`HTTP server listening on http://localhost:${PORT}`);
      resolve();
    });
  });

  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-skia-runtime-opts'],
  });

  const manifest: ThumbnailManifest = {
    generated: new Date().toISOString(),
    components: [],
  };

  let processed = 0;
  const total = componentStoryMap.size;

  for (const [componentName, storiesForComponent] of componentStoryMap) {
    processed++;

    const defaultStory = storiesForComponent.find((s) => s.name === 'Default');
    const selectedStory = defaultStory || storiesForComponent[0];

    const url = `http://localhost:${PORT}/iframe.html?id=${selectedStory.id}&viewMode=story`;

    try {
      const page = await browser.newPage({
        viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      });

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('#storybook-root', { state: 'visible' });
      await page.waitForTimeout(SETTLE_DELAY);

      const screenshot = await page.screenshot({ type: 'png' });
      await page.close();

      const webpPath = join(THUMBNAILS_DIR, `${componentName}.webp`);
      await sharp(screenshot).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

      const category = selectedStory.title.split('/')[0] || 'Uncategorized';

      manifest.components.push({
        name: componentName,
        file: `${componentName}.webp`,
        storyId: selectedStory.id,
        category,
      });

      console.log(`[${processed}/${total}] ${componentName}...`);
    } catch (error) {
      console.warn(`Warning: Failed to generate thumbnail for ${componentName}:`, error);
    }
  }

  await browser.close();
  server.close();

  writeFileSync(
    join(THUMBNAILS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nGenerated ${manifest.components.length} thumbnails in ${elapsedSeconds} seconds`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
