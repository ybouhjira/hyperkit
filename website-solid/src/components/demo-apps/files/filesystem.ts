/**
 * Seed filesystem for the File Manager demo.
 *
 * The tree is stored as a map of directory path → children, which makes
 * navigation, rename, and delete straightforward store updates.
 */
import type { FileItem } from '@ybouhjira/hyperkit';

export const HOME = '/home/youssef';


const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

interface SeedEntry {
  name: string;
  dir?: boolean;
  size?: number;
  days?: number;
  mime?: string;
}

const entry =
  (parent: string) =>
  (e: SeedEntry): FileItem => {
    const modified = daysAgo(e.days ?? 3);
    return {
      name: e.name,
      path: `${parent === '/' ? '' : parent}/${e.name}`,
      isDirectory: e.dir ?? false,
      size: e.dir ? undefined : (e.size ?? 1024),
      // ListView's Modified column reads `modifiedAt`; the preview reads
      // `mtime` first — populate both.
      mtime: modified,
      modifiedAt: modified,
      ...(e.mime ? { mimeType: e.mime } : {}),
    };
  };

export function seedFilesystem(): Record<string, FileItem[]> {
  const root = entry('/');
  const home = entry(HOME);
  const documents = entry(`${HOME}/Documents`);
  const contracts = entry(`${HOME}/Documents/Contracts`);
  const pictures = entry(`${HOME}/Pictures`);
  const screenshots = entry(`${HOME}/Pictures/Screenshots`);
  const projects = entry(`${HOME}/Projects`);
  const hyperkit = entry(`${HOME}/Projects/hyperkit`);
  const hyperkitSrc = entry(`${HOME}/Projects/hyperkit/src`);
  const music = entry(`${HOME}/Music`);
  const downloads = entry(`${HOME}/Downloads`);

  return {
    '/': [root({ name: 'home', dir: true, days: 90 })],
    '/home': [entry('/home')({ name: 'youssef', dir: true, days: 90 })],
    [HOME]: [
      home({ name: 'Documents', dir: true, days: 1 }),
      home({ name: 'Downloads', dir: true, days: 0 }),
      home({ name: 'Music', dir: true, days: 30 }),
      home({ name: 'Pictures', dir: true, days: 2 }),
      home({ name: 'Projects', dir: true, days: 0 }),
      home({ name: 'notes.md', size: 4_812, days: 0, mime: 'text/markdown' }),
      home({ name: 'resume.pdf', size: 182_400, days: 12, mime: 'application/pdf' }),
      home({ name: 'todo.txt', size: 640, days: 1, mime: 'text/plain' }),
      home({ name: '.bashrc', size: 3_214, days: 45 }),
      home({ name: '.gitconfig', size: 512, days: 45 }),
    ],
    [`${HOME}/Documents`]: [
      documents({ name: 'Contracts', dir: true, days: 8 }),
      documents({ name: 'budget-2026.xlsx', size: 48_230, days: 4 }),
      documents({ name: 'invoice-0142.pdf', size: 96_540, days: 6, mime: 'application/pdf' }),
      documents({ name: 'meeting-notes.md', size: 7_120, days: 1, mime: 'text/markdown' }),
      documents({ name: 'proposal-hyperkit.docx', size: 152_880, days: 2 }),
    ],
    [`${HOME}/Documents/Contracts`]: [
      contracts({ name: 'nda-acme.pdf', size: 88_064, days: 20, mime: 'application/pdf' }),
      contracts({ name: 'rev-share-digitalmania.pdf', size: 132_096, days: 15, mime: 'application/pdf' }),
    ],
    [`${HOME}/Pictures`]: [
      pictures({ name: 'Screenshots', dir: true, days: 0 }),
      pictures({ name: 'chat-window.webp', size: 88_320, days: 3, mime: 'image/webp' }),
      pictures({ name: 'command-palette.webp', size: 76_800, days: 4, mime: 'image/webp' }),
      pictures({ name: 'dashboard-cards.webp', size: 91_136, days: 5, mime: 'image/webp' }),
      pictures({ name: 'file-explorer.webp', size: 83_968, days: 2, mime: 'image/webp' }),
      pictures({ name: 'grid-layout.webp', size: 71_680, days: 7, mime: 'image/webp' }),
    ],
    [`${HOME}/Pictures/Screenshots`]: [
      screenshots({ name: 'breadcrumb-nav.webp', size: 64_512, days: 1, mime: 'image/webp' }),
      screenshots({ name: 'buttons-variants.webp', size: 59_392, days: 1, mime: 'image/webp' }),
      screenshots({ name: 'code-block.webp', size: 66_560, days: 0, mime: 'image/webp' }),
    ],
    [`${HOME}/Projects`]: [
      projects({ name: 'hyperkit', dir: true, days: 0 }),
      projects({ name: 'website', dir: true, days: 1 }),
      projects({ name: 'README.md', size: 2_048, days: 10, mime: 'text/markdown' }),
    ],
    [`${HOME}/Projects/hyperkit`]: [
      hyperkit({ name: 'src', dir: true, days: 0 }),
      hyperkit({ name: 'package.json', size: 3_672, days: 0, mime: 'application/json' }),
      hyperkit({ name: 'tsconfig.json', size: 890, days: 14, mime: 'application/json' }),
      hyperkit({ name: 'vite.config.ts', size: 1_240, days: 9 }),
      hyperkit({ name: 'CHANGELOG.md', size: 18_460, days: 0, mime: 'text/markdown' }),
    ],
    [`${HOME}/Projects/hyperkit/src`]: [
      hyperkitSrc({ name: 'index.ts', size: 12_480, days: 0 }),
      hyperkitSrc({ name: 'theme.ts', size: 8_120, days: 2 }),
      hyperkitSrc({ name: 'tokens.css', size: 6_040, days: 2, mime: 'text/css' }),
    ],
    [`${HOME}/Projects/website`]: [
      entry(`${HOME}/Projects/website`)({ name: 'app.tsx', size: 2_310, days: 1 }),
      entry(`${HOME}/Projects/website`)({ name: 'site.css', size: 4_400, days: 1, mime: 'text/css' }),
    ],
    [`${HOME}/Music`]: [
      music({ name: 'ambient-focus.mp3', size: 6_291_456, days: 40, mime: 'audio/mpeg' }),
      music({ name: 'deep-work.flac', size: 24_117_248, days: 38, mime: 'audio/flac' }),
      music({ name: 'synthwave-drive.mp3', size: 8_912_896, days: 21, mime: 'audio/mpeg' }),
    ],
    [`${HOME}/Downloads`]: [
      downloads({ name: 'hyperkit-3.4.1.tgz', size: 1_843_200, days: 0, mime: 'application/gzip' }),
      downloads({ name: 'dataset-metrics.csv', size: 512_000, days: 1, mime: 'text/csv' }),
      downloads({ name: 'font-inter.zip', size: 2_202_009, days: 5, mime: 'application/zip' }),
    ],
  };
}

/** Sidebar shortcuts shown in the Places panel. */
export const PLACES: Array<{ label: string; path: string; icon: string }> = [
  { label: 'Home', path: HOME, icon: '⌂' },
  { label: 'Documents', path: `${HOME}/Documents`, icon: '▤' },
  { label: 'Pictures', path: `${HOME}/Pictures`, icon: '▣' },
  { label: 'Projects', path: `${HOME}/Projects`, icon: '⌘' },
  { label: 'Music', path: `${HOME}/Music`, icon: '♪' },
  { label: 'Downloads', path: `${HOME}/Downloads`, icon: '↓' },
];

export const parentOf = (path: string): string => {
  const idx = path.lastIndexOf('/');
  return idx <= 0 ? '/' : path.slice(0, idx);
};
